const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name) ? describe.skip :
describe("test fundme contract", async function () {
    let fundMe

    let firstAccount

    beforeEach(async function () {

        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        console.log(`beforeEach first account is ${firstAccount}`)

        const fundMeDeployment = await deployments.get("FundMe")

        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)

    })
    //test fund and getFund successfully
    it("fund and getFund successfully", async function () {
        await fundMe.fund({ value: ethers.parseEther("0.00025") })
        await fundMe.fund({ value: ethers.parseEther("0.00025") })
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))
        console.log("contract balance in USD:",
            (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
        )
        //make sure get receipt
        const getFundTx = await fundMe.getFund()
        const getFundReceipt = await getFundTx.wait()
        expect(getFundReceipt).to.emit(fundMe, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.00025") + ethers.parseEther("0.00025"))

    })
    //test fund and refund successfully
    it("fund and reFund successfully", async function () {

        //target not met
        await fundMe.fund({ value: ethers.parseEther("0.00025") })
        //window closed
        await new Promise(resolve => setTimeout(resolve, 181 * 1000))
        console.log("contract balance in USD:",
            (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
        )
        //make sure get receipt
        const refundTx = await fundMe.refund()
        const refundReceipt = await refundTx.wait()
        expect(refundReceipt).to.emit(fundMe, "ReFundByFunder").withArgs(firstAccount, ethers.parseEther("0.00025"))
    })
})