
// app.js — Fabric Aura Site Logic

// ── DARK MODE ────────────────────────────────────────────────
(function initDarkMode() {
  const saved = localStorage.getItem('fabricaura-darkmode');
  // Apply on load — before paint to avoid flash
  if (saved === 'on' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  }
})();

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('fabricaura-darkmode', isDark ? 'on' : 'off');
  const icon = document.getElementById('darkToggleIcon');
  if (icon) {
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
      icon.style.transform = '';
    }, 200);
  }
}

// Sync icon on page load after DOM ready
document.addEventListener('DOMContentLoaded', function() {
  const icon = document.getElementById('darkToggleIcon');
  if (icon && document.body.classList.contains('dark-mode')) {
    icon.className = 'fas fa-sun';
  }
  // Remove pre-paint helper class from html element
  document.documentElement.classList.remove('dark-mode-pre');

  // Restore badges from persisted cart & wishlist
  updateCartBadge();
  updateWishBadge();

  // Render products after DOM is ready
  renderSubcategoryTabs(activeCategory);
  renderSections();
  const initBanner = document.getElementById('brandBanner');
  if (initBanner) initBanner.style.display = 'block';

  // If this page was opened via a shared product link (?product=ID),
  // jump straight to that product's detail view.
  openProductFromUrl();
});


// CONFIG — my contact details ────────────────────────────────
const CONFIG = {
  email:    'fabricaura69@gmail.com',
  whatsapp: '8801822188287',
  fbPage:   'fabricaura69',
};

// ── STATE ──────────────────────────────────────
let wishlist       = [];
let cart           = [];
let currentProduct = null;
let searchOpen     = false;
let toastTimer;
const slideIdx     = {};

// ── PERSISTENCE (survive page reloads) ─────────
const CART_KEY     = 'fabricaura-cart';
const WISHLIST_KEY = 'fabricaura-wishlist';

function saveCart()     { try { localStorage.setItem(CART_KEY,     JSON.stringify(cart));     } catch(e){} }
function saveWishlist() { try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); } catch(e){} }

function loadPersistedData() {
  try { const c = localStorage.getItem(CART_KEY);     if (c) cart     = JSON.parse(c); } catch(e) { cart = []; }
  try { const w = localStorage.getItem(WISHLIST_KEY); if (w) wishlist = JSON.parse(w); } catch(e) { wishlist = []; }
}
loadPersistedData();

// ════════════════════════════════════════
function driveUrl(fileId, width) {
  const w   = width || 600;
  const src = encodeURIComponent(`https://lh3.googleusercontent.com/d/${fileId}`);
  return `https://wsrv.nl/?url=${src}&w=${w}&output=webp&q=80`;
}

function getMainPhoto(p) {
  return (p.photos && p.photos.length > 0) ? driveUrl(p.photos[0], 300) : null;
}

// ═════════════
// CAROUSEL
// ═════════════
function noImgHtml(p) {
  return `<div class="no-img"><i class="fas ${p.icon}"></i><span>${p.label}</span></div>`;
}

function carouselHtml(p, prefix) {
  const uid  = prefix + p.id;
  const imgW = prefix === 'det' ? 800 : 400;

  if (!p.photos || p.photos.length === 0) {
    return `<div class="carousel">
      <div class="carousel-slides">
        <div class="carousel-slide">${noImgHtml(p)}</div>
      </div>
    </div>`;
  }

  const slides = p.photos.map((fid, i) =>
    `<div class="carousel-slide" data-icon="${p.icon}" data-label="${p.label}">
      <img src="${driveUrl(fid, imgW)}" alt="${p.name} ${i+1}" loading="lazy" decoding="async" onerror="imgFallback(this)"/>
    </div>`
  ).join('');

  const dots = p.photos.length > 1
    ? `<div class="carousel-dots" id="dots-${uid}">
        ${p.photos.map((_,i) => `<button class="carousel-dot ${i===0?'active':''}" onclick="goSlide('${uid}',${i})"></button>`).join('')}
       </div>`
    : '';

  const prevNext = p.photos.length > 1
    ? `<button class="carousel-btn prev" onclick="changeSlide('${uid}',-1)"><i class="fas fa-chevron-left"></i></button>
       <button class="carousel-btn next" onclick="changeSlide('${uid}',1)"><i class="fas fa-chevron-right"></i></button>`
    : '';

  return `<div class="carousel" id="car-${uid}">
    <div class="carousel-slides" id="slides-${uid}" style="transform:translateX(0%)">${slides}</div>
    ${prevNext}${dots}
  </div>`;
}

function imgFallback(img) {
  const slide = img.parentElement;
  const icon  = slide.dataset.icon  || 'fa-shirt';
  const label = slide.dataset.label || '';
  slide.innerHTML = `<div class="no-img"><i class="fas ${icon}"></i><span>${label}</span></div>`;
}

function changeSlide(uid, dir) {
  const car = document.getElementById('car-' + uid);
  if (!car) return;
  const total = car.querySelectorAll('.carousel-slide').length;
  if (!slideIdx[uid]) slideIdx[uid] = 0;
  slideIdx[uid] = (slideIdx[uid] + dir + total) % total;
  updateCarousel(uid);
}

function goSlide(uid, idx) {
  slideIdx[uid] = idx;
  updateCarousel(uid);
}

function updateCarousel(uid) {
  const i      = slideIdx[uid] || 0;
  const slides = document.getElementById('slides-' + uid);
  if (slides) slides.style.transform = `translateX(-${i * 100}%)`;
  const dots = document.getElementById('dots-' + uid);
  if (dots) dots.querySelectorAll('.carousel-dot').forEach((d, j) => d.classList.toggle('active', j === i));
}

// ══════════════════════════════════════════════════════════════════
// PRODUCT CARD & SECTION RENDERING
// ══════════════════════════════════════════════════════════
let activeCategory = 'all';
let activeSubcategory = 'all'; // sub-filter inside the "Pants" category

const CAT_META = {
  'all':          { eyebrow: 'Full Collection',    title: 'All Items' },
  'drop-shoulder':{ eyebrow: 'Oversized Fits',     title: 'Drop Shoulders' },
  'pants':        { eyebrow: 'Baggy, Formal & Cargo', title: 'Pants' },
  'tshirt':       { eyebrow: 'Everyday Essentials',title: 'T-Shirts' },
  'shirt':        { eyebrow: 'Smart Casual',        title: 'Shirts' },
  'watch':        { eyebrow: 'Timepieces',          title: 'Watches' },
};

function productCard(p) {
  const badge   = p.badge === 'new'  ? `<span class="product-badge-new">New</span>`
                : p.badge === 'sale' ? `<span class="product-badge-sale">Sale</span>` : '';
  const oldP    = p.old ? `<span class="price-old">৳${p.old.toLocaleString()}</span>` : '';
  const stars   = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
  const inWish  = wishlist.includes(p.id);
  const cartItem = cart.find(c => c.id === p.id);
  const inCart   = !!cartItem;
  const cartQty  = cartItem ? cartItem.qty : 0;

  // Cart badge shown on image corner when item is in cart
  const cartBadge = inCart
    ? `<div class="card-cart-badge" onclick="event.stopPropagation()">
        <button class="card-cqty-btn" ontouchstart="event.stopPropagation()" onclick="event.stopPropagation();cardCartQty(${p.id},-1)"><i class="fas fa-minus"></i></button>
        <span>${cartQty}</span>
        <button class="card-cqty-btn" ontouchstart="event.stopPropagation()" onclick="event.stopPropagation();cardCartQty(${p.id},1)"><i class="fas fa-plus"></i></button>
       </div>`
    : '';

  // Add to Cart button changes to "In Cart ✓" style when already added
  const cartBtn = inCart
    ? `<button class="add-cart-btn in-cart"
          ontouchstart="event.stopPropagation()"
          onclick="event.stopPropagation();addToCart(${p.id},event)">
          <i class="fas fa-cart-shopping"></i> In Cart (${cartQty})
        </button>`
    : `<button class="add-cart-btn"
          ontouchstart="event.stopPropagation()"
          onclick="event.stopPropagation();addToCart(${p.id},event)">
          <i class="fas fa-cart-plus"></i> Add to Cart
        </button>`;

  return `
    <div class="product-card" id="pcard-${p.id}" data-section="${p.section}" onclick="openDetail(${p.id})">
      <div class="product-img">
        ${carouselHtml(p, 'card')}
        ${badge}
        ${cartBadge}
        <button class="wishlist-btn ${inWish ? 'active' : ''}" onclick="toggleWish(event,${p.id})">
          <i class="${inWish ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="product-code"><i class="fas fa-barcode"></i> ${p.code}</div>
        <h3>${p.name}</h3>
        <div class="fabric-type"><i class="fas fa-tag" style="font-size:.65rem;color:var(--gold)"></i> ${p.fabric}</div>
        <div class="stars">${stars}</div>
        <div class="price-row"><span class="price-current">৳${p.price.toLocaleString()}</span>${oldP}</div>
        <button class="buy-btn"
          ontouchstart="event.stopPropagation()"
          onclick="event.stopPropagation();openOrderForm(${p.id})">
          <i class="fas fa-bag-shopping"></i> Buy Now
        </button>
        ${cartBtn}
      </div>
    </div>`;
}

// ══════════════════════════════════════════════════════════════════
// PRODUCT CARD ⋮ MENU — Share / Download Images (dynamic, works for any product)
// ══════════════════════════════════════════════════════════════════
let cardMenuProductId = null; // which product the open popover currently refers to

function closeCardMenu() {
  const pop = document.getElementById('cardMenuPopover');
  if (pop) pop.classList.remove('open');
  cardMenuProductId = null;
}

function toggleCardMenu(event, id) {
  event.stopPropagation();
  const pop = document.getElementById('cardMenuPopover');
  if (!pop) return;

  // Clicking the same card's dots again just closes it
  if (cardMenuProductId === id && pop.classList.contains('open')) {
    closeCardMenu();
    return;
  }

  cardMenuProductId = id;

  // Position the popover next to the button that was clicked (portal-style,
  // appended at body level so it's never clipped by the card's overflow:hidden)
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  const popW = 190; // must match CSS width
  const margin = 8;

  let left = rect.right - popW; // align right edge of popover with button
  if (left < margin) left = margin;
  if (left + popW > window.innerWidth - margin) left = window.innerWidth - popW - margin;

  let top = rect.bottom + 6;
  pop.style.left = left + 'px';
  pop.style.top  = top + 'px';
  pop.classList.add('open');

  // If it would overflow the bottom of the viewport, flip it above the button instead
  requestAnimationFrame(() => {
    const popRect = pop.getBoundingClientRect();
    if (popRect.bottom > window.innerHeight - margin) {
      pop.style.top = (rect.top - popRect.height - 6) + 'px';
    }
  });
}

// Close the menu on any outside click/tap, or on scroll/resize
document.addEventListener('click', (e) => {
  const pop = document.getElementById('cardMenuPopover');
  if (pop && pop.classList.contains('open') && !pop.contains(e.target)) closeCardMenu();
});
window.addEventListener('scroll', closeCardMenu, true);
window.addEventListener('resize', closeCardMenu);

function shareProductFromMenu() {
  const id = cardMenuProductId;
  closeCardMenu();
  if (id != null) shareProduct(id);
}

function downloadProductImagesFromMenu() {
  const id = cardMenuProductId;
  closeCardMenu();
  if (id != null) downloadProductImages(id);
}

// ══════════════════════════════════════════════════════════════════
// UNIQUE PER-PRODUCT LINKS — deep-link straight to a product's detail view
// ══════════════════════════════════════════════════════════════════
// Builds a shareable URL like https://yoursite.com/?product=1001
// The id is all that's needed, so this works for every product — including
// any new product added later through the admin panel — with zero extra setup.
function getProductShareUrl(id) {
  return `${window.location.origin}${window.location.pathname}?product=${id}`;
}

// Checks the current URL for ?product=ID on page load. If present and the id
// matches a real product, opens that product's detail drawer automatically —
// so anyone opening a shared link lands straight on the product, no searching.
function openProductFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('product');
  if (!idParam) return;

  const id = parseInt(idParam, 10);
  const p  = PRODUCTS.find(x => x.id === id);

  if (!p) {
    showToast('<i class="fas fa-circle-info"></i> This product link is no longer available.');
    return;
  }

  // Make sure the right category tab/grid is active behind the drawer
  const match = document.querySelector(`.cat-tab[data-cat="${p.section}"]`);
  setCategory(p.section, match || null);

  // Slight delay so the drawer's open animation runs after initial page paint
  setTimeout(() => openDetail(p.id), 150);
}

// Share a product via the native share sheet (with image, when supported),
// falling back to copy-link on desktop browsers that lack Web Share.
async function shareProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const shareText = `${p.name} (${p.code}) — ৳${p.price.toLocaleString()} at Fabric Aura`;
  // Unique per-product link — works for every product automatically, including
  // ones added later through the admin panel, since it's just the product's id.
  const shareUrl  = getProductShareUrl(p.id);

  // Try to attach the first product photo as a shareable file (Web Share API L2)
  let filesToShare = null;
  try {
    if (p.photos && p.photos.length && navigator.canShare) {
      const res  = await fetch(driveUrl(p.photos[0], 1200));
      const blob = await res.blob();
      const file = new File([blob], `${p.code || 'product'}.jpg`, { type: blob.type || 'image/jpeg' });
      if (navigator.canShare({ files: [file] })) filesToShare = [file];
    }
  } catch (e) { /* image fetch/share not available — fall back to text+link share */ }

  if (navigator.share) {
    try {
      const payload = { title: p.name, text: shareText, url: shareUrl };
      if (filesToShare) payload.files = filesToShare;
      await navigator.share(payload);
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // user cancelled — do nothing
      // fall through to clipboard fallback below
    }
  }

  // Fallback: copy a shareable message to clipboard
  const fallbackText = `${shareText}\n${shareUrl}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fallbackText)
      .then(() => showToast('<i class="fas fa-circle-check" style="color:#4ade80"></i> Product link copied to clipboard!'))
      .catch(() => showToast('<i class="fas fa-circle-info"></i> ' + fallbackText));
  } else {
    showToast('<i class="fas fa-circle-info"></i> Sharing not supported on this browser.');
  }
}

// Download every photo of a product to the user's device, one file per image.
async function downloadProductImages(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  if (!p.photos || p.photos.length === 0) {
    showToast('<i class="fas fa-circle-info"></i> No images available for this product.');
    return;
  }

  showToast(`<i class="fas fa-download"></i> Downloading ${p.photos.length} image${p.photos.length > 1 ? 's' : ''}...`);

  for (let i = 0; i < p.photos.length; i++) {
    try {
      const url  = driveUrl(p.photos[i], 1600);
      const res  = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${p.code || p.name || 'product'}-${i + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 4000);
      // Small stagger so browsers don't block back-to-back downloads
      if (i < p.photos.length - 1) await new Promise(r => setTimeout(r, 350));
    } catch (e) {
      showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Couldn\'t download image ' + (i + 1) + '.');
    }
  }
}

function renderSections(searchOverride) {
  const grid = document.getElementById('mainProductGrid');
  if (!grid) return;

  let src = searchOverride || PRODUCTS;

  // Apply category filter (skip if search override is active)
  if (!searchOverride && activeCategory !== 'all') {
    src = src.filter(p => p.section === activeCategory);
    // Further narrow by sub-category, if this category has any and one is selected
    const subList = (typeof SUBCATEGORIES !== 'undefined' && SUBCATEGORIES[activeCategory]) || [];
    if (subList.length && activeSubcategory !== 'all') {
      src = src.filter(p => p.subcategory === activeSubcategory);
    }
  }

  // Empty state — shown whenever a category/sub-category has zero products
  const none = `<p class="no-products-msg" style="color:var(--gray);font-size:.85rem;grid-column:1/-1;padding:20px 0">
    <i class="fas fa-circle-info" style="color:var(--crimson);margin-right:6px"></i>Currently no product available.</p>`;

  grid.innerHTML = src.length ? src.map(productCard).join('') : none;

  // Update section heading
  const meta = CAT_META[activeCategory] || CAT_META['all'];
  const eyebrow = document.getElementById('catEyebrow');
  const titleEl = document.getElementById('catTitle');
  if (eyebrow) eyebrow.textContent = meta.eyebrow;
  if (titleEl) titleEl.textContent = searchOverride ? 'Search Results' : meta.title;
}

function setCategory(cat, btn) {
  activeCategory = cat;
  activeSubcategory = 'all'; // reset sub-filter whenever main category changes

  // Update tab active states
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    // Called from footer links — find and activate the matching tab
    const match = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
    if (match) match.classList.add('active');
  }

  // Build (or hide) the sub-category tab row for whichever category is now active
  renderSubcategoryTabs(cat);

  renderSections();

  const banner = document.getElementById('brandBanner');
  if (banner) banner.style.display = (cat === 'all') ? 'block' : 'none';

  // Smooth scroll to products section
  const sec = document.getElementById('products');
  if (sec) sec.scrollIntoView({ behavior: 'smooth' });
}

// ── SUB-CATEGORY TABS ─────────────────────────────────────────────
// Builds the sub-tab row for the given main category, sourced from
// SUBCATEGORIES (see products.js). Add a new entry there for any
// category and its tab shows up here automatically — no edits needed
// in this file. If the category has no sub-categories, the row hides.
function renderSubcategoryTabs(cat) {
  const wrap  = document.getElementById('subcatFilterWrap');
  const inner = document.getElementById('subcatFilter');
  if (!wrap || !inner) return;

  const list = (typeof SUBCATEGORIES !== 'undefined' && SUBCATEGORIES[cat]) || [];

  if (!list.length) {
    wrap.style.display = 'none';
    inner.innerHTML = '';
    return;
  }

  const catLabel = (CAT_META[cat] && CAT_META[cat].title) || '';

  const allTab = `
    <button class="subcat-tab active" data-subcat="all" onclick="setSubcategory('all',this)">
      <i class="fas fa-layer-group"></i><span>All ${catLabel}</span>
    </button>`;

  const tabs = list.map(sc => `
    <button class="subcat-tab" data-subcat="${sc.id}" onclick="setSubcategory('${sc.id}',this)">
      <i class="fas ${sc.icon}"></i><span>${sc.label}</span>
    </button>`).join('');

  inner.innerHTML = allTab + tabs;
  wrap.style.display = 'flex';
}

function setSubcategory(sub, btn) {
  activeSubcategory = sub;
  document.querySelectorAll('.subcat-tab').forEach(t => t.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    const match = document.querySelector(`.subcat-tab[data-subcat="${sub}"]`);
    if (match) match.classList.add('active');
  }
  renderSections();
}



// ══════════════════════════════════════════════════════════════════
// SEARCH OVERLAY — full-screen with history & preference chips
// ══════════════════════════════════════════════════════════════════

// ── Search History (persisted via localStorage) ───────────────────
const SEARCH_HIST_KEY = 'fabricaura-search-history';
const MAX_HIST        = 10;

function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(SEARCH_HIST_KEY)) || []; }
  catch(e) { return []; }
}
function saveSearchHistory(hist) {
  try { localStorage.setItem(SEARCH_HIST_KEY, JSON.stringify(hist)); }
  catch(e) {}
}
function addSearchTerm(term) {
  if (!term || term.length < 2) return;
  let hist = getSearchHistory();
  hist = hist.filter(h => h.toLowerCase() !== term.toLowerCase()); // remove duplicate
  hist.unshift(term);
  if (hist.length > MAX_HIST) hist = hist.slice(0, MAX_HIST);
  saveSearchHistory(hist);
}
function clearSearchHistory() {
  saveSearchHistory([]);
  renderSearchHistory();
}
function deleteHistoryItem(term) {
  let hist = getSearchHistory().filter(h => h !== term);
  saveSearchHistory(hist);
  renderSearchHistory();
}

function renderSearchHistory() {
  const hist    = getSearchHistory();
  const section = document.getElementById('soHistorySection');
  const list    = document.getElementById('soHistoryList');
  if (!section || !list) return;
  if (!hist.length) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  list.innerHTML = hist.map(term => `
    <div class="so-hist-item" onclick="applySearchChip('${term.replace(/'/g,"\\'")}')">
      <i class="fas fa-clock-rotate-left so-hist-icon"></i>
      <span class="so-hist-term">${term}</span>
      <button class="so-hist-del" onclick="event.stopPropagation();deleteHistoryItem('${term.replace(/'/g,"\\'")}')">
        <i class="fas fa-xmark"></i>
      </button>
    </div>`).join('');
}

function openSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  searchOpen = true;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('search-overlay-open');
  renderSearchHistory();
  setTimeout(() => {
    const inp = document.getElementById('searchInput');
    if (inp) {
      inp.focus();
      inp.onkeydown = function(e) {
        if (e.key === 'Enter') {
          filterProducts(inp.value, true); // submitted = true → hide chips & history
          inp.blur();
        }
      };
    }
  }, 80);
}

function closeSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (!overlay) return;
  searchOpen = false;
  _searchSubmitted = false;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('search-overlay-open');
  const inp = document.getElementById('searchInput');
  if (inp) { inp.value = ''; inp.blur(); }
  const clear = document.getElementById('soClear');
  if (clear) clear.style.display = 'none';
  const hint = document.getElementById('soHint');
  if (hint) hint.style.display = 'flex';
  const soPrefs = document.querySelector('.so-prefs-section');
  if (soPrefs) soPrefs.style.display = 'block';
  const soResultsWrap = document.getElementById('soResultsWrap');
  if (soResultsWrap) soResultsWrap.style.display = 'none';
  renderSections();
}

function clearSearchInput() {
  _searchSubmitted = false;
  const inp = document.getElementById('searchInput');
  if (inp) { inp.value = ''; inp.focus(); }
  const clear = document.getElementById('soClear');
  if (clear) clear.style.display = 'none';
  const hint = document.getElementById('soHint');
  if (hint) hint.style.display = 'flex';
  const soPrefs = document.querySelector('.so-prefs-section');
  if (soPrefs) soPrefs.style.display = 'block';
  const soResultsWrap = document.getElementById('soResultsWrap');
  if (soResultsWrap) soResultsWrap.style.display = 'none';
  renderSearchHistory();
  renderSections();
}

// Apply a chip or history term into the search input
function applySearchChip(term) {
  const inp = document.getElementById('searchInput');
  if (inp) { inp.value = term; inp.focus(); }
  const clear = document.getElementById('soClear');
  if (clear) clear.style.display = 'flex';
  filterProducts(term, true); // submitted = true → show results, hide chips & history
}

// ── FUZZY / TYPO-TOLERANT SEARCH ─────────────────────────────────

// Levenshtein edit distance (handles insertions, deletions, substitutions)
function editDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m + 1}, (_, i) => [i]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

// Does query fuzzy-match target? Returns a score (lower = better match, -1 = no match)
function fuzzyScore(query, target) {
  if (!query || !target) return -1;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();

  // 1. Direct substring — best match
  if (t.includes(q)) return 0;

  // 2. All query words appear somewhere in target (handles "baggy pant" vs "baggy pants")
  const words = q.split(/\s+/);
  if (words.length > 1 && words.every(w => t.includes(w))) return 1;

  // 3. Each query word fuzzy-matches some word in target (1 typo tolerance per word)
  const targetWords = t.split(/[\s\-_]+/);
  const allWordsFuzzy = words.every(qw => {
    if (t.includes(qw)) return true;
    return targetWords.some(tw => {
      const maxLen = Math.max(qw.length, tw.length);
      const allowed = qw.length <= 3 ? 1 : qw.length <= 6 ? 2 : 3;
      return editDistance(qw, tw) <= allowed;
    });
  });
  if (allWordsFuzzy) return 2;

  // 4. Whole query fuzzy-matches any portion of target (sliding window)
  if (q.length >= 3) {
    for (let i = 0; i <= t.length - q.length + 2; i++) {
      const chunk = t.slice(i, i + q.length);
      const allowed = q.length <= 4 ? 1 : q.length <= 7 ? 2 : 3;
      if (editDistance(q, chunk) <= allowed) return 3;
    }
  }

  // 5. Starts-with prefix match (first 3+ chars match)
  if (q.length >= 3 && t.startsWith(q.slice(0, 3))) return 4;

  return -1; // no match
}

function productScore(p, query) {
  // Fields to search, weighted by priority
  const fields = [
    { text: p.name,    weight: 0 },
    { text: p.label,   weight: 0.5 },
    { text: p.section, weight: 0.5 },
    { text: p.fabric,  weight: 1 },
    { text: p.code,    weight: 0.5 },
  ];
  let best = -1;
  for (const f of fields) {
    const s = fuzzyScore(query, f.text);
    if (s === -1) continue;
    const weighted = s + f.weight;
    if (best === -1 || weighted < best) best = weighted;
  }
  return best;
}

// Debounce timer for saving history (only save after user stops typing)
let _searchHistTimer;
let _searchSubmitted = false; // true after Enter is pressed

function filterProducts(q, submitted = false) {
  const v = q.trim();
  if (submitted) _searchSubmitted = true;

  // Toggle clear button visibility
  const clearBtn = document.getElementById('soClear');
  if (clearBtn) clearBtn.style.display = v ? 'flex' : 'none';

  const soHint        = document.getElementById('soHint');
  const soResultsWrap = document.getElementById('soResultsWrap');
  const soPrefs       = document.querySelector('.so-prefs-section');
  const soHistory     = document.getElementById('soHistorySection');

  if (!v) {
    // Input cleared — show everything, hide results
    _searchSubmitted = false;
    if (soHint)        soHint.style.display        = 'flex';
    if (soResultsWrap) soResultsWrap.style.display = 'none';
    if (soPrefs)       soPrefs.style.display       = 'block';
    renderSearchHistory(); // re-shows history if any
    renderSections();
    return;
  }

  // While typing (not yet submitted): keep chips + history visible
  if (!_searchSubmitted) {
    if (soPrefs)   soPrefs.style.display   = 'block';
    if (soHistory) soHistory.style.display = getSearchHistory().length ? 'block' : 'none';
    if (soHint)    soHint.style.display    = 'none';
    if (soResultsWrap) soResultsWrap.style.display = 'none';
    return; // don't show results yet while typing
  }

  // After Enter — hide chips & history, show results only
  if (soPrefs)   soPrefs.style.display   = 'none';
  if (soHistory) soHistory.style.display = 'none';
  if (soHint)    soHint.style.display    = 'none';
  if (soResultsWrap) soResultsWrap.style.display = 'block';

  // Save to history
  clearTimeout(_searchHistTimer);
  addSearchTerm(v);

  // Score every product
  const scored = PRODUCTS
    .map(p => ({ p, score: productScore(p, v) }))
    .filter(x => x.score !== -1)
    .sort((a, b) => a.score - b.score);

  const hasExact = scored.some(x => x.score === 0);
  const results  = scored.map(x => x.p);

  // Render into the overlay results grid
  const soGrid  = document.getElementById('soResultsGrid');
  const soLabel = document.getElementById('soResultsLabel');
  if (soGrid) {
    if (results.length) {
      soGrid.innerHTML = results.map(productCard).join('');
    } else {
      soGrid.innerHTML = `<p class="no-products-msg" style="color:var(--gray);font-size:.85rem;grid-column:1/-1;padding:20px 0">
        <i class="fas fa-circle-info" style="color:var(--crimson);margin-right:6px"></i>No products found for "<strong>${v}</strong>"</p>`;
    }
  }
  if (soLabel) {
    soLabel.innerHTML = results.length
      ? (hasExact
          ? `<span class="so-results-count"><i class="fas fa-check-circle" style="color:var(--crimson)"></i> ${results.length} result${results.length>1?'s':''} for "<strong>${v}</strong>"</span>`
          : `<span class="so-results-count"><i class="fas fa-wand-magic-sparkles" style="color:var(--crimson)"></i> Closest results for "<strong>${v}</strong>"</span>`)
      : '';
  }
}

// ══════════════════════════════════════════════════════════════════
// WISHLIST
// ══════════════════════════════════════════════════════════
function toggleWish(e, id) {
  e.stopPropagation();
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(w => w !== id);
    showToast('<i class="fas fa-heart-crack"></i> Removed from saved');
  } else {
    wishlist.push(id);
    showToast('<i class="fas fa-heart" style="color:#ff6b6b"></i> Saved!');
  }
  saveWishlist();
  updateWishBadge();
  renderSections();
  // Re-render wishlist drawer instantly if it's open
  const wishDrawer = document.getElementById('wishlistDrawer');
  if (wishDrawer && wishDrawer.classList.contains('open')) {
    openWishlist();
  }
}

function updateWishBadge() {
  const n = wishlist.length;
  ['wishBadgeTop', 'wishBadgeNav'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.textContent = n;
    b.classList.toggle('show', n > 0);
  });
}

function openWishlist() {
  const el = document.getElementById('wishlistItems');
  if (!wishlist.length) {
    el.innerHTML = `<div class="cart-empty">
      <i class="far fa-heart"></i>
      <p style="margin-top:12px">No saved items yet.<br><small>Tap ♡ on any product to save it.</small></p>
    </div>`;
  } else {
    el.innerHTML = wishlist.map(id => {
      const p       = PRODUCTS.find(x => x.id === id);
      const imgHtml = getMainPhoto(p)
        ? `<img src="${getMainPhoto(p)}" alt="${p.name}" onerror="this.outerHTML='<i class=\\'fas ${p.icon}\\'></i>'">`
        : `<i class="fas ${p.icon}"></i>`;
      return `<div class="wish-item">
        <div class="wish-item-img">${imgHtml}</div>
        <div class="wish-item-info">
          <h4>${p.name}</h4>
          <div class="wi-code">${p.code}</div>
          <div class="wi-fabric">${p.fabric}</div>
          <div class="wi-price">৳${p.price.toLocaleString()}</div>
        </div>
        <div class="wish-item-actions">
          <button class="wish-order-btn" onclick="closeAllDrawers();setTimeout(()=>openOrderForm(${p.id}),200)">
            <i class="fas fa-bag-shopping"></i> Order
          </button>
          <button class="wish-remove-btn" onclick="toggleWish(event,${p.id})">
            <i class="fas fa-xmark"></i>
          </button>
        </div>
      </div>`;
    }).join('');
  }
  openDrawer('wishlistDrawer');
}

// ═════════════════════════════════════════════════════
// PRODUCT DETAIL DRAWER
// ═══════════════════════════════════════════════════════════
function openDetail(id) {
  const p     = PRODUCTS.find(x => x.id === id);
  const stars = '★'.repeat(p.stars) + '☆'.repeat(5 - p.stars);
  const oldP  = p.old ? `<div class="detail-price-old">৳${p.old.toLocaleString()}</div>` : '';

  document.getElementById('detailContent').innerHTML = `
    <div class="detail-carousel">
      ${carouselHtml(p, 'det')}
      <button class="detail-menu-btn" onclick="event.stopPropagation();toggleCardMenu(event,${p.id})" aria-label="More options">
        <i class="fas fa-ellipsis-vertical"></i>
      </button>
    </div>
    <div class="detail-code"><i class="fas fa-barcode"></i> Product Code: ${p.code}</div>
    <div class="detail-title">${p.name}</div>
    <div class="detail-fabric"><i class="fas fa-tag" style="color:var(--gold);font-size:.8rem;margin-right:4px"></i>${p.fabric}</div>
    <div class="detail-stars">${stars} (${p.stars}.0)</div>
    <div class="detail-price">৳${p.price.toLocaleString()}</div>
    ${oldP}
    <div class="detail-desc">${p.desc}</div>
    <div style="height:8px"></div>`;

  document.getElementById('detailStickyBtn').innerHTML = `
    <button class="order-now-btn" onclick="closeAllDrawers();setTimeout(()=>openOrderForm(${p.id}),200)">
      <i class="fas fa-bag-shopping"></i> Buy Now — ৳${p.price.toLocaleString()}
    </button>
    <button class="detail-cart-btn" onclick="addToCart(${p.id},event)">
      <i class="fas fa-cart-plus"></i> Add to Cart
    </button>`;

  // Update the tab title so a shared/opened product link looks right in the browser tab
  document.title = `${p.name} (${p.code}) – Fabric Aura`;

  openDrawer('detailDrawer');
}

// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════

let currentQty = 1;

function isPants(p) { return p && p.section === 'pants'; }
function isWatch(p)      { return p && p.section === 'watch'; }
function isPoloShirt(p)  { return p && p.subcategory === 'polo-shirt'; }
// Colour is skipped for: every Polo Shirt, OR any single product
// marked noColour: true in products.js (see comment there).
function skipsColour(p)  { return p && (isPoloShirt(p) || p.noColour === true); }

// ── Quantity Stepper ──────────────────────────────────────────────
function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById('qtyDisplay').textContent = currentQty;
  renderUnitRows();
  updateOrderSummary(getDeliveryCost());
}

// ── Render per-unit rows ──────────────────────────────────────────
function renderUnitRows() {
  const p         = currentProduct;
  const isBaggy   = isPants(p);
  const container = document.getElementById('unitRowsContainer');
  if (!container) return;

  let html = '';
  for (let i = 0; i < currentQty; i++) {
    const label = currentQty > 1 ? `<div class="unit-row-label">Unit ${i + 1}</div>` : '';

    if (isBaggy) {
      // Pants (any sub-category): S / M / L / XL + Colour
      html += `
      <div class="unit-row" data-unit="${i}">
        ${label}
        <div class="unit-row-fields">
          <div class="unit-field-group">
            <label class="form-label unit-label"><i class="fas fa-ruler-horizontal"></i> Size <span class="form-required">*</span></label>
            <select class="form-select unit-input" id="u_size_${i}">
              <option value="">— Size —</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </div>
          <div class="unit-field-group">
            <label class="form-label unit-label"><i class="fas fa-palette"></i> Colour <span class="form-required">*</span></label>
            <input class="form-input unit-input" type="text" id="u_colour_${i}"
              placeholder="e.g. Black, Olive…"/>
          </div>
        </div>
      </div>`;
    } else if (isWatch(p)) {
      // Watch: Colour only — no size
      html += `
      <div class="unit-row" data-unit="${i}">
        ${label}
        <div class="unit-row-fields">
          <div class="unit-field-group unit-field-full">
            <label class="form-label unit-label"><i class="fas fa-palette"></i> Colour / Variant <span class="form-required">*</span></label>
            <input class="form-input unit-input" type="text" id="u_colour_${i}"
              placeholder="e.g. Silver, Black, Gold…"/>
          </div>
        </div>
      </div>`;
    } else if (skipsColour(p)) {
      // Polo Shirt: Size only — no colour required for ordering
      html += `
      <div class="unit-row" data-unit="${i}">
        ${label}
        <div class="unit-row-fields">
          <div class="unit-field-group unit-field-full">
            <label class="form-label unit-label"><i class="fas fa-ruler-horizontal"></i> Size <span class="form-required">*</span></label>
            <select class="form-select unit-input" id="u_size_${i}">
              <option value="">— Size —</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
        </div>
      </div>`;
    } else {
      // All other products: S M L XL XXL + Colour
      html += `
      <div class="unit-row" data-unit="${i}">
        ${label}
        <div class="unit-row-fields">
          <div class="unit-field-group">
            <label class="form-label unit-label"><i class="fas fa-ruler-horizontal"></i> Size <span class="form-required">*</span></label>
            <select class="form-select unit-input" id="u_size_${i}">
              <option value="">— Size —</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>
          <div class="unit-field-group">
            <label class="form-label unit-label"><i class="fas fa-palette"></i> Colour <span class="form-required">*</span></label>
            <input class="form-input unit-input" type="text" id="u_colour_${i}"
              placeholder="e.g. Black…"/>
          </div>
        </div>
      </div>`;
    }
  }

  container.innerHTML = html;
}

function openOrderForm(id) {
  currentProduct = PRODUCTS.find(x => x.id === id);
  currentQty     = 1;
  const p        = currentProduct;

  const imgHtml = getMainPhoto(p)
    ? `<img src="${getMainPhoto(p)}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px" onerror="this.outerHTML='<i class=\\'fas ${p.icon}\\'></i>'">`
    : `<i class="fas ${p.icon}"></i>`;

  document.getElementById('orderPreview').innerHTML = `
    <div class="prev-icon">${imgHtml}</div>
    <div class="prev-info">
      <h4>${p.name}</h4>
      <div class="prev-code">${p.code}</div>
      <div class="prev-fabric">${p.fabric}</div>
      <div class="prev-price">৳${p.price.toLocaleString()}</div>
    </div>`;

  // Reset quantity display
  document.getElementById('qtyDisplay').textContent = '1';

  // Reset customer fields
  ['f_name', 'f_phone', 'f_address', 'f_note'].forEach(fid => {
    document.getElementById(fid).value = '';
    document.getElementById(fid).classList.remove('error');
  });
  document.getElementById('f_delivery').value = '';
  document.getElementById('f_delivery').classList.remove('error');

  document.getElementById('deliveryCostBox').style.display  = 'none';
  document.getElementById('orderSummaryBox').style.display  = 'none';

  renderUnitRows();
  openDrawer('orderDrawer');
}

function getDeliveryCost() {
  const val = document.getElementById('f_delivery').value;
  return val === 'inside' ? 80 : val === 'outside' ? 120 : 0;
}

function updateDeliveryCost() {
  const val        = document.getElementById('f_delivery').value;
  const box        = document.getElementById('deliveryCostBox');
  const amt        = document.getElementById('deliveryCostAmt');
  const summaryBox = document.getElementById('orderSummaryBox');

  if (val === 'inside') {
    box.style.display = 'flex';
    amt.textContent   = '৳80';
    updateOrderSummary(80);
    summaryBox.style.display = 'block';
  } else if (val === 'outside') {
    box.style.display = 'flex';
    amt.textContent   = '৳120';
    updateOrderSummary(120);
    summaryBox.style.display = 'block';
  } else {
    box.style.display        = 'none';
    summaryBox.style.display = 'none';
  }
}

function updateOrderSummary(deliveryCost) {
  const p = currentProduct;
  if (!p) return;
  const subtotal = p.price * currentQty;
  const total    = subtotal + deliveryCost;
  document.getElementById('os-product-price').textContent   = `৳${subtotal.toLocaleString()} (${currentQty} × ৳${p.price.toLocaleString()})`;
  document.getElementById('os-delivery-charge').textContent = '৳' + deliveryCost;
  document.getElementById('os-total').textContent           = '৳' + total.toLocaleString();
}

// ── Collect per-unit data ─────────────────────────────────────────
function getUnitVariants() {
  const p        = currentProduct;
  const watch    = isWatch(p);
  const polo     = skipsColour(p);
  const variants = [];
  for (let i = 0; i < currentQty; i++) {
    if (watch) {
      variants.push({
        unit:   i + 1,
        colour: (document.getElementById('u_colour_' + i) || {}).value || '',
      });
    } else if (polo) {
      variants.push({
        unit: i + 1,
        size: (document.getElementById('u_size_' + i) || {}).value || '',
      });
    } else {
      variants.push({
        unit:   i + 1,
        size:   (document.getElementById('u_size_'   + i) || {}).value || '',
        colour: (document.getElementById('u_colour_' + i) || {}).value || '',
      });
    }
  }
  return variants;
}

function validateForm() {
  let ok      = true;
  const p     = currentProduct;
  const isBaggy = isPants(p);

  // Delivery
  const delEl = document.getElementById('f_delivery');
  if (!delEl.value) { delEl.classList.add('error'); ok = false; }
  else delEl.classList.remove('error');

  // Per-unit fields
  const watch = isWatch(p);
  const polo  = skipsColour(p);
  for (let i = 0; i < currentQty; i++) {
    const prefixes = watch ? ['u_colour_'] : polo ? ['u_size_'] : ['u_size_', 'u_colour_'];
    prefixes.forEach(prefix => {
      const el = document.getElementById(prefix + i);
      if (!el || !el.value.trim()) { if (el) el.classList.add('error'); ok = false; }
      else el.classList.remove('error');
    });
  }

  // Customer fields
  ['f_name', 'f_phone', 'f_address'].forEach(fid => {
    const el = document.getElementById(fid);
    if (!el.value.trim()) { el.classList.add('error'); ok = false; }
    else el.classList.remove('error');
  });

  if (!ok) showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Please fill all required fields');
  return ok;
}

function buildMessage() {
  const p             = currentProduct;
  const name          = document.getElementById('f_name').value.trim();
  const phone         = document.getElementById('f_phone').value.trim();
  const address       = document.getElementById('f_address').value.trim();
  const note          = document.getElementById('f_note').value.trim();
  const delivery      = document.getElementById('f_delivery').value;
  const deliveryLabel = delivery === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
  const deliveryCostN = delivery === 'inside' ? 80 : 120;
  const subtotal      = p.price * currentQty;
  const total         = subtotal + deliveryCostN;
  const variants      = getUnitVariants();

  // Build variant lines
  const watch2 = isWatch(p);
  const polo2  = skipsColour(p);
  const variantLines = variants.map(v => {
    if (watch2) {
      return currentQty > 1
        ? `  Unit ${v.unit}: ${v.colour}`
        : `  Variant/Colour: ${v.colour}`;
    } else if (polo2) {
      return currentQty > 1
        ? `  Unit ${v.unit}: Size ${v.size}`
        : `  Size: ${v.size}`;
    } else {
      return currentQty > 1
        ? `  Unit ${v.unit}: Size ${v.size} | ${v.colour}`
        : `  Size: ${v.size} | Colour: ${v.colour}`;
    }
  }).join('\n');

  const variantLabel = watch2 ? 'Colour / Variant' : polo2 ? 'Size' : 'Size & Colour';

  return {
    name, phone, address, note, variants,
    text:
`===== NEW ORDER — FABRIC AURA =====
Product  : ${p.name}
Code     : ${p.code}
Category : ${p.label}
Fabric   : ${p.fabric}
Qty      : ${currentQty}
${variantLabel}:
${variantLines}
Unit Price: ৳${p.price.toLocaleString()}
Subtotal : ৳${subtotal.toLocaleString()}
------------------------------
Delivery : ${deliveryLabel} (৳${deliveryCostN})
TOTAL    : ৳${total.toLocaleString()}
------------------------------
Customer : ${name}
Phone    : ${phone}
Address  : ${address}${note ? '\nNote     : ' + note : ''}
==============================`
  };
}

// ── Order recording (saves every order to the database so it shows up
// in the admin dashboard's Orders tab). Fire-and-forget: if it fails,
// the customer's order still goes out via WhatsApp/email/Messenger as
// normal — this never blocks checkout. ──
function recordOrder(payload) {
  try {
    fetch('/.netlify/functions/save-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch (e) { /* never block checkout */ }
}

function sendVia(method) {
  if (!validateForm()) return;
  const { text, name, variants } = buildMessage();

  // Save this order to the database
  (function () {
    const p = currentProduct;
    const delivery = document.getElementById('f_delivery').value;
    const deliveryLabel = delivery === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
    const deliveryCostN = delivery === 'inside' ? 80 : 120;
    const subtotal = p.price * currentQty;
    recordOrder({
      channel: method,
      customer: {
        name,
        phone: document.getElementById('f_phone').value.trim(),
        address: document.getElementById('f_address').value.trim(),
        note: document.getElementById('f_note').value.trim(),
      },
      items: [{
        productId: p.id,
        code: p.code,
        name: p.name,
        category: p.label,
        qty: currentQty,
        unitPrice: p.price,
        variants,
      }],
      delivery: { zone: deliveryLabel, cost: deliveryCostN },
      subtotal,
      total: subtotal + deliveryCostN,
    });
  })();

  if (method === 'email') {
    const p             = currentProduct;
    const delivery      = document.getElementById('f_delivery').value;
    const deliveryLabel = delivery === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
    const deliveryCostN = delivery === 'inside' ? 80 : 120;
    const subtotal      = p.price * currentQty;
    const total         = subtotal + deliveryCostN;

    // Format variants for email
    const isBaggy = isPants(p);
    const polo3   = skipsColour(p);
    const variantStr = variants.map(v =>
      isWatch(p)
        ? `Unit ${v.unit}: ${v.colour}`
        : polo3
          ? `Unit ${v.unit}: Size ${v.size}`
          : `Unit ${v.unit}: Size ${v.size} | ${v.colour}`
    ).join(' / ');

    document.getElementById('fs_product_name').value     = p.name;
    document.getElementById('fs_product_code').value     = p.code;
    document.getElementById('fs_product_category').value = p.label;
    document.getElementById('fs_fabric').value           = p.fabric;
    document.getElementById('fs_variants').value         = variantStr;
    document.getElementById('fs_quantity').value         = currentQty;
    document.getElementById('fs_price').value            = '৳' + subtotal.toLocaleString();
    document.getElementById('fs_delivery_zone').value    = deliveryLabel;
    document.getElementById('fs_delivery_charge').value  = '৳' + deliveryCostN;
    document.getElementById('fs_total').value            = '৳' + total.toLocaleString();
    document.getElementById('fs_name').value             = document.getElementById('f_name').value.trim();
    document.getElementById('fs_phone').value            = document.getElementById('f_phone').value.trim();
    document.getElementById('fs_address').value          = document.getElementById('f_address').value.trim();
    document.getElementById('fs_note').value             = document.getElementById('f_note').value.trim();
    document.getElementById('fs_subject').value          = 'New Order: ' + p.name + ' (' + p.code + ') — Fabric Aura';

    closeAllDrawers();
    const form = document.getElementById('formspreeForm');
    const data = new FormData(form);
    fetch(form.action, { method:'POST', body:data, headers:{ Accept:'application/json' } })
      .then(r => r.ok
        ? showOrderConfirm(document.getElementById('fs_name').value)
        : showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Something went wrong, please try again.'))
      .catch(() => showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Network error, please try again.'));

  } else if (method === 'whatsapp') {
    window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank');
    closeAllDrawers();
    showToast('<i class="fas fa-circle-check" style="color:#4ade80"></i> Order sent! We\'ll confirm shortly, ' + name.split(' ')[0] + '.');

  } else if (method === 'facebook') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        window.open('https://m.me/' + CONFIG.fbPage, '_blank');
        closeAllDrawers();
        showToast('<i class="fab fa-facebook-messenger" style="color:#fff"></i> Order copied! Paste it in Messenger.');
      }).catch(function() {
        window.open('https://m.me/' + CONFIG.fbPage, '_blank');
        closeAllDrawers();
        showToast('<i class="fab fa-facebook-messenger"></i> Messenger opened - type your order there.');
      });
    } else {
      window.open('https://m.me/' + CONFIG.fbPage, '_blank');
      closeAllDrawers();
      showToast('<i class="fab fa-facebook-messenger"></i> Messenger opened - type your order there.');
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// CART SYSTEM — multiple products, single delivery charge
// ══════════════════════════════════════════════════════════════════

// Refresh just one product card in the grid (no full re-render flicker)
function refreshCard(id) {
  const existing = document.getElementById('pcard-' + id);
  if (!existing) return;
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  existing.outerHTML = productCard(p);
}

// +/− buttons on the card badge call this
function cardCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  refreshCard(id);
}

function addToCart(id, evt) {
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
    showToast(`<i class="fas fa-cart-plus" style="color:#4ade80"></i> Qty updated in cart`);
  } else {
    cart.push({ id, qty: 1 });
    showToast(`<i class="fas fa-cart-plus" style="color:#4ade80"></i> Added to cart!`);
  }
  saveCart();
  flyToCart(evt, id);
  updateCartBadge();
  renderCartDrawer();
  refreshCard(id);
}

// ── Fly-to-cart animation ───────────────────────────────────────────
function flyToCart(evt, id) {
  try {
    if (!evt) return;
    const btn = evt.currentTarget || evt.target.closest('button');
    if (!btn) return;

    // Find the product image to clone (card image, or detail carousel image)
    const card = btn.closest('.product-card');
    const scope = card || document.getElementById('detailContent');
    const img = scope ? scope.querySelector('.product-img img, .detail-carousel img') : null;

    // Find the visible cart icon (top nav on desktop, bottom nav on mobile)
    const cartTargets = [document.getElementById('cartBadgeNav'), document.getElementById('cartBadgeTop')]
      .map(el => el ? el.closest('button') : null)
      .filter(Boolean);
    const target = cartTargets.find(el => el.offsetParent !== null) || cartTargets[0];
    if (!target) return;

    const startRect = (img || btn).getBoundingClientRect();
    const endRect = target.getBoundingClientRect();

    const flyer = document.createElement('div');
    flyer.className = 'fly-to-cart';
    if (img) {
      const cloneImg = document.createElement('img');
      cloneImg.src = img.src;
      flyer.appendChild(cloneImg);
    } else {
      flyer.innerHTML = '<i class="fas fa-shirt"></i>';
    }

    const size = 56;
    flyer.style.width = size + 'px';
    flyer.style.height = size + 'px';
    flyer.style.left = (startRect.left + startRect.width / 2 - size / 2) + 'px';
    flyer.style.top = (startRect.top + startRect.height / 2 - size / 2) + 'px';
    document.body.appendChild(flyer);

    const endX = endRect.left + endRect.width / 2 - size / 2;
    const endY = endRect.top + endRect.height / 2 - size / 2;
    const deltaX = endX - (startRect.left + startRect.width / 2 - size / 2);
    const deltaY = endY - (startRect.top + startRect.height / 2 - size / 2);

    // Force layout, then animate via Web Animations API (translate + scale + arc via two keyframes)
    requestAnimationFrame(() => {
      flyer.animate([
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1, offset: 0 },
        { transform: `translate(${deltaX * 0.5}px, ${deltaY * 0.35 - 60}px) scale(.8) rotate(15deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${deltaX}px, ${deltaY}px) scale(.15) rotate(25deg)`, opacity: 0.3, offset: 1 }
      ], { duration: 700, easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = () => {
        flyer.remove();
        bumpCartIcon(target);
      };
    });
  } catch (e) { /* animation is best-effort, never block cart logic */ }
}

function bumpCartIcon(target) {
  target.classList.remove('cart-bump');
  // restart animation
  void target.offsetWidth;
  target.classList.add('cart-bump');
  setTimeout(() => target.classList.remove('cart-bump'), 420);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  refreshCard(id);
  if (!cart.length) closeDrawer('cartDrawer');
}

function changeCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  refreshCard(id);
}

function clearCart() {
  if (!cart.length) return;
  const ids = cart.map(c => c.id);
  cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  ids.forEach(refreshCard);
  closeDrawer('cartDrawer');
  showToast('<i class="fas fa-trash-can"></i> Cart cleared');
}

function updateCartBadge() {
  const count = cart.length;
  ['cartBadgeTop', 'cartBadgeNav'].forEach(id => {
    const badge = document.getElementById(id);
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('show', count > 0);
    }
  });
}

function cartSubtotal() {
  return cart.reduce((s, c) => {
    const p = PRODUCTS.find(x => x.id === c.id);
    return s + (p ? p.price * c.qty : 0);
  }, 0);
}

function renderCartDrawer() {
  const container = document.getElementById('cartItems');
  const footer    = document.getElementById('cartFooter');
  const subtotalEl = document.getElementById('cartSubtotalAmt');
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = `<div class="cart-empty">
      <i class="fas fa-cart-shopping" style="font-size:2.2rem;color:var(--light-gray)"></i>
      <p style="margin-top:12px;color:var(--gray)">Your cart is empty.<br><small>Tap "Add to Cart" on any product.</small></p>
    </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  container.innerHTML = cart.map(c => {
    const p      = PRODUCTS.find(x => x.id === c.id);
    if (!p) return '';
    const photo  = getMainPhoto(p);
    const imgHtml = photo
      ? `<img src="${photo}" alt="${p.name}" onerror="this.outerHTML='<i class=\\'fas ${p.icon}\\'></i>'">`
      : `<i class="fas ${p.icon}"></i>`;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${imgHtml}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-code">${p.code}</div>
          <div class="cart-item-price">৳${(p.price * c.qty).toLocaleString()} (${c.qty} × ৳${p.price.toLocaleString()})</div>
          <div class="cart-item-qty">
            <button class="cart-qty-btn" onclick="changeCartQty(${p.id},-1)"><i class="fas fa-minus"></i></button>
            <span>${c.qty}</span>
            <button class="cart-qty-btn" onclick="changeCartQty(${p.id},1)"><i class="fas fa-plus"></i></button>
          </div>
        </div>
        <button class="cart-remove-btn" onclick="removeFromCart(${p.id})" aria-label="Remove"><i class="fas fa-xmark"></i></button>
      </div>`;
  }).join('');

  const sub = cartSubtotal();
  if (subtotalEl) subtotalEl.textContent = '৳' + sub.toLocaleString();
  if (footer) footer.style.display = 'block';
}

function openCartDrawer() {
  renderCartDrawer();
  openDrawer('cartDrawer');
}

// ── Cart Order Form ───────────────────────────────────────────────
function openCartOrderForm() {
  if (!cart.length) return;

  // Build per-item variant rows
  const container = document.getElementById('cartOrderItems');
  if (container) {
    container.innerHTML = cart.map(c => {
      const p = PRODUCTS.find(x => x.id === c.id);
      if (!p) return '';
      const photo = getMainPhoto(p);
      const imgHtml = photo
        ? `<img src="${photo}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.outerHTML='<i class=\\'fas ${p.icon}\\'></i>'">`
        : `<i class="fas ${p.icon}"></i>`;

      // Build size/colour rows for each unit of this product
      let varRows = '';
      for (let i = 0; i < c.qty; i++) {
        const unitLabel = c.qty > 1 ? `<span class="unit-row-label" style="font-size:.72rem;margin-bottom:4px;display:block">Unit ${i+1}</span>` : '';
        if (isWatch(p)) {
          varRows += `${unitLabel}
            <div class="unit-row-fields" style="margin-bottom:8px">
              <div class="unit-field-group unit-field-full">
                <label class="form-label unit-label"><i class="fas fa-palette"></i> Colour/Variant <span class="form-required">*</span></label>
                <input class="form-input unit-input" type="text" id="co_colour_${p.id}_${i}" placeholder="e.g. Silver, Black…"/>
              </div>
            </div>`;
        } else if (skipsColour(p)) {
          varRows += `${unitLabel}
            <div class="unit-row-fields" style="margin-bottom:8px">
              <div class="unit-field-group unit-field-full">
                <label class="form-label unit-label"><i class="fas fa-ruler-horizontal"></i> Size <span class="form-required">*</span></label>
                <select class="form-select unit-input" id="co_size_${p.id}_${i}">
                  <option value="">— Size —</option>
                  <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                </select>
              </div>
            </div>`;
        } else {
          varRows += `${unitLabel}
            <div class="unit-row-fields" style="margin-bottom:8px">
              <div class="unit-field-group">
                <label class="form-label unit-label"><i class="fas fa-ruler-horizontal"></i> Size <span class="form-required">*</span></label>
                <select class="form-select unit-input" id="co_size_${p.id}_${i}">
                  <option value="">— Size —</option>
                  <option>S</option><option>M</option><option>L</option><option>XL</option><option>XXL</option>
                </select>
              </div>
              <div class="unit-field-group">
                <label class="form-label unit-label"><i class="fas fa-palette"></i> Colour <span class="form-required">*</span></label>
                <input class="form-input unit-input" type="text" id="co_colour_${p.id}_${i}" placeholder="e.g. Black…"/>
              </div>
            </div>`;
        }
      }

      return `
        <div class="cart-order-item">
          <div class="coi-header">
            <div class="coi-img">${imgHtml}</div>
            <div class="coi-meta">
              <div class="coi-name">${p.name}</div>
              <div class="coi-code">${p.code} · Qty: ${c.qty}</div>
              <div class="coi-price">৳${(p.price * c.qty).toLocaleString()}</div>
            </div>
          </div>
          <div class="coi-variants">${varRows}</div>
        </div>`;
    }).join('');
  }

  // Reset fields
  ['co_name','co_phone','co_address','co_note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  const del = document.getElementById('co_delivery');
  if (del) { del.value = ''; del.classList.remove('error'); }
  document.getElementById('coDeliveryCostBox').style.display = 'none';
  document.getElementById('coSummaryBox').style.display = 'none';

  closeDrawer('cartDrawer');
  setTimeout(() => openDrawer('cartOrderDrawer'), 200);
}

function updateCartDeliveryCost() {
  const val = document.getElementById('co_delivery').value;
  const box = document.getElementById('coDeliveryCostBox');
  const amt = document.getElementById('coDeliveryCostAmt');
  const summary = document.getElementById('coSummaryBox');

  const cost = val === 'inside' ? 80 : val === 'outside' ? 120 : 0;
  if (cost) {
    box.style.display = 'flex';
    amt.textContent   = '৳' + cost;
    renderCartSummary(cost);
    summary.style.display = 'block';
  } else {
    box.style.display = 'none';
    summary.style.display = 'none';
  }
}

function renderCartSummary(deliveryCost) {
  const sub   = cartSubtotal();
  const total = sub + deliveryCost;
  document.getElementById('co-subtotal').textContent = '৳' + sub.toLocaleString();
  document.getElementById('co-delivery').textContent = '৳' + deliveryCost;
  document.getElementById('co-total').textContent    = '৳' + total.toLocaleString();

  const itemsEl = document.getElementById('coSummaryItems');
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(c => {
      const p = PRODUCTS.find(x => x.id === c.id);
      if (!p) return '';
      return `<div class="os-row" style="font-size:.75rem">
        <span>${p.name} ×${c.qty}</span>
        <span>৳${(p.price * c.qty).toLocaleString()}</span>
      </div>`;
    }).join('');
  }
}

function validateCartOrderForm() {
  let ok = true;

  const del = document.getElementById('co_delivery');
  if (!del.value) { del.classList.add('error'); ok = false; }
  else del.classList.remove('error');

  // Per-item variants
  cart.forEach(c => {
    const p = PRODUCTS.find(x => x.id === c.id);
    if (!p) return;
    for (let i = 0; i < c.qty; i++) {
      if (isWatch(p)) {
        const el = document.getElementById(`co_colour_${p.id}_${i}`);
        if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
        else if (el) el.classList.remove('error');
      } else if (skipsColour(p)) {
        const el = document.getElementById(`co_size_${p.id}_${i}`);
        if (el && !el.value) { el.classList.add('error'); ok = false; }
        else if (el) el.classList.remove('error');
      } else {
        ['size','colour'].forEach(f => {
          const el = document.getElementById(`co_${f}_${p.id}_${i}`);
          if (el && !el.value.trim()) { el.classList.add('error'); ok = false; }
          else if (el) el.classList.remove('error');
        });
      }
    }
  });

  ['co_name','co_phone','co_address'].forEach(fid => {
    const el = document.getElementById(fid);
    if (!el.value.trim()) { el.classList.add('error'); ok = false; }
    else el.classList.remove('error');
  });

  if (!ok) showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Please fill all required fields');
  return ok;
}

function buildCartMessage() {
  const name     = document.getElementById('co_name').value.trim();
  const phone    = document.getElementById('co_phone').value.trim();
  const address  = document.getElementById('co_address').value.trim();
  const note     = document.getElementById('co_note').value.trim();
  const delivery = document.getElementById('co_delivery').value;
  const deliveryLabel = delivery === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka';
  const deliveryCostN = delivery === 'inside' ? 80 : 120;
  const sub   = cartSubtotal();
  const total = sub + deliveryCostN;

  const itemLines = cart.map((c, idx) => {
    const p = PRODUCTS.find(x => x.id === c.id);
    if (!p) return '';
    let varLines = '';
    for (let i = 0; i < c.qty; i++) {
      if (isWatch(p)) {
        const col = (document.getElementById(`co_colour_${p.id}_${i}`) || {}).value || '';
        varLines += c.qty > 1 ? `\n      Unit ${i+1}: ${col}` : `\n      Variant: ${col}`;
      } else if (skipsColour(p)) {
        const sz = (document.getElementById(`co_size_${p.id}_${i}`) || {}).value || '';
        varLines += c.qty > 1 ? `\n      Unit ${i+1}: Size ${sz}` : `\n      Size: ${sz}`;
      } else {
        const sz  = (document.getElementById(`co_size_${p.id}_${i}`)   || {}).value || '';
        const col = (document.getElementById(`co_colour_${p.id}_${i}`) || {}).value || '';
        varLines += c.qty > 1 ? `\n      Unit ${i+1}: Size ${sz} | ${col}` : `\n      Size: ${sz} | Colour: ${col}`;
      }
    }
    return `[Item ${idx+1}] ${p.name} (${p.code})
  Qty: ${c.qty} × ৳${p.price.toLocaleString()} = ৳${(p.price*c.qty).toLocaleString()}${varLines}`;
  }).join('\n\n');

  const text =
`===== NEW ORDER — FABRIC AURA =====
ORDER TYPE: Cart Order (${cart.length} product${cart.length>1?'s':''})

${itemLines}

------------------------------
Products Subtotal: ৳${sub.toLocaleString()}
Delivery : ${deliveryLabel} (৳${deliveryCostN})
TOTAL    : ৳${total.toLocaleString()}
------------------------------
Customer : ${name}
Phone    : ${phone}
Address  : ${address}${note ? '\nNote     : ' + note : ''}
==============================`;

  return { text, name, sub, deliveryCostN, total, deliveryLabel };
}

function sendCartVia(method) {
  if (!validateCartOrderForm()) return;
  const { text, name, sub, deliveryCostN, total, deliveryLabel } = buildCartMessage();

  // Save this order to the database
  (function () {
    const items = cart.map((c) => {
      const p = PRODUCTS.find((x) => x.id === c.id);
      if (!p) return null;
      const variants = [];
      for (let i = 0; i < c.qty; i++) {
        if (isWatch(p)) {
          variants.push({ unit: i + 1, colour: (document.getElementById(`co_colour_${p.id}_${i}`) || {}).value || '' });
        } else if (skipsColour(p)) {
          variants.push({ unit: i + 1, size: (document.getElementById(`co_size_${p.id}_${i}`) || {}).value || '' });
        } else {
          variants.push({
            unit: i + 1,
            size: (document.getElementById(`co_size_${p.id}_${i}`) || {}).value || '',
            colour: (document.getElementById(`co_colour_${p.id}_${i}`) || {}).value || '',
          });
        }
      }
      return {
        productId: p.id,
        code: p.code,
        name: p.name,
        category: p.label,
        qty: c.qty,
        unitPrice: p.price,
        variants,
      };
    }).filter(Boolean);

    recordOrder({
      channel: method,
      customer: {
        name,
        phone: document.getElementById('co_phone').value.trim(),
        address: document.getElementById('co_address').value.trim(),
        note: document.getElementById('co_note').value.trim(),
      },
      items,
      delivery: { zone: deliveryLabel, cost: deliveryCostN },
      subtotal: sub,
      total,
    });
  })();

  if (method === 'email') {
    const itemsStr = cart.map(c => {
      const p = PRODUCTS.find(x => x.id === c.id);
      return p ? `${p.name} (${p.code}) ×${c.qty}` : '';
    }).filter(Boolean).join(' | ');

    document.getElementById('co_fs_items').value          = itemsStr;
    document.getElementById('co_fs_subtotal').value       = '৳' + sub.toLocaleString();
    document.getElementById('co_fs_delivery_zone').value  = deliveryLabel;
    document.getElementById('co_fs_delivery_charge').value = '৳' + deliveryCostN;
    document.getElementById('co_fs_total').value          = '৳' + total.toLocaleString();
    document.getElementById('co_fs_name').value           = name;
    document.getElementById('co_fs_phone').value          = document.getElementById('co_phone').value.trim();
    document.getElementById('co_fs_address').value        = document.getElementById('co_address').value.trim();
    document.getElementById('co_fs_note').value           = document.getElementById('co_note').value.trim();
    document.getElementById('co_fs_subject').value        = `Cart Order (${cart.length} items) — Fabric Aura`;

    closeAllDrawers();
    const form = document.getElementById('coFormspree');
    const data = new FormData(form);
    fetch(form.action, { method:'POST', body:data, headers:{ Accept:'application/json' } })
      .then(r => r.ok
        ? (cart = [], saveCart(), updateCartBadge(), showOrderConfirm(name))
        : showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Something went wrong, please try again.'))
      .catch(() => showToast('<i class="fas fa-triangle-exclamation" style="color:#fbbf24"></i> Network error, please try again.'));

  } else if (method === 'whatsapp') {
    window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text), '_blank');
    cart = []; saveCart(); updateCartBadge();
    closeAllDrawers();
    showToast(`<i class="fas fa-circle-check" style="color:#4ade80"></i> Order sent! We'll confirm shortly, ${name.split(' ')[0]}.`);

  } else if (method === 'facebook') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        window.open('https://m.me/' + CONFIG.fbPage, '_blank');
        cart = []; saveCart(); updateCartBadge();
      }).catch(() => {
        window.open('https://m.me/' + CONFIG.fbPage, '_blank');
        closeAllDrawers();
        showToast('<i class="fab fa-facebook-messenger"></i> Messenger opened - type your order there.');
      });
    } else {
      window.open('https://m.me/' + CONFIG.fbPage, '_blank');
      closeAllDrawers();
      showToast('<i class="fab fa-facebook-messenger"></i> Messenger opened - type your order there.');
    }
  }
}

// ══════════════════════════════════════════════════════════════════
// DRAWERS & NAVIGATION
// ══════════════════════════════════════════════════════════════════
function openDrawer(id) {
  document.getElementById('overlay').classList.add('open');
  document.getElementById(id).classList.add('open');
  document.body.classList.add('drawer-open-state');
  // Push a history entry so back button closes the drawer instead of leaving the site
  history.pushState({ drawer: id }, '', window.location.href);
}

function closeDrawer(id) {
  document.getElementById(id).classList.remove('open');
  const any = ['detailDrawer', 'orderDrawer', 'wishlistDrawer']
    .some(d => document.getElementById(d).classList.contains('open'));
  if (!any) {
    document.getElementById('overlay').classList.remove('open');
    document.body.classList.remove('drawer-open-state');
  }
}

function closeAllDrawers() {
  ['detailDrawer', 'orderDrawer', 'wishlistDrawer', 'cartDrawer', 'cartOrderDrawer'].forEach(d =>
    document.getElementById(d).classList.remove('open')
  );
  document.getElementById('overlay').classList.remove('open');
  document.body.classList.remove('drawer-open-state');
}

// Back button: close drawer instead of leaving the site
window.addEventListener('popstate', function(e) {
  const anyOpen = ['detailDrawer', 'orderDrawer', 'wishlistDrawer', 'cartDrawer', 'cartOrderDrawer']
    .some(d => document.getElementById(d).classList.contains('open'));
  if (anyOpen) {
    closeAllDrawers();
  } else {
    const home = document.getElementById('home');
    if (home) home.scrollIntoView({ behavior: 'smooth' });
  }
});

function scrollToSection(id, btn) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// ═════════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════════════════════════════
function showToast(html) {
  const t = document.getElementById('toast');
  t.innerHTML = html;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

function showOrderConfirm(fullName) {
  const firstName = (fullName || 'there').split(' ')[0];
  const modal = document.getElementById('orderConfirmModal');
  document.getElementById('confirmCustomerName').textContent = firstName;
  modal.classList.add('open');
}

function closeOrderConfirm() {
  document.getElementById('orderConfirmModal').classList.remove('open');
}

// ══════════════════════════════════════════════════════════════════
// ROTATING BRAND BANNER — auto + manual (dots, prev/next arrows)
// ══════════════════════════════════════════════════════════════════
(function initBannerRotator() {
  const banners = document.querySelectorAll('.bb-slide');
  if (!banners.length) return;
  let current   = 0;
  let autoTimer = null;
  const dots    = document.querySelectorAll('.bb-nav-dot');
  const total   = banners.length;

  function goTo(idx, fromUser) {
    const prev = current;
    current = (idx + total) % total;
    if (prev === current) return;

    banners[prev].classList.remove('bb-active');
    banners[prev].classList.add('bb-exit');
    dots[prev] && dots[prev].classList.remove('active');

    setTimeout(() => banners[prev].classList.remove('bb-exit'), 700);

    banners[current].classList.add('bb-active');
    dots[current] && dots[current].classList.add('active');

    // If triggered manually, restart the auto timer so it won't jump too soon
    if (fromUser) restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1, false), 5000);
  }

  // expose for dot + arrow clicks
  window.bbGoTo   = (idx) => goTo(idx, true);
  window.bbPrev   = ()    => goTo(current - 1, true);
  window.bbNext   = ()    => goTo(current + 1, true);

  restartAuto();
})();

// ══════════════════════════════════════════════════════════════════
// FLOATING HOTLINE WIDGET
// ══════════════════════════════════════════════════════════════════
function toggleHotline() {
  const panel = document.getElementById('hotlinePanel');
  const icon  = document.getElementById('hotlineIcon');
  if (!panel) return;
  const open = panel.classList.toggle('open');
  // Swap icon: headset ↔ xmark when open
  icon.className = open ? 'fas fa-xmark' : 'fas fa-headset';
}

// Close hotline panel when clicking anywhere outside
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('hotlineFab');
  if (wrap && !wrap.contains(e.target)) {
    const panel = document.getElementById('hotlinePanel');
    const icon  = document.getElementById('hotlineIcon');
    if (panel && panel.classList.contains('open')) {
      panel.classList.remove('open');
      if (icon) icon.className = 'fas fa-headset';
    }
  }
});

// ══════════════════════════════════════════════════════════════════
// RECENTLY VIEWED
// ══════════════════════════════════════════════════════════════════
const recentlyViewed = []; // stores product ids in order

function addToRecentlyViewed(id) {
  // Remove if already exists (move to front)
  const idx = recentlyViewed.indexOf(id);
  if (idx !== -1) recentlyViewed.splice(idx, 1);
  recentlyViewed.unshift(id);
  // Keep max 12
  if (recentlyViewed.length > 12) recentlyViewed.pop();
  renderRvTray();
}

function renderRvTray() {
  const container = document.getElementById('rvItems');
  const navBadge  = document.getElementById('rvBadgeNav');
  if (navBadge) {
    navBadge.textContent = recentlyViewed.length;
    navBadge.classList.toggle('show', recentlyViewed.length > 0);
  }
  if (!container) return;
  if (!recentlyViewed.length) {
    container.innerHTML = '<p style="font-size:.78rem;color:var(--gray);text-align:center;padding:20px 0;grid-column:1/-1">No items yet.<br>Tap any product to view it.</p>';
    return;
  }

  container.innerHTML = recentlyViewed.map(id => {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return '';
    const photo = getMainPhoto(p);
    const imgHtml = photo
      ? `<img src="${photo}" alt="${p.name}" loading="lazy" onerror="this.parentElement.innerHTML='<i class=\\'fas ${p.icon}\\'></i>'">`
      : `<i class="fas ${p.icon}"></i>`;
    return `
      <div class="rv-item" onclick="closeRvTray();openDetail(${p.id})">
        <div class="rv-item-img">${imgHtml}</div>
        <div class="rv-item-info">
          <div class="rv-item-code">${p.code}</div>
          <div class="rv-item-name">${p.name}</div>
          <div class="rv-item-price">৳${p.price.toLocaleString()}</div>
        </div>
      </div>`;
  }).join('');
}

function toggleRvTray() {
  const tray = document.getElementById('rvTray');
  if (!tray) return;
  tray.classList.toggle('open');
}

function closeRvTray() {
  const tray = document.getElementById('rvTray');
  if (tray) tray.classList.remove('open');
}

// Close tray when clicking outside
document.addEventListener('click', function(e) {
  const tray = document.getElementById('rvTray');
  const navBtn = document.querySelector('.bottom-nav-item[onclick="toggleRvTray()"]');
  if (tray && tray.classList.contains('open') &&
      !tray.contains(e.target) && (!navBtn || !navBtn.contains(e.target))) {
    tray.classList.remove('open');
  }
});

// Hook into openDetail so every product view is tracked
const _origOpenDetail = window.openDetail || openDetail;
// We wrap openDetail after it's defined — patch it here
(function patchOpenDetail() {
  const original = openDetail;
  window.openDetail = function(id) {
    addToRecentlyViewed(id);
    original(id);
  };
})();

// ══════════════════════════════════════════════════════════════════
// CATEGORY TAB SCROLL HINT — hide chevron once user scrolls tabs
// ══════════════════════════════════════════════════════════════════
(function initTabScrollHint() {
  const filter = document.getElementById('categoryFilter');
  const hint   = document.getElementById('catMoreHint');
  if (!filter || !hint) return;
  filter.addEventListener('scroll', function() {
    // If scrolled near end, hide the hint
    const atEnd = filter.scrollLeft + filter.clientWidth >= filter.scrollWidth - 10;
    hint.style.opacity = atEnd ? '0' : '1';
  }, { passive: true });
})();




