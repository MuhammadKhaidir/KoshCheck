import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { qrisConfirmationUrl } from '../src/lib/qrisPayment.js'

test('QRIS WhatsApp confirmation includes order and server amount without claiming paid', () => {
  const url = new URL(qrisConfirmationUrl('6281234567890', { orderId: 'KC-TEST', amount: 79000, planName: 'Survei Standar', nama: 'Test' }))
  assert.equal(url.hostname, 'wa.me')
  const message = url.searchParams.get('text')
  assert.match(message, /KC-TEST/)
  assert.match(message, /79000/)
  assert.match(message, /verifikasi/)
  assert.equal(qrisConfirmationUrl('invalid', { orderId: 'x', amount: 79000 }), '')
  assert.equal(qrisConfirmationUrl('6281234567890', { orderId: 'x', amount: 0 }), '')
})

test('checkout uses QRIS, not the dummy payment endpoint', async () => {
  const order = await readFile(new URL('../src/components/sections/Order.jsx', import.meta.url), 'utf8')
  const modal = await readFile(new URL('../src/components/pay/QrisPay.jsx', import.meta.url), 'utf8')
  assert.match(order, /<QrisPay/)
  assert.match(order, /amount: data.amount/)
  assert.doesNotMatch(order, /<DummyPay|VITE_ENABLE_DUMMY_PAYMENT/)
  assert.doesNotMatch(modal, /pay-dummy|onFinish|fetch\(/)
  assert.match(modal, /gopay-merchant\.png/)
})
