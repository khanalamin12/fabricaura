const CATEGORY_MAP = {
  'drop-shoulder': { file: 'products.js', arrayVar: 'DROP_SHOULDER_PRODUCTS', min: 1001, max: 1999, codePrefix: 'DS' },
  'pants':         { file: 'pants.js',    arrayVar: 'PANTS_PRODUCTS',         min: 2001, max: 2999, codePrefix: 'PT' },
  'shirt':         { file: 'shirts.js',   arrayVar: 'SHIRTS_PRODUCTS',        min: 4001, max: 4999, codePrefix: 'SH' },
  'tshirt':        { file: 'tshirts.js',  arrayVar: 'TSHIRTS_PRODUCTS',       min: 3001, max: 3999, codePrefix: 'TS' },
  'watch':         { file: 'watches.js',  arrayVar: 'WATCHES_PRODUCTS',       min: 5001, max: 5999, codePrefix: 'WT' },
};

module.exports = { CATEGORY_MAP };
