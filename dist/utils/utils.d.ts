import { Quote, SwapStep } from "./types/types";
export declare function prepareSwapParams(quote: Quote, slippagePercentage: number, deadlineInMinutes: number, tokenIn: string, tokenOut: string, amountIn: bigint, recipient: string): {
    adjustedQuote: {
        swaps: {
            data: string;
            dexId: number;
        }[];
        amountIn: bigint;
    }[];
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    minAmountOut: bigint;
    recipient: string;
    deadline: number;
};
export declare function generateCalldata(quote: Quote, slippagePercentage: number, deadlineInMinutes: number, tokenIn: string, tokenOut: string, amountIn: bigint, recipient: string): string;
export declare function transferQuoteWithBalancerPoolIdToAddress(quote: Quote): Quote;
export declare function hashStringToInt(dexName: string): number;
export declare function encodeSwapData(swap: SwapStep): string;
