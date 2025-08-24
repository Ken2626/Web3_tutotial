const { ethers } = require("hardhat")

async function main() {
    // create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log(`contract deploying`)
    const fundMe = await fundMeFactory.deploy(300)
    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`)
    // 等待 5 个确认/*
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY) {
        console.log(`等待 5 个确认`)
        await fundMe.deploymentTransaction().wait(5)
        console.log(`verifyFundMe`)
        await verifyFundMe(fundMe.target, [300])

    } else {
        console.log(`Verification skipped.`)
    }



    const [firstAccount, secondAccount] = await ethers.getSigners()
    const fundTx = await fundMe.fund({ value: ethers.parseEther("0.00025") })
    await fundTx.wait()
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContract}`)

    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.00025") })
    await fundTxWithSecondAccount.wait()


    const balanceOfContractAfterSecondAccount = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of the contract is ${balanceOfContractAfterSecondAccount}`)

    const firstAccountBalancInFundMe = await fundMe.fundersToAmount(firstAccount.address)

    const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account ${firstAccount.address} is ${firstAccountBalancInFundMe}`)
    console.log(`Balance of second account ${secondAccount.address} is ${secondAccountBalanceInFundMe}`)
}










async function verifyFundMe(fundMeAddr, _lockTime) {

    await hre.run("verify:verify", {
        address: fundMeAddr,
        constructorArguments: _lockTime,
    });
}
main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})