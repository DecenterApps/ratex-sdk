import { Quote, Pool } from "../types";
export declare function findRoute(tokenIn: string, tokenOut: string, amountIn: bigint, pools: Pool[], chainId: number): Promise<Quote>;
