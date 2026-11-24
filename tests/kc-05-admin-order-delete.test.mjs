import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const temp = await mkdtemp(path.join(tmpdir(), 'koscheck-order-delete-'))
process.chdir(temp)
const load = (file) => import(pathToFileURL(path.join(root, file)).href)
const { deleteOrder } = await load('api/admin.js')
const { insertOrder, getOrder } = await load('api/_db.js')

const env = { ADMIN_KEY: 'test-only-admin-key' }
const admin = { headers: { 'x-admin-key': env.ADMIN_KEY } }
const guest = { headers: {} }

test('admin can delete one order without deleting other orders', async () => {
  await insertOrder(env, { id: 'KC-DELETE', nama: 'Test Hapus', whatsapp: '081234567890', kos: 'Kos A', paket: 'dasar', harga: 89000, catatan: '' })
  await insertOrder(env, { id: 'KC-KEEP', nama: 'Test Simpan', whatsapp: '081234567891', kos: 'Kos B', paket: 'dasar', harga: 89000, catatan: '' })

  assert.equal((await deleteOrder({ id: 'KC-DELETE' }, env, guest)).status, 401)
  assert.ok(await getOrder(env, 'KC-DELETE'))

  assert.equal((await deleteOrder({ id: '' }, env, admin)).status, 400)
  assert.equal((await deleteOrder({ id: 'KC-MISSING' }, env, admin)).status, 404)

  const result = await deleteOrder({ id: 'KC-DELETE' }, env, admin)
  assert.equal(result.status, 200)
  assert.equal(result.data.orderId, 'KC-DELETE')
  assert.equal(await getOrder(env, 'KC-DELETE'), null)
  assert.ok(await getOrder(env, 'KC-KEEP'))
})

test.after(async () => {
  process.chdir(root)
  await rm(temp, { recursive: true, force: true })
})
