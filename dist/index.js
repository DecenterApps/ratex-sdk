"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateX = exports.Dexes = void 0;
const web3_1 = __importDefault(require("web3"));
const main_1 = require("./routing/main");
const graph_communication_1 = require("./swap/graph_communication");
var Dexes;
(function (Dexes) {
    Dexes["UNISWAP_V2"] = "UniswapV2";
    Dexes["UNISWAP_V3"] = "UniswapV3";
    Dexes["SUSHISWAP_V2"] = "Sushiswap";
    Dexes["BALANCER"] = "Balancer";
    Dexes["CAMELOT"] = "Camelot";
})(Dexes || (exports.Dexes = Dexes = {}));
class RateX {
    constructor(config) {
        this.rpcProvider = new web3_1.default(new web3_1.default.providers.HttpProvider(config.rpcUrl));
        this.chainId = config.chainId;
        this.graphApiKey = config.graphApiKey;
        this.dexes = config.dexes || [Dexes.SUSHISWAP_V2, Dexes.UNISWAP_V2, Dexes.UNISWAP_V3, Dexes.BALANCER, Dexes.CAMELOT];
    }
    ;
    async getQuote(tokenIn, tokenOut, amountIn) {
        const preFetchPools = Date.now();
        const pools = await (0, graph_communication_1.fetchPoolsData)(tokenIn, tokenOut, 5, 5, this.chainId, this.rpcProvider, this.graphApiKey, this.dexes);
        const middle = Date.now();
        const route = await (0, main_1.findRoute)(tokenIn, tokenOut, amountIn, pools, this.chainId);
        const finished = Date.now();
        console.log(middle - preFetchPools);
        return route;
    }
}
exports.RateX = RateX;
