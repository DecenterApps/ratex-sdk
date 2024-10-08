"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamelotPool = void 0;
const types_1 = require("../../utils/types/types");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
// Camelot V2 pools have 2 tokens in the pool, and a fee
// Example contracts of one Camelot V2 pool: https://arbiscan.io/address/0xa6c5c7d189fa4eb5af8ba34e63dcdd3a635d433f#readContract
const feeDenominator = new bignumber_js_1.default(100000);
class CamelotPool extends types_1.Pool {
    constructor(poolId, dexId, tokens, reserves, fees, stableSwap) {
        super(poolId, dexId, tokens);
        this.reserves = reserves.map((r) => (0, bignumber_js_1.default)(r.toString()));
        this.startingReserves = [...this.reserves];
        this.fees = fees.map((f) => (0, bignumber_js_1.default)(f.toString()));
        this.stableSwap = stableSwap;
    }
    reset() {
        this.reserves = [...this.startingReserves];
    }
    // function getAmountOut on Camelot V2 pools smart contracts
    calculateExpectedOutputAmount(tokenIn, tokenOut, amountIn) {
        // this function will be called by our routing algorithm which uses bigint values
        const amountInBN = new bignumber_js_1.default(amountIn.toString());
        if (this.stableSwap)
            return calculateStableSwap(this, tokenIn, tokenOut, amountInBN);
        else
            return calculateRegularSwap(this, tokenIn, tokenOut, amountInBN);
    }
    update(tokenIn, tokenOut, amountIn, amountOut) {
        const i = this.tokens.findIndex((token) => token._address === tokenIn);
        const j = this.tokens.findIndex((token) => token._address === tokenOut);
        this.reserves[i] = this.reserves[i].plus((0, bignumber_js_1.default)(amountIn.toString()));
        this.reserves[j] = this.reserves[j].minus((0, bignumber_js_1.default)(amountOut.toString()));
    }
}
exports.CamelotPool = CamelotPool;
function calculateStableSwap(pool, tokenIn, tokenOut, amountIn) {
    const feePercent = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase() ? pool.fees[0] : pool.fees[1];
    let reserve0 = pool.reserves[0];
    let reserve1 = pool.reserves[1];
    const precisionMultiplier0 = new bignumber_js_1.default(10 ** pool.tokens[0].decimals);
    const precisionMultiplier1 = new bignumber_js_1.default(10 ** pool.tokens[1].decimals);
    amountIn = amountIn.minus(amountIn.times(feePercent).div(feeDenominator)); // remove fee from amount received
    const xy = _k(pool);
    reserve0 = reserve0.times(1e18).div(precisionMultiplier0);
    reserve1 = reserve1.times(1e18).div(precisionMultiplier1);
    const [reserveA, reserveB] = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase()
        ? [reserve0, reserve1]
        : [reserve1, reserve0];
    // amountIn = tokenIn == token0 ? amountIn * 1e18 / precisionMultiplier0 : amountIn * 1e18 / precisionMultiplier1;
    amountIn = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase()
        ? amountIn.times(1e18).div(precisionMultiplier0)
        : amountIn.times(1e18).div(precisionMultiplier1);
    // uint y = reserveB - _get_y(amountIn + reserveA, xy, reserveB);
    const y = reserveB.minus(_get_y(amountIn.plus(reserveA), xy, reserveB));
    // return y * (tokenIn == token0 ? precisionMultiplier1 : precisionMultiplier0) / 1e18;
    let result = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase()
        ? y.times(precisionMultiplier1).div(1e18)
        : y.times(precisionMultiplier0).div(1e18);
    result = floor(result);
    return BigInt(result.toFixed());
}
// named the same as in Camelot V2 pools smart contracts
function _k(pool) {
    // for simplicity extract values
    let reserve0 = pool.reserves[0];
    let reserve1 = pool.reserves[1];
    if (pool.stableSwap) {
        const precisionMultiplier0 = new bignumber_js_1.default(10 ** pool.tokens[0].decimals);
        const precisionMultiplier1 = new bignumber_js_1.default(10 ** pool.tokens[1].decimals);
        const x = reserve0.times(1e18).div(precisionMultiplier0);
        const y = reserve1.times(1e18).div(precisionMultiplier1);
        const a = x.times(y).div(1e18);
        const b = x.times(x).div(1e18).plus(y.times(y).div(1e18));
        let res = a.times(b).div(1e18);
        return floor(res); // x3y+y3x >= k
    }
    return reserve0.times(reserve1);
}
// named the same as in Camelot V2 pools smart contracts
function _get_y(x0, xy, y) {
    for (let i = 0; i < 255; i++) {
        const y_prev = y;
        const k = _f(x0, y);
        if (k.lt(xy)) {
            let dy = xy.minus(k).times(1e18).dividedToIntegerBy(_d(x0, y));
            y = y.plus(dy);
        }
        else {
            let dy = k.minus(xy).times(1e18).dividedToIntegerBy(_d(x0, y));
            y = y.minus(dy);
        }
        const diff = y.minus(y_prev).abs();
        if (diff.lte(1))
            break;
    }
    return floor(y);
}
function _f(x0, y) {
    // return x0 * (y * y / 1e18 * y / 1e18) / 1e18 + (x0 * x0 / 1e18 * x0 / 1e18) * y / 1e18;
    const ySquared = y.times(y).dividedToIntegerBy(1e18);
    const x0Squared = x0.times(x0).dividedToIntegerBy(1e18);
    const term1 = x0.times((ySquared).times(y).dividedToIntegerBy(1e18)).dividedToIntegerBy(1e18);
    const term2 = y.times(x0Squared.times(x0).dividedToIntegerBy(1e18)).dividedToIntegerBy(1e18);
    return term1.plus(term2);
}
function _d(x0, y) {
    // return 3 * x0 * (y * y / 1e18) / 1e18 + (x0 * x0 / 1e18 * x0 / 1e18);
    const ySquared = y.times(y).dividedToIntegerBy(1e18);
    const x0Squared = x0.times(x0).dividedToIntegerBy(1e18);
    const term1 = x0.times(ySquared).times(3).dividedToIntegerBy(1e18);
    const term2 = x0Squared.times(x0).dividedToIntegerBy(1e18);
    return term1.plus(term2);
}
function calculateRegularSwap(pool, tokenIn, tokenOut, amountIn) {
    const feePercent = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase() ? pool.fees[0] : pool.fees[1];
    const [reserveA, reserveB] = tokenIn.toLowerCase() === pool.tokens[0]._address.toLowerCase()
        ? [pool.reserves[0], pool.reserves[1]]
        : [pool.reserves[1], pool.reserves[0]];
    amountIn = amountIn.times(feeDenominator.minus(feePercent));
    const numerator = amountIn.times(reserveB);
    const denominator = reserveA.times(feeDenominator).plus(amountIn);
    const result = floor(numerator.div(denominator));
    return BigInt(result.toFixed());
}
/*  Custom floor function because BigNumber library does not implement it
    @param num: the BigNumber number to be floored
*/
function floor(num) {
    const whole = num.toFixed().toString().split('.')[0];
    return new bignumber_js_1.default(whole);
}
