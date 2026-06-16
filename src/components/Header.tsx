import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSwitchChain } from 'wagmi'
import { arbitrum } from 'wagmi/chains'

export function Header() {
  const { chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const wrongNetwork = chainId !== undefined && chainId !== arbitrum.id

  return (
    <>
      {wrongNetwork && (
        <div className="bg-red-900/80 text-red-200 text-sm text-center py-2 px-4">
          Wrong network.{' '}
          <button
            onClick={() => switchChain({ chainId: arbitrum.id })}
            className="underline font-semibold hover:text-white"
          >
            Switch to Arbitrum
          </button>
        </div>
      )}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white font-bold text-sm">
              T
            </div>
            <span className="font-semibold text-lg">TKN Presale</span>
          </div>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </header>
    </>
  )
}
