// Netlify Function: list-orders
// Password-protected. Returns all saved orders for the admin dashboard
// (order list + analytics). Also supports updating an order's status.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const store = getStore({ name: 'orders', consistency: 'strong' });

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
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
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
      return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
    }

    // ── List all orders (default action) ──
    let index = [];
    try {
      index = (await store.get('_index', { type: 'json' })) || [];
    } catch (e) {
      index = [];
    }

    // Fetch full order objects (index only has summary fields)
    const orders = [];
    for (const entry of index) {
      try {
        const full = await store.get(entry.id, { type: 'json' });
        if (full) orders.push(full);
      } catch (e) {
        // skip missing/corrupt entries
      }
    }

    // Newest first
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { statusCode: 200, headers, body: JSON.stringify({ success: true, orders }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
      
