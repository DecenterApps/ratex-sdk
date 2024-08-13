"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPoolsData = fetchPoolsData;
const my_local_storage_1 = require("./my_local_storage");
let initializedMainnet = false;
let initializedArbitrum = false;
let initializedDexes = [];
let dexesPools = new Map();
async function initializeDexes(chainId, graphApiKey) {
    try {
        // Clear Previous Dex Graph Mappings and Initialized DEX array
        dexesPools.clear();
        initializedDexes = [];
        // CHANGE DEXES FOR ALGORITHM
        const files = [
            'SushiSwapV2.ts',
            'UniswapV3.ts',
            'BalancerV2.ts',
            //'Curve.ts',
            //'CamelotV2.ts',
            'UniswapV2.ts',
        ];
        for (const file of files) {
            if (file.endsWith('.ts')) {
                if (chainId === 1 && file === 'CamelotV2.ts') {
                    continue;
                }
                if (chainId === 42161 && file === 'UniswapV2.ts') {
                    continue;
                }
                const module = await Promise.resolve(`${`../dexes/graph_queries/${file}`}`).then(s => __importStar(require(s)));
                const dex = module.default.initialize(my_local_storage_1.myLocalStorage);
                dex.setEndpoint(chainId, graphApiKey);
                initializedDexes.push(dex);
                dexesPools.set(dex, []);
            }
        }
    }
    catch (err) {
        console.error('Error reading directory dexes_graph:', err);
    }
}
async function checkInitializedDexes(chainId, graphApiKey) {
    if (chainId === 1 && !initializedMainnet) {
        await initializeDexes(chainId, graphApiKey);
        initializedArbitrum = false;
        initializedMainnet = true;
    }
    if (chainId === 42161 && !initializedArbitrum) {
        await initializeDexes(chainId, graphApiKey);
        initializedMainnet = false;
        initializedArbitrum = true;
    }
}
/*   Returns dictionary of dexes and their poolIds for token1 and token2:
 *   UniswapV3: [poolId1, poolId2, ...],
 *   SushiSwapV2: [poolId1, poolId2, ...]
 */
async function getPoolIdsForTokenPairs(tokenA, tokenB, numPools = 3, chainId, graphApiKey) {
    await checkInitializedDexes(chainId, graphApiKey);
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
async function getPoolIdsForToken(token, numPools = 5, chainId, graphApiKey) {
    await checkInitializedDexes(chainId, graphApiKey);
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
async function getTopPools(numPools = 5, chainId, graphApiKey) {
    await checkInitializedDexes(chainId, graphApiKey);
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
async function fetchPoolsData(tokenFrom, tokenTo, numFromToPools = 5, numTopPools = 5, chainId, rpcProvider, graphApiKey) {
    let pools = [];
    dexesPools.forEach((poolInfos, dex) => {
        dexesPools.set(dex, []);
    });
    await checkInitializedDexes(chainId, graphApiKey);
    // call Graph API
    const promises = [];
    promises.push(getPoolIdsForToken(tokenFrom, numFromToPools, chainId, graphApiKey));
    promises.push(getPoolIdsForToken(tokenTo, numFromToPools, chainId, graphApiKey));
    promises.push(getTopPools(numTopPools, chainId, graphApiKey));
    promises.push(getPoolIdsForTokenPairs(tokenFrom, tokenTo, numFromToPools, chainId, graphApiKey));
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
