/*
  Token login pemilik kos disimpan di sessionStorage (hilang saat tab ditutup, server menolaknya setelah 2 jam).
  Yang disimpan hanya token dari /api/owner, bukan password.
*/
const KEY = 'kc_owner_token'

/** Bisa melempar error di beberapa mode privat. Pemanggil yang menanganinya. */
export const saveOwnerToken = (token) => sessionStorage.setItem(KEY, token)

export function getOwnerToken() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearOwnerToken() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* abaikan */
  }
}
