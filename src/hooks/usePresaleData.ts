import { useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { PRESALE_ADDRESS, PRESALE_ABI } from '../config/contracts'

const presaleContract = { address: PRESALE_ADDRESS, abi: PRESALE_ABI } as const
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const

export function usePresaleData(userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContracts({
    contracts: [
      { ...presaleContract, functionName: 'currentPhase' },          // 0
      { ...presaleContract, functionName: 'totalAmountSold' },       // 1
      { ...presaleContract, functionName: 'maxSellingAmount' },      // 2
      { ...presaleContract, functionName: 'startingTime' },          // 3
      { ...presaleContract, functionName: 'endingTime' },            // 4
      { ...presaleContract, functionName: 'getEtherPrice' },         // 5
      { ...presaleContract, functionName: 'owner' },                 // 6
      { ...presaleContract, functionName: 'phases', args: [0n, 0n] }, // 7
      { ...presaleContract, functionName: 'phases', args: [0n, 1n] }, // 8
      { ...presaleContract, functionName: 'phases', args: [0n, 2n] }, // 9
      { ...presaleContract, functionName: 'phases', args: [1n, 0n] }, // 10
      { ...presaleContract, functionName: 'phases', args: [1n, 1n] }, // 11
      { ...presaleContract, functionName: 'phases', args: [1n, 2n] }, // 12
      { ...presaleContract, functionName: 'phases', args: [2n, 0n] }, // 13
      { ...presaleContract, functionName: 'phases', args: [2n, 1n] }, // 14
      { ...presaleContract, functionName: 'phases', args: [2n, 2n] }, // 15
      { ...presaleContract, functionName: 'userTokenBalance', args: [userAddress ?? ZERO_ADDRESS] }, // 16
    ] as const,
    query: { refetchInterval: 15_000 },
  })

  const currentPhase = data?.[0]?.result as bigint | undefined
  const totalAmountSold = data?.[1]?.result as bigint | undefined
  const maxSellingAmount = data?.[2]?.result as bigint | undefined
  const startingTime = data?.[3]?.result as bigint | undefined
  const endingTime = data?.[4]?.result as bigint | undefined
  const ethPrice = data?.[5]?.result as bigint | undefined
  const owner = data?.[6]?.result as `0x${string}` | undefined
  const userTokenBalance = userAddress ? (data?.[16]?.result as bigint | undefined) : 0n

  const phases = [
    { cap: data?.[7]?.result as bigint | undefined, price: data?.[8]?.result as bigint | undefined, endTime: data?.[9]?.result as bigint | undefined },
    { cap: data?.[10]?.result as bigint | undefined, price: data?.[11]?.result as bigint | undefined, endTime: data?.[12]?.result as bigint | undefined },
    { cap: data?.[13]?.result as bigint | undefined, price: data?.[14]?.result as bigint | undefined, endTime: data?.[15]?.result as bigint | undefined },
  ]

  const phaseIndex = currentPhase !== undefined ? Number(currentPhase) : 0
  const currentPhaseData = phases[Math.min(phaseIndex, 2)]

  const now = BigInt(Math.floor(Date.now() / 1000))
  const presaleActive =
    startingTime !== undefined &&
    endingTime !== undefined &&
    now >= startingTime &&
    now <= endingTime

  const presaleEnded = endingTime !== undefined && now > endingTime
  const presaleNotStarted = startingTime !== undefined && now < startingTime

  const soldDisplay = totalAmountSold !== undefined ? formatUnits(totalAmountSold, 18) : '—'
  const maxDisplay = maxSellingAmount !== undefined ? formatUnits(maxSellingAmount, 18) : '—'
  const userBalanceDisplay = userTokenBalance !== undefined ? formatUnits(userTokenBalance, 18) : '0'
  const priceUSD = currentPhaseData.price !== undefined
    ? (Number(currentPhaseData.price) / 1e6).toFixed(4)
    : '—'

  return {
    isLoading,
    refetch,
    currentPhase,
    phaseIndex,
    totalAmountSold,
    maxSellingAmount,
    startingTime,
    endingTime,
    ethPrice,
    owner,
    phases,
    currentPhaseData,
    userTokenBalance,
    presaleActive,
    presaleEnded,
    presaleNotStarted,
    soldDisplay,
    maxDisplay,
    userBalanceDisplay,
    priceUSD,
  }
}
