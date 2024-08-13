"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
const dexIdsList_1 = require("../dexIdsList");
const UniswapV2_1 = require("../pools/UniswapV2");
const UniswapV2Helper_1 = require("../../contracts/rateX/UniswapV2Helper");
class UniswapV2 {
    constructor() {
        this.endpoint = ``;
        this.dexId = dexIdsList_1.dexIds.UNI_V2;
        this.chainId = 1;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new UniswapV2();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    // @reminder add uniswapv2 real endpoint for arbitrum
    setEndpoint(chainId, graphApiKey) {
        if (chainId == 1) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu`;
        }
        if (chainId == 42161) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/CStW6CSQbHoXsgKuVCrk3uShGA4JX3CAzzv2x9zaGf8w`;
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools, this.chainId));
        queryResult.pairs.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
        });
        return poolsInfo;
    }
    async getPoolsWithTokenPair(tokenA, tokenB, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools, this.chainId));
        queryResult.pairs.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
        });
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools, this.chainId));
        queryResult.pairs.forEach((pool) => {
            poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
        });
        return poolsInfo;
    }
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        //@ts-ignore
        const UniswapV2HelperContract = (0, UniswapV2Helper_1.CreateUniswapV2HelperContract)(this.chainId, rpcProvider);
        const rawData = await UniswapV2HelperContract.methods.getPoolsData(poolInfos).call();
        const pools = [];
        for (let pool of rawData) {
            const poolId = pool[0];
            const dexId = pool[1];
            const tokensRaw1 = pool[2][0];
            const tokensRaw2 = pool[2][1];
            const token1 = {
                _address: tokensRaw1[0],
                decimals: Number(tokensRaw1[1]),
                name: tokensRaw1[2],
            };
            const token2 = {
                _address: tokensRaw2[0],
                decimals: Number(tokensRaw2[1]),
                name: tokensRaw2[2],
            };
            pools.push(new UniswapV2_1.UniswapV2Pool(pool[0], pool[1], [token1, token2], pool[3]));
        }
        for (const pool of pools)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools;
    }
}
exports.default = UniswapV2;
function queryTopPools(numPools, chainId) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
    {
      pairs(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD) {
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
function queryPoolsWithTokenPair(tokenA, tokenB, numPools, chainId) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
    {
      pairs(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD, where: {
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
function queryPoolsWithToken(token, numPools, chainId) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
  {
    pairs(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD, where: {
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
function createPoolFromGraph(jsonData, dexId, chainId) {
    let pool;
    pool = {
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
