"use strict";
// Ported from Solidity:
// https://github.com/balancer-labs/balancer-core-v2/blob/70843e6a61ad11208c1cfabf5cfe15be216ca8d3/pkg/solidity-utils/contracts/math/FixedPoint.sol
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
exports.complement = exports.powUp = exports.powDown = exports.divUp = exports.divDown = exports.mulUp = exports.mulDown = exports.sub = exports.add = exports.MIN_POW_BASE_FREE_EXPONENT = exports.MAX_POW_RELATIVE_ERROR = exports.ONE = exports.ZERO = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const logExp = __importStar(require("./log-exp"));
exports.ZERO = new bignumber_js_1.default(0);
exports.ONE = new bignumber_js_1.default("1000000000000000000"); // 10^18
exports.MAX_POW_RELATIVE_ERROR = new bignumber_js_1.default(10000); // 10^(-14)
// Minimum base for the power function when the exponent is 'free' (larger than ONE)
exports.MIN_POW_BASE_FREE_EXPONENT = new bignumber_js_1.default("700000000000000000"); // 0.7e18
const add = (a, b) => {
    // Fixed Point addition is the same as regular checked addition
    return a.plus(b);
};
exports.add = add;
const sub = (a, b) => {
    // Fixed Point subtraction is the same as regular checked subtraction
    if (b.gt(a))
        throw new Error("SUB_OVERFLOW");
    return a.minus(b);
};
exports.sub = sub;
const mulDown = (a, b) => {
    return a.times(b).idiv(exports.ONE);
};
exports.mulDown = mulDown;
const mulUp = (a, b) => {
    const product = a.times(b);
    if (product.isZero()) {
        return product;
    }
    else {
        // The traditional divUp formula is:
        // divUp(x, y) := (x + y - 1) / y
        // To avoid intermediate overflow in the addition, we distribute the division and get:
        // divUp(x, y) := (x - 1) / y + 1
        // Note that this requires x != 0, which we already tested for
        return product.minus(new bignumber_js_1.default(1)).idiv(exports.ONE).plus(new bignumber_js_1.default(1));
    }
};
exports.mulUp = mulUp;
const divDown = (a, b) => {
    if (b.isZero())
        throw new Error("ZERO_DIVISION");
    if (a.isZero())
        return a;
    else
        return a.times(exports.ONE).idiv(b);
};
exports.divDown = divDown;
const divUp = (a, b) => {
    if (b.isZero())
        throw new Error("ZERO_DIVISION");
    if (a.isZero())
        return a;
    else {
        // The traditional divUp formula is:
        // divUp(x, y) := (x + y - 1) / y
        // To avoid intermediate overflow in the addition, we distribute the division and get:
        // divUp(x, y) := (x - 1) / y + 1
        // Note that this requires x != 0, which we already tested for.
        return a.times(exports.ONE).minus(new bignumber_js_1.default(1)).idiv(b).plus(new bignumber_js_1.default(1));
    }
};
exports.divUp = divUp;
const powDown = (x, y) => {
    const raw = logExp.pow(x, y);
    const maxError = (0, exports.add)((0, exports.mulUp)(raw, exports.MAX_POW_RELATIVE_ERROR), new bignumber_js_1.default(1));
    if (raw.lt(maxError))
        return new bignumber_js_1.default(0);
    else {
        return (0, exports.sub)(raw, maxError);
    }
};
exports.powDown = powDown;
const powUp = (x, y) => {
    const raw = logExp.pow(x, y);
    const maxError = (0, exports.add)((0, exports.mulUp)(raw, exports.MAX_POW_RELATIVE_ERROR), new bignumber_js_1.default(1));
    return (0, exports.add)(raw, maxError);
};
exports.powUp = powUp;
const complement = (x) => {
    return x.lt(exports.ONE) ? exports.ONE.minus(x) : new bignumber_js_1.default(0);
};
exports.complement = complement;
