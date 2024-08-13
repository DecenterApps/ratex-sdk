"use strict";
// Ported from Solidity: https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/WeightedMath.sol
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancerWeightedPool = void 0;
const types_1 = require("../../../types");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const fp = __importStar(require("../../../utils/math/fixed-points"));
const math = __importStar(require("../../../utils/math/math"));
// Swap limits: amounts swapped may not be larger than this percentage of total balance of the token being swapped
// Example - if the pool has 100 WETH, we can swap a maximum od 30 WETH
const _MAX_IN_RATIO = new bignumber_js_1.default(0.3e18);
class BalancerWeightedPool extends types_1.Pool {
    constructor(poolId, dexId, tokens, reserves, weights, swapFeePercentage) {
        super(poolId, dexId, tokens);
        this.reserves = reserves.map((r) => new bignumber_js_1.default(r.toString()));
        this.startingReserves = [...this.reserves];
        this.weights = weights.map((r) => new bignumber_js_1.default(r.toString()));
        this.swapFeePercentage = new bignumber_js_1.default(swapFeePercentage.toString());
    }
    reset() {
        this.reserves = [...this.startingReserves];
    }
    calculateExpectedOutputAmount(tokenIn, tokenOut, amountIn) {
        return calculateOutputAmount(this, tokenIn, tokenOut, (0, bignumber_js_1.default)(amountIn.toString()));
    }
    update(tokenIn, tokenOut, amountIn, amountOut) {
        // CHECK ???
        const i = this.tokens.findIndex((token) => token._address === tokenIn);
        const j = this.tokens.findIndex((token) => token._address === tokenOut);
        this.reserves[i] = fp.add(this.reserves[i], (0, bignumber_js_1.default)(amountIn.toString()));
        this.reserves[j] = fp.sub(this.reserves[j], (0, bignumber_js_1.default)(amountOut.toString()));
    }
}
exports.BalancerWeightedPool = BalancerWeightedPool;
function calculateOutputAmount(pool, tokenA, tokenB, tokenAmountIn, swapFeePercentage) {
    // Subtract the fee from the amount in if requested
    if (swapFeePercentage)
        tokenAmountIn = fp.sub(tokenAmountIn, fp.mulUp(tokenAmountIn, swapFeePercentage));
    // Get the index of the token we are swapping from and to
    const i = pool.tokens.findIndex((token) => token._address === tokenA);
    const j = pool.tokens.findIndex((token) => token._address === tokenB);
    try {
        const res = _calcOutGivenIn(pool.reserves[i], pool.weights[i], pool.reserves[j], pool.weights[j], tokenAmountIn);
        return BigInt(res.toFixed());
    }
    catch (e) {
        return BigInt(0);
    }
}
/* Computes how many tokens can be taken out of a pool if `amountIn` are sent, given the current balances and weights.
    Amount out, so we round down overall:
**********************************************************************************************
// outGivenIn                                                                                //
// aO = amountOut                                                                            //
// bO = balanceOut                                                                           //
// bI = balanceIn              /      /            bI             \    (wI / wO) \           //
// aI = amountIn    aO = bO * |  1 - | --------------------------  | ^            |          //
// wI = weightIn               \      \       ( bI + aI )         /              /           //
// wO = weightOut                                                                            //
**********************************************************************************************
The multiplication rounds down, and the subtrahend (power) runds up (so the base rounds up too).
Because bI / (bI + aI) <= 1, the exponent rounds down.  */
// Ovde puca!!!!!!!!!!!!!!
function _calcOutGivenIn(balanceIn, weightIn, balanceOut, weightOut, amountIn) {
    // Cannot exceed maximum in ratio (30% of tokenIn balance)
    if (amountIn.gte(fp.mulDown(balanceIn, _MAX_IN_RATIO)))
        throw new Error('MAX_IN_RATIO');
    const denominator = math.add(balanceIn, amountIn);
    const base = fp.divUp(balanceIn, denominator);
    const exponent = fp.divDown(weightIn, weightOut);
    const power = fp.powUp(base, exponent);
    return fp.mulDown(balanceOut, fp.complement(power));
}
