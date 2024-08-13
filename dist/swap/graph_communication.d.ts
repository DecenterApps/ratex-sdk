import Web3 from 'web3';
import { Pool } from '../types';
import { Dexes } from '../index';
declare function fetchPoolsData(tokenFrom: string, tokenTo: string, numFromToPools: number | undefined, numTopPools: number | undefined, chainId: number, rpcProvider: Web3, graphApiKey: string, dexes: Array<Dexes>): Promise<Pool[]>;
export { fetchPoolsData };
