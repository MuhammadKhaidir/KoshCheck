import test from 'node:test'
import assert from 'node:assert/strict'
import { PROMO_START, PROMO_END, promoActive, pricePlan, countdown } from '../src/lib/openingPromo.js'
import { ownerPlans, surveyPlans, freeCatalogPlan } from '../src/content/site.js'

test('Batas promo tepat pada WIB', () => {
  assert.equal(promoActive(PROMO_START - 1), false)
  assert.equal(promoActive(PROMO_START), true)
  assert.equal(promoActive(PROMO_END - 1), true)
  assert.equal(promoActive(PROMO_END), false)
  assert.equal(countdown(PROMO_END), '0 hari 00:00:00')
})
test('Harga promo dan normal, durasi serta benefit tetap', () => {
  const expected = { premium: [49000, 29000], ultimate: [199000, 169000], dasar: [89000, 79000], lengkap: [149000, 129000], free: [0, 0] }
  for (const p of [...ownerPlans.items, ...surveyPlans, freeCatalogPlan]) {
    const [normal, promo] = expected[p.id]
    assert.equal(pricePlan(p, PROMO_START).price, promo)
    assert.equal(pricePlan(p, PROMO_END).price, normal)
    assert.equal(pricePlan(p, PROMO_START - 1).price, normal)
    assert.equal(pricePlan(p, PROMO_START).duration, p.duration)
    assert.deepEqual(pricePlan(p, PROMO_START).includes, p.includes)
    assert.equal(p.price, normal)
  }
  assert.equal(pricePlan(undefined), undefined)
})
