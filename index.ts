import Web3 from "web3"
import { findRoute } from "./routing/main"
import { fetchPoolsData } from "./swap/graph_communication"
import { Pool, Quote } from "./types"

export enum Dexes {
    UNISWAP_V2 = "UniswapV2",
    UNISWAP_V3 = "UniswapV3",
    SUSHISWAP_V2 = "Sushiswap",
    BALANCER = "Balancer",
    CAMELOT = "Camelot"
}
interface RateXConfig {
    rpcUrl: string,
    chainId: number,
    dexes?: Array<Dexes>,
    graphApiKey: string
}

export class RateX {
    rpcProvider: Web3
    chainId: number
    graphApiKey: string
    dexes: Array<Dexes>

    constructor(config: RateXConfig) {
        this.rpcProvider = new Web3(new Web3.providers.HttpProvider(config.rpcUrl))
        this.chainId = config.chainId
        this.graphApiKey = config.graphApiKey
        this.dexes = config.dexes || [Dexes.SUSHISWAP_V2, Dexes.UNISWAP_V2, Dexes.UNISWAP_V3, Dexes.BALANCER, Dexes.CAMELOT]
    };

    async getQuote(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<Quote> {
        const preFetchPools = Date.now();
        const pools: Pool[] = await fetchPoolsData(tokenIn, tokenOut, 5, 5, this.chainId, this.rpcProvider, this.graphApiKey, this.dexes)
        const middle = Date.now();
        const route = await findRoute(tokenIn, tokenOut, amountIn, pools, this.chainId)
        const finished = Date.now();
        console.log(middle - preFetchPools)
        return route
    }
}