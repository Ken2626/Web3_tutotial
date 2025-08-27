const DECIMAL = 8
const INITIAL_ANSWER = 450000000000
const developmentChains = ["hardhat", "local"]
const networkConfig = {
    11155111: {
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97: {
        ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}
const LOCKTIME = 180
const CONFIRMATIONS = 5
module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    networkConfig,
    LOCKTIME,
    CONFIRMATIONS
}