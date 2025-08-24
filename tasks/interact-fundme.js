const { task } = require("hardhat/config")
task("interact-fundme", "interact with fundme contract").addParam("addr", "fundme contract address").setAction(async (taskArgs, hre) => {
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    const fundMe = fundMeFactory.attach(taskArgs.addr)

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
})
module.exports = {}