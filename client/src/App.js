import './App.css';
import { useState, useEffect } from 'react';
import abi from './contract/BandL.json';
import Borrow from './components/Borrow';
import Data from './components/Data';

const {ethers} = require("ethers");


function App() {
  const [state,setState] = useState({
    provider : null,
    signer: null,
    contract : null
  })
  const [account,setAccount] = useState("None");
  const [x,setX] = useState("Connect");
  const connectWallet = async()=>{
    const contractAddress = '0x8194f94eF3E128d1eB8E96743d6dB90E00b19AEf';
    const contractAbi = abi.abi;
    
    try{
      if(window.ethereum != null && x === "Connect"){
        const account = await window.ethereum.request({method : 'eth_requestAccounts',});
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress,contractAbi,signer);
        
        window.ethereum.on("chainChanged", () =>{
          window.location.reload();
        })

        window.ethereum.on("accountsChanged", ()=>{
          window.location.reload();
          // const account = await window.ethereum.request({method : 'eth_requestAccounts',});
          // setAccount(account[0]);
          // setState({provider,signer,contract});
        })

        setAccount(account[0]);
        setX("Disconnect");
        setState({provider,signer,contract});
      }
      else if(x === "Disconnect"){
        window.location.reload();
        setX("Connect");
        setAccount("None");
      }
    }catch(error){
      console.log(error);
    }
  }
  return(
    <>
      <button className = "bclass" onClick={connectWallet}>{x}</button>
      <div className="classP">{account}</div>
      <Borrow state = {state}/>
      <Data state = {state} account = {account}/> 
    </>
  )
}
export default App;

