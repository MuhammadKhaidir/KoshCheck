// Harga paket di README: Rp39.000 - Rp99.000. Sesuaikan kalau berubah.
const MIN_AMOUNT = 39000;
const MAX_AMOUNT = 99000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } = process.env;
  if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
    return res.status(500).json({ error: 'MIDTRANS_SERVER_KEY / MIDTRANS_CLIENT_KEY belum diset' });
  }

  const isProd = MIDTRANS_IS_PRODUCTION === 'true';
  const base = isProd ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';

  const { amount, itemName, customer } = req.body || {};
  const gross = Number(amount);
  if (!Number.isInteger(gross) || gross < MIN_AMOUNT || gross > MAX_AMOUNT) {
    return res.status(400).json({ error: 'amount tidak valid' });
  }

  const orderId = `KC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const payload = {
    transaction_details: { order_id: orderId, gross_amount: gross },
    item_details: [
      {
        id: 'paket',
        price: gross,
        quantity: 1,
        name: String(itemName || 'Paket KOSCHECK').slice(0, 50),
      },
    ],
  };
  if (customer && typeof customer === 'object') {
    payload.customer_details = {
      first_name: String(customer.name || '').slice(0, 50),
      email: String(customer.email || '').slice(0, 100),
      phone: String(customer.phone || '').slice(0, 20),
    };
  }

  try {
    const r = await fetch(`${base}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error_messages?.join(', ') || 'Midtrans error' });
    }
    return res.status(200).json({
      token: data.token,
      orderId,
      clientKey: MIDTRANS_CLIENT_KEY,
      snapUrl: `${base}/snap/snap.js`,
    });
  } catch {
    return res.status(502).json({ error: 'Gagal menghubungi Midtrans' });
  }
}
