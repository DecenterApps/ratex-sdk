import Web3 from 'web3';
import { Pool, PoolInfo, DEXGraphFunctionality } from '../utils/types/types'
import { Dexes } from '../index';
import { myLocalStorage } from './my_local_storage';
import UniswapV2 from '../dexes/graph_queries/UniswapV2';
import SushiSwapV2 from '../dexes/graph_queries/SushiSwapV2';
import UniswapV3 from '../dexes/graph_queries/UniswapV3';
import BalancerV2 from '../dexes/graph_queries/BalancerV2';
import CamelotV2 from '../dexes/graph_queries/CamelotV2';

let initializedMainnet = false
let initializedArbitrum = false
let initializedDexes: DEXGraphFunctionality[] = []
let dexesPools: Map<DEXGraphFunctionality, PoolInfo[]> = new Map<DEXGraphFunctionality, PoolInfo[]>()

async function initializeDexes(chainId: number, graphApiKey: string, dexes: Array<Dexes>): Promise<void> {
  try {
    // Clear Previous Dex Graph Mappings and Initialized DEX array
    dexesPools.clear()
    initializedDexes = []

    for (const dex of dexes) {
      let Dex;
      switch (dex) {
        case Dexes.BALANCER:
          Dex = BalancerV2;
          break;
        case Dexes.CAMELOT:
          if (chainId === 1)
            continue;
          Dex = CamelotV2;
          break;
        case Dexes.SUSHISWAP_V2:
          Dex = SushiSwapV2;
          break;
        case Dexes.UNISWAP_V2:
          if (chainId === 42161)
            continue;
          Dex = UniswapV2;
          break;
        case Dexes.UNISWAP_V3:
          Dex = UniswapV3;
          break;
        default:
          throw Error("Invalid Dex value")
      }
      const dexInstance: DEXGraphFunctionality = Dex.initialize(myLocalStorage)
      dexInstance.setEndpoint(chainId, graphApiKey)
      initializedDexes.push(dexInstance)
      dexesPools.set(dexInstance, [])
    }
  } catch (err) {
    console.error('Error reading directory dexes_graph:', err)
  }
}

async function checkInitializedDexes(chainId: number, graphApiKey: string, dexes: Array<Dexes>) {
  if (chainId === 1 && !initializedMainnet) {
    await initializeDexes(chainId, graphApiKey, dexes)
    initializedArbitrum = false
    initializedMainnet = true
  }
  if (chainId === 42161 && !initializedArbitrum) {
    await initializeDexes(chainId, graphApiKey, dexes)
    initializedMainnet = false
    initializedArbitrum = true
  }
}

/*   Returns dictionary of dexes and their poolIds for token1 and token2:
 *   UniswapV3: [poolId1, poolId2, ...],
 *   SushiSwapV2: [poolId1, poolId2, ...]
 */
async function getPoolIdsForTokenPairs(tokenA: string, tokenB: string, numPools: number = 3, chainId: number, graphApiKey: string, dexes: Array<Dexes>): Promise<void> {
  await checkInitializedDexes(chainId, graphApiKey, dexes)

  const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithTokenPair(tokenA, tokenB, numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* Get pools from each dex in initializedDexes list that have token as one of the tokens in the pool
 * @param token: token address to match (for now the chain is Arbitrum -> param for the future)
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getPoolIdsForToken(token: string, numPools: number = 5, chainId: number, graphApiKey: string, dexes: Array<Dexes>): Promise<void> {
  await checkInitializedDexes(chainId, graphApiKey, dexes)

  const allPoolsPromises = initializedDexes.map((dex) => dex.getPoolsWithToken(token, numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* Get top pools from each dex in initializedDexes list - returns a list of poolIds
 * @param numPools: number of pools to return from each dex
 * @param amountIn: amount of token1 to swap (in wei) - currently unused
 * @returns: list of poolIds
 */
async function getTopPools(numPools: number = 5, chainId: number, graphApiKey: string, dexes: Array<Dexes>): Promise<void> {
  await checkInitializedDexes(chainId, graphApiKey, dexes)

  const allPoolsPromises = initializedDexes.map((dex) => dex.getTopPools(numPools))
  const allPoolsResults = await Promise.all(allPoolsPromises)

  initializedDexes.forEach((dex, index) => {
    const pools = allPoolsResults[index]
    if (dexesPools.has(dex)) {
      dexesPools.get(dex)?.push(...pools)
    } else {
      dexesPools.set(dex, pools)
    }
  })
}

/* We are fetching pools from multiple dexes, so we might get duplicate pools
 * top numTopPools pools for tokenFrom and tokenTo are fetched from each DEX
 * top numTopPools by TVL from each DEX
 * top numTopPools that contain tokenFrom and tokenTo from each DEX (possible direct swap)
 */
async function fetchPoolsData(
  tokenFrom: string,
  tokenTo: string,
  numFromToPools: number = 5,
  numTopPools: number = 5,
  chainId: number,
  rpcProvider: Web3,
  graphApiKey: string,
  dexes: Array<Dexes>
): Promise<Pool[]> {
  let pools: Pool[] = []
  dexesPools.forEach((poolInfos: PoolInfo[], dex: DEXGraphFunctionality) => {
    dexesPools.set(dex, [])
  })

  await checkInitializedDexes(chainId, graphApiKey, dexes)

  // call Graph API
  const promises: Promise<void>[] = []
  promises.push(getPoolIdsForToken(tokenFrom, numFromToPools, chainId, graphApiKey, dexes))
  promises.push(getPoolIdsForToken(tokenTo, numFromToPools, chainId, graphApiKey, dexes))
  promises.push(getTopPools(numTopPools, chainId, graphApiKey, dexes))
  promises.push(getPoolIdsForTokenPairs(tokenFrom, tokenTo, numFromToPools, chainId, graphApiKey, dexes))
  await Promise.all(promises)
  filterDuplicatePools()

  // call Solidity for additional pool data
  const dexPoolsPromises: Promise<Pool[]>[] = []
  for (let [dex, poolInfos] of dexesPools.entries()) {
    dexPoolsPromises.push(dex.getAdditionalPoolDataFromSolidity(poolInfos, rpcProvider))
  }
  const allPoolsData = await Promise.all(dexPoolsPromises)
  allPoolsData.forEach((poolsData: Pool[]) => {
    pools.push(...poolsData)
  })

  return pools
}

function filterDuplicatePools(): void {
  dexesPools.forEach((poolInfos: PoolInfo[], dex: DEXGraphFunctionality, self) => {
    const filteredPoolInfos = poolInfos.filter((poolInfo: PoolInfo, index: number, allPoolInfos: PoolInfo[]) => {
      return allPoolInfos.findIndex((pool2) => pool2.poolId === poolInfo.poolId) === index
    })
    self.set(dex, filteredPoolInfos)
  })
}

export { fetchPoolsData }
