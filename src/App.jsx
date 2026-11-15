import { useEffect, useState } from 'react'
import { OrderIntentProvider } from './context/OrderIntent.jsx'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Hero from './components/sections/Hero.jsx'
import Problems from './components/sections/Problems.jsx'
import Steps from './components/sections/Steps.jsx'
import Plans from './components/sections/Plans.jsx'
import Catalog from './components/sections/Catalog.jsx'
import Owners from './components/sections/Owners.jsx'
import Faq from './components/sections/Faq.jsx'
import Order from './components/sections/Order.jsx'
import ChatWidget from './components/chat/ChatWidget.jsx'
import AdminPage from './pages/AdminPage.jsx'

const isAdminHash = () => window.location.hash === '#/admin'

/*
  Urutan section = urutan di halaman.
  Menambah section baru: buat komponennya di components/sections, lalu taruh di sini.
*/
export default function App() {
  // Halaman database dibuka lewat chat (#/admin). Tanpa react-router: cukup memantau hash.
  const [admin, setAdmin] = useState(isAdminHash)
  useEffect(() => {
    const sync = () => setAdmin(isAdminHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  if (admin) return <AdminPage />

  return (
    <OrderIntentProvider>
      <div id="top">
        <a className="skip-link" href="#konten">
          Lewati ke konten
        </a>
        <Header />
        <main id="konten">
          <Hero />
          <Problems />
          <Steps />
          <Plans />
          <Catalog />
          <Owners />
          <Faq />
          <Order />
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </OrderIntentProvider>
  )
}
