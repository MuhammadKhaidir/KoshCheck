async function postJSON(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || `Request gagal (${r.status})`);
  return data;
}

export async function askAI(messages) {
  const { reply } = await postJSON('/api/chat', { messages });
  return reply;
}

function loadSnap(src, clientKey) {
  if (window.snap) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute('data-client-key', clientKey);
    s.onload = resolve;
    s.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
    document.head.appendChild(s);
  });
}

// payWithSnap({ amount: 49000, itemName: 'Paket Cek Kos', customer: { name, email, phone } })
export async function payWithSnap(payload) {
  const { token, clientKey, snapUrl } = await postJSON('/api/midtrans-token', payload);
  await loadSnap(snapUrl, clientKey);
  return new Promise((resolve, reject) => {
    window.snap.pay(token, {
      onSuccess: (result) => resolve({ status: 'success', result }),
      onPending: (result) => resolve({ status: 'pending', result }),
      onError: (result) => reject(new Error(result?.status_message || 'Pembayaran gagal')),
      onClose: () => resolve({ status: 'closed' }),
    });
  });
}
