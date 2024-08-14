import { Token, Pool } from '../../utils/types/types';
import BigNumber from 'bignumber.js';
export declare class CurvePool extends Pool {
    reserves: BigNumber[];
    startingReserves: BigNumber[];
    fee: BigNumber;
    amplificationCoeff: BigNumber;
    constructor(poolId: string, dexId: string, tokens: Token[], reserves: BigNumber[], fee: string, A: string);
    reset(): void;
    calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void;
}
