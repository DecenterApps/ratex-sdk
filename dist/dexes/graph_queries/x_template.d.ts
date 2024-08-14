import { Pool, PoolInfo, DEXGraphFunctionality } from '../../utils/types/types';
export default class NewDex implements DEXGraphFunctionality {
    endpoint: string;
    dexId: string;
    chainId: number;
    static initialize(): DEXGraphFunctionality;
    setEndpoint(chainId: number): void;
    getTopPools(numPools: number): Promise<PoolInfo[]>;
    getPoolsWithTokenPair(token1: string, token2: string, first: number): Promise<PoolInfo[]>;
    getPoolsWithToken(token: string, numPools: number): Promise<PoolInfo[]>;
    getAdditionalPoolDataFromSolidity(poolInfos: PoolInfo[]): Promise<Pool[]>;
}
