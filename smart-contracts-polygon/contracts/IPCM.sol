// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IPCM is Ownable {
    string private cidMapping;

    event MappingUpdated(string value);

    constructor(address owner) Ownable(owner) {}

    function updateMapping(string memory value) public onlyOwner {
        cidMapping = value;
        emit MappingUpdated(value);
    }

    function getMapping() public view returns (string memory) {
        return cidMapping;
    }
}
