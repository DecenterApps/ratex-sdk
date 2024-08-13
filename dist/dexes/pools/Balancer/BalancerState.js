"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancerState = void 0;
const BalancerWeightedPool_1 = require("./BalancerWeightedPool");
const BalancerHelper_1 = require("../../../contracts/rateX/BalancerHelper");
class BalancerState {
    constructor() { }
    static async getPoolDataFromContract(pools, chainId, rpcProvider) {
        const promises = pools.map(async (pool) => {
            // return token address after '-' split
            pool.tokens.forEach((token) => token._address = token._address.split('-')[1]);
            const BalancerHelperContract = (0, BalancerHelper_1.CreateBalancerHelperContract)(chainId, rpcProvider);
            try {
                // @ts-ignore
                const res = await BalancerHelperContract.methods
                    .getWeightedPoolInfo(pool.poolId)
                    .call();
                const [decimals, invariant, tokens, balances, weights, swapFeePercentage] = [res[0], res[1], res[2], res[3], res[4], res[5]];
                const weightedPool = new BalancerWeightedPool_1.BalancerWeightedPool(pool.poolId, pool.dexId, pool.tokens, balances, weights, swapFeePercentage);
                return weightedPool;
            }
            catch (err) {
                console.log('Weighted Get Pool Info Error: ', err);
                return null; // Handle the error as needed
            }
        });
        const newPools = await Promise.all(promises);
        // @ts-ignore
        return newPools.filter((pool) => pool !== null); // Filter out any null values
    }
}
exports.BalancerState = BalancerState;
