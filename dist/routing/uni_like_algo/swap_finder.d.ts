import { AlgoParams, TQuoteUniLike, TRouteWithQuote } from "./types";
export declare class SwapFinder {
    private algoParams;
    private percentagesToSortedQuotes;
    private percentages;
    private amountIn;
    private bestQuote;
    private bestSwap;
    private queue;
    private numOfSplits;
    constructor(algoParams: AlgoParams, routesWithQuotes: TRouteWithQuote[], percentages: number[], amountIn: bigint);
    private readyToFinishSplitting;
    findBestRoute(): TQuoteUniLike;
    private addMissingAmountIn;
    private processLayer;
    private processPairedItemsInLayer;
    private processPairedItem;
    private updateBestQuoteAndSwapIfBetter;
    private initBestQuoteAndSwapForFullAmount;
    private initQueueWithHighestQuotes;
    private insertHigestQuoteForPercentageIfExist;
    private insertSecondHigestQuoteForPercentageIfExist;
    private getSortedQuotes;
    private findFirstRouteNotUsingUsedPools;
}
