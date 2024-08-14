import { Pool, Token } from '../../utils/types/types';
import BigNumber from "bignumber.js";
export declare class CamelotPool extends Pool {
    fees: BigNumber[];
    reserves: BigNumber[];
    startingReserves: BigNumber[];
    stableSwap: boolean;
    constructor(poolId: string, dexId: string, tokens: Token[], reserves: bigint[], fees: bigint[], stableSwap: boolean);
    reset(): void;
    calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void;
}
