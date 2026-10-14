import Icon from '../ui/Icon.jsx'
import OrderButton from '../ui/OrderButton.jsx'
import { rupiah, tanggal } from '../../lib/format.js'
import s from './KosItem.module.css'

/** Satu baris kos di katalog. Bentuk props mengikuti objek di src/data/kos.js. */
export default function KosItem({ kos }) {
  const { nama, area, tipe, harga, fasilitas, verified, dicekPada, foto } = kos

  return (
    <li className={s.item}>
      <div className={s.photo}>
        {foto ? <img src={foto} alt="" loading="lazy" /> : <Icon name="home" size={30} />}
      </div>

      <div className={s.info}>
        <h3 className={s.name}>{nama}</h3>
        <p className={s.meta}>
          {area}, kos {tipe.toLowerCase()}
        </p>
        <ul className={s.tags}>
          {fasilitas.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>

      <div className={s.side}>
        <p className={s.price}>
          <strong>{rupiah(harga)}</strong>
          <span className={s.unit}> per bulan</span>
        </p>
        {verified ? (
          <p className={s.verified}>
            <span className={s.verifiedTitle}>
              <Icon name="check" size={16} />
              Terverifikasi
            </span>
            <span className={s.date}>Diperiksa {tanggal(dicekPada)}</span>
          </p>
        ) : (
          <>
            <p className={s.unchecked}>Belum disurvei</p>
            <OrderButton intent={{ mode: 'survei', kos: nama }} variant="secondary" size="sm">
              Pesan survei
            </OrderButton>
          </>
        )}
      </div>
    </li>
  )
}
