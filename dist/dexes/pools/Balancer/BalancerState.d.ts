import { Pool, PoolInfo } from '../../../utils/types/types';
import Web3 from 'web3';
export declare class BalancerState {
    private constructor();
    static getPoolDataFromContract(pools: PoolInfo[], chainId: number, rpcProvider: Web3): Promise<Pool[]>;
}
