import { Quote, SwapStep } from "./types/types";
import { RateXAbi } from "../contracts/abi/RateXAbi";
import { keccak256, toUtf8Bytes, ethers } from "ethers";

export function prepareSwapParams(
  quote: Quote,
  slippagePercentage: number,
  deadlineInMinutes: number,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  recipient: string
): {
  adjustedQuote: {
    swaps: {
      data: string;
      dexId: number;
    }[];
    amountIn: bigint;
  }[];
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  minAmountOut: bigint;
  recipient: string;
  deadline: number;
} {
  const quoteWithAddressPoolId =
    transferQuoteWithBalancerPoolIdToAddress(quote);

  const HUNDRED = BigInt(100);
  const slippageBigInt = BigInt(slippagePercentage) * HUNDRED;
  const minAmountOut =
    (quoteWithAddressPoolId.quote * (HUNDRED - slippageBigInt)) / HUNDRED;

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

export function generateCalldata(
  quote: Quote,
  slippagePercentage: number,
  deadlineInMinutes: number,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  recipient: string
): string {
  const params = prepareSwapParams(
    quote,
    slippagePercentage,
    deadlineInMinutes,
    tokenIn,
    tokenOut,
    amountIn,
    recipient
  );

  const abiCoder = new ethers.AbiCoder();
  const calldata = new ethers.Interface(RateXAbi).encodeFunctionData("swap", [
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

export function transferQuoteWithBalancerPoolIdToAddress(quote: Quote): Quote {
  quote.routes.forEach((route) =>
    route.swaps.forEach((swap) => {
      if (swap.poolId.length === 66) {
        swap.poolId = swap.poolId.slice(0, 42); // Convert to address format
      }
    })
  );
  return quote;
}

export function hashStringToInt(dexName: string): number {
  const hash = keccak256(toUtf8Bytes(dexName));
  return parseInt(hash.slice(2, 10), 16);
}

export function encodeSwapData(swap: SwapStep): string {
  const abiCoder = new ethers.AbiCoder();
  if (
    swap.dexId === "BALANCER_V2" ||
    swap.dexId === "UNI_V3"
  ) {
    // For DEXes like Balancer, Curve, UniswapV3: encode poolId, tokenIn, and tokenOut
    return abiCoder.encode(
      ["address", "address", "address"],
      [swap.poolId, swap.tokenIn, swap.tokenOut]
    );
  } else {
    // For other DEXes: encode only tokenIn and tokenOut
    return abiCoder.encode(
      ["address", "address"],
      [swap.tokenIn, swap.tokenOut]
    );
  }
}
