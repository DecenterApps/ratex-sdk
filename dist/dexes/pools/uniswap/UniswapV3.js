"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV3Pool = void 0;
const types_1 = require("../../../types");
const uniswapState_1 = require("./uniswapState");
class UniswapV3Pool extends types_1.Pool {
    constructor(poolId, dexId, tokens) {
        super(poolId.toLowerCase(), dexId, tokens);
    }
    calculateExpectedOutputAmount(tokenIn, tokenOut, amountIn) {
        const poolData = uniswapState_1.UniswapState.getPoolState(this.poolId);
        if (!poolData) {
            console.log('ERROR: Data for uni v3 pool: ' + this.poolId + ' not found');
            return BigInt(0);
        }
        return uniswapState_1.UniswapState.quoter.quote(poolData, tokenIn, tokenOut, amountIn)[0];
    }
    reset() {
        uniswapState_1.UniswapState.resetPoolState(this.poolId);
    }
    update(tokenIn, tokenOut, amountIn) {
        const poolData = uniswapState_1.UniswapState.getPoolState(this.poolId);
        if (!poolData) {
            console.log('ERROR: Data for uni v3 pool: ' + this.poolId + ' not found');
            return BigInt(0);
        }
        // lastQuote will be stored each time we call quote
        const lastQuote = poolData.lastQuote;
        poolData.data.currentLiquidity = lastQuote.newLiquidity;
        poolData.data.currentSqrtPriceX96 = lastQuote.newSqrtPriceX96;
        poolData.data.currentTickIndex = lastQuote.newTickIndex;
        // we don't need this, because we don't use amountIn anyway
        return BigInt(0);
    }
}
exports.UniswapV3Pool = UniswapV3Pool;
