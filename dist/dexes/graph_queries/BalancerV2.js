"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
const dexIdsList_1 = require("../dexIdsList");
const BalancerState_1 = require("../pools/Balancer/BalancerState");
class BalancerV2 {
    constructor() {
        this.endpoint = ``;
        this.dexId = dexIdsList_1.dexIds.BALANCER_V2;
        this.chainId = 1;
        this.myLocalStorage = null;
    }
    static initialize(myLocalStorage) {
        const object = new BalancerV2();
        object.myLocalStorage = myLocalStorage;
        return object;
    }
    setEndpoint(chainId, graphApiKey) {
        if (chainId == 1) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV`;
        }
        if (chainId == 42161) {
            this.endpoint = `https://gateway-arbitrum.network.thegraph.com/api/${graphApiKey}/subgraphs/id/itkjv6Vdh22HtNEPQuk5c9M3T7VeGLQtXxcH8rFi1vc`;
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools));
        queryResult.pools.forEach((pool) => {
            try {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId));
            }
            catch (e) { }
        });
        return poolsInfo;
    }
    async getPoolsWithTokenPair(tokenA, tokenB, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(tokenA, tokenB, numPools));
        queryResult.pools.forEach((pool) => {
            try {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId));
            }
            catch (e) { }
        });
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools));
        queryResult.pools.forEach((pool) => {
            try {
                poolsInfo.push(createPoolFromGraph(pool, this.dexId));
            }
            catch (e) { }
        });
        return poolsInfo;
    }
    async getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider) {
        const pools = await BalancerState_1.BalancerState.getPoolDataFromContract(poolInfos, this.chainId, rpcProvider);
        for (const pool of pools)
            // @ts-ignore
            this.myLocalStorage.setItem(pool.poolId.toLowerCase(), pool);
        return pools;
    }
}
exports.default = BalancerV2;
function queryTopPools(numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `{
    pools(first: ${numPools},  orderBy: totalLiquidity, orderDirection: desc, where: {totalLiquidity_not: "0"}) {
      id
      name
      poolType
      tokens {
        id
        decimals
        name
      }
    }
  }
  `);
}
function queryPoolsWithTokenPair(tokenA, tokenB, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `{
      pools(first: ${numPools}, orderBy: totalLiquidity, orderDirection: desc, where: {
          and: [
              {tokens_: {address: "${tokenA.toLowerCase()}"}},
              {tokens_: {address: "${tokenB.toLowerCase()}"}},
              {totalLiquidity_not: "0"}
            ],
        }
        ) {
          id
          poolType
          tokens {
            id
            decimals
            name
          }
      }
  }
  `);
}
function queryPoolsWithToken(token, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) `{
      pools(first: ${numPools}, orderBy: totalLiquidity, orderDirection: desc, where: 
          {
              tokens_: {address_contains: "${token.toLowerCase()}"},
              totalLiquidity_not: "0"
          }
        ) {
          id
          poolType
          tokens {
            id
            decimals
            name
          }
      }
  }
  `);
}
function createPoolFromGraph(jsonData, dexId) {
    const isWeighted = dexIdsList_1.balancerWeightedPoolTypes.includes(jsonData.poolType);
    if (!isWeighted)
        throw new Error('BALANCER: Pool type not supported');
    const pool = {
        poolId: jsonData.id,
        dexId: dexId,
        tokens: jsonData.tokens.map((token) => {
            return {
                _address: token.id,
                decimals: token.decimals,
                name: token.name,
            };
        }),
    };
    return pool;
}
