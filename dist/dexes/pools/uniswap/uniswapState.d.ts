import { PoolState } from './types';
import { UniswapOffchainQuoter } from './uniswapOffchainQuoter';
import Web3 from 'web3';
export declare class UniswapState {
    private static poolStateMap;
    private static startingPoolStateMap;
    static quoter: UniswapOffchainQuoter;
    private static batch_size;
    private constructor();
    static getPoolState(poolAddress: string): PoolState | undefined;
    static resetPoolState(poolAddress: string): void;
    private static getPoolsDataFromContract;
    static initializeFreshPoolsData(pools: string[], chainId: number, rpcProvider: Web3): Promise<void>;
}
