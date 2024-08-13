import { DEXGraphFunctionality } from '../../DEXGraphFunctionality';
import { Pool, PoolInfo } from '../../types';
import Web3 from 'web3';
export default class Curve implements DEXGraphFunctionality {
    dexId: string;
    chainId: number;
    myLocalStorage: null;
    static initialize(myLocalStorage: any): DEXGraphFunctionality;
    setEndpoint(chainId: number): void;
    getTopPools(numPools: number): Promise<PoolInfo[]>;
    getPoolsWithTokenPair(token1: string, token2: string, first: number): Promise<PoolInfo[]>;
    getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]>;
    getAdditionalPoolDataFromSolidity(poolInfos: PoolInfo[], rpcProvider: Web3): Promise<Pool[]>;
}
