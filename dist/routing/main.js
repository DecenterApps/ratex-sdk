"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRoute = findRoute;
const main_1 = require("./uni_like_algo/main");
const main_2 = require("./iterative_spliting/main");
/**
 * This algo works good if we are using pools with two tokens,
 * but it doesn't scale well for pools with more than two tokens because
 * amount of routes rapidly increases with number of tokens in pool as there are more ways to go
 * from token A to token B. This makes algo really slow, especially slow if we include curve dex.
 * That being said, it will stay here as a reference for future algo ideas and improvements but right
 * now iterative splitting is way to go.
 * */
const UNI_LIKE_ALGO_ACTIVE = false;
async function findRoute(tokenIn, tokenOut, amountIn, pools, chainId) {
    if (UNI_LIKE_ALGO_ACTIVE) {
        return (0, main_1.findRouteUniLikeAlgo)(tokenIn, tokenOut, amountIn, pools);
    }
    else {
        return (await (0, main_2.findRouteWithIterativeSplitting)(tokenIn, tokenOut, amountIn, pools, chainId));
    }
}
