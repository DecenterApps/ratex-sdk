"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findRouteUniLikeAlgo = findRouteUniLikeAlgo;
const compute_routes_backtrack_1 = __importDefault(require("./compute_routes_backtrack"));
const amount_distribution_1 = __importDefault(require("./amount_distribution"));
const routes_quoter_1 = require("./routes_quoter");
const swap_finder_1 = require("./swap_finder");
const algo_config_1 = require("./algo_config");
function findRouteUniLikeAlgo(tokenIn, tokenOut, amountIn, pools) {
    const routes = (0, compute_routes_backtrack_1.default)(tokenIn, tokenOut, pools, algo_config_1.algoParams.maxHops);
    const amounts = (0, amount_distribution_1.default)(amountIn, algo_config_1.algoParams.distributionPercentage);
    console.log("Amounts:", amounts);
    console.log("Amounts size:", amounts.length);
    console.log("Routes size:", routes.length);
    const routesWithQuotes = (0, routes_quoter_1.getRoutesWithQuotes)(routes, amounts);
    const swapFinder = new swap_finder_1.SwapFinder(algo_config_1.algoParams, routesWithQuotes, amounts.map(amount => amount.percentage), amountIn);
    const quote = swapFinder.findBestRoute();
    console.log("UniLikeQuote:", quote);
    return convertResponseToFoundQuoteType(quote);
}
function convertResponseToFoundQuoteType(q) {
    const routes = q.routes.map(r => {
        const route = r.route;
        let tokenIn = route.tokenIn;
        let swaps = [];
        route.steps.forEach(step => {
            swaps.push({
                poolId: step.pool.poolId,
                dexId: step.pool.dexId,
                tokenIn: tokenIn,
                tokenOut: step.tokenOut
            });
            tokenIn = step.tokenOut;
        });
        return {
            swaps: swaps,
            amountIn: r.amount.amountIn,
            percentage: r.amount.percentage,
            quote: r.quote
        };
    });
    return {
        routes: routes,
        quote: q.quote
    };
}
