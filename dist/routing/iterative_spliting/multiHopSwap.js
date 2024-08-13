"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiHopSwap = multiHopSwap;
exports.createGraph = createGraph;
const max_hops = 4;
/*  The algorithm to find the best route for each iteration (highest output amount) is seen below.
*   It is based on dynamic programming.
*   @param amountIn: The amount of tokenIn that we want to swap (in wei)
*   @param tokenIn: The address of the token we want to swap (address on Arbitrum)
*   @param tokenOut: The address of the token we want to receive (address on Arbitrum)
*   @param graph: The graph of all the fetched pools
*/
function multiHopSwap(amountIn, tokenIn, tokenOut, graph) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    tokenIn = tokenIn.toLowerCase();
    tokenOut = tokenOut.toLowerCase();
    // dp[hop][token]
    const dp = new Map();
    dp.set(0, new Map());
    (_a = dp.get(0)) === null || _a === void 0 ? void 0 : _a.set(tokenIn, { amountOut: amountIn, path: [tokenIn], swaps: [] });
    const res = { amountOut: BigInt(-1), path: [], swaps: [] };
    for (let hop = 0; hop < max_hops - 1; hop++) {
        (_b = dp.get(hop)) === null || _b === void 0 ? void 0 : _b.forEach((dpInfo, tokenA) => {
            var _a;
            (_a = graph.get(tokenA)) === null || _a === void 0 ? void 0 : _a.forEach((pool) => {
                pool.tokens.forEach((tokenB) => {
                    var _a, _b, _c;
                    if (dpInfo.path.includes(tokenB._address)) {
                        return;
                    }
                    // console.log(hop, pool.poolId, tokenA, tokenB._address, dpInfo.amountOut)
                    const amountOut = pool.calculateExpectedOutputAmount(tokenA, tokenB._address, dpInfo.amountOut);
                    if (amountOut <= 0) {
                        return;
                    }
                    const newPath = [...dpInfo.path, tokenB._address];
                    const currSwap = { poolId: pool.poolId, dexId: pool.dexId, tokenIn: tokenA, tokenOut: tokenB._address };
                    const newSwaps = [...dpInfo.swaps, currSwap];
                    if (!dp.has(hop + 1)) {
                        dp.set(hop + 1, new Map());
                    }
                    const dpEntry = dp.get(hop + 1);
                    if (!(dpEntry === null || dpEntry === void 0 ? void 0 : dpEntry.has(tokenB._address))) {
                        (_a = dp.get(hop + 1)) === null || _a === void 0 ? void 0 : _a.set(tokenB._address, { amountOut: amountOut, path: newPath, swaps: newSwaps });
                    }
                    else if (amountOut > (((_b = dpEntry === null || dpEntry === void 0 ? void 0 : dpEntry.get(tokenB._address)) === null || _b === void 0 ? void 0 : _b.amountOut) || 0)) {
                        (_c = dp.get(hop + 1)) === null || _c === void 0 ? void 0 : _c.set(tokenB._address, { amountOut: amountOut, path: newPath, swaps: newSwaps });
                    }
                });
            });
        });
        if (((_c = dp.get(hop + 1)) === null || _c === void 0 ? void 0 : _c.has(tokenOut)) && (((_e = (_d = dp.get(hop + 1)) === null || _d === void 0 ? void 0 : _d.get(tokenOut)) === null || _e === void 0 ? void 0 : _e.amountOut) || -1) > res.amountOut) {
            res.amountOut = ((_g = (_f = dp.get(hop + 1)) === null || _f === void 0 ? void 0 : _f.get(tokenOut)) === null || _g === void 0 ? void 0 : _g.amountOut) || BigInt(0);
            res.path = ((_j = (_h = dp.get(hop + 1)) === null || _h === void 0 ? void 0 : _h.get(tokenOut)) === null || _j === void 0 ? void 0 : _j.path) || [];
            res.swaps = ((_l = (_k = dp.get(hop + 1)) === null || _k === void 0 ? void 0 : _k.get(tokenOut)) === null || _l === void 0 ? void 0 : _l.swaps) || [];
        }
    }
    return {
        swaps: res.swaps,
        quote: res.amountOut,
        percentage: 0,
        amountIn: BigInt(0) // will be set in iterative splitting when we know percentage
    };
}
/* Function to create a graph from all the fetched pools
*  Graph maps every token to a list of pools that token is in
*  @param pools: The fetched pools
*  @returns The graph
*/
function createGraph(pools) {
    var _a;
    const graph = new Map();
    for (let pool of pools) {
        const poolId = pool.poolId;
        for (let token of pool.tokens) {
            if (!graph.has(token._address)) {
                graph.set(token._address, []);
            }
            (_a = graph.get(token._address)) === null || _a === void 0 ? void 0 : _a.push(pool);
        }
    }
    return graph;
}
