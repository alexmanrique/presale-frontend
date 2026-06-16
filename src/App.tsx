import { Header } from './components/Header'
import { PresaleStats } from './components/PresaleStats'
import { BuySection } from './components/BuySection'
import { ClaimSection } from './components/ClaimSection'
import { AdminPanel } from './components/AdminPanel'

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-4 flex-1">
        <PresaleStats />
        <div className="grid md:grid-cols-2 gap-4">
          <BuySection />
          <ClaimSection />
        </div>
        <AdminPanel />
      </main>
      <footer className="text-center text-xs text-gray-600 py-6">
        Contract: 0x22acf670a8ef602290348f5bee655ec31ebd5038 · Arbitrum
      </footer>
    </div>
  )
}
