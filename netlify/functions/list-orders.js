// Netlify Function: list-orders
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

    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const store = getOrderStore();

    // ── Update order status ──
    if (body.action === 'updateStatus') {
      if (!body.id || !body.status) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'id and status are required' }) };
      }
      const order = await store.get(body.id, { type: 'json' });
      if (!order) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };
      }
      order.status = body.status;
      await store.setJSON(body.id, order);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Status updated' }) };
    }

    // ── Delete order ──
    if (body.action === 'delete') {
      if (!body.id) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'id is required' }) };
      }
      await store.delete(body.id);
      let index = [];
      try { index = (await store.get('_index', { type: 'json' })) || []; } catch (e) { index = []; }
      index = index.filter((it) => it.id !== body.id);
      await store.setJSON('_index', index);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: 'Order deleted' }) };
    }

    // ── List all orders ──
    let index = [];
    try {
      index = (await store.get('_index', { type: 'json' })) || [];
    } catch (e) {
      index = [];
    }

    const orders = [];
    for (const entry of index) {
      try {
        const full = await store.get(entry.id, { type: 'json' });
        if (full) orders.push(full);
      } catch (e) {}
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, orders }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
