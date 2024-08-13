"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCurveHelperContract = CreateCurveHelperContract;
const CurveHelperAbi_1 = require("../abi/CurveHelperAbi");
const addresses_mainnet_1 = require("../addresses-mainnet");
const addresses_arbitrum_1 = require("../addresses-arbitrum");
function CreateCurveHelperContract(chainId, web3) {
    if (chainId === 1) {
        return new web3.eth.Contract(CurveHelperAbi_1.CurveHelperAbi, addresses_mainnet_1.CURVE_HELPER_ADDRESS);
    }
    else {
        return new web3.eth.Contract(CurveHelperAbi_1.CurveHelperAbi, addresses_arbitrum_1.CURVE_HELPER_ADDRESS);
    }
}
