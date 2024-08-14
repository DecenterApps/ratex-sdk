import { Pool, Token } from '../../utils/types/types';
export declare class SushiSwapV2Pool extends Pool {
    reserves: bigint[];
    startingReserves: bigint[];
    constructor(poolId: string, dexId: string, tokens: Token[], reserves: bigint[]);
    reset(): void;
    calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void;
}
