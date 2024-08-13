"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapState = void 0;
const utils_1 = require("./utils");
const uniswapOffchainQuoter_1 = require("./uniswapOffchainQuoter");
const UniswapHelper_1 = require("../../../contracts/rateX/UniswapHelper");
class UniswapState {
    constructor() { }
    static getPoolState(poolAddress) {
        return this.poolStateMap.get(poolAddress.toLowerCase());
    }
    static resetPoolState(poolAddress) {
        const poolState = this.startingPoolStateMap.get(poolAddress.toLowerCase());
        if (poolState) {
            this.poolStateMap.set(poolAddress.toLowerCase(), poolState);
        }
    }
    static async getPoolsDataFromContract(pools, chainId, rpcProvider) {
        //@ts-ignore
        try {
            const UniswapHelperContract = (0, UniswapHelper_1.CreateUniswapHelperContract)(chainId, rpcProvider);
            const rawPoolsData = await UniswapHelperContract.methods.fetchData(pools, 15).call();
            return rawPoolsData.map((rawPoolData) => (0, utils_1.convertRowPoolData)(rawPoolData));
        }
        catch (err) {
            console.log('Error while fetching additional data from the smart contracts: ', err);
            throw err;
        }
    }
    static async initializeFreshPoolsData(pools, chainId, rpcProvider) {
        const poolsSize = pools.length;
        const numberOfBatches = Math.ceil(poolsSize / this.batch_size);
        const promises = [];
        for (let i = 0; i < numberOfBatches; i++) {
            const batch = pools.slice(i * this.batch_size, (i + 1) * this.batch_size);
            promises.push(this.getPoolsDataFromContract(batch, chainId, rpcProvider));
        }
        const allPoolsData = await Promise.all(promises);
        allPoolsData.flat().forEach((poolData) => {
            let poolState = (0, utils_1.convertInitialPoolDataToPoolState)(poolData);
            // we will store keys as lowercase addresses
            this.poolStateMap.set(poolData.info.pool.toLowerCase(), poolState);
            this.startingPoolStateMap.set(poolData.info.pool.toLowerCase(), poolState.clone());
        });
    }
}
exports.UniswapState = UniswapState;
UniswapState.poolStateMap = new Map();
UniswapState.startingPoolStateMap = new Map();
UniswapState.quoter = new uniswapOffchainQuoter_1.UniswapOffchainQuoter();
UniswapState.batch_size = 3;
