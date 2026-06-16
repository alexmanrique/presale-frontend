import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, parseUnits, formatUnits } from 'viem'
import { PRESALE_ADDRESS, PRESALE_ABI, ERC20_ABI, USDC_ADDRESS, USDT_ADDRESS } from '../config/contracts'
import { usePresaleData } from '../hooks/usePresaleData'

type StableToken = 'USDC' | 'USDT'

const STABLE_ADDRESSES: Record<StableToken, `0x${string}`> = {
  USDC: USDC_ADDRESS,
  USDT: USDT_ADDRESS,
}

function estimateTokensFromEth(ethInput: string, ethPrice: bigint, phasePrice: bigint): string {
  try {
    const ethWei = parseEther(ethInput)
    if (ethWei === 0n || phasePrice === 0n) return '0'
    const tokens = (ethWei * ethPrice * 1_000_000n) / (10n ** 18n * phasePrice)
    return parseFloat(formatUnits(tokens, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })
  } catch {
    return '0'
  }
}

function estimateTokensFromStable(stableInput: string, phasePrice: bigint): string {
  try {
    const amount = parseUnits(stableInput, 6)
    if (amount === 0n || phasePrice === 0n) return '0'
    const tokens = (amount * 10n ** 18n) / phasePrice
    return parseFloat(formatUnits(tokens, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 })
  } catch {
    return '0'
  }
}

function EthTab() {
  const [input, setInput] = useState('')
  const { presaleActive, ethPrice, currentPhaseData } = usePresaleData()
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const estimated = ethPrice && currentPhaseData.price
    ? estimateTokensFromEth(input, ethPrice, currentPhaseData.price)
    : '0'

  const handleBuy = () => {
    if (!input || !presaleActive) return
    writeContract({
      address: PRESALE_ADDRESS,
      abi: PRESALE_ABI,
      functionName: 'buyWithEth',
      value: parseEther(input),
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-400 mb-1 block">ETH amount</label>
        <input
          type="number"
          min="0"
          step="0.001"
          placeholder="0.0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand"
        />
      </div>

      {input && (
        <p className="text-sm text-gray-400">
          You receive ≈ <span className="text-white font-medium">{estimated} TKN</span>
        </p>
      )}

      {isSuccess && (
        <p className="text-sm text-green-400">Purchase confirmed!</p>
      )}

      <button
        onClick={handleBuy}
        disabled={!input || !presaleActive || isPending || isConfirming}
        className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {isPending || isConfirming ? 'Confirming…' : 'Buy with ETH'}
      </button>

      {!presaleActive && (
        <p className="text-xs text-center text-gray-500">Presale not active</p>
      )}
    </div>
  )
}

function StableTab() {
  const [input, setInput] = useState('')
  const [token, setToken] = useState<StableToken>('USDC')
  const { address } = useAccount()
  const { presaleActive, currentPhaseData, refetch } = usePresaleData(address)

  const tokenAddress = STABLE_ADDRESSES[token]
  const atomicAmount = (() => { try { return parseUnits(input || '0', 6) } catch { return 0n } })()

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PRESALE_ADDRESS] : undefined,
    query: { enabled: !!address },
  })

  const needsApproval = allowance !== undefined && atomicAmount > 0n && allowance < atomicAmount

  const { writeContract: approve, data: approveTxHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const { writeContract: buy, data: buyTxHash, isPending: isBuyPending } = useWriteContract()
  const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyTxHash })

  const estimated = currentPhaseData.price
    ? estimateTokensFromStable(input, currentPhaseData.price)
    : '0'

  const handleApprove = () => {
    approve({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [PRESALE_ADDRESS, atomicAmount],
    })
  }

  const handleBuy = () => {
    if (!input || !presaleActive) return
    buy({
      address: PRESALE_ADDRESS,
      abi: PRESALE_ABI,
      functionName: 'buyWithStable',
      args: [tokenAddress, atomicAmount],
    })
    refetch()
  }

  const isWorking = isApprovePending || isApproveConfirming || isBuyPending || isBuyConfirming

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['USDC', 'USDT'] as StableToken[]).map((t) => (
          <button
            key={t}
            onClick={() => setToken(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              token === t ? 'bg-brand text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-400 mb-1 block">{token} amount</label>
        <input
          type="number"
          min="0"
          step="1"
          placeholder="0.00"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand"
        />
      </div>

      {input && (
        <p className="text-sm text-gray-400">
          You receive ≈ <span className="text-white font-medium">{estimated} TKN</span>
        </p>
      )}

      {isBuySuccess && <p className="text-sm text-green-400">Purchase confirmed!</p>}
      {isApproveSuccess && !isBuySuccess && <p className="text-sm text-blue-400">Approval confirmed. Now click Buy.</p>}

      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={!input || isWorking}
          className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isApprovePending || isApproveConfirming ? 'Approving…' : `Approve ${token}`}
        </button>
      ) : (
        <button
          onClick={handleBuy}
          disabled={!input || !presaleActive || isWorking || !address}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {isBuyPending || isBuyConfirming ? 'Confirming…' : `Buy with ${token}`}
        </button>
      )}

      {!presaleActive && (
        <p className="text-xs text-center text-gray-500">Presale not active</p>
      )}
    </div>
  )
}

export function BuySection() {
  const [tab, setTab] = useState<'eth' | 'stable'>('eth')
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 text-center text-gray-400">
        Connect wallet to buy tokens
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Buy TKN</h2>

      <div className="flex gap-2 bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setTab('eth')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'eth' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pay with ETH
        </button>
        <button
          onClick={() => setTab('stable')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'stable' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pay with USDC / USDT
        </button>
      </div>

      {tab === 'eth' ? <EthTab /> : <StableTab />}
    </div>
  )
}
