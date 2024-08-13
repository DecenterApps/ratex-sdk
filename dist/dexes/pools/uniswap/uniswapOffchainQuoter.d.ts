import { PoolState } from "./types";
export declare class UniswapOffchainQuoter {
    quote(poolState: PoolState, tokenIn: string, tokenOut: string, amountIn: bigint): [bigint, bigint];
    private initSwapState;
    private initStepComputations;
    private convertToFeeAmount;
    private updateSwapIteration;
    private updateSwapStep;
    private calculateAmount;
    private updateTickWithLiquidity;
    private calculateRatioTargetX96;
    private getSqrtPriceLimitX96;
}
