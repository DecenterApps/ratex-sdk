import { DEXGraphFunctionality } from '../../DEXGraphFunctionality';
import { Pool, PoolInfo } from '../../types';
import Web3 from 'web3';
export default class SushiSwapV2 implements DEXGraphFunctionality {
    endpoint: string;
    dexId: string;
    chainId: number;
    myLocalStorage: null;
    static initialize(myLocalStorage: any): DEXGraphFunctionality;
    setEndpoint(chainId: number, graphApiKey: string): void;
    getTopPools(numPools: number): Promise<PoolInfo[]>;
    getPoolsWithTokenPair(tokenA: string, tokenB: string, numPools: number): Promise<PoolInfo[]>;
    getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]>;
    getAdditionalPoolDataFromSolidity(poolInfos: PoolInfo[], rpcProvider: Web3): Promise<Pool[]>;
}
