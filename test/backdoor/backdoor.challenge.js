const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Backdoor', function () {
    let deployer, users, player;
    let masterCopy, walletFactory, token, walletRegistry;

    const AMOUNT_TOKENS_DISTRIBUTED = 40n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, alice, bob, charlie, david, player] = await ethers.getSigners();
        users = [alice.address, bob.address, charlie.address, david.address]

        // Deploy Gnosis Safe master copy and factory contracts
        masterCopy = await (await ethers.getContractFactory('GnosisSafe', deployer)).deploy();
        walletFactory = await (await ethers.getContractFactory('GnosisSafeProxyFactory', deployer)).deploy();
        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        
        // Deploy the registry
        walletRegistry = await (await ethers.getContractFactory('WalletRegistry', deployer)).deploy(
            masterCopy.address,
            walletFactory.address,
            token.address,
            users
        );
        expect(await walletRegistry.owner()).to.eq(deployer.address);

        for (let i = 0; i < users.length; i++) {
            // Users are registered as beneficiaries
            expect(
                await walletRegistry.beneficiaries(users[i])
            ).to.be.true;

            // User cannot add beneficiaries
            await expect(
                walletRegistry.connect(
                    await ethers.getSigner(users[i])
                ).addBeneficiary(users[i])
            ).to.be.revertedWithCustomError(walletRegistry, 'Unauthorized');
        }

        // Transfer tokens to be distributed to the registry
        await token.transfer(walletRegistry.address, AMOUNT_TOKENS_DISTRIBUTED);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        await ((await ethers.getContractFactory("WalletRegistryAttacker", player)).deploy(
            walletRegistry.address,
            walletFactory.address,
            users,
        ));
        /*
        Explanation:
        Gnosis Safe Proxies (which are just smart contract wallets) allow you to create them and execute
        an initializer with a delegatecall within one transaction.
        We create proxies with the beneficiaries as owners, but our initializer approves our attacker contract
        as a spender.
        The Registry callback transfers tokens to the newly created wallets.
        The attacker immediately transfers from these wallets to ${player.address}.

        Note: why do we need an intermediary contract instead of calling the ERC-20 directly with an encoded approval?
        DELEGATECALL basically says that I'm a contract and I'm allowing (delegating) you to do whatever you want to my storage.
        Which means, if the target modifies storage, that storage must be present, in the same layout, in the original contract.
        If we DELEGATECALL to the ERC-20 approve function, the target will simply modify the allowances mapping, as if it were present in the origin.
        But it's not present, since the origin is a Gnosis Safe contract, not an ERC-20. That means the DELEGATECALL is useless.

        For that reason, we deploy a second contract which does not modify storage, but rather calls the ERC-20 for an approval.
        It's important to note that, in DelegateCallbackAttack::approve, msg.sender is still the Factory contract.
        msg.sender becomes the Safe in the inner function call `IERC20(token).approve(spender, type(uint256).max)`.
        */
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player must have used a single transaction
        expect(await ethers.provider.getTransactionCount(player.address)).to.eq(1);

        for (let i = 0; i < users.length; i++) {
            let wallet = await walletRegistry.wallets(users[i]);
            
            // User must have registered a wallet
            expect(wallet).to.not.eq(
                ethers.constants.AddressZero,
                'User did not register a wallet'
            );

            // User is no longer registered as a beneficiary
            expect(
                await walletRegistry.beneficiaries(users[i])
            ).to.be.false;
        }

        // Player must own all tokens
        expect(
            await token.balanceOf(player.address)
        ).to.eq(AMOUNT_TOKENS_DISTRIBUTED);
    });
});
