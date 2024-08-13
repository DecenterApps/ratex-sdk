"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeRoutesParams = void 0;
class ComputeRoutesParams {
    constructor(tokenIn, tokenOut, pools, maxHops) {
        this.tokenIn = tokenIn;
        this.tokenOut = tokenOut;
        this.pools = pools;
        this.maxHops = maxHops;
    }
}
exports.ComputeRoutesParams = ComputeRoutesParams;
