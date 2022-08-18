import { useState } from "react";
import useEth from "../../contexts/EthContext/useEth";

function ContractBtns() {
  const { state: { contract, accounts } } = useEth();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [paidStatus, setPaidStatus] = useState("");
  const [itemShip, setItemShip] = useState(-1);
  const [toSendAddress, setToSendAddress] = useState("");

  const getItemPrice = async () => {
    const value = await contract.methods.getItemValue(0).call({ from: accounts[0] });
    console.log(value)
  };

  const createItem = async () => {
    const result = await contract.methods.createItem(title, price*1).send({ from: accounts[0] });
    setToSendAddress(result.events.SupplyChainStep.returnValues._itemAddress)
      setTitle("")
      setPaidStatus("Payment status: false")
  };

  const listenToPaymentEvent = () => {
      contract.events.SupplyChainStep().on("data", async (e) => {
          let itemObj = await contract.methods.items(e.returnValues._itemIdentifier).call()
          if (itemObj.externalItem === toSendAddress) {
              setPaidStatus("Payment status: true")
              setItemShip(e.returnValues._itemIdentifier*1)
          }
      })
  }

  const deliveryCall = async () => {
      let result = await contract.methods.triggerDelivery(itemShip).send({ from: accounts[0] })
      console.log(result)
  }

  listenToPaymentEvent()

  return (
    <div>
        <h1>Triggers</h1>
        <h3>Add Item</h3>
        Cost in Wei: <input
            type="text"
            name="cost"
            value={price}
            onChange={(event) => {setPrice(event.target.value)}}
            placeholder="Wei"
        />
        Item name: <input
            type="text"
            name="item_name"
            value={title}
            onChange={(event) => {setTitle(event.target.value)}}
            placeholder="Item name"
        />

    <h4 style={toSendAddress !== "" ? {display: "block"} : {display: "none"}}>{`You need to send ${price} of Wei to this address: ${toSendAddress}`}</h4>

    <div className="btns">
        <button onClick={createItem}>
            Create Item
        </button>

        <div onClick={getItemPrice} className="input-btn">
            Get Some Shit
        </div>

        <div style={paidStatus === "Payment status: true" ? {display: "block"} : {display: "none"}}
             onClick={deliveryCall}
             className="input-btn">
            Deliver Some Shit
        </div>
    </div>

    <h4>{paidStatus}</h4>
    </div>
  );
}

export default ContractBtns;
