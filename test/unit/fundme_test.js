const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { assert, expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains } = require("../../helper-hardhat-config")
!developmentChains.includes(network.name) ? describe.skip :
    describe("test fundme contract", async function () {
        let fundMe
        let fundMeSecondAccount
        let firstAccount
        let secondAccount
        let mockV3Aggregator
        beforeEach(async function () {
            if (network.name == "hardhat") {
                console.log("network.name ==", network.name)
                await network.provider.send("hardhat_reset")
            }
            await deployments.fixture(["all"])
            firstAccount = (await getNamedAccounts()).firstAccount
            console.log(`beforeEach first account is ${firstAccount}`)
            secondAccount = (await getNamedAccounts()).secondAccount
            console.log(`beforeEach second account is ${secondAccount}`)
            const fundMeDeployment = await deployments.get("FundMe")
            mockV3Aggregator = await deployments.get("MockV3Aggregator")
            fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address)
            fundMeSecondAccount = await ethers.getContract("FundMe", secondAccount)
        })
        it("test if the owner is msg.sender", async function () {
            // const [firstAccount] = await ethers.getSigners()
            // const fundmeFactory = await ethers.getContractFactory("FundMe")
            // const fundMe = await fundmeFactory.deploy(180)
            await fundMe.waitForDeployment()
            console.log(`it first account is ${firstAccount}`)
            console.log(`fundMe.owner() is ${await fundMe.owner()}`)
            assert.equal((await fundMe.owner()), firstAccount)
        })
        it("test if the datafeed is assigned correctly", async function () {
            // const [firstAccount] = await ethers.getSigners()
            // const fundmeFactory = await ethers.getContractFactory("FundMe")
            // const fundMe = await fundmeFactory.deploy(180)
            await fundMe.waitForDeployment()

            //assert.equal((await fundMe.dataFeed()), "0x694AA1769357215DE4FAC081bf1f309aDC325306")
            assert.equal((await fundMe.dataFeed()), mockV3Aggregator.address)
        })

        //fund.
        it("window closed,value greater than minimum,fund failed", async function () {
            await helpers.time.increase(200)
            await helpers.mine()
            expect(fundMe.fund({ value: ethers.parseEther("0.00025") })).to.be.revertedWith("window is closed.")

        })
        it("window open,value less than minimum,fund failed", async function () {
            expect(fundMe.fund({ value: ethers.parseEther("0.00005") })).to.be.revertedWith("You need to send more ETH!")
        })
        it("window open,value greater than minimum,fund sucess", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            const balance = await fundMe.fundersToAmount(firstAccount)
            expect(balance).to.equal(ethers.parseEther("0.00025"))
            console.log("contract balance in USD:",
                (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
            )
        })
        //getFund
        it("window closed,no owner,target reached,getfund failed", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await helpers.time.increase(200)
            await helpers.mine()
            expect(fundMeSecondAccount.getFund()).to.be.revertedWith("this function can only be called by owner.")
            console.log("contract balance in USD:",
                (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
            )
        })

        it("window open,is owner,target reached,getfund failed", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await expect(fundMe.getFund()).to.be.revertedWith("window is not closed.")
            console.log("contract balance in USD:",
                (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
            )
        })

        it("window closed,is owner,target not reached,getfund failed", async function () {

            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            console.log("contract balance in USD:",
                (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
            )
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.getFund()).to.be.revertedWith("Target not met")
        })

        it("window closed,is owner,target reached,getfund sucess", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            console.log("contract balance in USD:",
                (await fundMe.convertETHToUSD(await ethers.provider.getBalance(fundMe.target))).toString()
            )
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.getFund()).to.emit(fundMe, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.00025") + ethers.parseEther("0.00025"))
        })
        //refund-window closed,target not reached,has balance
        it("window open ,target not reached,has balance,refund fail", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await expect(fundMe.refund()).to.be.revertedWith("window is not closed.")
        })
        it("window closed ,target reached,has balance,refund fail", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.refund()).to.be.revertedWith("Target met")
        })
        it("window closed ,target not reached,funder has no balance,refund fail", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMeSecondAccount.refund()).to.be.revertedWith("You are not a funder.")
        })
        it("window closed ,target not reached,funder has  balance,refund sucess", async function () {
            await fundMe.fund({ value: ethers.parseEther("0.00025") })
            await helpers.time.increase(200)
            await helpers.mine()
            await expect(fundMe.refund()).to.emit(fundMe, "ReFundByFunder").withArgs(firstAccount, ethers.parseEther("0.00025"))
        })
    })