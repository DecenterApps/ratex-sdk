import { Pool } from "../../types";
import { TRoute } from "./types";
export default function computeRoutes(tokenIn: string, tokenOut: string, pools: Pool[], maxHops: number): TRoute[];
