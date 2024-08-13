"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolState = exports.LastQuote = exports.AdaptedPoolData = exports.TradeInfo = exports.PoolData = exports.TickData = exports.PoolInfo = void 0;
class PoolInfo {
    constructor(pool, token0, token1, tick, tickLiquidityNet, tickSpacing, fee, sqrtPriceX96, liquidity) {
        this.pool = pool;
        this.token0 = token0;
        this.token1 = token1;
        this.tick = tick;
        this.tickLiquidityNet = tickLiquidityNet;
        this.tickSpacing = tickSpacing;
        this.fee = fee;
        this.sqrtPriceX96 = sqrtPriceX96;
        this.liquidity = liquidity;
    }
}
exports.PoolInfo = PoolInfo;
class TickData {
    clone() {
        return new TickData(this.tick, this.initialized, this.liquidityNet);
    }
    constructor(tick, initialized, liquidityNet) {
        this.tick = tick;
        this.initialized = initialized;
        this.liquidityNet = liquidityNet;
    }
}
exports.TickData = TickData;
class PoolData {
    constructor(info, zeroForOneTicks, oneForZeroTicks) {
        this.info = info;
        this.zeroForOneTicks = zeroForOneTicks;
        this.oneForZeroTicks = oneForZeroTicks;
    }
}
exports.PoolData = PoolData;
// helper used for test
class TradeInfo {
    constructor(pool, tokenIn, tokenOut, amountIn, fee) {
        this.pool = pool;
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
        this.amountIn = amountIn;
        this.fee = fee;
    }
}
exports.TradeInfo = TradeInfo;
class AdaptedPoolData {
    clone() {
        const newData = new AdaptedPoolData(null);
        newData.pool = this.pool;
        newData.token0 = this.token0;
        newData.token1 = this.token1;
        newData.tickSpacing = this.tickSpacing;
        newData.fee = this.fee;
        newData.currentLiquidity = this.currentLiquidity;
        newData.currentSqrtPriceX96 = this.currentSqrtPriceX96;
        newData.ticks = this.ticks.map(e => e.clone());
        newData.currentTickIndex = this.currentTickIndex;
        return newData;
    }
    constructor(poolData) {
        if (!poolData) {
            this.pool = '';
            this.token0 = '';
            this.token1 = '';
            this.tickSpacing = BigInt(0);
            this.fee = BigInt(0);
            this.currentLiquidity = BigInt(0);
            this.currentSqrtPriceX96 = BigInt(0);
            this.ticks = [];
            this.currentTickIndex = 0;
            return;
        }
        this.pool = poolData.info.pool;
        this.token0 = poolData.info.token0;
        this.token1 = poolData.info.token1;
        this.tickSpacing = poolData.info.tickSpacing;
        this.fee = poolData.info.fee;
        this.currentLiquidity = poolData.info.liquidity;
        this.currentSqrtPriceX96 = poolData.info.sqrtPriceX96;
        const currentTickData = new TickData(poolData.info.tick, true, poolData.info.tickLiquidityNet);
        this.ticks = poolData.zeroForOneTicks.reverse().concat(currentTickData).concat(poolData.oneForZeroTicks);
        this.currentTickIndex = poolData.zeroForOneTicks.length;
    }
    getCurrTickData() {
        return this.ticks[this.currentTickIndex];
    }
}
exports.AdaptedPoolData = AdaptedPoolData;
class LastQuote {
    clone() {
        return new LastQuote(this.newLiquidity, this.newSqrtPriceX96, this.newTickIndex);
    }
    constructor(newLiquidity, newSqrtPriceX96, newTickIndex) {
        this.newLiquidity = newLiquidity;
        this.newSqrtPriceX96 = newSqrtPriceX96;
        this.newTickIndex = newTickIndex;
    }
}
exports.LastQuote = LastQuote;
class PoolState {
    clone() {
        return new PoolState(this.data.clone(), this.lastQuote.clone());
    }
    constructor(currData, lastQuote) {
        this.data = currData;
        this.lastQuote = lastQuote;
    }
}
exports.PoolState = PoolState;
