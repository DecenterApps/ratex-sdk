"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareSwapParams = prepareSwapParams;
exports.generateCalldata = generateCalldata;
exports.transferQuoteWithBalancerPoolIdToAddress = transferQuoteWithBalancerPoolIdToAddress;
exports.hashStringToInt = hashStringToInt;
exports.encodeSwapData = encodeSwapData;
const RateXAbi_1 = require("../contracts/abi/RateXAbi");
const ethers_1 = require("ethers");
function prepareSwapParams(quote, slippagePercentage, deadlineInMinutes, tokenIn, tokenOut, amountIn, recipient) {
    const quoteWithAddressPoolId = transferQuoteWithBalancerPoolIdToAddress(quote);
    const HUNDRED = BigInt(100);
    const slippageBigInt = BigInt(slippagePercentage) * HUNDRED;
    const minAmountOut = (quoteWithAddressPoolId.quote * (HUNDRED - slippageBigInt)) / HUNDRED;
    const adjustedQuote = quoteWithAddressPoolId.routes.map((route) => ({
        swaps: route.swaps.map((swap) => ({
            data: encodeSwapData(swap), // Encode swap data
            dexId: hashStringToInt(swap.dexId), // Convert dexId to uint32
        })),
        amountIn: route.amountIn,
    }));
    const deadline = Math.floor(Date.now() / 1000) + 60 * deadlineInMinutes;
    // Return the parameters as a plain object
    return {
        adjustedQuote,
        tokenIn,
        tokenOut,
        amountIn,
        minAmountOut,
        recipient,
        deadline,
    };
}
function generateCalldata(quote, slippagePercentage, deadlineInMinutes, tokenIn, tokenOut, amountIn, recipient) {
    const params = prepareSwapParams(quote, slippagePercentage, deadlineInMinutes, tokenIn, tokenOut, amountIn, recipient);
    const abiCoder = new ethers_1.ethers.AbiCoder();
    const calldata = new ethers_1.ethers.Interface(RateXAbi_1.RateXAbi).encodeFunctionData("swap", [
        params.adjustedQuote,
        params.tokenIn,
        params.tokenOut,
        params.amountIn,
        params.minAmountOut,
        params.recipient,
        params.deadline,
    ]);
    // Return swap calldata
    return calldata;
}
function transferQuoteWithBalancerPoolIdToAddress(quote) {
    quote.routes.forEach((route) => route.swaps.forEach((swap) => {
        if (swap.poolId.length === 66) {
            swap.poolId = swap.poolId.slice(0, 42); // Convert to address format
        }
    }));
    return quote;
}
function hashStringToInt(dexName) {
    const hash = (0, ethers_1.keccak256)((0, ethers_1.toUtf8Bytes)(dexName));
    return parseInt(hash.slice(2, 10), 16);
}
function encodeSwapData(swap) {
    const abiCoder = new ethers_1.ethers.AbiCoder();
    if (swap.dexId === "BALANCER" ||
        swap.dexId === "CURVE" ||
        swap.dexId === "UNI_V3") {
        // For DEXes like Balancer, Curve, UniswapV3: encode poolId, tokenIn, and tokenOut
        return abiCoder.encode(["address", "address", "address"], [swap.poolId, swap.tokenIn, swap.tokenOut]);
    }
    else {
        // For other DEXes: encode only tokenIn and tokenOut
        return abiCoder.encode(["address", "address"], [swap.tokenIn, swap.tokenOut]);
    }
}
