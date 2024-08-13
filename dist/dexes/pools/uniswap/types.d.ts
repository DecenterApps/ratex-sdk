export declare class PoolInfo {
    pool: string;
    token0: string;
    token1: string;
    tick: bigint;
    tickLiquidityNet: bigint;
    tickSpacing: bigint;
    fee: bigint;
    sqrtPriceX96: bigint;
    liquidity: bigint;
    constructor(pool: string, token0: string, token1: string, tick: bigint, tickLiquidityNet: bigint, tickSpacing: bigint, fee: bigint, sqrtPriceX96: bigint, liquidity: bigint);
}
export declare class TickData {
    tick: bigint;
    initialized: boolean;
    liquidityNet: bigint;
    clone(): TickData;
    constructor(tick: bigint, initialized: boolean, liquidityNet: bigint);
}
export declare class PoolData {
    info: PoolInfo;
    zeroForOneTicks: TickData[];
    oneForZeroTicks: TickData[];
    constructor(info: PoolInfo, zeroForOneTicks: TickData[], oneForZeroTicks: TickData[]);
}
export type SwapState = {
    amountSpecifiedRemaining: bigint;
    amountCalculated: bigint;
    sqrtPriceX96: bigint;
    tick: bigint;
    liquidity: bigint;
};
export type StepComputations = {
    sqrtPriceStartX96: bigint;
    tickNext: bigint;
    initialized: boolean;
    sqrtPriceNextX96: bigint;
    amountIn: bigint;
    amountOut: bigint;
    feeAmount: bigint;
};
export declare class TradeInfo {
    pool: string;
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    fee: bigint;
    constructor(pool: string, tokenIn: string, tokenOut: string, amountIn: bigint, fee: bigint);
}
export declare class AdaptedPoolData {
    pool: string;
    token0: string;
    token1: string;
    tickSpacing: bigint;
    fee: bigint;
    currentLiquidity: bigint;
    currentSqrtPriceX96: bigint;
    ticks: TickData[];
    currentTickIndex: number;
    clone(): AdaptedPoolData;
    constructor(poolData: PoolData | null);
    getCurrTickData(): TickData;
}
export declare class LastQuote {
    newLiquidity: bigint;
    newSqrtPriceX96: bigint;
    newTickIndex: number;
    clone(): LastQuote;
    constructor(newLiquidity: bigint, newSqrtPriceX96: bigint, newTickIndex: number);
}
export declare class PoolState {
    data: AdaptedPoolData;
    lastQuote: LastQuote;
    clone(): PoolState;
    constructor(currData: AdaptedPoolData, lastQuote: LastQuote);
}
