"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
const dexIdsList_1 = require("../dexIdsList");
const uniswapState_1 = require("../pools/uniswap/uniswapState");
const UniswapV3_1 = require("../pools/uniswap/UniswapV3");
class UniswapV3 {
    constructor() {
        this.endpoint = ``;
        this.chainId = 1;
        this.dexId = dexIdsList_1.dexIds.UNI_V3;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new UniswapV3();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    setEndpoint(chainId, graphApiKey) {
        if (chainId == 1) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;
        }
        if (chainId == 42161) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM`;
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools));
        queryResult.pools.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId));
        });
        return poolsInfo;
    }
    async getPoolsWithTokenPair(tokenA, tokenB, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools));
        queryResult.pools.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId));
        });
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools));
        queryResult.pools.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId));
        });
        return poolsInfo;
    }
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        const pools = poolInfos.map((poolInfo) => poolInfo.poolId);
        await uniswapState_1.UniswapState.initializeFreshPoolsData(pools, this.chainId, rpcProvider);
        const pools2 = poolInfos.map((poolInfo) => new UniswapV3_1.UniswapV3Pool(poolInfo.poolId, this.dexId, poolInfo.tokens));
        for (const pool of pools2)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools2;
    }
}
exports.default = UniswapV3;
function queryTopPools(numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
    {
      pools(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD) {
        id
        volumeUSD
        token0 {
          id
          name
          decimals
        }
        token1 {
          id
          name
          decimals
        }
      }
    }
  `);
}
function queryPoolsWithTokenPair(tokenA, tokenB, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
    {
      pools(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD, where: {
        or: [
          {and: [
            {token0_: {id: "${tokenA.toLowerCase()}"}},
            {token1_: {id: "${tokenB.toLowerCase()}"}}
          ]},
          {and: [
            {token0_: {id: "${tokenB.toLowerCase()}"}},
            {token1_: {id: "${tokenA.toLowerCase()}"}}
          ]}
        ]   
      }) {
        id
        volumeUSD
        token0 {
          id
          name
          decimals
        }
        token1 {
          id
          name
          decimals
        }
      }
    }
  `);
}
function queryPoolsWithToken(token, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
  {
    pools(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD, where: {
      or: [
        {token0_: {id: "${token.toLowerCase()}"}},
        {token1_: {id: "${token.toLowerCase()}"}}
      ]
    }) {
      id
      volumeUSD
      token0 {
        id
        name
        decimals
      }
      token1 {
        id
        name
        decimals
      }
    }
  }  
`);
}
function createPoolFromGraph(jsonData, dexId) {
    const pool = {
        poolId: jsonData.id,
        dexId: dexId,
        tokens: [
            {
                _address: jsonData.token0.id,
                decimals: jsonData.token0.decimals,
                name: jsonData.token0.name,
            },
            {
                _address: jsonData.token1.id,
                decimals: jsonData.token1.decimals,
                name: jsonData.token1.name,
            },
        ],
    };
    return pool;
}
