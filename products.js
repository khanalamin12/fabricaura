
//   1001–1999  = Drop-Shoulder
//   2001–2999  =  Pants  (Baggy / Formal / Cargo / …)
//   3001–3999 =  T-Shirts
//   4001–4999 =  Shirts
//   5001–5999  =   Watches

// ══════════════════════════════════════════════════════════════════

const SUBCATEGORIES = {
  pants: [
    { id: 'baggy-pants',  label: 'Baggy Pants',  icon: 'fa-person'       },
    { id: 'formal-pants', label: 'Formal Pants', icon: 'fa-user-tie'     },
    { id: 'cargo-pants',  label: 'Cargo Pants',  icon: 'fa-bag-shopping' },

    // { id: 'slim-pants', label: 'Slim Pants', icon: 'fa-ruler-vertical' },
  ],
  shirt: [
    { id: 'polo-shirt',    label: 'Polo Shirt',    icon: 'fa-shirt' },
    { id: 'short-sleeved', label: 'Short Sleeved', icon: 'fa-shirt' },
    { id: 'long-sleeved',  label: 'Long Sleeved',  icon: 'fa-shirt' },

    // { id: 'casual-shirt', label: 'Casual Shirt', icon: 'fa-shirt' },
  ],
  watch: [
    { id: 'smartwatch',   label: 'Smartwatch',   icon: 'fa-mobile-screen' },
    { id: 'analog-watch', label: 'Analog Watch', icon: 'fa-clock'         },

    // { id: 'digital-watch', label: 'Digital Watch', icon: 'fa-calculator' },
  ],
};

const PRODUCTS = [

  // ── DROP-SHOULDER  (1001–1999) ─────────────────────────────────
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
    name: 'Essential Drop-Shoulder ',
    fabric: 'Fleece Cotton',
    price: 500, old: 600,
    section: 'drop-shoulder',
    badge: 'sale', stars: 4,
    icon: 'fa-shirt', label: 'Drop-Shoulder',
    photos: [
      "1NfFWpmywDWaEd8atTwzmNE1SEX2YE_Fy",
"1BhUf9QJ0SP-96rntr4DPvDrrVwFfPUyv",
"1QCdNyVl89YuRMxDODL0dbOXXLFKq2mXa",
"1QT4Lh4J3ND95Ggi2X67X03-mHXtrZo1Y",
"10Z3Gsn7G3tU-kciyEBos4LxChjwbkj7V",
"1pkLYbMRCrKPKk4yDXCazturHWjGxNCUv",
"1_MaFhDthCYXugdhJDWT0sr7LdiuszWce",
"1bccJva_K2VBwwww_i33zrag0HapFe99x",
"1x-1OqElpF3XRlMr-Dh32pLPv3uBYkEil",
"1hKkTqjeFpKPaV4AJ1pR_CUGetP3nXFKl"
      
    ],
    
    desc: 'Cozy fleece hoodie with drop-shoulder cut. Front graphic print. Kangaroo pocket. Ideal for cool evenings and casual outings.'
  },

  // ── PANTS  (2001–2999) ───────────────────────────────────────────
  // Every pants product needs BOTH:
  //   section: 'pants'              (keeps it under the main "Pants" tab)
  //   subcategory: '<id from SUBCATEGORIES.pants above>'
  {
    id: 2001,
    code: 'BP-001',
    name: 'Baggy Pant',
    fabric: 'Cotton Twill',
    price: 999, old: 1299,
    section: 'pants',
    subcategory: 'baggy-pants',
    badge: 'new', stars: 5,
    icon: 'fa-bag-shopping', label: 'Cargo Pants',
    photos: [
      '1uT_1Z7H3gRmY8CgIF9QV8LGOeZDMMmNX',
'1QsfOXGGkZQZYAT0XGMtHJmk16JtYJqnB',
'1dAe44dYdnlNEjIjh9DyloN9iFHJzIJhE',
'1s_C8EBonHVfrqt8INozPXm_VrqKiPo51'
    ],
    
    desc: 'Wide-leg cargo pants with side pockets. Relaxed fit waist, elasticated at ankle. Available in black, khaki, and olive green.'
  },
  
  
  {
    id: 2004,
    code: 'FP-001',
    name: 'Slim Fit Formal Trouser',
    fabric: 'Poly-Viscose Blend',
    price: 899, old: 1099,
    section: 'pants',
    subcategory: 'formal-pants',
    badge: 'new', stars: 5,
    icon: 'fa-user-tie', label: 'Formal Pants',
    photos: [
    '1oGBhogKH5dDb2S3Fys-SD7FVO8OZsnh9',
'1HeO3EdVsSANmM8iaGHbznMjhWUzOFH6K',
'1qJhg32pP6rO27txHKvcEqaEsesMG0_Ry',
'18XKi2GxZq4a8WF941nN4mePEU4HZL8Uo',
'1Rz1tuZOJrMPHoUOHV9qUEPxsHwDwD6zt'
    ],
    
    desc: 'Slim-fit formal trouser with a sharp crease and tailored finish. Wrinkle-resistant fabric — perfect for office wear and formal occasions.'

  },

  // ── T-SHIRTS  (3001–3999) ──────────────────────────────────────
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
    desc: 'Everyday essential polo neck t-shirt. Soft, breathable 180GSM cotton. Available in 10+ colours. Regular fit.'
  },






  // ── SHIRTS  (4001–4999) ───────────────────────────────────────
  {
    id: 4001,
    code: 'SH-001',
    name: 'POLO Shirt',
    fabric: 'Oxford Cotton',
    price: 749, old: 900,
    section: 'shirt',
    subcategory: 'polo-shirt',
    badge: 'new', stars: 5,
    icon: 'fa-shirt', label: 'Polo Shirt',
    photos: [
    '1hTnQdfUopfCafxHPpIG1RBkMRkuV2hpU'
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
'1PlJq2ZEaNcn2brqhoLV4iXBYWWHg8mTn'
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
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
    noColour:true,
    desc: 'casual  shirt for daily wear. Soft cotton'
  },
  
  
  // ── WATCHES  (5001–5999) ───────────────────────────────────────
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
    colors: [{name:'Silver',hex:'#C0C0C0'},{name:'Gold',hex:'#C9A84C'},{name:'Black',hex:'#1A1A1A'}],
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
    colors: [{name:'Silver/White',hex:'#C0C0C0'},{name:'Black/Black',hex:'#1A1A1A'},{name:'Gold/White',hex:'#C9A84C'}],
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
    colors: [{name:'Black',hex:'#1A1A1A'},{name:'Red',hex:'#C0152A'},{name:'Blue',hex:'#1B2A4A'}],
    desc: 'Bold sport chronograph with luminous hands. Durable rubber strap, scratch-resistant mineral glass. Water resistant 50m.'
  },

];
