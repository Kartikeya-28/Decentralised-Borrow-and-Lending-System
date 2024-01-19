import React from 'react'
import { useEffect, useState } from "react";
import "./Data.css";
const {ethers} = require("ethers");

const Data = ({state,account}) => {
  const [arr,setArr] = useState([]);
  const [txn,setTxn] = useState([]);
  const currentAddress = account;
  const contract = state.contract;
  const provider = state.provider;

  useEffect(() => {
    const maps = async () => {
      const l = Number(await contract.l(currentAddress));
      const b = Number(await contract.b(currentAddress));
      const bp = Number(await contract.bp(currentAddress));
      const lp = Number(await contract.lp(currentAddress));
   
      const arr = [];
      const txn = [];
      if(lp > 0){
          for(let i = 0 ; i < lp ; i++){
            const k = await contract.lend_pending(currentAddress,i);
            arr.push([k,0]);
          }
      }
      if(bp > 0){
          for(let i = 0 ; i < bp ; i++){
            const k = await contract.borrow_pending(currentAddress,i);
            arr.push([k,1]);
          }
      }
      if(l > 0){
          for(let i = 0 ; i < l ; i++){
            const k = await contract.lend(currentAddress,i);
            txn.push([k,2]);
          }
      }
      if(b > 0){
          for(let i = 0 ; i < b ; i++){
            const k = await contract.borrow(currentAddress,i)
            txn.push([k,3]);
          }
      }
      setArr(arr);
      setTxn(txn);
    }
    if(account !== "None") maps();
  });
  return (
    <>
      <h4 className="hdata">Requests and Transactions</h4>
        {arr.map(receipt=>{ 
          if(receipt[1] === 0){
            return(
              <div>
                <div className="tx">
                <div className="td td1">{receipt[0].to}</div>
                <div className="td td2">{receipt[0].message}</div>
                <div className="td td3">{new Date(receipt[0].timestamp * 1000).toLocaleString()}</div>
                <div className="td td4">{ethers.utils.formatEther(receipt[0].amount)}</div>
                </div>
                <span className="buttons">
                  <button className ="bData b1" onClick={async() =>{
                    const val = {value : ethers.utils.parseEther(ethers.utils.formatEther(receipt[0].amount))};
                    if(ethers.utils.formatEther(receipt[0].amount) > ethers.utils.formatEther(await provider.getBalance(currentAddress))){
                      alert("Insufficient Balance in account");
                      return(<></>)
                    }
                    await contract.lendMoney(receipt[0].to,ethers.utils.getAddress(currentAddress),receipt[0].message,ethers.utils.parseEther(ethers.utils.formatEther(receipt[0].amount)),receipt[0].timestamp,val);
                  }}>Accept</button>
                  <button className = "bData b2" onClick={async() => {
                    // for(let i =0 ; i < 2 ; i++){
                    //   const x = await contract.lend_pending(currentAddress,i);
                    //   console.log(x);
                    //   console.log(receipt[0].to === x.to);
                    //   console.log(receipt[0].timestamp === x.timestamp);
                    // }
                    await contract.reject(ethers.utils.getAddress(receipt[0].to),ethers.utils.getAddress(currentAddress),receipt[0].message,receipt[0].amount,receipt[0].timestamp);
                  }}>Reject</button>
                </span>
              </div>
            )
          }
          else{
            return(
                <div className="tx">
                  <div className="td td1">{receipt[0].to}</div>
                  <div className="td td2">{receipt[0].message}</div>
                  <div className="td td3">{new Date(receipt[0].timestamp * 1000).toLocaleString()}</div>
                  <div className="td td4">{ethers.utils.formatEther(receipt[0].amount)}</div>
                </div>
            )
          }
        })
        }
        {txn.map(receipt=>{
          if(receipt[1] === 2){
            return(
              <div className="tx tx1">
                <div className="td td1">{receipt[0].to}</div>
                <div className="td td2 ltd" style = {{textAlign : "center"}}>Lent</div>
                <div className="td td3">{new Date(receipt[0].timestamp * 1000).toLocaleString()}</div>
                <div className="td td4">{ethers.utils.formatEther(receipt[0].amount)}</div>
              </div>
            )
          }
          else{
            return(
              <div className="tx tx2">
                <div className="td td1">{receipt[0].to}</div>
                <div className="td td2 btd" style = {{textAlign : "center"}}>Borrowed</div>
                <div className="td td3">{new Date(receipt[0].timestamp * 1000).toLocaleString()}</div>
                <div className="td td4">{ethers.utils.formatEther(receipt[0].amount)}</div>
              </div>
            )
          }
        })
        }
    </>
  )
}

export default Data