"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwapFinder = void 0;
const queue_1 = __importDefault(require("mnemonist/queue"));
class SwapFinder {
    constructor(algoParams, routesWithQuotes, percentages, amountIn) {
        this.algoParams = algoParams;
        this.percentages = percentages;
        this.amountIn = amountIn;
        this.percentagesToSortedQuotes = this.getSortedQuotes(routesWithQuotes);
        this.bestQuote = BigInt(0);
        this.bestSwap = [];
        this.queue = new queue_1.default();
        this.numOfSplits = 1;
    }
    readyToFinishSplitting() {
        const maxSplitsReached = this.numOfSplits > this.algoParams.maxSplit;
        const bestSwapNotImprovedWithNewSplit = this.numOfSplits >= 3 && (this.bestSwap.length < this.numOfSplits - 1);
        return maxSplitsReached || bestSwapNotImprovedWithNewSplit;
    }
    findBestRoute() {
        this.initBestQuoteAndSwapForFullAmount();
        this.initQueueWithHighestQuotes();
        while (this.queue.size > 0) {
            let layer = this.queue.size;
            this.numOfSplits++;
            if (this.readyToFinishSplitting()) {
                break;
            }
            this.processLayer(layer);
        }
        this.addMissingAmountIn();
        return {
            quote: this.bestQuote,
            routes: this.bestSwap
        };
    }
    addMissingAmountIn() {
        const totalAmountIn = this.bestSwap.reduce((acc, route) => acc + route.amount.amountIn, BigInt(0));
        const diff = this.amountIn - totalAmountIn;
        if (diff > BigInt(0)) {
            this.bestSwap[this.bestSwap.length - 1].amount.amountIn += diff;
        }
    }
    processLayer(layer) {
        while (layer > 0) {
            layer--;
            const q = this.queue.dequeue();
            this.processPairedItemsInLayer(q);
        }
    }
    processPairedItemsInLayer(q) {
        for (let i = q.percentageIndex; i >= 0; --i) {
            const percentage = this.percentages[i];
            if (percentage > q.ramainingPercentage || !this.percentagesToSortedQuotes.has(percentage)) {
                continue;
            }
            this.processPairedItem(q, percentage, i);
        }
    }
    processPairedItem(q, percentage, index) {
        const candidateRoutes = this.percentagesToSortedQuotes.get(percentage);
        const routeWithQuote = this.findFirstRouteNotUsingUsedPools(q.currentRoutes, candidateRoutes);
        if (!routeWithQuote) {
            return;
        }
        const newRemainingPercentage = q.ramainingPercentage - percentage;
        const newCurrentRoutes = [...q.currentRoutes, routeWithQuote];
        if (newRemainingPercentage === 0) {
            this.updateBestQuoteAndSwapIfBetter(newCurrentRoutes);
        }
        else {
            this.queue.enqueue({
                percentageIndex: index,
                currentRoutes: newCurrentRoutes,
                ramainingPercentage: newRemainingPercentage
            });
        }
    }
    updateBestQuoteAndSwapIfBetter(currentRoutes) {
        const quote = currentRoutes.reduce((acc, route) => acc + route.quote, BigInt(0));
        if (quote > this.bestQuote) {
            this.bestQuote = quote;
            this.bestSwap = currentRoutes;
        }
    }
    initBestQuoteAndSwapForFullAmount() {
        if (this.percentagesToSortedQuotes.has(100)) {
            this.bestQuote = this.percentagesToSortedQuotes.get(100)[0].quote;
            this.bestSwap = [this.percentagesToSortedQuotes.get(100)[0]];
        }
    }
    initQueueWithHighestQuotes() {
        for (let i = this.percentages.length - 1; i >= 0; --i) {
            this.insertHigestQuoteForPercentageIfExist(i);
            this.insertSecondHigestQuoteForPercentageIfExist(i);
        }
    }
    insertHigestQuoteForPercentageIfExist(percentageIndex) {
        const percentage = this.percentages[percentageIndex];
        if (this.percentagesToSortedQuotes.has(percentage)) {
            this.queue.enqueue({
                percentageIndex: percentageIndex,
                currentRoutes: [this.percentagesToSortedQuotes.get(percentage)[0]],
                ramainingPercentage: 100 - percentage
            });
        }
    }
    insertSecondHigestQuoteForPercentageIfExist(percentageIndex) {
        const percentage = this.percentages[percentageIndex];
        if (this.percentagesToSortedQuotes.get(percentage)[1]) {
            this.queue.enqueue({
                percentageIndex: percentageIndex,
                currentRoutes: [this.percentagesToSortedQuotes.get(percentage)[1]],
                ramainingPercentage: 100 - percentage
            });
        }
    }
    getSortedQuotes(routeWithQuotes) {
        const map = new Map();
        routeWithQuotes.forEach(routeWithQuote => {
            var _a;
            const percentage = routeWithQuote.amount.percentage;
            if (!map.has(percentage)) {
                map.set(percentage, []);
            }
            (_a = map.get(percentage)) === null || _a === void 0 ? void 0 : _a.push(routeWithQuote);
        });
        map.forEach((value, key) => {
            value.sort((a, b) => {
                return Number(b.quote - a.quote);
            });
        });
        return map;
    }
    findFirstRouteNotUsingUsedPools(usedRoutes, candidateRoutes) {
        const usedPoolsSet = new Set();
        usedRoutes.forEach(route => {
            route.route.steps.forEach(step => usedPoolsSet.add(step.pool.poolId));
        });
        for (const candidateRoute of candidateRoutes) {
            const candidatePools = candidateRoute.route.steps.map(step => step.pool.poolId);
            if (candidatePools.some(pool => usedPoolsSet.has(pool))) {
                continue;
            }
            return candidateRoute;
        }
        return null;
    }
}
exports.SwapFinder = SwapFinder;
