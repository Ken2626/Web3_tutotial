// function deployFunction(){

const { network } = require("hardhat")
const { developmentChains, networkConfig, LOCKTIME, CONFIRMATIONS } = require("../helper-hardhat-config")

//     console.log("this is a deploy function")
// }
//module.exports.default=deployFunction

// module.exports = async (hre) => {
//     const getNameAccounts = hre.getNameAccounts
//     const deployments = hre.deployments
//     console.log("this is a deploy function")
// }

module.exports = async (hre) => {
    const { getNamedAccounts, deployments, network, run } = hre
    const { firstAccount } = await getNamedAccounts()
    console.log(`first account is ${firstAccount}`)
    // const secondAccount = (await getNamedAccounts()).secondAccount
    // console.log(`second account is ${secondAccount}`)
    console.log("this is a deploy function")

    //const {deploy} = await deployments

    const { deploy } = deployments

    let dataFeedAddr
    let confirmations
    if (developmentChains.includes(network.name)) {
        const MockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = MockV3Aggregator.address
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCKTIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    })
    //remove /deployment or add --reset flag
    if (hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_APIKEY) {
        // console.log(`等待 5 个确认`)
        // const tx = await ethers.provider.getTransaction(fundMe.transactionHash)
        // await tx.wait(5)   // 等 5 个区块确认
        // console.log(`确认完成，开始 verify`)

        await run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCKTIME, dataFeedAddr],
        })
    } else {
        console.log("network is not sepolia,verification skipped.")
    }
}

module.exports.tags = ["all", "fundme"]