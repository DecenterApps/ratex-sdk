"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSushiSwapHelperContract = CreateSushiSwapHelperContract;
const SushiSwapHelperAbi_1 = require("../abi/SushiSwapHelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateSushiSwapHelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(SushiSwapHelperAbi_1.SushiSwapHelperAbi, addresses_mainnet_1.SUSHISWAP_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(SushiSwapHelperAbi_1.SushiSwapHelperAbi, addresses_arbitrum_1.SUSHISWAP_HELPER_ADDRESS);
    }
}
