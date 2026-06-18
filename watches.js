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
  {
    id: 5001,
    code: 'WA-001',
    name: 'Classic Analog Watch',
    fabric: 'Stainless Steel Case',
    price: 1499, old: 1999,
    section: 'watch',
    subcategory: 'analog-watch',
    badge: 'new', stars: 5,
    icon: 'fa-clock', label: 'Analog Watch',
    photos: [
      // '1YourFileIDHere',
    ],
    colors: [
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Gold', hex: '#C9A84C' },
      { name: 'Black', hex: '#1A1A1A' },
    ],
    desc: 'Sleek analog watch with stainless steel case and genuine leather strap. Japanese quartz movement. Water resistant 30m.'
  },

  {
    id: 5002,
    code: 'WA-002',
    name: 'Minimalist Mesh Watch',
    fabric: 'Steel Mesh Strap',
    price: 1299, old: null,
    section: 'watch',
    subcategory: 'analog-watch',
    badge: 'new', stars: 5,
    icon: 'fa-clock', label: 'Analog Watch',
    photos: [
      // '1YourFileIDHere',
    ],
    colors: [
      { name: 'Silver/White', hex: '#C0C0C0' },
      { name: 'Black/Black', hex: '#1A1A1A' },
      { name: 'Gold/White', hex: '#C9A84C' },
    ],
    desc: 'Ultra-thin minimalist watch with stainless steel mesh band. Clean white or black dial. Perfect for office and casual wear.'
  },

  {
    id: 5003,
    code: 'WA-003',
    name: 'Sport Chronograph Watch',
    fabric: 'Rubber Strap',
    price: 1799, old: 2299,
    section: 'watch',
    subcategory: 'analog-watch',
    badge: 'sale', stars: 4,
    icon: 'fa-clock', label: 'Analog Watch',
    photos: [
      // '1YourFileIDHere',
    ],
    colors: [
      { name: 'Black', hex: '#1A1A1A' },
      { name: 'Red', hex: '#C0152A' },
      { name: 'Blue', hex: '#1B2A4A' },
    ],
    desc: 'Bold sport chronograph with luminous hands. Durable rubber strap, scratch-resistant mineral glass. Water resistant 50m.'
  },

  // ── Add new watches below this line ──

];
