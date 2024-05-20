// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { VerifierParams, IVerifier } from "./Verifier.sol";
import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Cursive is ERC721URIStorage, Ownable {
    uint256 public _nextTokenId;
    bool public multipleItems;

    address public _verifierAddress;
    string nftImageUri = "https://gold-open-stork-876.mypinata.cloud/ipfs/QmRX9K9sqBbTKGfzrKQopJ3pHSMgVonHxoqqPPrctqkw9H/cursive.png";

    mapping(address => bool) public hasClaimed; // mapping to keep track of users who have claimed the NFT

    constructor(
        string memory _name,
        string memory _symbol,
        address _verifierContract,
        bool _multipleItems
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        _verifierAddress = _verifierContract;
        multipleItems = _multipleItems;
    }

    // Event emitted when a proof is verified and NFT is airdropped
    event Mint(address indexed ownerAddress, uint256 tokenId);

    // Minting is possible only if the proof is valid
    function verifyAndMint(
        address userAddress,
        string memory _tokenURI,
        VerifierParams calldata data
    ) public {
        bool isValidProof = IVerifier(_verifierAddress).verifyProof(
            data._pA,
            data._pB,
            data._pC,
            data._pubSignals
        );
        require(isValidProof, "Proof is not valid");
        mint(userAddress, _tokenURI);
    }

    // Private function to mint an NFT
    function mint(
        address _recipient,
        string memory _tokenURI
    ) private returns (bool)  {
        if (!multipleItems) {
            require(!hasClaimed[_recipient], "User has already claimed the NFT");
            hasClaimed[_recipient] = true;
        }
        uint256 tokenId = _nextTokenId + 1;

        _nextTokenId = tokenId;

        // Mint the NFT to the recipient
        _safeMint(_recipient, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        emit Mint(_recipient, tokenId);
        return true;
    }
}
