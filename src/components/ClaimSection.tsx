import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { PRESALE_ADDRESS, PRESALE_ABI } from '../config/contracts'
import { usePresaleData } from '../hooks/usePresaleData'

export function ClaimSection() {
  const { address, isConnected } = useAccount()
  const { userTokenBalance, userBalanceDisplay, presaleEnded, endingTime, refetch } = usePresaleData(address)

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  if (!isConnected) return null
  if (!userTokenBalance || userTokenBalance === 0n) return null

  const canClaim = presaleEnded

  const handleClaim = () => {
    writeContract({
      address: PRESALE_ADDRESS,
      abi: PRESALE_ABI,
      functionName: 'claimTokens',
    })
    refetch()
  }

  const endDate = endingTime ? new Date(Number(endingTime) * 1000).toLocaleDateString() : '—'

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold">Claim Tokens</h2>

      <div className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
        <span className="text-gray-400 text-sm">Your allocation</span>
        <span className="text-white font-semibold">
          {parseFloat(userBalanceDisplay).toLocaleString(undefined, { maximumFractionDigits: 4 })} TKN
        </span>
      </div>

      {isSuccess && (
        <p className="text-sm text-green-400">Tokens claimed successfully!</p>
      )}

      {!canClaim && (
        <p className="text-xs text-gray-500 text-center">
          Tokens claimable after presale ends ({endDate})
        </p>
      )}

      <button
        onClick={handleClaim}
        disabled={!canClaim || isPending || isConfirming}
        className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {isPending || isConfirming ? 'Confirming…' : 'Claim TKN'}
      </button>
    </div>
  )
}
