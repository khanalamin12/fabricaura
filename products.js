

const SUBCATEGORIES = {
  pants: [
    { id: 'baggy-pants',  label: 'Baggy Pants',  icon: 'fa-person'       },
    { id: 'formal-pants', label: 'Formal Pants', icon: 'fa-user-tie'     },
    { id: 'cargo-pants',  label: 'Cargo Pants',  icon: 'fa-bag-shopping' },


  ],
  shirt: [
    { id: 'polo-shirt',    label: 'Polo Shirt',    icon: 'fa-shirt' },
    { id: 'short-sleeved', label: 'Short Sleeved', icon: 'fa-shirt' },
    { id: 'long-sleeved',  label: 'Long Sleeved',  icon: 'fa-shirt' },


  ],
  watch: [
    { id: 'smartwatch',   label: 'Smartwatch',   icon: 'fa-mobile-screen' },
    { id: 'analog-watch', label: 'Analog Watch', icon: 'fa-clock'         },


  ],
};

// ── DROP-SHOULDER  (1001–1999) ─────────────────────────────────
const DROP_SHOULDER_PRODUCTS = [
  {
    id: 1001,
    code: 'DS-001',
    name: 'logoless drop-shoulder',
    fabric: 'Heavy Cotton 240GSM',
    price: 490, old: 600,
    section: 'drop-shoulder',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'Drop-Shoulder',
    photos: [
      '1vdvYUHANPx3PjC8g8Al__XUAvue51Xz4',
      '1zXbVWwwsLteiAzctnnkPbishLSLVIWbh',
      '1fzQKCKKF4Qsl0Z_qk9_zFXb_FV7dG-dE',
      '12KNoofPtjHC5Yph6tcKup8CgUhwFLV_r',
      '1aDJn5X-nGetpN6qEXTp6IimcmU9QANYa',
      '1ujJsx7eRis22FewaPpfPgPjentuLa-K_',
      '155hari9jyOjzT7NTUdvJqu7nfPGXX0tP',
      '1cKUANiHcOcgEi0FzJB4-nbf4YSE4G9xU',
      '1eJMYUW3858sJo1Pc-hOEOP6pZTu8_ZmF',
    ],
    desc: 'Classic no logo drop-shoulder tee. Thick 240GSM cotton. Available in every colour'
  },
  {
    id: 1002,
    code: 'DS-002',
    name: 'ESSENTIAL Drop-Shoulder',
    fabric: 'Acid Wash Cotton',
    price: 550, old: 700,
    section: 'drop-shoulder',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'Drop-Shoulder',
    photos: [
      '1hOas51reeddjzGsNVIctkSuPoiqroEiN',
      '1gYIyi9tJ4oHC67VJke5rRvA33UrQ79nu',
      '1x7RLQYSBBZqzpRF28cl0k9LjvhdFdNDW',
      '1rjYcGAAYCpknWMTf4VVWBAiIgp2Iguqc',
      '1ARG0ao4P9xSmKRAHmuAP89qq-fhNNQGA',
      '1jo3DhN83hHj2HpIk4CgiW9-hUrdvRjlG',
    ],
    desc: 'essential drop shoulder with a vintage look. Heavy fabric, relaxed chest fit. Great layering piece.'
  },
  {
    id: 1003,
    code: 'DS-003',
    name: 'Essential Drop-Shoulder',
    fabric: 'Fleece Cotton',
    price: 500, old: 600,
    section: 'drop-shoulder',
    badge: 'sale', stars: 4,
    icon: 'fa-shirt', label: 'Drop-Shoulder',
    photos: [
      '1NfFWpmywDWaEd8atTwzmNE1SEX2YE_Fy',
      '1BhUf9QJ0SP-96rntr4DPvDrrVwFfPUyv',
      '1QCdNyVl89YuRMxDODL0dbOXXLFKq2mXa',
      '1QT4Lh4J3ND95Ggi2X67X03-mHXtrZo1Y',
      '10Z3Gsn7G3tU-kciyEBos4LxChjwbkj7V',
      '1pkLYbMRCrKPKk4yDXCazturHWjGxNCUv',
      '1_MaFhDthCYXugdhJDWT0sr7LdiuszWce',
      '1bccJva_K2VBwwww_i33zrag0HapFe99x',
      '1x-1OqElpF3XRlMr-Dh32pLPv3uBYkEil',
      '1hKkTqjeFpKPaV4AJ1pR_CUGetP3nXFKl',
    ],
    desc: 'Cozy fleece hoodie with drop-shoulder cut. Front graphic print. Kangaroo pocket. Ideal for cool evenings and casual outings.'
  },

  // ── Add new drop-shoulder products below this line ──

  {
    id: 1004,
    code: 'DS-004',
    name: 'essential drop shoulder',
    fabric: 'kora',
    price: 500, old: 600,
    section: 'drop-shoulder',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: '',
    photos: [
      '1EaECefsVkLuwH7P5eoO_ybhVPTuqCKwt',
    ],
    noColour: true,
    desc: 'good product.'
  },

];















// ── Dont touch  ──────────
const PRODUCTS = [
  ...DROP_SHOULDER_PRODUCTS,
  ...PANTS_PRODUCTS,
  ...SHIRTS_PRODUCTS,
  ...TSHIRTS_PRODUCTS,
  ...WATCHES_PRODUCTS,
];
