// ══════════════════════════════════════════════════════════════════
// SHIRTS  (ids 4001–4999)
//
// To add a new shirt: copy one block below, paste it inside the
// array, give it a new unused id, and fill in the fields.
//
// Required fields:
//   id           unique number, 4001–4999
//   code         short product code, e.g. 'SH-026'
//   name         display name
//   fabric       fabric/material description
//   price        current price
//   old          old/strikethrough price (or null if none)
//   section      always 'shirt' for this file
//   subcategory  one of: 'polo-shirt' | 'short-sleeved' | 'long-sleeved'
//                (see SUBCATEGORIES.shirt in products.js — add a new
//                 entry there first if you need a brand-new subcategory)
//   badge        'new' | 'sale' | null
//   stars        rating, 1–5
//   icon         FontAwesome icon class
//   label        text shown under the icon
//   photos       array of Google Drive file IDs
//   noColour     set to true if this product has no colour picker
//   desc         short product description
// ══════════════════════════════════════════════════════════════════

const SHIRTS_PRODUCTS = [
  {
    deletedAt: '2026-06-22T08:27:07.006Z',
    id: 4001,
    code: 'SH-001',
    name: 'POLO Shirt',
    fabric: 'Oxford Cotton',
    price: 200, old: 900,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: '',
    photos: [
      '1hTnQdfUopfCafxHPpIG1RBkMRkuV2hpU',
    ],
    desc: 'Classic formal oxford shirt with button-down collar. Wrinkle-resistant, machine washable. Available in white, light blue, and grey.'
  },


  {
    id: 4002,
    code: 'SH-002',
    name: 'POLO Shirt',
    fabric: '100% Cotton',
    price: 599, old: 799,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: 'New', stars: 4,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1PlJq2ZEaNcn2brqhoLV4iXBYWWHg8mTn',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4003,
    code: 'SH-003',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1qxINCRTrdimu5ccdMJn_IXdlqyrQpIKW',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4004,
    code: 'SH-004',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '11H1ct_6u7BZ718SZzF_Z3chqvMvYmTtj',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4005,
    code: 'SH-005',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1eBZSSN1g_X7508Vx0EbD2VCPczRyXsg_',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4006,
    code: 'SH-006',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1Kj5XxK64y7_mXFksOJk6L3oGaQKM3RjE',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4007,
    code: 'SH-007',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1S71DeWkismmJbohdaBhV7jgyO3pQ_gMt',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4008,
    code: 'SH-008',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1Nr7ZrWmWIpbljTt4PiJGtRfKGf-Ir1xn',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4009,
    code: 'SH-009',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '16AOkvFriJYyV7eiwtSCibV0i4tMlIhmm',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4010,
    code: 'SH-010',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1EAbEMAzxkQpGfwCE4_Psm3WoQYpEOtLv',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4011,
    code: 'SH-011',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1F4wsoGeKFX5CrJpYqalt49_YUoWjm0It',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4012,
    code: 'SH-012',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1bPHDgmegXSQFZ7CUGdf-2HvTSEutYfkC',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4013,
    code: 'SH-013',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1fR2EwL2tbys8cuSRQPrL_vK0QhSMyuiP',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4014,
    code: 'SH-014',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1F_kMHWMUU9O8TvlTatyfE09p0wWBas28',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4015,
    code: 'SH-015',
    name: 'POLO Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1Aifo8uIwMKtRVIbnPIatOdwredEAd7aG',
    ],
    desc: 'casual polo shirt for daily wear. Soft cotton'
  },

  {
    id: 4016,
    code: 'SH-016',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1fc94rtN7G4pAzcm0Tfzdjk8kD3DXiQPp',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4017,
    code: 'SH-017',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1c0z5Li8OrbAtq4AdjMp64U-nFYvJLs2J',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4018,
    code: 'SH-018',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '17eNAZzmFvCClmh3yRH8RUYgiTbUPl5VA',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4019,
    code: 'SH-019',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1rHqZVov5v0bp7JKENelNkV79HSkRQd-S',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4020,
    code: 'SH-020',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '19ptbyq2CQRKO0rzqCmPDKs38ahqxNqmf',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4021,
    code: 'SH-021',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '11aSBuzFZdOYo3uObwHZvXRXL1WZ025_D',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4022,
    code: 'SH-022',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1dZDaTMhJDom_U41PgcYbZ6pEOpEtqJCp',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4023,
    code: 'SH-023',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1bBcpHVC-tIiA4DcQUnGZAQ0ePKhlPqmE',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4024,
    code: 'SH-024',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1I7ARpS1FrIpG1TV281f7UvaoLKp90cVA',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },

  {
    id: 4025,
    code: 'SH-025',
    name: 'Short sleeved Shirt',
    fabric: 'Pure Linen',
    price: 849, old: 1099,
    section: 'shirt',
    subcategory: 'short-sleeved',
    badge: null, stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
      '1SPDxWvpFOrbsXdlegUmjRiBkrYi9taFn',
    ],
    noColour: true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },
];
