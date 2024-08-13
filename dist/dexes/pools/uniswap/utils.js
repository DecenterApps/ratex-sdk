"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRowPoolData = convertRowPoolData;
exports.convertInitialPoolDataToPoolState = convertInitialPoolDataToPoolState;
const types_1 = require("./types");
function convertRowPoolData(poolData) {
    const getPoolInfo = (poolInfoRaw) => {
        const pool = poolInfoRaw[0];
        const token0 = poolInfoRaw[1];
        const token1 = poolInfoRaw[2];
        const tick = poolInfoRaw[3];
        const tickLiquidityNet = poolInfoRaw[4];
        const tickSpacing = poolInfoRaw[5];
        const fee = poolInfoRaw[6];
        const sqrtPriceX96 = poolInfoRaw[7];
        const liquidity = poolInfoRaw[8];
        return new types_1.PoolInfo(pool, token0, token1, tick, tickLiquidityNet, tickSpacing, fee, sqrtPriceX96, liquidity);
    };
    const getTickData = (tickDataRaw) => {
        const tick = tickDataRaw[0];
        const initialized = tickDataRaw[1];
        const liquidityNet = tickDataRaw[2];
        return new types_1.TickData(tick, initialized, liquidityNet);
    };
    const zeroForOneTicksRaw = poolData[1];
    const zeroForOneTicks = [];
    for (let i = 0; i < zeroForOneTicksRaw.length; i++) {
        zeroForOneTicks.push(getTickData(zeroForOneTicksRaw[i]));
    }
    const oneForZeroTicksRaw = poolData[2];
    const oneForZeroTicks = [];
    for (let i = 0; i < oneForZeroTicksRaw.length; i++) {
        oneForZeroTicks.push(getTickData(oneForZeroTicksRaw[i]));
    }
    return new types_1.PoolData(getPoolInfo(poolData[0]), zeroForOneTicks, oneForZeroTicks);
}
function convertInitialPoolDataToPoolState(poolData) {
    const adaptedPoolData = new types_1.AdaptedPoolData(poolData);
    const lastQuote = new types_1.LastQuote(adaptedPoolData.currentLiquidity, adaptedPoolData.currentSqrtPriceX96, adaptedPoolData.currentTickIndex);
    return new types_1.PoolState(adaptedPoolData, lastQuote);
}
