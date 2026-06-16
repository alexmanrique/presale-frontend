import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { arbitrum } from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'TKN Presale',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'fallback',
  chains: [arbitrum],
  ssr: false,
})
