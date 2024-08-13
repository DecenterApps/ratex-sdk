"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCamelotHelperContract = CreateCamelotHelperContract;
const CamelotHelperAbi_1 = require("../abi/CamelotHelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateCamelotHelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(CamelotHelperAbi_1.CamelotHelperAbi, addresses_mainnet_1.CAMELOT_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(CamelotHelperAbi_1.CamelotHelperAbi, addresses_arbitrum_1.CAMELOT_HELPER_ADDRESS);
    }
}
