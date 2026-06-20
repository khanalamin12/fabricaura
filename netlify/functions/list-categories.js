// Netlify Function: list-categories
// Returns every category in CATEGORY_MAP (key + label), so the admin
// panel's dropdowns can be built dynamically and automatically include
// any new category created via add-category.js.

const { CATEGORY_MAP } = require('./_shared');

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const body = JSON.parse(event.body || '{}');
    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Wrong password' }) };
    }

    const categories = Object.entries(CATEGORY_MAP).map(([key, cfg]) => ({
      key,
      label: cfg.label || key,
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ categories }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
