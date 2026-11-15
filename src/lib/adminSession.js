/*
  Token login admin disimpan di sessionStorage: hilang saat tab ditutup, dan server menolaknya
  setelah 1 jam. Yang disimpan hanya token dari /api/admin-login, bukan password.
*/
const KEY = 'kc_admin_token'

/** Bisa melempar error di beberapa mode privat. Pemanggil yang menanganinya. */
export const saveToken = (token) => sessionStorage.setItem(KEY, token)

export function getToken() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* abaikan */
  }
}
