"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = computeRoutes;
const types_1 = require("./types");
function computeRoutes(tokenIn, tokenOut, pools, maxHops) {
    const usedPools = Array(pools.length).fill(false);
    const routes = [];
    const params = new types_1.ComputeRoutesParams(tokenIn, tokenOut, pools, maxHops);
    _computeRoutes(params, [], usedPools, routes, tokenIn);
    return routes;
}
function _computeRoutes(params, currentRoute, usedPools, foundRoutes, previousTokenOut) {
    if (currentRoute.length > params.maxHops) {
        return;
    }
    if (routeFound(currentRoute, params)) {
        foundRoutes.push({
            steps: [...currentRoute],
            tokenIn: params.tokenIn,
            tokenOut: params.tokenOut
        });
        return;
    }
    for (let i = 0; i < params.pools.length; i++) {
        if (usedPools[i]) {
            continue;
        }
        const curPool = params.pools[i];
        if (!curPool.containsToken(previousTokenOut)) {
            continue;
        }
        const tokensToExplore = curPool.tokens.filter((token) => token._address.toLowerCase() !== previousTokenOut.toLowerCase());
        for (let token of tokensToExplore) {
            currentRoute.push({ pool: curPool, tokenOut: token._address });
            usedPools[i] = true;
            _computeRoutes(params, currentRoute, usedPools, foundRoutes, token._address);
            usedPools[i] = false;
            currentRoute.pop();
        }
    }
}
function routeFound(route, params) {
    return route.length > 0 && route[route.length - 1].tokenOut.toLowerCase() === params.tokenOut.toLowerCase();
}
