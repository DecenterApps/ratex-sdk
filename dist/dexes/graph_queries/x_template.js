"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_request_1 = require("graphql-request");
class NewDex {
    constructor() {
        this.endpoint = '';
        this.dexId = '';
        this.chainId = 1;
    }
    static initialize() {
        return new NewDex();
    }
    setEndpoint(chainId) {
        if (chainId == 42161) {
            this.endpoint = '';
        }
        this.chainId = chainId;
    }
    async getTopPools(numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryTopPools(numPools));
        queryResult.pairs.forEach((pair) => {
            poolsInfo.push(pair.id);
        });
        return poolsInfo;
    }
    async getPoolsWithTokenPair(token1, token2, first) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithTokenPair(token1, token2, first));
        queryResult.pairs.forEach((pair) => {
            poolsInfo.push(pair.id);
        });
        return poolsInfo;
    }
    async getPoolsWithToken(token, numPools) {
        const poolsInfo = [];
        const queryResult = await (0, graphql_request_1.request)(this.endpoint, queryPoolsWithToken(token, numPools));
        queryResult.pairs.forEach((pair) => {
            poolsInfo.push(pair.id);
        });
        return poolsInfo;
    }
    async getAdditionalPoolDataFromSolidity(poolInfos) {
        return [];
    }
}
exports.default = NewDex;
function queryTopPools(numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) ``);
}
function queryPoolsWithTokenPair(tokenA, tokenB, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) ``);
}
function queryPoolsWithToken(token, numPools) {
    return (0, graphql_1.parse)((0, graphql_request_1.gql) ``);
}
