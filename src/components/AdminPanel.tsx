import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, isAddress } from 'viem'
import { PRESALE_ADDRESS, PRESALE_ABI, ERC20_ABI, SALE_TOKEN_ADDRESS } from '../config/contracts'
import { usePresaleData } from '../hooks/usePresaleData'

function AdminAction({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-700 rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {children}
    </div>
  )
}

function FundSection() {
  const { maxSellingAmount, refetch } = usePresaleData()
  const { address } = useAccount()

  const { data: allowance } = useReadContract({
    address: SALE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && maxSellingAmount ? [address, PRESALE_ADDRESS] : undefined,
    query: { enabled: !!address && !!maxSellingAmount },
  })

  const needsApproval = !allowance || !maxSellingAmount || allowance < maxSellingAmount

  const { writeContract: approve, data: approveTxHash, isPending: isApprovePending } = useWriteContract()
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash })

  const { writeContract: fund, data: fundTxHash, isPending: isFundPending } = useWriteContract()
  const { isLoading: isFundConfirming, isSuccess: isFundSuccess } = useWaitForTransactionReceipt({ hash: fundTxHash })

  const handleApprove = () => {
    if (!maxSellingAmount) return
    approve({ address: SALE_TOKEN_ADDRESS, abi: ERC20_ABI, functionName: 'approve', args: [PRESALE_ADDRESS, maxSellingAmount] })
  }

  const handleFund = () => {
    fund({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: 'fund' })
    refetch()
  }

  return (
    <AdminAction label="Fund contract">
      {isFundSuccess && <p className="text-sm text-green-400">Contract funded!</p>}
      {isApproveSuccess && !isFundSuccess && <p className="text-sm text-blue-400">Approved. Now click Fund.</p>}
      {needsApproval ? (
        <button
          onClick={handleApprove}
          disabled={isApprovePending || isApproveConfirming}
          className="w-full bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {isApprovePending || isApproveConfirming ? 'Approving…' : 'Approve Sale Token'}
        </button>
      ) : (
        <button
          onClick={handleFund}
          disabled={isFundPending || isFundConfirming}
          className="w-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {isFundPending || isFundConfirming ? 'Confirming…' : 'Fund Contract'}
        </button>
      )}
    </AdminAction>
  )
}

function BlacklistSection() {
  const [addr, setAddr] = useState('')
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const handleSubmit = () => {
    if (!isAddress(addr)) return
    writeContract({
      address: PRESALE_ADDRESS,
      abi: PRESALE_ABI,
      functionName: mode === 'add' ? 'blackList' : 'removeBlacklist',
      args: [addr as `0x${string}`],
    })
  }

  return (
    <AdminAction label="Blacklist">
      <div className="flex gap-2">
        {(['add', 'remove'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              mode === m ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {m === 'add' ? 'Blacklist' : 'Remove'}
          </button>
        ))}
      </div>
      <input
        placeholder="0x address"
        value={addr}
        onChange={(e) => setAddr(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand font-mono"
      />
      {isSuccess && <p className="text-xs text-green-400">Done!</p>}
      <button
        onClick={handleSubmit}
        disabled={!isAddress(addr) || isPending || isConfirming}
        className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        {isPending || isConfirming ? 'Confirming…' : mode === 'add' ? 'Blacklist Address' : 'Remove from Blacklist'}
      </button>
    </AdminAction>
  )
}

function EmergencySection() {
  const [tokenAddr, setTokenAddr] = useState('')
  const [amount, setAmount] = useState('')
  const [decimals, setDecimals] = useState('18')

  const { writeContract: withdrawToken, data: erc20TxHash, isPending: isErc20Pending } = useWriteContract()
  const { isLoading: isErc20Confirming, isSuccess: isErc20Success } = useWaitForTransactionReceipt({ hash: erc20TxHash })

  const { writeContract: withdrawEth, data: ethTxHash, isPending: isEthPending } = useWriteContract()
  const { isLoading: isEthConfirming, isSuccess: isEthSuccess } = useWaitForTransactionReceipt({ hash: ethTxHash })

  const handleWithdrawToken = () => {
    if (!isAddress(tokenAddr) || !amount) return
    try {
      const atomicAmount = parseUnits(amount, parseInt(decimals))
      withdrawToken({
        address: PRESALE_ADDRESS,
        abi: PRESALE_ABI,
        functionName: 'emergencyWithdraw',
        args: [tokenAddr as `0x${string}`, atomicAmount],
      })
    } catch {}
  }

  const handleWithdrawEth = () => {
    withdrawEth({ address: PRESALE_ADDRESS, abi: PRESALE_ABI, functionName: 'emergencyWithdrawEth' })
  }

  return (
    <AdminAction label="Emergency withdraw">
      <div className="space-y-2">
        <input
          placeholder="Token address (0x…)"
          value={tokenAddr}
          onChange={(e) => setTokenAddr(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand font-mono"
        />
        <div className="flex gap-2">
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand"
          />
          <input
            placeholder="Decimals"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand"
          />
        </div>
        {isErc20Success && <p className="text-xs text-green-400">Token withdrawn!</p>}
        <button
          onClick={handleWithdrawToken}
          disabled={!isAddress(tokenAddr) || !amount || isErc20Pending || isErc20Confirming}
          className="w-full bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {isErc20Pending || isErc20Confirming ? 'Confirming…' : 'Withdraw Token'}
        </button>
      </div>

      <div className="border-t border-gray-700 pt-3 space-y-2">
        {isEthSuccess && <p className="text-xs text-green-400">ETH withdrawn!</p>}
        <button
          onClick={handleWithdrawEth}
          disabled={isEthPending || isEthConfirming}
          className="w-full bg-orange-700 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          {isEthPending || isEthConfirming ? 'Confirming…' : 'Withdraw ETH'}
        </button>
      </div>
    </AdminAction>
  )
}

export function AdminPanel() {
  const { address, isConnected } = useAccount()
  const { owner } = usePresaleData(address)

  const isOwner = isConnected && owner && address &&
    owner.toLowerCase() === address.toLowerCase()

  if (!isOwner) return null

  return (
    <div className="bg-gray-900 border border-yellow-800/50 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-yellow-400 text-sm font-medium">⚙ Admin Panel</span>
      </div>

      <FundSection />
      <BlacklistSection />
      <EmergencySection />
    </div>
  )
}
