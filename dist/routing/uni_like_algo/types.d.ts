import { Pool } from "../../utils/types/types";
export interface TRouteStep {
    pool: Pool;
    tokenOut: string;
}
export interface TRoute {
    steps: TRouteStep[];
    tokenIn: string;
    tokenOut: string;
}
export interface TRouteWithQuote {
    route: TRoute;
    quote: bigint;
    amount: AmountPercentage;
}
export interface AmountPercentage {
    amountIn: bigint;
    percentage: number;
}
export declare class ComputeRoutesParams {
    tokenIn: string;
    tokenOut: string;
    pools: Pool[];
    maxHops: number;
    constructor(tokenIn: string, tokenOut: string, pools: Pool[], maxHops: number);
}
export interface QueueItem {
    percentageIndex: number;
    currentRoutes: TRouteWithQuote[];
    ramainingPercentage: number;
}
export interface TQuoteUniLike {
    routes: TRouteWithQuote[];
    quote: bigint;
}
export type AlgoParams = {
    maxHops: number;
    distributionPercentage: number;
    maxSplit: number;
};
