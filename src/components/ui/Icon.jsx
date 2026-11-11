/* Ikon garis sederhana (24x24). Tambah ikon baru dengan menambah entri di `paths`. */
const paths = {
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chat: <path d="M4 5h16v11H10l-6 4z" />,
  send: (
    <>
      <path d="M21 3 3 10.5l7 3 3 7z" />
      <path d="M10 13.5 21 3" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7v9H4z" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  play: <path d="M8 5.5v13l11-6.5z" />,
  bars: <path d="M5 20v-8M12 20V4M19 20v-5" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9L3.5 9.7l5.9-.8z" />,
  gift: (
    <>
      <path d="M4 11h16v9H4z" />
      <path d="M3 7h18v4H3z" />
      <path d="M12 7v13" />
      <path d="M12 7C10.5 3.5 7 4.3 7.5 6c.3 1 2.5 1 4.5 1zm0 0c1.5-3.5 5-2.7 4.5-1-.3 1-2.5 1-4.5 1z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8 7.5 9.5 4.4-1.5 7.5-4.9 7.5-9.5V6z" />
      <path d="m8.8 12 2.4 2.4 4.1-4.6" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.6-2.5h6.8L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.4" />
    </>
  ),
  bolt: <path d="M13.5 3 5.5 13.5H11l-1 7.5 8.5-11H13z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h5M10 16h5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.9v.1" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13h3v5H5.5A1.5 1.5 0 0 1 4 16.5zM20 13h-3v5h1.5a1.5 1.5 0 0 0 1.5-1.5z" />
      <path d="M18 18.5v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </>
  ),
}

/* filled: isi bentuk dengan warna teks (untuk ikon solid seperti tombol play) */
export default function Icon({ name, size = 20, className, filled = false }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
