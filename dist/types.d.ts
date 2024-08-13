export interface ResponseType {
    isSuccess: boolean;
    txHash: string;
    errorMessage: string;
}
export type Token = {
    _address: string;
    decimals: number;
    name?: string;
};
export type PoolInfo = {
    poolId: string;
    dexId: string;
    tokens: Token[];
};
export declare abstract class Pool {
    poolId: string;
    dexId: string;
    tokens: Token[];
    protected constructor(poolId: string, dexId: string, tokens: Token[]);
    abstract calculateExpectedOutputAmount(tokenIn: string, tokenOut: string, amountIn: bigint): bigint;
    abstract reset(): void;
    abstract update(tokenIn: string, tokenOut: string, amountIn: bigint, amountOut: bigint): void;
    containsToken(token: string): boolean;
    getToken0(): Token;
    getToken1(): Token;
}
export type SwapStep = {
    poolId: string;
    dexId: string;
    tokenIn: string;
    tokenOut: string;
};
export type Route = {
    swaps: SwapStep[];
    amountIn: bigint;
    percentage: number;
    quote: bigint;
};
export type Quote = {
    routes: Route[];
    quote: bigint;
};
