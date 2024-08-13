import { Quote, Pool } from "../../types";
declare function findRouteWithIterativeSplitting(tokenA: string, tokenB: string, amountIn: bigint, pools: Pool[], chainId: number): Promise<Quote>;
export { findRouteWithIterativeSplitting };
