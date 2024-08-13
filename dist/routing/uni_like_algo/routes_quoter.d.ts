import { AmountPercentage, TRoute, TRouteWithQuote } from "./types";
/**
 * We will calcualte everything offchain. Why?
 * Because if we want to call for quotes on uni, we will need separate call for each pool.
 * We can have route that theoretically looks like this:
 * sushiPool->uniPool->curvePool->uniPool->uniPool->balancerPool->uniPool
 * Here, we can't batch any calls, because we need amount out from previous pool. There is no other way than
 * to call for quote on each uni pool separately.
 * If we have 40 routes, 10 splitted amounts, and 2 uni pool on average per route, we will need 800 rpc calls.
 *
 * We can batch it, but that would require to calculate everything on chain. Which is also doable to try if we have time.
 *
 * Start with calculating everything offchain, and check final result.
 * The problem we can have is that for large trades we fetch only +- 15 ticks. Maybe that would be solved if
 * we split amount on lets say 5% percentage or even 2%. That would be fast because we will have offchain calculation. The only
 * concert is that we can end up with to many splits for large trade.
 *
 * */
export declare function getRoutesWithQuotes(routes: TRoute[], amounts: AmountPercentage[]): TRouteWithQuote[];
export declare function getSingleRouteWithAllQuotes(route: TRoute, amounts: AmountPercentage[]): TRouteWithQuote[];
export declare function getSingleRouteWithSingleQuote(route: TRoute, amount: AmountPercentage): TRouteWithQuote;
