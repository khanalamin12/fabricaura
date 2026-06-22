// Netlify Function: save-order (public — no password needed)
const { getStore } = require('@netlify/blobs');

function getOrderStore() {
  const opts = { name: 'orders', consistency: 'strong' };
  if (process.env.NETLIFY_BLOBS_CONTEXT) return getStore(opts);
  if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
    return getStore({ ...opts, siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN });
  }
  return getStore(opts);
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No items in order' }) };
    }
    if (!body.customer || !body.customer.name || !body.customer.phone) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Customer name and phone are required' }) };
    }

    const store = getOrderStore();

    const now = new Date();
    const id = 'ORD-' + now.getTime().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    const order = {
      id,
      createdAt: now.toISOString(),
      channel: body.channel || 'unknown',
      status: 'new',
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
