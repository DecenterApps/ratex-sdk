"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPoolsData = fetchPoolsData;
const index_1 = require("../index");
const my_local_storage_1 = require("./my_local_storage");
const UniswapV2_1 = __importDefault(require("../dexes/graph_queries/UniswapV2"));
const SushiSwapV2_1 = __importDefault(require("../dexes/graph_queries/SushiSwapV2"));
const UniswapV3_1 = __importDefault(require("../dexes/graph_queries/UniswapV3"));
const BalancerV2_1 = __importDefault(require("../dexes/graph_queries/BalancerV2"));
const CamelotV2_1 = __importDefault(require("../dexes/graph_queries/CamelotV2"));
let initializedMainnet = false;
let initializedArbitrum = false;
let initializedDexes = [];
let dexesPools = new Map();
async function initializeDexes(chainId, graphApiKey, dexes) {
    try {
        // Clear Previous Dex Graph Mappings and Initialized DEX array
        dexesPools.clear();
        initializedDexes = [];
        for (const dex of dexes) {
            let Dex;
            switch (dex) {
                case index_1.Dexes.BALANCER:
                    Dex = BalancerV2_1.default;
                    break;
                case index_1.Dexes.CAMELOT:
                    if (chainId === 1)
                        continue;
                    Dex = CamelotV2_1.default;
                    break;
                case index_1.Dexes.SUSHISWAP_V2:
                    Dex = SushiSwapV2_1.default;
                    break;
                case index_1.Dexes.UNISWAP_V2:
                    if (chainId === 42161)
                        continue;
                    Dex = UniswapV2_1.default;
                    break;
                case index_1.Dexes.UNISWAP_V3:
                    Dex = UniswapV3_1.default;
                    break;
                default:
                    throw Error("Invalid Dex value");
            }
            const dexInstance = Dex.initialize(my_local_storage_1.myLocalStorage);
            dexInstance.setEndpoint(chainId, graphApiKey);
            initializedDexes.push(dexInstance);
            dexesPools.set(dexInstance, []);
        }
    }
    catch (err) {
        console.error('Error reading directory dexes_graph:', err);
    }
}
async function checkInitializedDexes(chainId, graphApiKey, dexes) {
    if (chainId === 1 && !initializedMainnet) {
        await initializeDexes(chainId, graphApiKey, dexes);
        initializedArbitrum = false;
        initializedMainnet = true;
    }
    if (chainId === 42161 && !initializedArbitrum) {
        await initializeDexes(chainId, graphApiKey, dexes);
        initializedMainnet = false;
        initializedArbitrum = true;
    }
}
/*   Returns dictionary of dexes and their poolIds for token1 and token2:
 *   UniswapV3: [poolId1, poolId2, ...],
 *   SushiSwapV2: [poolId1, poolId2, ...]
 */
async function getPoolIdsForTokenPairs(tokenA, tokenB, numPools = 3, chainId, graphApiKey, dexes) {
    await checkInitializedDexes(chainId, graphApiKey, dexes);
    const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithTokenPair(tokenA, tokenB, numPools));
    const allPoolsResults = await Promise.all(allPoolsPromises);
    initializedDexes.forEach((dex, index) => {
        var _a;
        const pools = allPoolsResults[index];
        if (dexesPools.has(dex)) {
            (_a = dexesPools.get(dex)) === null || _a === void 0 ? void 0 : _a.push(...pools);
        }
        else {
            dexesPools.set(dex, pools);
        }
    });
}
/* Get pools from each dex in initializedDexes list that have token as one of the tokens in the pool
 * @param token: token address to match (for now the chain is Arbitrum -> param for the future)
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getPoolIdsForToken(token, numPools = 5, chainId, graphApiKey, dexes) {
    await checkInitializedDexes(chainId, graphApiKey, dexes);
    const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithToken(token, numPools));
    const allPoolsResults = await Promise.all(allPoolsPromises);
    initializedDexes.forEach((dex, index) => {
        var _a;
        const pools = allPoolsResults[index];
        if (dexesPools.has(dex)) {
            (_a = dexesPools.get(dex)) === null || _a === void 0 ? void 0 : _a.push(...pools);
        }
        else {
            dexesPools.set(dex, pools);
        }
    });
}
/* Get top pools from each dex in initializedDexes list - returns a list of poolIds
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getTopPools(numPools = 5, chainId, graphApiKey, dexes) {
    await checkInitializedDexes(chainId, graphApiKey, dexes);
    const allPoolsPromises = initializedDexes.map((dex) => dex.getTopPools(numPools));
    const allPoolsResults = await Promise.all(allPoolsPromises);
    initializedDexes.forEach((dex, index) => {
        var _a;
        const pools = allPoolsResults[index];
        if (dexesPools.has(dex)) {
            (_a = dexesPools.get(dex)) === null || _a === void 0 ? void 0 : _a.push(...pools);
        }
        else {
            dexesPools.set(dex, pools);
        }
    });
}
/* We are fetching pools from multiple dexes, so we might get duplicate pools
 * top numTopPools pools for tokenFrom and tokenTo are fetched from each DEX
 * top numTopPools by TVL from each DEX
 * top numTopPools that contain tokenFrom and tokenTo from each DEX (possible direct swap)
 */
async function fetchPoolsData(tokenFrom, tokenTo, numFromToPools = 5, numTopPools = 5, chainId, rpcProvider, graphApiKey, dexes) {
    let pools = [];
    dexesPools.forEach((poolInfos, dex) => {
        dexesPools.set(dex, []);
    });
    await checkInitializedDexes(chainId, graphApiKey, dexes);
    // call Graph API
    const promises = [];
    promises.push(getPoolIdsForToken(tokenFrom, numFromToPools, chainId, graphApiKey, dexes));
    promises.push(getPoolIdsForToken(tokenTo, numFromToPools, chainId, graphApiKey, dexes));
    promises.push(getTopPools(numTopPools, chainId, graphApiKey, dexes));
    promises.push(getPoolIdsForTokenPairs(tokenFrom, tokenTo, numFromToPools, chainId, graphApiKey, dexes));
    await Promise.all(promises);
    filterDuplicatePools();
    // call Solidity for additional pool data
    const dexPoolsPromises = [];
    for (let [dex, poolInfos] of dexesPools.entries()) {
        dexPoolsPromises.push(dex.getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider));
    }
    const allPoolsData = await Promise.all(dexPoolsPromises);
    allPoolsData.forEach((poolsData) => {
        pools.push(...poolsData);
    });
    return pools;
}
function filterDuplicatePools() {
    dexesPools.forEach((poolInfos, dex, self) => {
        const filteredPoolInfos = poolInfos.filter((poolInfo, index, allPoolInfos) => {
            return allPoolInfos.findIndex((pool2) => pool2.poolId === poolInfo.poolId) === index;
        });
        self.set(dex, filteredPoolInfos);
    });
}
