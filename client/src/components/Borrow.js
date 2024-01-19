import { useState } from "react";
import "./Borrow.css"
const {ethers} = require("ethers");

const Borrow = ({state}) => {
  const [i1,setI1] = useState("")
  const [i2,setI2] = useState("")
  const [i3,setI3] = useState("")
  const sendRequest = async (event) =>{
    event.preventDefault();
    const contract = state.contract;
    
    const address = document.querySelector("#address").value;
    const message = document.querySelector("#message").value;
    const amount = ethers.utils.parseEther(document.querySelector("#amount").value);
    if(ethers.utils.isAddress(address) === true /*&& typeof(amount) === Number */){
      contract.borrowMoney(ethers.utils.getAddress(address),message,amount);
      setI1("");
      setI2("");
      setI3("");
      return;
    }
    else if(ethers.utils.isAddress(address) === true && typeof(amount) !== Number){
      console.log(typeof(amount));
      console.log(typeof(amount) !== Number);
      alert("Please type numerical value");
      return;
    }
    else{
      alert("Please type correct address");
      return;
    }
  }
  return (
    <div>
        <h4 className="hcss">Borrow Money</h4>
        <form>
            <div>
            <span className="borrowLabel">
            <label>From: </label>
            </span>
            <input className = "inputLabel i1" type="text" value = {i1} placeholder="Enter address of the wallet..." id = "address" disabled = {!state.contract} onChange={(e)=>{setI1(e.target.value);}}/>
            </div>
            <div>
            <span className="borrowLabel">
            <label>Message: </label>
            </span>
            <input className = "inputLabel i2" type="text" value = {i2} placeholder="Enter your message..." id = "message" disabled = {!state.contract} onChange={(e)=>{setI2(e.target.value);}}/>
            </div>
            <div>
            <span className="borrowLabel">
            <label>Amount: </label>
            </span>
            <input className = "inputLabel i3" type="text" value = {i3} placeholder="Enter amount to borrow (in eth)..." id = "amount" disabled = {!state.contract} onChange={(e)=>{setI3(e.target.value);}}/>
            </div>
            <button 
              className="b"
              onClick = {sendRequest}
              disabled = {!state.contract}
            >Send</button>
        </form>
    </div>
  )
}

export default Borrow;