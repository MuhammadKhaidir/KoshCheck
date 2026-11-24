import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Import DB only after switching to a temporary working directory: never touch real .data.
const root = process.cwd()
const temp = await mkdtemp(path.join(tmpdir(), 'koscheck-stage1-'))
process.chdir(temp)
const load = p => import(pathToFileURL(path.join(root, p)).href)
const { dummyPay } = await load('api/pay-dummy.js')
const { ownerApi } = await load('api/owner.js')
const { insertListing, getOwnerByWa, insertOwner, getOrder, insertOrder } = await load('api/_db.js')
const { hashPassword } = await load('api/_owner.js')
const { addListing, editListing } = await load('api/admin-listings.js')
const { listKos } = await load('api/kos.js')
const env = { ADMIN_KEY: 'test-only-admin-key', OWNER_SECRET: 'test-only-owner-secret' }
const admin = { headers: { 'x-admin-key': env.ADMIN_KEY } }
const user = { headers: { 'x-forwarded-for': 'test-ip' } }
const bearer = token => ({ headers: { authorization: `Bearer ${token}`, 'x-forwarded-for': 'test-ip' } })

test('KC-01: isolated local integration regression', async t => {
  await t.test('dummy disabled unless explicitly local; no mutation on rejection', async () => {
    await insertOrder(env, { id: 'test-order', nama: 'Test', whatsapp: '081234567890', kos: 'Kos Test', paket: 'dasar', harga: 89000, catatan: '' })
    const request = { orderId: 'test-order', hasil: 'paid', metode: 'qris' }
    for (const flags of [{}, { VERCEL: '1', ENABLE_DUMMY_PAYMENT: 'true' }, { NODE_ENV: 'production', ENABLE_DUMMY_PAYMENT: 'true' }, { MIDTRANS_SERVER_KEY: 'configured', ENABLE_DUMMY_PAYMENT: 'true' }]) {
      assert.equal((await dummyPay(request, { ...env, ...flags })).status, 403)
      assert.equal((await getOrder(env, 'test-order')).status, 'pending')
    }
    assert.equal((await dummyPay(request, { ...env, ENABLE_DUMMY_PAYMENT: 'true' })).status, 200)
    assert.equal((await getOrder(env, 'test-order')).status, 'paid')
  })
  await t.test('price period required on write, preserved in public API, legacy not guessed', async () => {
    const body = { nama: 'Owner', whatsapp: '081234567890', kos: 'Kos Test', area: 'Bukit', catatan: '', tipe: 'Campur', harga: 12000000, fasilitas: [] }
    assert.equal((await addListing(body, env, admin)).status, 400)
    const created = await addListing({ ...body, periode_harga: 'tahun' }, env, admin)
    assert.equal(created.status, 201)
    const id = created.data.listingId
    await insertListing(env, { id: 'legacy', ...body, publik: true })
    let list = (await listKos(null, env)).data.kos
    assert.equal(list.find(k => k.id === id).periode_harga, 'tahun')
    assert.equal(list.find(k => k.id === 'legacy').periode_harga, null)
    assert.deepEqual(list.find(k => k.id === 'legacy').fasilitas, [])
    assert.equal((await editListing({ ...body, id, harga: 1000000, periode_harga: 'bulan' }, env, admin)).status, 200)
    list = (await listKos(null, env)).data.kos
    assert.equal(list.find(k => k.id === id).periode_harga, 'bulan')
    assert.equal(list.find(k => k.id === id).harga, 1000000)
    assert.equal(Object.hasOwn(list.find(k => k.id === id), 'whatsapp'), false)
  })
  await t.test('owner provisioning admin-only, legacy shared password blocked, sessions rotate', async () => {
    const wa = '6281234567890'
    const legacy = await insertOwner(env, { id: 'owner-legacy', whatsapp: wa, nama: 'Owner', pass_hash: hashPassword('old-shared-password') })
    assert.ok(legacy.must_change)
    assert.equal((await ownerApi({ action: 'login', whatsapp: wa, password: 'old-shared-password' }, env, user)).status, 401)
    assert.equal((await ownerApi({ action: 'provision', whatsapp: wa }, env, user)).status, 401)
    const issued = await ownerApi({ action: 'provision', whatsapp: wa }, env, admin)
    assert.equal(issued.status, 200)
    assert.ok(issued.data.temporaryPassword.length >= 20)
    const login = await ownerApi({ action: 'login', whatsapp: wa, password: issued.data.temporaryPassword }, env, user)
    assert.equal(login.status, 200)
    const token = login.data.token
    const locked = await ownerApi({ action: 'data' }, env, bearer(token))
    assert.equal(locked.status, 200)
    assert.equal(locked.data.kos.length, 0)
    const changed = await ownerApi({ action: 'password', password: issued.data.temporaryPassword, newPassword: 'new-test-password-123' }, env, bearer(token))
    assert.equal(changed.status, 200)
    assert.equal((await ownerApi({ action: 'data' }, env, bearer(token))).status, 401)
    const relogin = await ownerApi({ action: 'login', whatsapp: wa, password: 'new-test-password-123' }, env, user)
    assert.equal(relogin.status, 200)
    const data = await ownerApi({ action: 'data' }, env, bearer(relogin.data.token))
    assert.equal(data.status, 200)
    assert.ok(data.data.kos.length > 0)
    assert.equal((await getOwnerByWa(env, wa)).must_change, false)
    assert.equal((await ownerApi({ action: 'provision', whatsapp: wa }, env, admin)).status, 409)
    const id = data.data.kos.find(k => k.id !== 'legacy').id
    const otherWa = '081298765432'
    const moved = await editListing({ id, nama: 'Other Owner', whatsapp: otherWa, kos: 'Kos Test', area: 'Bukit', catatan: '', tipe: 'Campur', harga: 1000000, periode_harga: 'bulan', fasilitas: [] }, env, admin)
    assert.equal(moved.status, 200)
    const refreshed = await ownerApi({ action: 'data' }, env, bearer(relogin.data.token))
    assert.equal(refreshed.data.kos.some(k => k.id === id), false)
    assert.equal((await ownerApi({ action: 'login', whatsapp: otherWa, password: 'old-shared-password' }, env, user)).status, 401)
  })
})

test.after(async () => {
  process.chdir(root)
  await rm(temp, { recursive: true, force: true })
})
