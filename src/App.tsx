import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Dashboard, Members, Contributions, Expenses, Transactions } from '@/pages'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background font-sans antialiased">
        <main className="mx-auto max-w-lg px-4 pt-4 pb-20">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/contributions" element={<Contributions />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/transactions" element={<Transactions />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  )
}

export default App

