const CATEGORY_MAP = {
  'jacket': { file: 'jacket.js', arrayVar: 'JACKET_PRODUCTS', min: 7001, max: 7999, codePrefix: 'JK', label: 'jacket' },
  'drop-shoulder': { file: 'products.js', arrayVar: 'DROP_SHOULDER_PRODUCTS', min: 1001, max: 1999, codePrefix: 'DS', label: 'Drop-Shoulder Tee' },
  'pants':         { file: 'pants.js',    arrayVar: 'PANTS_PRODUCTS',         min: 2001, max: 2999, codePrefix: 'PT', label: 'Pants' },
  'shirt':         { file: 'shirts.js',   arrayVar: 'SHIRTS_PRODUCTS',        min: 4001, max: 4999, codePrefix: 'SH', label: 'Shirt' },
  'tshirt':        { file: 'tshirts.js',  arrayVar: 'TSHIRTS_PRODUCTS',       min: 3001, max: 3999, codePrefix: 'TS', label: 'T-Shirt' },
  'watch':         { file: 'watches.js',  arrayVar: 'WATCHES_PRODUCTS',       min: 5001, max: 5999, codePrefix: 'WT', label: 'Watch' },
};

module.exports = { CATEGORY_MAP };
