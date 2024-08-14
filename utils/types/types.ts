import Web3 from "web3";

export interface ResponseType {
  isSuccess: boolean;
  txHash: string;
  errorMessage: string;
}

export interface RateXConfig {
  rpcUrl: string;
  chainId: number;
  dexes?: Array<Dexes>;
  graphApiKey: string;
}

export interface DEXGraphFunctionality {
  setEndpoint: (chainId: number, graphApiKey: string) => void;
  getTopPools: (numPools: number) => Promise<PoolInfo[]>;
  getPoolsWithTokenPair: (
    tokenA: string,
    tokenB: string,
    first: number
  ) => Promise<PoolInfo[]>;
  getPoolsWithToken: (token: string, first: number) => Promise<PoolInfo[]>;

  // calls to Solidity for additional data
  getAdditionalPoolDataFromSolidity: (
    poolInfos: PoolInfo[],
    rpcProvider: Web3
  ) => Promise<Pool[]>;
}

export enum Dexes {
  UNISWAP_V2 = "UniswapV2",
  UNISWAP_V3 = "UniswapV3",
  SUSHISWAP_V2 = "Sushiswap",
  BALANCER = "Balancer",
  CAMELOT = "Camelot",
}

export type Token = {
  _address: string;
  decimals: number;
  name?: string;
};

// we get from Graph QL
export type PoolInfo = {
  poolId: string;
  dexId: string;
  tokens: Token[]; // list of addresses
};

// we get from Solidity (extra info)
export abstract class Pool {
  poolId: string;
  dexId: string;
  tokens: Token[]; // list of addresses

  protected constructor(poolId: string, dexId: string, tokens: Token[]) {
    this.poolId = poolId;
    this.dexId = dexId;
    this.tokens = tokens.map((token) => ({
      _address: token._address.toLowerCase(),
      decimals: token.decimals,
      name: token.name,
    }));
  }

  abstract calculateExpectedOutputAmount(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint
  ): bigint;
  abstract reset(): void;
  abstract update(
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    amountOut: bigint
  ): void;

  containsToken(token: string): boolean {
    return this.tokens.some(
      (t) => t._address.toLowerCase() === token.toLowerCase()
    );
  }

  getToken0(): Token {
    return this.tokens[0];
  }

  getToken1(): Token {
    return this.tokens[1];
  }
}

export type SwapStep = {
  poolId: string;
  dexId: string;
  tokenIn: string;
  tokenOut: string;
};

export type Route = {
  swaps: SwapStep[];
  amountIn: bigint;
  percentage: number;
  quote: bigint;
};

export type Quote = {
  routes: Route[];
  quote: bigint;
};
