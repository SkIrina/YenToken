//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
    string public name = "Yena Token";
    string public symbol = "YEN";

    uint256 private _totalSupply;
    uint8 private _decimals;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    address public owner;

    constructor(uint256 totalSupplyInit) {
        _totalSupply = totalSupplyInit;
        _decimals = 18;
        owner = msg.sender;
        _balances[msg.sender] = 100;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return _balances[_owner];
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_balances[msg.sender] >= _value, "Not enough balance for transfer");
        _balances[msg.sender] -= _value;
        _balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_allowances[_from][_to] >= _value && _balances[_from] >= _value, "This transfer is not permitted");
        _allowances[_from][_to] -= _value;
        _balances[_from] -= _value;
        _balances[_to] += _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        _allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return _allowances[_owner][_spender];
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function mint(address account, uint256 _value) public returns (bool success) {
        require(msg.sender == owner, "Minting not allowed");
        _balances[account] += _value;
        _totalSupply += _value;
        emit Transfer(address(0), account, _value);
        return true;
    }

    function burn(address account, uint256 _value) public returns (bool success) {
        require(msg.sender == owner, "Burning not allowed");
        require(_balances[account] >= _value, "Not possible to burn this amount");
        _balances[account] -= _value;
        _totalSupply -= _value;
        emit Transfer(account, address(0), _value);
        return true;
    }
}
