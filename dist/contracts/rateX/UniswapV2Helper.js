"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUniswapV2HelperContract = CreateUniswapV2HelperContract;
const UniswapV2HelperAbi_1 = require("../abi/UniswapV2HelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateUniswapV2HelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(UniswapV2HelperAbi_1.UniswapV2HelperAbi, addresses_mainnet_1.UNISWAP_V2_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(UniswapV2HelperAbi_1.UniswapV2HelperAbi, addresses_arbitrum_1.UNISWAP_V2_HELPER_ADDRESS);
    }
}
