"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Curve_1 = require("../pools/Curve");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const dexIdsList_1 = require("../dexIdsList");
const CurveMainnetGraph_json_1 = __importDefault(require("./hardcoded/CurveMainnetGraph.json"));
const CurveArbitrumGraph_json_1 = __importDefault(require("./hardcoded/CurveArbitrumGraph.json"));
const CurveHelper_1 = require("../../contracts/rateX/CurveHelper");
// For curve we use the official API instead of a graph query
class Curve {
    constructor() {
        this.dexId = dexIdsList_1.dexIds.CURVE;
        this.chainId = 1;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new Curve();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    setEndpoint(chainId) {
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        return ((this.chainId == 1) ? CurveMainnetGraph_json_1.default : CurveArbitrumGraph_json_1.default).map(e => {
            const obj = e;
            const poolInfo = {
                poolId: obj.poolId,
                dexId: obj.dexId,
                tokens: obj.tokens.map((coin, index) => {
                    return {
                        _address: coin._address,
                        decimals: parseInt(coin.decimals),
                        name: coin.name,
                    };
                }),
            };
            return poolInfo;
        });
    }
    async getPoolsWithTokenPair(token1, token2, first) {
        return [];
    }
    async getPoolsWithToken(token, numPools) {
        return [];
    }
    // calls to Solidity for additional data
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        //@ts-ignore
        const CurveHelperContract = (0, CurveHelper_1.CreateCurveHelperContract)(this.chainId, rpcProvider);
        const rawData = await CurveHelperContract.methods.getPoolsData(poolInfos).call();
        const pools = [];
        for (let pool of rawData) {
            const poolId = pool[0];
            const dexId = pool[1];
            const tokensRaw1 = pool[2][0];
            const tokensRaw2 = pool[2][1];
            const token1 = {
                _address: tokensRaw1[0],
                decimals: Number(tokensRaw1[1]),
            };
            const token2 = {
                _address: tokensRaw2[0],
                decimals: Number(tokensRaw2[1]),
            };
            let noLiquidity = false;
            for (let reserve of pool[3]) {
                if (reserve == BigInt(0)) {
                    noLiquidity = true;
                }
            }
            if (noLiquidity) {
                continue;
            }
            const reserves = pool[3].map((reserve) => new bignumber_js_1.default(reserve.toString()));
            pools.push(new Curve_1.CurvePool(pool[0], pool[1], [token1, token2], reserves, pool[4], pool[5]));
        }
        for (const pool of pools)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools;
    }
}
exports.default = Curve;
