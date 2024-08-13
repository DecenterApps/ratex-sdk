"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
const dexIdsList_1 = require("../dexIdsList");
const Camelot_1 = require("../pools/Camelot");
const CamelotHelper_1 = require("../../contracts/rateX/CamelotHelper");
// Camelot is a silly place
class CamelotV2 {
    constructor() {
        // Camelot is currently not working, ne
        this.endpoint = ``;
        this.dexId = dexIdsList_1.dexIds.CAMELOT;
        this.chainId = 1;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new CamelotV2();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    setEndpoint(chainId, graphApiKey) {
        if (chainId == 1) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/8zagLSufxk5cVhzkzai3tyABwJh53zxn9tmUYJcJxijG`;
        }
        if (chainId == 42161) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/8zagLSufxk5cVhzkzai3tyABwJh53zxn9tmUYJcJxijG`;
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools));
        queryResult.pairs.forEach((lp) => {
            poolsInfo.push(createPoolFromGraph(lp, this.dexId));
        });
        return poolsInfo;
    }
    async getPoolsWithTokenPair(token1, token2, first) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(token1, token2, first));
        queryResult.pairs.forEach((lp) => {
            poolsInfo.push(createPoolFromGraph(lp, this.dexId));
        });
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools));
        queryResult.pairs.forEach((lp) => {
            poolsInfo.push(createPoolFromGraph(lp, this.dexId));
        });
        return poolsInfo;
    }
    // call to Solidity for additional data
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        const CamelotHelperContract = (0, CamelotHelper_1.CreateCamelotHelperContract)(this.chainId, rpcProvider);
        //@ts-ignore
        const rawData = await CamelotHelperContract.methods.getPoolsData(poolInfos).call();
        const pools = [];
        for (let pool of rawData) {
            const poolId = pool[0];
            const dexId = pool[1];
            const tokensRaw1 = pool[2][0];
            const tokensRaw2 = pool[2][1];
            const token1 = {
                _address: tokensRaw1[0],
                decimals: Number(tokensRaw1[1]),
            };
            const token2 = {
                _address: tokensRaw2[0],
                decimals: Number(tokensRaw2[1]),
            };
            const reserves = [BigInt(pool[3][0]), BigInt(pool[3][1])];
            const fees = [BigInt(pool[4][0]), BigInt(pool[4][1])];
            const stableSwap = pool[5];
            // do not include pools with no liquidity
            if (reserves[0] === BigInt(0) || reserves[1] === BigInt(0)) {
                continue;
            }
            pools.push(new Camelot_1.CamelotPool(poolId, dexId, [token1, token2], reserves, fees, stableSwap));
        }
        for (const pool of pools)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools;
    }
}
exports.default = CamelotV2;
function queryTopPools(numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `
      {
        pairs(first: ${numPools}, orderDirection: desc, orderBy: volumeUSD) {
          id
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
function queryPoolsWithToken(token, numPools) {
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
