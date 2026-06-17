import { useEffect, useState } from 'react'
import { usePresaleData } from '../hooks/usePresaleData'

function useCountdown(target?: bigint) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    if (!target) return
    const tick = () => {
      const diff = Number(target) - Math.floor(Date.now() / 1000)
      if (diff <= 0) { setRemaining('Ended'); return }
      const d = Math.floor(diff / 86400)
      const h = Math.floor((diff % 86400) / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setRemaining(`${d}d ${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [target])

  return remaining
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-gray-400 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-white font-semibold text-lg leading-tight">{value}</span>
    </div>
  )
}

export function PresaleStats() {
  const { phaseIndex, phases, soldDisplay, maxDisplay, priceUSD, startingTime, endingTime, presaleActive, presaleNotStarted, presaleEnded, isLoading } = usePresaleData()

  const countdown = useCountdown(presaleActive ? endingTime : presaleNotStarted ? startingTime : undefined)

  const progressPct = soldDisplay !== '—' && maxDisplay !== '—'
    ? Math.min(100, (parseFloat(soldDisplay) / parseFloat(maxDisplay)) * 100).toFixed(1)
    : '0'

  const status = presaleEnded
    ? 'Ended'
    : presaleActive
    ? 'Active'
    : presaleNotStarted
    ? 'Not started'
    : '—'

  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 animate-pulse h-48" />
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Presale Info</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          presaleActive ? 'bg-green-900 text-green-300' :
          presaleEnded ? 'bg-red-900 text-red-300' :
          'bg-yellow-900 text-yellow-300'
        }`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Phase" value={`${phaseIndex + 1} / 3`} />
        <Stat label="Token price" value={`$${priceUSD}`} />
        <Stat label="Sold" value={`${parseFloat(soldDisplay).toLocaleString()} TKN`} />
        <Stat label="Total supply" value={`${parseFloat(maxDisplay).toLocaleString()} TKN`} />
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-brand h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm text-gray-400 mb-2">Price per phase</h3>
        <div className="grid grid-cols-3 gap-2">
          {phases.map((phase, i) => {
            const price = phase.price !== undefined
              ? `$${(Number(phase.price) / 1e6).toFixed(4)}`
              : '—'
            const isActive = i === phaseIndex
            return (
              <div
                key={i}
                className={`rounded-lg p-3 text-center ${
                  isActive
                    ? 'bg-brand/20 border border-brand'
                    : 'bg-gray-800'
                }`}
              >
                <span className="text-xs text-gray-400 block">Phase {i + 1}</span>
                <span className={`font-semibold text-sm ${isActive ? 'text-brand' : 'text-white'}`}>
                  {price}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {(presaleActive || presaleNotStarted) && countdown && (
        <div className="text-center text-sm text-gray-400">
          {presaleNotStarted ? 'Starts in' : 'Ends in'}{' '}
          <span className="font-mono text-white">{countdown}</span>
        </div>
      )}
    </div>
  )
}
