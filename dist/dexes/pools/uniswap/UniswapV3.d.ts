import { Pool, Token } from '../../../types';
export declare class UniswapV3Pool extends Pool {
    constructor(poolId: string, dexId: string, tokens: Token[]);
    calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    reset(): void;
    update(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
}
