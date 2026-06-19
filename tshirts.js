// ══════════════════════════════════════════════════════════════════
// T-SHIRTS  (ids 3001–3999)
//
// To add a new t-shirt: copy one block below, paste it inside the
// array, give it a new unused id, and fill in the fields.
//
// Required fields:
//   id        unique number, 3001–3999
//   code      short product code, e.g. 'TS-010'
//   name      display name
//   fabric    fabric/material description
//   price     current price
//   old       old/strikethrough price (or null if none)
//   section   always 'tshirt' for this file
//   badge     'new' | 'sale' | null
//   stars     rating, 1–5
//   icon      FontAwesome icon class
//   label     text shown under the icon
//   photos    array of Google Drive file IDs
//   noColour  set to true if this product has no colour picker
//   desc      short product description
// ══════════════════════════════════════════════════════════════════

const TSHIRTS_PRODUCTS = [
  {
    id: 3001,
    code: 'TS-001',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1G1MWdR1vs81CTW-7DukrEjExxSP4SUmO',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3002,
    code: 'TS-002',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1VSZm-1PWGaN1HSQjVoQSXEeqjp436CRb',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3003,
    code: 'TS-003',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '18uGrQjmjzz4uX4FFaybGuw8WPM1dr0A4',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3004,
    code: 'TS-004',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1zmgUDu8IJMMZDry2C16EGiZW1D8FkBWw',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3005,
    code: 'TS-005',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1xomHvFduw7ZKYPdtltJiUnbbLYtqgIbX',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3006,
    code: 'TS-006',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1VsGpHm44755rJSQlCPN6xYc5t2pT9fnl',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3007,
    code: 'TS-007',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1jNEOtzZJ9swfN34rqW5ivMyurBLBIbf2',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3008,
    code: 'TS-008',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1xpwWnHNvQzkjRnj80hTGeE8Wkg6ZfKwL',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  {
    id: 3009,
    code: 'TS-009',
    name: 'Polo T-shirt',
    fabric: '100% Cotton 180GSM',
    price: 399, old: 499,
    section: 'tshirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'T-Shirt',
    photos: [
      '1dBDPUDTQ_VTO4QF-vrELL4NNvdjPFg05',
    ],
    noColour: true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },

  // ── Add new t-shirts below this line ──

];
