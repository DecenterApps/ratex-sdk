import Web3 from "web3";
import { Quote } from "./types";
import { RegisteredSubscription } from "web3/lib/commonjs/eth.exports";
interface RateXConfig {
    rpcUrl: string;
    chainId: number;
    dexes: Array<string>;
    graphApiKey: string;
}
declare class RateX {
    rpcProvider: Web3<RegisteredSubscription>;
    chainId: number;
    graphApiKey: string;
    constructor(config: RateXConfig);
    getQuote(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<Quote>;
}
export default RateX;
