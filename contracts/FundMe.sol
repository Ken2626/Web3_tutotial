//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe {
    mapping(address => uint256) public fundersToAmount;
    uint256 constant MINIMUM_VALUE = 1 * 1e18;
    AggregatorV3Interface internal dataFeed;
    uint256 constant TARGET = 2 * 1e18;
    address public owner;
    uint256 deploymentTimeStamp;
    uint256 lockTime;
    address erc20Addr;
         bool public getFundSuccess = false;

    constructor(uint256 _lockTime) {
        //sepolia testnet
        dataFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        owner = msg.sender;
        deploymentTimeStamp = block.timestamp;
        lockTime = _lockTime;
    }

    function fund() external payable {
        require(
            convertETHToUSD(msg.value) >= MINIMUM_VALUE,
            "You need to send more ETH!"
        );
        require(
            block.timestamp < deploymentTimeStamp + lockTime,
            "window is closed."
        );
        fundersToAmount[msg.sender] = msg.value;
    }

    /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */,
            int256 answer,
            /*uint256 startedAt*/,
            /*uint256 updatedAt*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertETHToUSD(uint256 ethAmount)
        internal
        view
        returns (uint256)
    {
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return (ethAmount * ethPrice) / (10**8);
    }

    function getFund() external windowClosed onlyOwner {
        require(
            convertETHToUSD(address(this).balance) >= TARGET,
            "Target not met"
        );

        //payable(msg.sender).transfer(address(this).balance);

        // bool success = payable(msg.sender).send(address(this).balance);
        // require(success,"tx failed.");

        (getFundSuccess, ) = payable(msg.sender).call{value: address(this).balance}(
            ""
        );
        require(getFundSuccess, "tx failed.");
        //fundersToAmount[msg.sender]=0?
    }

    function refund() external windowClosed {
        require(convertETHToUSD(address(this).balance) < TARGET, "Target met");
        uint256 amount = fundersToAmount[msg.sender];
        require(amount != 0, "You are not a funder.");
        bool success;
        (success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "tx failed.");
        fundersToAmount[msg.sender];
    }

    function setErc20Addr(address _erc20Addr) external onlyOwner {
        erc20Addr = _erc20Addr;
    }

    function setFunderToAmount(address funder, uint256 amountToUpdate)
        external
    {
        require(
            msg.sender == erc20Addr,
            "You dont have permission to call this function"
        );
        fundersToAmount[funder] = amountToUpdate;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    modifier windowClosed() {
        require(
            block.timestamp >= deploymentTimeStamp + lockTime,
            "window is not closed."
        );
        _;
    }
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "this function can only be called by owner."
        );
        _;
    }
}
