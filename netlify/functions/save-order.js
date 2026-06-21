// Netlify Function: save-order
// Saves every order placed on the storefront (WhatsApp / Email / Messenger)
// into Netlify Blobs, so it can be viewed & analysed in the admin dashboard.
// This function is PUBLIC (no password) because customers trigger it
// directly when they checkout — it only ever WRITES a new order, it
// never reads or exposes existing orders.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Basic shape validation — keep it loose since cart orders can have
    // multiple items, single-product orders have one.
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items in order' }) };
    }
    if (!body.customer || !body.customer.name || !body.customer.phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Customer name and phone are required' }) };
    }

    const store = getStore({ name: 'orders', consistency: 'strong' });

    const now = new Date();
    const id = 'ORD-' + now.getTime().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    const order = {
      id,
      createdAt: now.toISOString(),
      channel: body.channel || 'unknown',        // 'whatsapp' | 'email' | 'facebook'
      status: 'new',                              // 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
      customer: {
        name: String(body.customer.name).slice(0, 200),
        phone: String(body.customer.phone).slice(0, 50),
        address: String(body.customer.address || '').slice(0, 500),
        note: String(body.customer.note || '').slice(0, 1000),
      },
      items: body.items.map((it) => ({
        productId: it.productId,
        code: it.code || '',
        name: String(it.name || '').slice(0, 200),
        category: it.category || '',
        qty: Number(it.qty) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        variants: it.variants || [],
      })),
      delivery: {
        zone: body.delivery?.zone || '',
        cost: Number(body.delivery?.cost) || 0,
      },
      subtotal: Number(body.subtotal) || 0,
      total: Number(body.total) || 0,
    };

    await store.setJSON(id, order);

    // Maintain a lightweight index for fast listing without scanning
    // every blob (cheap to read, append-only).
    let index = [];
    try {
      index = (await store.get('_index', { type: 'json' })) || [];
    } catch (e) {
      index = [];
    }
    index.push({ id, createdAt: order.createdAt, total: order.total, customer: order.customer.name });
    await store.setJSON('_index', index);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
    
