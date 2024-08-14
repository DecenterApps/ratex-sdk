"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
// we get from Solidity (extra info)
class Pool {
    constructor(poolId, dexId, tokens) {
        this.poolId = poolId;
        this.dexId = dexId;
        this.tokens = tokens.map((token) => ({
            _address: token._address.toLowerCase(),
            decimals: token.decimals,
            name: token.name,
        }));
    }
    containsToken(token) {
        return this.tokens.some((t) => t._address.toLowerCase() === token.toLowerCase());
    }
    getToken0() {
        return this.tokens[0];
    }
    getToken1() {
        return this.tokens[1];
    }
}
exports.Pool = Pool;
