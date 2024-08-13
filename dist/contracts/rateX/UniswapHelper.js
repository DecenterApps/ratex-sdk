"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUniswapHelperContract = CreateUniswapHelperContract;
const UniswapHelperAbi_1 = require("../abi/UniswapHelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateUniswapHelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(UniswapHelperAbi_1.UniswapHelperAbi, addresses_mainnet_1.UNISWAP_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(UniswapHelperAbi_1.UniswapHelperAbi, addresses_arbitrum_1.UNISWAP_HELPER_ADDRESS);
    }
}
