// SPDX-License-Identifier: MIT

pragma solidity^ 0.8.0;

contract BandL{
    struct receipt{
        address to;
        string message;
        uint amount;
        uint timestamp;
    }
    mapping(address => receipt[]) public borrow;   // if a user borrows money it is mapped to his address
    mapping(address => receipt[]) public lend;     // if a user lends money it is mapped to his address

    mapping(address => receipt[]) public borrow_pending; // stores the pending borrow requests that a user has made for borrowing money
    mapping(address => receipt[]) public lend_pending; // stores the pending requests that are made to the user for lending money

    // seraching a receipt and removing it from the address mapping 
    function remove(mapping(address => receipt[]) storage _map, receipt memory _receipt, address _address) internal{
        uint pos = 0;
        uint n = _map[_address].length;
        for(uint i =0; i < n ; i++){
            if(_map[_address][i].to == _receipt.to && _map[_address][i].amount == _receipt.amount && _map[_address][i].timestamp == _receipt.timestamp){
                pos = i;
                break;
            }
        }
        if(_map[_address].length > 0){
            _map[_address][pos] = _map[_address][n-1];
            _map[_address].pop();
        }
    }

    // if a user rejects a request, it is no more pending for him as well as for the user who made it
    function reject(address _from, address _to, string memory message, uint val, uint timestamp) public{
        require(msg.sender == _to, "You aren't the person to whom the request was made!");
        receipt memory _receipt = receipt(_from,message,val,timestamp);
        remove(lend_pending, _receipt, msg.sender);
        _receipt.to = _to;
        remove(borrow_pending, _receipt , _from);
    }

    function lendMoney(address _from, address _to, string memory message, uint val, uint timestamp) public payable{
        // amount send should be greater than money requested to process the transcation
        require(msg.sender == _to, "You aren't the person to whom the request was made!");
        require(msg.value >= val, "Less amount sent than requested!");
        require(lend_pending[_to].length > 0, "No pending lending requests!");    
        payable(_from).transfer(msg.value);
        uint time = block.timestamp;

        // msg.sender lended money so add receipt to his address in lend mapping
        lend[msg.sender].push(receipt(_from,"done",val,time));

        // _to's borrow request has been granted, so add receipt to his address in borrow mapping
        borrow[_from].push(receipt(msg.sender,"requestGranted",val,time));

        // the pending requests are now completed, so remove them
        remove(borrow_pending, receipt(_to,message,val,timestamp) , _from);
        remove(lend_pending, receipt(_from,message,val,timestamp), _to);
    }

    // if a user wants to borrow money, send his message and request to the appropriate address 
    function borrowMoney(address _from, string memory _message, uint val) public {
        require(val>0 , "Borrow positive amount!");
        uint time = block.timestamp;
        borrow_pending[msg.sender].push(receipt(_from,_message,val,time));
        lend_pending[_from].push(receipt(msg.sender,_message,val,time));
    }   

    function b(address _address) public view returns(uint){
        return borrow[_address].length;
    }

    function l(address _address) public view returns(uint){
        return lend[_address].length;
    }

    function bp(address _address) public view returns(uint){
        return borrow_pending[_address].length;
    }

    function lp(address _address) public view returns(uint){
        return lend_pending[_address].length;
    }
}

