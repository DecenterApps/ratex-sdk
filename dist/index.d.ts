import Web3 from "web3";
import { Quote } from "./types";
export declare enum Dexes {
    UNISWAP_V2 = "UniswapV2",
    UNISWAP_V3 = "UniswapV3",
    SUSHISWAP_V2 = "Sushiswap",
    BALANCER = "Balancer",
    CAMELOT = "Camelot"
}
interface RateXConfig {
    rpcUrl: string;
    chainId: number;
    dexes?: Array<Dexes>;
    graphApiKey: string;
}
export declare class RateX {
    rpcProvider: Web3;
    chainId: number;
    graphApiKey: string;
    dexes: Array<Dexes>;
    constructor(config: RateXConfig);
    getQuote(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<Quote>;
    getSolidityCalldata(tokenIn: string, tokenOut: string, amountIn: bigint, slippagePercentage: number, recipient: string, deadlineInMinutes: number): Promise<string>;
}
export {};
