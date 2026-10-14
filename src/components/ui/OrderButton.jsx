import Button from './Button.jsx'
import { useOrderIntent } from '../../context/OrderIntent.jsx'

/**
 * Tombol yang mengarah ke form pemesanan (#pesan) sekaligus mengisi form-nya.
 * intent: { mode: 'survei' | 'pemilik', plan?: string, kos?: string }
 */
export default function OrderButton({ intent, onClick, children, ...props }) {
  const { setIntent } = useOrderIntent()

  const handleClick = (event) => {
    setIntent(intent)
    onClick?.(event)
  }

  return (
    <Button href="#pesan" {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}
