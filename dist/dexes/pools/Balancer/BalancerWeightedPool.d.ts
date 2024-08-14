import { Token, Pool } from '../../../utils/types/types';
import BigNumber from 'bignumber.js';
export declare class BalancerWeightedPool extends Pool {
    reserves: BigNumber[];
    startingReserves: BigNumber[];
    weights: BigNumber[];
    swapFeePercentage: BigNumber;
    constructor(poolId: string, dexId: string, tokens: Token[], reserves: BigInt[], weights: BigInt[], swapFeePercentage: BigInt);
    reset(): void;
    calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void;
}
