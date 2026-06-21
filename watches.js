// ══════════════════════════════════════════════════════════════════
// WATCHES  (ids 5001–5999)
//
// To add a new watch: copy one block below, paste it inside the
// array, give it a new unused id, and fill in the fields.
//
// Required fields:
//   id           unique number, 5001–5999
//   code         short product code, e.g. 'WA-004'
//   name         display name
//   fabric       case/strap material description
//   price        current price
//   old          old/strikethrough price (or null if none)
//   section      always 'watch' for this file
//   subcategory  one of: 'smartwatch' | 'analog-watch'
//                (see SUBCATEGORIES.watch in products.js — add a new
//                 entry there first if you need a brand-new subcategory)
//   badge        'new' | 'sale' | null
//   stars        rating, 1–5
//   icon         FontAwesome icon class
//   label        text shown under the icon
//   photos       array of Google Drive file IDs
//   colors       array of { name, hex } colour options
//   desc         short product description
// ══════════════════════════════════════════════════════════════════

const WATCHES_PRODUCTS = [
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Gold', hex: '#C9A84C' },
      { name: 'Black', hex: '#1A1A1A' },
];
