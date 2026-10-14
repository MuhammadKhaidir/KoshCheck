import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/*
  Menghubungkan tombol di seluruh halaman ke form pemesanan (section #pesan).
  Tombol memanggil setIntent({ mode, plan, kos }); form membaca intent dan mengisi dirinya.

  mode: 'survei' | 'pemilik'
  plan: id paket (lihat content/site.js)
  kos : nama kos yang ingin dicek
*/
const OrderIntentContext = createContext({
  intent: { mode: 'survei', plan: null, kos: null, nonce: 0 },
  setIntent: () => {},
})

export function OrderIntentProvider({ children }) {
  const [intent, setIntentState] = useState({ mode: 'survei', plan: null, kos: null, nonce: 0 })

  const setIntent = useCallback((next = {}) => {
    setIntentState((prev) => ({
      mode: next.mode ?? 'survei',
      plan: next.plan ?? null,
      kos: next.kos ?? null,
      nonce: prev.nonce + 1,
    }))
  }, [])

  const value = useMemo(() => ({ intent, setIntent }), [intent, setIntent])

  return <OrderIntentContext.Provider value={value}>{children}</OrderIntentContext.Provider>
}

export const useOrderIntent = () => useContext(OrderIntentContext)
