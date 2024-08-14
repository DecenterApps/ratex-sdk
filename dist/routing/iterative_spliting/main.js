"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRouteWithIterativeSplitting = findRouteWithIterativeSplitting;
const my_local_storage_1 = require("../../swap/my_local_storage");
const multiHopSwap_1 = require("./multiHopSwap");
const object_hash_1 = __importDefault(require("object-hash"));
/*  Simple algorithm that splits the input amount into (100/step) parts of step% each and finds the best route for each split.
    The algorithm to find the best route for each iteration finds the route with the highest output amount.
    (code is seen in ./multiHopSwap.ts)
    After each iteration, the pools are updated with the amounts that passed through them.
*/
async function findRouteWithIterativeSplitting(tokenA, tokenB, amountIn, pools, chainId) {
    const graph = (0, multiHopSwap_1.createGraph)(pools);
    // percentage of the amountIn that we split into
    const step = 5;
    let amountOut = BigInt(0);
    const poolMap = new Map(pools.map((pool) => [pool.poolId, pool]));
    const routes = new Map();
    const splitAmountIn = (amountIn * BigInt(step)) / BigInt(100);
    for (let i = 0; i < 100; i += step) {
        const route = (0, multiHopSwap_1.multiHopSwap)(splitAmountIn, tokenA, tokenB, graph);
        const routeHash = (0, object_hash_1.default)(route.swaps);
        let existingRoute = routes.get(routeHash);
        if (!existingRoute) {
            route.percentage = step;
            routes.set(routeHash, route);
        }
        else {
            existingRoute.percentage += step;
        }
        amountOut += route.quote;
        updatePoolsInRoute(poolMap, route, splitAmountIn);
    }
    const foundRoutes = [];
    for (let route of routes.values()) {
        route.amountIn = (BigInt(route.percentage) * amountIn) / BigInt(100);
        foundRoutes.push(route);
    }
    const missingAmount = amountIn - foundRoutes.reduce((acc, route) => acc + route.amountIn, BigInt(0));
    foundRoutes[0].amountIn += missingAmount;
    const quote = { routes: foundRoutes, quote: amountOut };
    let total = BigInt(0);
    const resetPools = new Set();
    for (const route of quote.routes) {
        let progress = route.amountIn;
        for (const swap of route.swaps) {
            const pool = my_local_storage_1.myLocalStorage.getItem(swap.poolId.toLowerCase());
            if (!pool)
                throw Error("Error caching pools");
            if (!resetPools.has(swap.poolId.toLowerCase())) {
                pool.reset();
                resetPools.add(swap.poolId.toLowerCase());
            }
            const amount = pool.calculateExpectedOutputAmount(swap.tokenIn, swap.tokenOut, progress);
            pool.update(swap.tokenIn, swap.tokenOut, progress, amount);
            progress = amount;
        }
        route.quote = progress;
        total += progress;
    }
    quote.quote = total;
    if (quote.routes[0].swaps.length == 0)
        quote.quote = BigInt(0);
    return quote;
}
// Function to update all the pools in a route with the amounts that passed through them
function updatePoolsInRoute(poolMap, route, amountIn) {
    for (let swap of route.swaps) {
        const pool = poolMap.get(swap.poolId);
        if (!pool) {
            console.log('Pool ', swap.poolId, " doesn't exist!");
            continue;
        }
        const amountOut = pool.calculateExpectedOutputAmount(swap.tokenIn, swap.tokenOut, amountIn);
        pool.update(swap.tokenIn, swap.tokenOut, amountIn, amountOut);
        amountIn = amountOut;
    }
}
