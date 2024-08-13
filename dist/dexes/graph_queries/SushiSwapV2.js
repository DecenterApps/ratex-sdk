"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
const dexIdsList_1 = require("../dexIdsList");
const SushiSwapV2_1 = require("../pools/SushiSwapV2");
const SushiSwapHelper_1 = require("../../contracts/rateX/SushiSwapHelper");
class SushiSwapV2 {
    constructor() {
        this.endpoint = "";
        this.dexId = dexIdsList_1.dexIds.SUSHI_V2;
        this.chainId = 1;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new SushiSwapV2();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    setEndpoint(chainId, graphApiKey) {
        if (chainId == 1) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/77jZ9KWeyi3CJ96zkkj5s1CojKPHt6XJKjLFzsDCd8Fd`;
        }
        if (chainId == 42161) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/8yBXBTMfdhsoE5QCf7KnoPmQb7QAWtRzESfYjiCjGEM9`;
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools, this.chainId));
        if (this.chainId == 1) {
            queryResult.liquidityPools.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        else {
            queryResult.pairs.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        return poolsInfo;
    }
    async getPoolsWithTokenPair(tokenA, tokenB, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools, this.chainId));
        if (this.chainId == 1) {
            queryResult.liquidityPools.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        else {
            queryResult.pairs.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools, this.chainId));
        if (this.chainId == 1) {
            queryResult.liquidityPools.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        else {
            queryResult.pairs.forEach((pool) => {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId, this.chainId));
            });
        }
        return poolsInfo;
    }
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        //@ts-ignore
        const SushiSwapHelperContract = (0, SushiSwapHelper_1.CreateSushiSwapHelperContract)(this.chainId, rpcProvider);
        const rawData = await SushiSwapHelperContract.methods.getPoolsData(poolInfos).call();
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
            pools.push(new SushiSwapV2_1.SushiSwapV2Pool(pool[0], pool[1], [token1, token2], pool[3]));
        }
        for (const pool of pools)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools;
    }
}
exports.default = SushiSwapV2;
function queryTopPools(numPools, chainId) {
    if (chainId == 1) {
        return (0, graphql_1.parse)((0, graphql_request_1.gql) `
    {
      liquidityPools(first:${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD) {
        id
        cumulativeVolumeUSD
        inputTokens {
          id
          decimals
          name
        }
      }
    }
  `);
    }
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
    if (chainId == 1) {
        return (0, graphql_1.parse)((0, graphql_request_1.gql) `{
    liquidityPools(first: ${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD, where: {
      and: [
        {inputTokens_: {id: "${tokenA.toLowerCase()}"}},
        {inputTokens_: {id: "${tokenB.toLowerCase()}"}}
      ]
    }
    ) {
      id
      cumulativeVolumeUSD
      inputTokens {
        id
        decimals
        name
      }
    }
  }`);
    }
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
    if (chainId == 1) {
        return (0, graphql_1.parse)((0, graphql_request_1.gql) `{
    liquidityPools(first: ${numPools}, orderDirection: desc, orderBy: cumulativeVolumeUSD, where: {
      inputTokens_: { id: "${token.toLowerCase()}" }
    }
    ) {
      id
      cumulativeVolumeUSD
      inputTokens {
        id
        decimals
        name
      }
    }
  }`);
    }
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
    if (chainId == 1) {
        pool = {
            poolId: jsonData.id,
            dexId: dexId,
            tokens: jsonData.inputTokens.map((token, index) => {
                return {
                    _address: token.id,
                    decimals: token.decimals,
                    name: token.name,
                };
            }),
        };
    }
    else {
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
    }
    return pool;
}
