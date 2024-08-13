"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapOffchainQuoter = void 0;
const v3_sdk_1 = require("@uniswap/v3-sdk");
const jsbi_1 = __importDefault(require("jsbi"));
const types_1 = require("./types");
class UniswapOffchainQuoter {
    quote(poolState, tokenIn, tokenOut, amountIn) {
        if (amountIn <= BigInt(0)) {
            return [BigInt(0), BigInt(0)];
        }
        try {
            const zeroForOne = tokenIn < tokenOut;
            const sqrtPriceLimitX96 = this.getSqrtPriceLimitX96(zeroForOne);
            let state = this.initSwapState(poolState, amountIn);
            let tickDataIndex = zeroForOne
                ? poolState.data.currentTickIndex - 1
                : poolState.data.currentTickIndex + 1;
            while (state.amountSpecifiedRemaining !== BigInt(0) &&
                state.sqrtPriceX96 !== sqrtPriceLimitX96 &&
                tickDataIndex >= 0 &&
                tickDataIndex < poolState.data.ticks.length) {
                const tickData = poolState.data.ticks[tickDataIndex];
                let step = this.initStepComputations(state, tickData);
                this.updateSwapIteration(state, step, tickData, poolState.data.fee, sqrtPriceLimitX96, zeroForOne);
                tickDataIndex = zeroForOne ? tickDataIndex - 1 : tickDataIndex + 1;
            }
            // remember where we left off, so we can update pool later
            poolState.lastQuote = new types_1.LastQuote(state.liquidity, state.sqrtPriceX96, zeroForOne ? tickDataIndex + 2 : tickDataIndex - 2);
            const amountOut = state.amountCalculated > BigInt(0) ? state.amountCalculated : -state.amountCalculated;
            return [amountOut, state.amountSpecifiedRemaining];
        }
        catch (e) {
            return [BigInt(0), BigInt(0)];
        }
    }
    initSwapState(poolState, amountIn) {
        return {
            amountSpecifiedRemaining: amountIn,
            amountCalculated: BigInt(0),
            sqrtPriceX96: poolState.data.currentSqrtPriceX96,
            tick: poolState.data.getCurrTickData().tick,
            liquidity: poolState.data.currentLiquidity
        };
    }
    initStepComputations(state, tickData) {
        return {
            sqrtPriceStartX96: state.sqrtPriceX96,
            tickNext: tickData.tick,
            initialized: tickData.initialized,
            sqrtPriceNextX96: BigInt(v3_sdk_1.TickMath.getSqrtRatioAtTick(Number(tickData.tick)).toString()),
            amountIn: BigInt(0),
            amountOut: BigInt(0),
            feeAmount: BigInt(0)
        };
    }
    convertToFeeAmount(fee) {
        switch (fee.toString()) {
            case "100":
                return v3_sdk_1.FeeAmount.LOWEST;
            case "500":
                return v3_sdk_1.FeeAmount.LOW;
            case "3000":
                return v3_sdk_1.FeeAmount.MEDIUM;
            case "10000":
                return v3_sdk_1.FeeAmount.HIGH;
            default:
                throw new Error("Invalid fee amount");
        }
    }
    updateSwapIteration(state, step, tickData, fee, sqrtPriceLimitX96, zeroForOne) {
        this.updateSwapStep(state, step, fee, sqrtPriceLimitX96, zeroForOne);
        this.calculateAmount(state, step);
        this.updateTickWithLiquidity(state, step, tickData, zeroForOne);
    }
    updateSwapStep(state, step, fee, sqrtPriceLimitX96, zeroForOne) {
        const [sqrtPriceX96, amountIn, amountOut, feeAmount] = v3_sdk_1.SwapMath.computeSwapStep(jsbi_1.default.BigInt(state.sqrtPriceX96.toString()), this.calculateRatioTargetX96(zeroForOne, step.sqrtPriceNextX96, sqrtPriceLimitX96), jsbi_1.default.BigInt(state.liquidity.toString()), jsbi_1.default.BigInt(state.amountSpecifiedRemaining.toString()), this.convertToFeeAmount(fee));
        state.sqrtPriceX96 = BigInt(sqrtPriceX96.toString());
        step.amountIn = BigInt(amountIn.toString());
        step.amountOut = BigInt(amountOut.toString());
        step.feeAmount = BigInt(feeAmount.toString());
    }
    calculateAmount(state, step) {
        state.amountSpecifiedRemaining -= (step.amountIn + step.feeAmount);
        state.amountCalculated -= step.amountOut;
    }
    updateTickWithLiquidity(state, step, tickData, zeroForOne) {
        if (state.sqrtPriceX96 === step.sqrtPriceNextX96) {
            // if the tick is initialized, run the tick transition
            if (step.initialized) {
                let liquidityNet = tickData.liquidityNet;
                // if we're moving leftward, we interpret liquidityNet as the opposite sign
                if (zeroForOne) {
                    liquidityNet = -liquidityNet;
                }
                const finalLiquidity = v3_sdk_1.LiquidityMath.addDelta(jsbi_1.default.BigInt(state.liquidity.toString()), jsbi_1.default.BigInt(liquidityNet.toString()));
                state.liquidity = BigInt(finalLiquidity.toString());
            }
            state.tick = zeroForOne ? step.tickNext - BigInt(1) : step.tickNext;
        }
        else if (state.sqrtPriceX96 !== step.sqrtPriceStartX96) {
            // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
            const tick = v3_sdk_1.TickMath.getTickAtSqrtRatio(jsbi_1.default.BigInt(state.sqrtPriceX96.toString()));
            state.tick = BigInt(tick.toString());
        }
    }
    calculateRatioTargetX96(zeroForOne, sqrtPriceNextX96, sqrtPriceLimitX96) {
        return (zeroForOne ? sqrtPriceNextX96 < sqrtPriceLimitX96 : sqrtPriceNextX96 > sqrtPriceLimitX96)
            ? jsbi_1.default.BigInt(sqrtPriceLimitX96.toString())
            : jsbi_1.default.BigInt(sqrtPriceNextX96.toString());
    }
    getSqrtPriceLimitX96(zeroForOne) {
        return zeroForOne ?
            BigInt(jsbi_1.default.add(v3_sdk_1.TickMath.MIN_SQRT_RATIO, jsbi_1.default.BigInt("1")).toString()) :
            BigInt(jsbi_1.default.subtract(v3_sdk_1.TickMath.MAX_SQRT_RATIO, jsbi_1.default.BigInt("1")).toString());
    }
}
exports.UniswapOffchainQuoter = UniswapOffchainQuoter;
