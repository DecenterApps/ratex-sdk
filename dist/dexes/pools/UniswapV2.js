"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapV2Pool = void 0;
const types_1 = require("../../types");
class UniswapV2Pool extends types_1.Pool {
    constructor(poolId, dexId, tokens, reserves) {
        super(poolId, dexId, tokens);
        this.reserves = reserves.slice();
        this.startingReserves = [...this.reserves];
    }
    reset() {
        this.reserves = [...this.startingReserves];
    }
    calculateExpectedOutputAmount(tokenIn, tokenOut, amountIn) {
        let reserveIn = this.reserves[0];
        let reserveOut = this.reserves[1];
        if (tokenIn.toLowerCase() === this.tokens[1]._address.toLowerCase()) {
            reserveIn = this.reserves[1];
            reserveOut = this.reserves[0];
        }
        return (amountIn * BigInt(997) * reserveOut) / (reserveIn * BigInt(1000) + amountIn * BigInt(997));
    }
    update(tokenIn, tokenOut, amountIn, amountOut) {
        if (tokenIn.toLowerCase() === this.tokens[0]._address.toLowerCase()) {
            this.reserves[0] += amountIn;
            this.reserves[1] -= amountOut;
        }
        else {
            this.reserves[1] += amountIn;
            this.reserves[0] -= amountOut;
        }
    }
}
exports.UniswapV2Pool = UniswapV2Pool;
