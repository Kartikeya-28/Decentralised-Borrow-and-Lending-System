const {expect} = require("chai");
const hre = require("hardhat");

async function getBalances(_address){
    const balance = await hre.ethers.provider.getBalance(_address);
    return hre.ethers.formatEther(balance);
}

describe("myContract", function(){
    const Deploy = async () => {
        const [owner,_ad1,_ad2,_ad3,_ad4] = await hre.ethers.getSigners();
        const BandL = await hre.ethers.getContractFactory("BandL");
        const contract = await BandL.deploy();
        await contract.waitForDeployment();

        return {contract,owner,_ad1,_ad2,_ad3,_ad4};
    }

    describe("1) borrowMoney function working correctly" ,function() {
        it("request sent" , async function(){

            const {contract,owner,_ad1,_ad2,_ad3,_ad4} = await Deploy();
            const message = "Please lend me money"; 
            await contract.connect(_ad1).borrowMoney(_ad2.address,message,2);
            const x = await contract.bp(_ad1.address);
            const y = await contract.bp(_ad1.address);
            expect(x).to.be.equal(1);
            expect(y).to.be.equal(1);
        })

        it("borrower's account updated", async function(){
            const {contract,owner,_ad1,_ad2,_ad3,_ad4} = await Deploy();
            const message = "Please lend me money"; 

            const amount = hre.ethers.parseEther("2");
            await contract.connect(_ad1).borrowMoney(_ad3.address,message,amount);
            
            const receipt = await contract.borrow_pending(_ad1.address,Number(await contract.bp(_ad1.address))-1);
            expect(receipt.to).to.be.equal(_ad3.address);
            expect(receipt.message).to.be.equal(message);
            expect(receipt.amount).to.be.equal(amount);
        })

        it("lender's account updated",async function(){
            const {contract,owner,_ad1,_ad2,_ad3,_ad4} = await Deploy();
            const message = "Please lend me money"; 

            const amount = hre.ethers.parseEther("108");
            await contract.connect(_ad1).borrowMoney(_ad4.address,message,amount);
            
            const receipt = await contract.lend_pending(_ad4.address,Number(await contract.lp(_ad4.address))-1);
            expect(receipt.to).to.be.equal(_ad1.address);
            expect(receipt.message).to.be.equal(message);
            expect(receipt.amount).to.be.equal(amount);

            
        })
    })
    
    describe("2) reject function working correctly", function(){
        it("borrow request removed from the user account who sent it and to whom it was sent", async function(){
            const {contract,owner,_ad1,_ad2,_ad3,_ad4} = await Deploy();
            const message = "Please lend me money"; 

            const amount = hre.ethers.parseEther("108");
            await contract.connect(_ad1).borrowMoney(_ad4.address,message,amount);

            const initiaLength = Number(await contract.bp(_ad1.address));
            const receipt = await contract.borrow_pending(_ad1.address,Number(await contract.bp(_ad1.address))-1);
            await expect(contract.connect(_ad1).reject(_ad1.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp)).to.be.revertedWith("You aren't the person to whom the request was made!");
            await expect(contract.connect(_ad4).reject(_ad1.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp)).not.to.be.reverted;

            expect(Number(await contract.bp(_ad1.address))).to.be.equal(initiaLength-1);
            expect(Number(await contract.lp(_ad4.address))).to.be.equal(initiaLength-1);
        })
    })

    describe("3) lendMoney function is also working fine", function(){
        const call = async () =>{
            const {contract,owner,_ad1,_ad2,_ad3,_ad4} = await Deploy();
            const message = "Please lend me money"; 

            const amount = hre.ethers.parseEther("108");
            await contract.connect(_ad2).borrowMoney(_ad3.address,message,amount);
            const receipt = await contract.borrow_pending(_ad2.address , 0);
            return {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt};
        }

        it("revert if less amount sent than requested", async function(){
            
            const {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt} = await call();
            const val = {value : hre.ethers.parseEther("10")};
            expect(Number(await contract.bp(_ad2.address))).to.be.equal(1);
            expect(Number(await contract.lp(_ad3.address))).to.be.equal(1);

            await expect(contract.connect(_ad3).lendMoney(_ad2.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp,val)).to.be.revertedWith("Less amount sent than requested!");

        })

        it("revert if some other user responds to the request for lending", async function(){

            const {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt} = await call();
            const val = {value : hre.ethers.parseEther("109")};
            await expect(contract.connect(_ad2).lendMoney(_ad2.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp,val)).to.be.revertedWith("You aren't the person to whom the request was made!");
        
        })

        it("amount was deducted from the lender's account and added to borrower's account", async function(){
            const {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt} = await call();
            const val = {value : hre.ethers.parseEther("109")};
            
            const oldLenderBalance = await getBalances(_ad3.address);
            const oldBorrowerbalance = await getBalances(_ad2.address);
            await contract.connect(_ad3).lendMoney(_ad2.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp,val);

            const newLenderBalance = await getBalances(_ad3.address);
            const newBorrowerbalance = await getBalances(_ad2.address);
            
            expect(oldLenderBalance-newLenderBalance).to.be.greaterThan(109);
            expect(newBorrowerbalance-oldBorrowerbalance).to.be.equal(109);
        })

        it("both pending lists are updated", async function(){

            const {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt} = await call();
            const val = {value : hre.ethers.parseEther("3")};

            const message = "Borrow request";
            await contract.connect(_ad1).borrowMoney(_ad3.address,message,2);
            await contract.connect(_ad4).borrowMoney(_ad3.address,message,2);

            const newreceipt = await contract.borrow_pending(_ad1.address , 0);

            await contract.connect(_ad3).lendMoney(_ad1.address,newreceipt.to,newreceipt.message,newreceipt.amount,newreceipt.timestamp,val);

            expect(Number(await contract.lp(_ad3.address))).to.be.equal(2);
            expect(Number(await contract.bp(_ad1.address))).to.be.equal(0);
            expect(Number(await contract.bp(_ad4.address))).to.be.equal(1);
            expect(Number(await contract.bp(_ad2.address))).to.be.equal(1);

        })

        it("receipts correctly added to borrower's address and lender's address",async function(){
            const {contract,owner,_ad1,_ad2,_ad3,_ad4,receipt} = await call(); // receipt is borrower receipt
            const val = {value : hre.ethers.parseEther("109")};
            const amount = hre.ethers.parseEther("108");
            await contract.connect(_ad3).lendMoney(_ad2.address,receipt.to,receipt.message,receipt.amount,receipt.timestamp,val);

            const receiptAddedforLender = await contract.lend(_ad3.address,0);
            const receiptAddedforBorrower = await contract.borrow(_ad2.address,0);

            expect(await contract.bp(_ad2.address)).to.be.equal(0);
            expect(await contract.lp(_ad3.address)).to.be.equal(0);
            expect(await contract.b(_ad2.address)).to.be.equal(1);
            expect(await contract.l(_ad3.address)).to.be.equal(1);

            expect(receipt.to).to.be.equal(receiptAddedforBorrower.to);
            expect(receiptAddedforLender.to).to.be.equal(_ad2.address);

            expect(receipt.amount).to.be.equal(receiptAddedforBorrower.amount);
            expect(receiptAddedforBorrower.amount).to.be.equal(receiptAddedforLender.amount);
            expect(receiptAddedforLender.amount).to.be.equal(amount);
        })
    })
})


