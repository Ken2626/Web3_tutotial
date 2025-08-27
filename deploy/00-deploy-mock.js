const { DECIMAL, INITIAL_ANSWER } = require("../helper-hardhat-config")
const { developmentChains} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {

    if (developmentChains.includes(network.name)) {
        const { firstAccount } = await getNamedAccounts()
        console.log(`first account is ${firstAccount}`)
        // const secondAccount = (await getNamedAccounts()).secondAccount
        // console.log(`second account is ${secondAccount}`)
        console.log("this is a deploy mock function")

        const { deploy } = deployments
        await deploy("MockV3Aggregator", {
            from: firstAccount,
            args: [DECIMAL, INITIAL_ANSWER],
            log: true
        })
    }else{
        console.log("Enviroment is not local,mock contract is skipped.")
    }
}

module.exports.tags = ["all", "mock"]