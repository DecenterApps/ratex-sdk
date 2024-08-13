import Web3 from 'web3';
import { Pool } from '../types';
declare function fetchPoolsData(tokenFrom: string, tokenTo: string, numFromToPools: number | undefined, numTopPools: number | undefined, chainId: number, rpcProvider: Web3, graphApiKey: string): Promise<Pool[]>;
export { fetchPoolsData };
