const hre = require("hardhat");


async function main(){
    const BandL = await hre.ethers.getContractFactory("BandL");
    const contract = await BandL.deploy();
    
    await contract.waitForDeployment();

    console.log("Contract Address:", contract.target);
}



main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});