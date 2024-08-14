import { Quote, Pool } from "../../utils/types/types";
declare function findRouteWithIterativeSplitting(tokenA: string, tokenB: string, amountIn: bigint, pools: Pool[], chainId: number): Promise<Quote>;
export { findRouteWithIterativeSplitting };
