import Web3 from 'web3';
import { Pool, PoolInfo } from './types';
export interface DEXGraphFunctionality {
    setEndpoint: (chainId: number, graphApiKey: string) => void;
    getTopPools: (numPools: number) => Promise<PoolInfo[]>;
    getPoolsWithTokenPair: (tokenA: string, tokenB: string, first: number) => Promise<PoolInfo[]>;
    getPoolsWithToken: (token: string, first: number) => Promise<PoolInfo[]>;
    getAdditionalPoolDataFromSolidity: (poolInfos: PoolInfo[], rpcProvider: Web3) => Promise<Pool[]>;
}
