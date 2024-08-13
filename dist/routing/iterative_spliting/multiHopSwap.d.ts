import { Route, Pool } from '../../types';
declare function multiHopSwap(amountIn: bigint, tokenIn: string, tokenOut: string, graph: Map<string, Pool[]>): Route;
declare function createGraph(pools: Pool[]): Map<string, Pool[]>;
export { multiHopSwap, createGraph };
