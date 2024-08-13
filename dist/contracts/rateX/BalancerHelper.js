"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBalancerHelperContract = CreateBalancerHelperContract;
const BalancerHelperAbi_1 = require("../abi/BalancerHelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateBalancerHelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(BalancerHelperAbi_1.BalancerHelperAbi, addresses_mainnet_1.BALANCER_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(BalancerHelperAbi_1.BalancerHelperAbi, addresses_arbitrum_1.BALANCER_HELPER_ADDRESS);
    }
}
