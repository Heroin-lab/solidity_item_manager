pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Item.sol";

contract ItemManager is Ownable {

    enum SupplyChainState{Created, Paid, Delivered}

    struct SomeItem {
        Item externalItem;
        string identifier;
        uint price;
        ItemManager.SupplyChainState state;
    }

    mapping(uint => SomeItem) public items;
    uint itemIndex;

    event SupplyChainStep(uint _itemIdentifier, uint _step, address _itemAddress);

    function getItemValue(uint _itemIndex) public returns(SomeItem memory) {
        return items[_itemIndex];
    }

    function createItem(string memory _identifier, uint _price) public onlyOwner {
        Item newItem = new Item(this, _price, itemIndex);

        items[itemIndex].externalItem = newItem;
        items[itemIndex].identifier = _identifier;
        items[itemIndex].price = _price;
        items[itemIndex].state = SupplyChainState.Created;

        emit SupplyChainStep(itemIndex, uint(items[itemIndex].state), address(newItem));

        itemIndex++;
    }

    function triggerPayment(uint _itemIdentifier) public payable {
        require(items[_itemIdentifier].price == msg.value, "There is only full payments accepted");
        require(items[_itemIdentifier].state == SupplyChainState.Created, "Item is further in the chain");

        items[_itemIdentifier].state = SupplyChainState.Paid;

        emit SupplyChainStep(_itemIdentifier, uint(items[_itemIdentifier].state), address(items[_itemIdentifier].externalItem));
    }

    function triggerDelivery(uint _itemIdentifier) public onlyOwner {
        require(items[_itemIdentifier].state == SupplyChainState.Paid, "Item is further in the chain");
        items[_itemIdentifier].state = SupplyChainState.Delivered;

        emit SupplyChainStep(_itemIdentifier, uint(items[_itemIdentifier].state), address(items[_itemIdentifier].externalItem));
    }
}

