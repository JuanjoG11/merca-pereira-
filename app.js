/**
 * ==========================================================================
 * MERCADO PEREIRA RESILIENTE - APPLICATION LOGIC
 * Features: Supabase real-time DB, Product Grid, Category/Barrio Filters,
 * WhatsApp Direct Buy, Express Publishing with photo upload, live timestamps.
 * ==========================================================================
 */

(function() {
  'use strict';

  // ─── Supabase Client Init ──────────────────────────────────────────────────
  let supabaseClient = null;
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
  const TABLE = 'marketplace_products';

  function initSupabase() {
    try {
      if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado correctamente.');
      } else {
        console.warn('⚠️ Supabase no disponible. Usando localStorage como respaldo.');
      }
    } catch (e) {
      console.error('Error al inicializar Supabase:', e);
    }
  }

// ─── Fallback Demo Products ────────────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Set de Tejas Onduladas & Perfiles C-10 de Reparación',
    description: 'Excelente calidad para techos golpeados por el sismo. Disponibilidad inmediata en bodega. Entregamos a domicilio o recogida.',
    price: 180000, category: 'construccion', neighborhood: 'cuba',
    neighborhood_name: 'Cuba / San Fernando', seller_name: 'Don Carlos - Ferretería El Progreso',
    seller_phone: '3104567890', delivery_badge: 'domicilio',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'prod-2',
    title: 'Mercado Familiar Completo (Arroz, Fríjol, Aceite y Granos)',
    description: 'Canasta de víveres esenciales a precio solidario. Todo fresco y empacado con normas sanitarias.',
    price: 85000, category: 'viveres', neighborhood: 'centro',
    neighborhood_name: 'Centro de Pereira', seller_name: 'Doña Gloria - Central de Abastos',
    seller_phone: '3129876543', delivery_badge: 'ambos',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'prod-3',
    title: 'Servicio 24/7 de Reparación Eléctrica & Conexión de Plantas',
    description: 'Electricista certificado para revisión de cortos, instalación de plantas de energía y reparación de redes domiciliarias.',
    price: 50000, category: 'servicios', neighborhood: 'dosquebradas',
    neighborhood_name: 'Dosquebradas', seller_name: 'Mateo Electricista Pereira',
    seller_phone: '3157778899', delivery_badge: 'domicilio',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'prod-4',
    title: 'Almuerzos Ejecutivos & Caldo de Costilla Caliente',
    description: 'Servicio de alimentación preparado al día. Caldo reparador y menús caseros completos con jugos naturales.',
    price: 14000, category: 'restaurantes', neighborhood: 'circunvalar',
    neighborhood_name: 'Circunvalar / Pinares', seller_name: 'Restaurante El Sabor Pereirano',
    seller_phone: '3183334455', delivery_badge: 'domicilio',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'prod-5',
    title: 'Powerbank Batería Externa 20.000mAh Carga Rápida Dual',
    description: 'Ideal para mantener tu celular cargado ante cortes de luz. Carga rápida tipo C e iluminación linterna LED integrada.',
    price: 65000, category: 'tecnologia', neighborhood: 'circunvalar',
    neighborhood_name: 'Circunvalar / Pinares', seller_name: 'Tech Pereira - Accesorios',
    seller_phone: '3001112233', delivery_badge: 'ambos',
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'prod-6',
    title: 'Pacas de Agua Mineral Pura x 24 Botellas 500ml',
    description: 'Agua potable sellada para hidratación familiar o comunitaria. Descuento especial por compras al mayor.',
    price: 22000, category: 'viveres', neighborhood: 'boston',
    neighborhood_name: 'Boston / Providencia', seller_name: 'Distribuidora Otún',
    seller_phone: '3146665544', delivery_badge: 'domicilio',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString()
  },
  {
    id: 'prod-7',
    title: 'Plomero 24 Horas & Destape de Tuberías con Sonda',
    description: 'Servicio técnico especializado en fugas de agua, reparación de sanitarios y tanques de reserva.',
    price: 45000, category: 'servicios', neighborhood: 'cerritos',
    neighborhood_name: 'Cerritos / Galicia', seller_name: 'Plomería Rápida Pereira',
    seller_phone: '3119998877', delivery_badge: 'domicilio',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'prod-8',
    title: 'Cobijas Térmicas Dobles & Colchones Inflables',
    description: 'Artículos de abrigo y descanso rápido para el hogar. Producto totalmente nuevo en empaque sellado.',
    price: 95000, category: 'hogar', neighborhood: 'alamos',
    neighborhood_name: 'Álamos / UTP', seller_name: 'Almacén El Sol',
    seller_phone: '3132223344', delivery_badge: 'recogida',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString()
  }
];

// ─── Category / Neighborhood / Delivery Maps ──────────────────────────────
const CATEGORY_FALLBACK_IMAGES = {
  viveres:      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  construccion: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=600&q=80',
  servicios:    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  restaurantes: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  tecnologia:   'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
  hogar:        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
  otros:        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80'
};

const CATEGORY_LABELS = {
  viveres: '🍞 Víveres', construccion: '🛠️ Construcción',
  servicios: '⚡ Servicios', restaurantes: '🍽️ Restaurantes',
  tecnologia: '🔋 Tecnología', hogar: '🏠 Hogar', otros: '📦 Otros'
};

const NEIGHBORHOOD_LABELS = {
  cuba: 'Cuba / San Fernando', centro: 'Centro de Pereira',
  circunvalar: 'Circunvalar / Pinares', dosquebradas: 'Dosquebradas',
  boston: 'Boston / Providencia', cerritos: 'Cerritos / Galicia',
  alamos: 'Álamos / UTP', villasantana: 'Villa Santana / Toki'
};

const DELIVERY_LABELS = {
  domicilio: '🛵 A Domicilio', recogida: '🏬 Punto Físico / Recogida'
};

// ─── Application State ────────────────────────────────────────────────────
let productsState = [];
let currentCategory = 'all';
let currentNeighborhood = 'all';
let currentSearchTerm = '';
let currentSort = 'recent';
let selectedFilesList = [];    // Array of File objects (up to 3)
let selectedImagesBase64 = []; // Array of base64 preview strings
let isLoadingFromDB = false;
let editingProductId = null;

// ─── DOM Refs ─────────────────────────────────────────────────────────────
const productsGrid        = document.getElementById('productsGrid');
const emptyState          = document.getElementById('emptyState');
const resultsCountBadge   = document.getElementById('resultsCountBadge');
const currentCategoryTitle= document.getElementById('currentCategoryTitle');
const totalProductsCount  = document.getElementById('totalProductsCount');
const totalSellersCount   = document.getElementById('totalSellersCount');
const searchInput         = document.getElementById('searchInput');
const clearSearchBtn      = document.getElementById('clearSearchBtn');
const categoryFilter      = document.getElementById('categoryFilter');
const neighborhoodFilter  = document.getElementById('neighborhoodFilter');
const sortSelect          = document.getElementById('sortSelect');
const categoryPillsContainer = document.getElementById('categoryPillsContainer');
const publishModal        = document.getElementById('publishModal');
const openPublishModalBtn = document.getElementById('openPublishModalBtn');
const closePublishModalBtn= document.getElementById('closePublishModalBtn');
const cancelPublishBtn    = document.getElementById('cancelPublishBtn');
const publishForm         = document.getElementById('publishForm');
const emptyStatePublishBtn= document.getElementById('emptyStatePublishBtn');
const imageInput          = document.getElementById('imageInput');
const dropzone            = document.getElementById('dropzone');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview        = document.getElementById('imagePreview');
const removeImgBtn        = document.getElementById('removeImgBtn');

// ─── App Bootstrap ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initSupabase();
  setupEventListeners();
  // ⚡ Instant Render: Load local state immediately so user sees content with 0ms delay
  loadFromLocalStorage();
  renderProducts();
  updateStats();

  // 📡 Background Cloud Sync: Fetch latest from Supabase without blocking UI
  loadProducts().then(() => {
    renderProducts();
    updateStats();
  });
  startRealtimeSync();
});

// ─── Loading State ────────────────────────────────────────────────────────
function showLoadingState() {
  productsGrid.innerHTML = `
    <div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div>
    <div class="loading-skeleton"></div>
  `;
}

// ─── Data Loading ─────────────────────────────────────────────────────────
async function loadProducts() {
  if (supabaseClient) {
    try {
      isLoadingFromDB = true;
      const { data, error } = await supabaseClient
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist yet — fall back to local data
        console.warn('⚠️ Tabla no encontrada en Supabase. Usando datos demo. Crea la tabla con el SQL provisto.', error.message);
        loadFromLocalStorage();
        showDbSetupBanner();
      } else {
        productsState = data && data.length > 0 ? data : DEFAULT_PRODUCTS;
        if (!data || data.length === 0) {
          // Seed DB with demo products
          seedSupabaseWithDefaults();
        }
        console.log(`✅ ${productsState.length} productos cargados desde Supabase.`);
      }
    } catch (err) {
      console.error('Error al cargar desde Supabase:', err);
      loadFromLocalStorage();
    } finally {
      isLoadingFromDB = false;
    }
  } else {
    loadFromLocalStorage();
  }
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('pereira_marketplace_products');
  if (saved) {
    try { productsState = JSON.parse(saved); } catch { productsState = [...DEFAULT_PRODUCTS]; }
  } else {
    productsState = [...DEFAULT_PRODUCTS];
    saveToLocalStorage();
  }
}

function saveToLocalStorage() {
  localStorage.setItem('pereira_marketplace_products', JSON.stringify(productsState));
}

async function seedSupabaseWithDefaults() {
  if (!supabaseClient) return;
  try {
    const { error } = await supabaseClient.from(TABLE).insert(DEFAULT_PRODUCTS);
    if (!error) {
      productsState = [...DEFAULT_PRODUCTS];
      console.log('✅ Datos demo cargados a Supabase.');
      renderProducts();
      updateStats();
    }
  } catch (e) {
    console.warn('No se pudieron cargar datos demo a Supabase:', e);
  }
}

// ─── Real-time Sync ───────────────────────────────────────────────────────
function startRealtimeSync() {
  if (!supabaseClient) return;

  supabaseClient
    .channel('marketplace_live')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: TABLE
    }, (payload) => {
      const newProduct = payload.new;
      // Avoid duplicates
      if (!productsState.find(p => p.id === newProduct.id)) {
        productsState.unshift(newProduct);
        renderProducts();
        updateStats();
        showToast(`¡Nuevo producto publicado! "${newProduct.title.substring(0, 35)}..."`, 'success');
      }
    })
    .subscribe();

  console.log('📡 Suscripción en tiempo real activa.');
}

// ─── DB Setup Banner ─────────────────────────────────────────────────────
function showDbSetupBanner() {
  const banner = document.createElement('div');
  banner.id = 'db-setup-banner';
  banner.innerHTML = `
    <div style="background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);border-radius:12px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.9rem;color:#FDE68A;display:flex;align-items:flex-start;gap:0.75rem;">
      <i class="fa-solid fa-triangle-exclamation" style="color:#FCD34D;margin-top:2px;flex-shrink:0;"></i>
      <div>
        <strong>Configuración de base de datos requerida:</strong><br>
        La tabla <code>marketplace_products</code> no existe aún en tu proyecto Supabase. 
        Ve a <a href="https://supabase.com/dashboard/project/wqqwmtfupeejqzfnujdm/sql/new" target="_blank" style="color:#FCD34D;text-decoration:underline;">Supabase SQL Editor</a> 
        y ejecuta el SQL del archivo <code>setup.sql</code> para activar la base de datos en tiempo real.
      </div>
    </div>
  `;
  const marketplace = document.querySelector('.marketplace-section .container');
  if (marketplace) marketplace.prepend(banner);
}

// ─── Event Listeners ──────────────────────────────────────────────────────
function setupEventListeners() {
  searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.toLowerCase().trim();
    clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
    renderProducts();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    currentSearchTerm = '';
    clearSearchBtn.style.display = 'none';
    renderProducts();
  });
  categoryFilter.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    updateActiveCategoryPill(currentCategory);
    renderProducts();
  });
  neighborhoodFilter.addEventListener('input', (e) => {
    currentNeighborhood = e.target.value;
    renderProducts();
  });
  neighborhoodFilter.addEventListener('change', (e) => {
    currentNeighborhood = e.target.value;
    renderProducts();
  });
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });

  // Category pills — direct handlers per pill for reliable mobile touch
  bindCategoryPills();

  // Modals — header button + FAB (floating button) + empty state
  document.querySelectorAll('#openPublishModalBtn, #fabPublishBtn, #emptyStatePublishBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });
  if (publishForm) publishForm.addEventListener('submit', handlePublishSubmit);
  if (closePublishModalBtn) closePublishModalBtn.addEventListener('click', closeModal);
  if (cancelPublishBtn) cancelPublishBtn.addEventListener('click', closeModal);
  if (publishModal) {
    publishModal.addEventListener('click', (e) => { if (e.target === publishModal) closeModal(); });
  }

  if (imageInput) imageInput.addEventListener('change', handleImageSelect);
  if (removeImgBtn) removeImgBtn.addEventListener('click', removeImagePreview);

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--pereira-yellow)';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'rgba(255, 199, 44, 0.4)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'rgba(255, 199, 44, 0.4)';
      if (e.dataTransfer.files?.[0]) {
        imageInput.files = e.dataTransfer.files;
        handleImageSelect();
      }
    });
  }

  // Real-time dot thousands separator for price input
  const productPriceInput = document.getElementById('productPrice');
  if (productPriceInput) {
    productPriceInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, '');
      if (raw) {
        let num = parseInt(raw, 10);
        e.target.value = new Intl.NumberFormat('es-CO').format(num);
      } else {
        e.target.value = '';
      }
    });
  }

  // Card click handler — opens product detail modal & photo lightbox
  if (productsGrid) {
    productsGrid.addEventListener('click', (e) => {
      if (e.target.closest('.action-buttons')) return;
      const card = e.target.closest('.product-card');
      if (card && card.dataset.productId) {
        openProductDetail(card.dataset.productId);
      }
    });
  }

  // Close Product Detail Modal handlers
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const productDetailModal  = document.getElementById('productDetailModal');
  if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', closeProductDetail);
  if (productDetailModal) {
    productDetailModal.addEventListener('click', (e) => {
      if (e.target === productDetailModal) closeProductDetail();
    });
  }
}

// Bind category pills with clean click event delegation for desktop & mobile touch
function bindCategoryPills() {
  if (!categoryPillsContainer) return;
  categoryPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    const cat = pill.dataset.category;
    if (!cat) return;

    currentCategory = cat;
    if (categoryFilter) categoryFilter.value = cat;
    updateActiveCategoryPill(cat);
    renderProducts();
  });
}

function updateActiveCategoryPill(catValue) {
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.category === catValue);
  });
}

// ─── Product Rendering ────────────────────────────────────────────────────
function renderProducts() {
  let filtered = productsState.filter(item => {
    const matchCat    = currentCategory === 'all' || item.category === currentCategory;
    const n = (currentNeighborhood || '').toLowerCase().trim();
    const itemBarrio = (item.neighborhood_name || item.neighborhood || '').toLowerCase();
    const matchBarrio = !n || n === 'all' || itemBarrio.includes(n);

    const q = currentSearchTerm;
    const matchSearch = !q ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.seller_name?.toLowerCase().includes(q) ||
      (item.neighborhood_name || item.neighborhood || '')?.toLowerCase().includes(q);
    return matchCat && matchBarrio && matchSearch;
  });

  filtered.sort((a, b) => {
    if (currentSort === 'price-low')  return a.price - b.price;
    if (currentSort === 'price-high') return b.price - a.price;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    resultsCountBadge.textContent = '0 productos encontrados';
  } else {
    emptyState.style.display = 'none';
    resultsCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'} en Pereira`;
    productsGrid.innerHTML = filtered.map(createProductCardHTML).join('');
  }

  currentCategoryTitle.textContent =
    currentCategory === 'all' ? 'Destacadas' : (CATEGORY_LABELS[currentCategory] || 'Destacadas');
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(amount);
}

function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)    return 'Hace unos segundos';
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function buildWhatsAppLink(phone, sellerName, title, price, neighborhoodName) {
  const clean = phone.replace(/\D/g, '');
  const formatted = clean.length === 10 ? `57${clean}` : clean;
  const text = `Hola ${sellerName}, vi tu producto "${title}" (${formatCOP(price)}) publicado en *La Vitrina Pereirana* 🛍️. Deseo comprarlo / solicitarlo — Sector: ${neighborhoodName}. ¿Sigue disponible?`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
}

// ─── Product Card HTML (Compact — click opens full detail modal) ──────────
function createProductCardHTML(product) {
  const catLabel  = CATEGORY_LABELS[product.category] || '📦 Producto';
  const barrio    = product.neighborhood_name || NEIGHBORHOOD_LABELS[product.neighborhood] || product.neighborhood || 'Pereira';
  const waLink    = buildWhatsAppLink(product.seller_phone, product.seller_name, product.title, product.price, barrio);
  const callLink  = `tel:${product.seller_phone}`;
  const imgUrl    = (product.images && product.images[0]) || product.image || CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.otros;

  return `
    <article class="product-card" data-product-id="${product.id}" title="Toca para ver detalles y fotos">
      <div class="product-image-box">
        <img src="${imgUrl}" alt="${product.title}" class="product-image" loading="lazy"
             onerror="this.src='${CATEGORY_FALLBACK_IMAGES.otros}'">
        <span class="badge-category">${catLabel}</span>
        <span class="badge-neighborhood"><i class="fa-solid fa-location-dot"></i> ${barrio}</span>
      </div>

      <div class="product-card-body">
        <h3 class="product-title">${product.title}</h3>

        <div class="product-footer">
          <span class="product-price">${formatCOP(product.price)}</span>

          <div class="action-buttons">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm" onclick="event.stopPropagation();">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </a>
            <a href="${callLink}" class="btn btn-call btn-sm" title="Llamar" onclick="event.stopPropagation();">
              <i class="fa-solid fa-phone"></i>
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}


// ─── Stats Counter ────────────────────────────────────────────────────────
function updateStats() {
  totalProductsCount.textContent = productsState.length;
  const uniqueSellers = new Set(productsState.map(p => (p.seller_name || '').toLowerCase().trim()));
  totalSellersCount.textContent = uniqueSellers.size;
}


// ─── Modal ────────────────────────────────────────────────────────────────
function openModal() {
  publishModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  publishModal.classList.remove('active');
  document.body.style.overflow = '';
  publishForm.reset();
  editingProductId = null;
  const modalTitle = publishModal.querySelector('.modal-title-group h3');
  if (modalTitle) modalTitle.textContent = 'Publicar Producto o Servicio';
  removeImagePreview();
}

// ─── Product Detail & Photo Lightbox Modal ────────────────────────────────
function openProductDetail(productId) {
  const product = productsState.find(p => p.id === productId);
  if (!product) return;

  const detailModal        = document.getElementById('productDetailModal');
  const detailImage        = document.getElementById('detailImage');
  const detailTitle        = document.getElementById('detailTitle');
  const detailPrice        = document.getElementById('detailPrice');
  const detailSellerName   = document.getElementById('detailSellerName');
  const detailTimeAgo      = document.getElementById('detailTimeAgo');
  const detailNeighborhood = document.getElementById('detailNeighborhood');
  const detailDelivery     = document.getElementById('detailDelivery');
  const detailDescription  = document.getElementById('detailDescription');
  const detailWaBtn        = document.getElementById('detailWaBtn');
  const detailCallBtn      = document.getElementById('detailCallBtn');
  const galleryThumbs      = document.getElementById('galleryThumbs');

  const barrio   = product.neighborhood_name || NEIGHBORHOOD_LABELS[product.neighborhood] || product.neighborhood || 'Pereira';
  const delivery = DELIVERY_LABELS[product.delivery_badge] || '🛵 A Domicilio';
  const waLink   = buildWhatsAppLink(product.seller_phone, product.seller_name, product.title, product.price, barrio);
  const images   = (product.images && product.images.length > 0) ? product.images : [product.image || CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.otros];

  if (detailImage) {
    detailImage.src = images[0];
    detailImage.alt = product.title;
  }

  if (galleryThumbs) {
    if (images.length > 1) {
      galleryThumbs.style.display = 'flex';
      galleryThumbs.innerHTML = images.map((src, idx) => `
        <button type="button" class="thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <img src="${src}" alt="Miniatura ${idx + 1}">
        </button>
      `).join('');

      galleryThumbs.querySelectorAll('.thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          galleryThumbs.querySelectorAll('.thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const i = parseInt(btn.dataset.index, 10);
          if (detailImage) detailImage.src = images[i];
        });
      });
    } else {
      galleryThumbs.style.display = 'none';
      galleryThumbs.innerHTML = '';
    }
  }

  if (detailTitle) detailTitle.textContent = product.title;
  if (detailPrice) detailPrice.textContent = formatCOP(product.price);
  if (detailSellerName) detailSellerName.innerHTML = `<i class="fa-solid fa-store"></i> ${product.seller_name || 'Vendedor local'}`;
  if (detailTimeAgo) detailTimeAgo.textContent = `• ${timeAgo(product.created_at)}`;
  if (detailNeighborhood) detailNeighborhood.textContent = barrio;
  if (detailDelivery) detailDelivery.textContent = delivery;
  if (detailDescription) {
    detailDescription.textContent = product.description || 'Sin descripción adicional. Contacta al vendedor directamente por WhatsApp o llamada para coordinar entrega o inquietudes.';
  }
  if (detailWaBtn) detailWaBtn.href = waLink;
  if (detailCallBtn) detailCallBtn.href = `tel:${product.seller_phone}`;

  if (detailModal) {
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeProductDetail() {
  const detailModal = document.getElementById('productDetailModal');
  if (detailModal) {
    detailModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// ─── Image Compression & Upload (Up to 3 Photos) ───────────────────────────
function compressImageFile(file, maxWidth = 1000, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve({ file, base64: null });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve({ file, base64: compressedBase64 });
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve({ file: compressedFile, base64: compressedBase64 });
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve({ file, base64: e.target.result });
      img.src = e.target.result;
    };
    reader.onerror = () => resolve({ file, base64: null });
    reader.readAsDataURL(file);
  });
}

async function handleImageSelect() {
  if (!imageInput || !imageInput.files) return;
  const files = Array.from(imageInput.files);
  if (files.length === 0) return;

  if (selectedFilesList.length + files.length > 3) {
    showToast('Puedes subir como máximo 3 fotografías por producto.', 'error');
  }

  const remaining = 3 - selectedFilesList.length;
  const filesToAdd = files.slice(0, remaining);

  for (const file of filesToAdd) {
    const { file: compressedFile, base64 } = await compressImageFile(file);
    selectedFilesList.push(compressedFile);
    if (base64) selectedImagesBase64.push(base64);
  }

  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  if (!grid) return;

  if (selectedImagesBase64.length === 0) {
    grid.style.display = 'none';
    grid.innerHTML = '';
    if (dropzone) dropzone.style.display = 'flex';
    return;
  }

  grid.style.display = 'grid';
  grid.innerHTML = selectedImagesBase64.map((src, index) => `
    <div class="preview-thumb-card">
      <img src="${src}" alt="Foto ${index + 1}">
      <button type="button" class="btn-remove-thumb" data-index="${index}" title="Eliminar foto">&times;</button>
    </div>
  `).join('');

  if (selectedFilesList.length >= 3) {
    if (dropzone) dropzone.style.display = 'none';
  } else {
    if (dropzone) dropzone.style.display = 'flex';
  }

  grid.querySelectorAll('.btn-remove-thumb').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      selectedFilesList.splice(idx, 1);
      selectedImagesBase64.splice(idx, 1);
      if (imageInput) imageInput.value = '';
      renderImagePreviews();
    });
  });
}

function removeImagePreview() {
  selectedFilesList = [];
  selectedImagesBase64 = [];
  if (imageInput) imageInput.value = '';
  renderImagePreviews();
}

// Upload multiple image files to Supabase Storage and return public URLs
async function uploadImagesToStorage(files, productId) {
  if (!supabaseClient || !files || files.length === 0) return [];
  const urls = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${productId}-${i + 1}.${ext}`;
      const { data, error } = await supabaseClient.storage
        .from('product-images')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!error) {
        const { data: urlData } = supabaseClient.storage
          .from('product-images')
          .getPublicUrl(path);
        if (urlData?.publicUrl) urls.push(urlData.publicUrl);
      }
    } catch (e) {
      console.error('Error subiendo foto:', e);
    }
  }
  return urls;
}


// ─── Publish Submit (Instant 0ms UI Update + Background Sync) ──────────────
async function handlePublishSubmit(e) {
  e.preventDefault();

  const sellerNameEl    = document.getElementById('sellerName');
  const sellerPhoneEl   = document.getElementById('sellerPhone');
  const titleEl         = document.getElementById('productTitle');
  const priceEl         = document.getElementById('productPrice');
  const categoryEl      = document.getElementById('productCategory');
  const neighborhoodEl  = document.getElementById('productNeighborhood');
  const deliveryBadgeEl = document.getElementById('deliveryBadge');
  const descriptionEl   = document.getElementById('productDescription');

  const sellerName      = sellerNameEl?.value.trim() || '';
  const sellerPhone     = sellerPhoneEl?.value.trim() || '';
  const title           = titleEl?.value.trim() || '';
  const priceRaw        = priceEl?.value.replace(/\D/g, '') || '';
  const price           = parseFloat(priceRaw) || 0;
  const category        = categoryEl?.value || '';
  const neighborhoodStr = neighborhoodEl?.value.trim() || '';
  const deliveryBadge   = deliveryBadgeEl?.value || 'domicilio';
  const description     = descriptionEl?.value.trim() || '';

  // Highlight missing required fields
  let hasError = false;
  [
    { el: sellerNameEl, val: sellerName },
    { el: sellerPhoneEl, val: sellerPhone },
    { el: titleEl, val: title },
    { el: priceEl, val: price },
    { el: categoryEl, val: category },
    { el: neighborhoodEl, val: neighborhoodStr }
  ].forEach(item => {
    if (!item.el) return;
    if (!item.val) {
      item.el.classList.add('field-error');
      hasError = true;
      item.el.addEventListener('input', () => item.el.classList.remove('field-error'), { once: true });
    } else {
      item.el.classList.remove('field-error');
    }
  });

  if (hasError) {
    showToast('Por favor completa todos los campos obligatorios (*).', 'error');
    return;
  }

  const submitBtn = publishForm?.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';
  }

  const productId = `prod-${Date.now()}`;
  let imageUrls = selectedImagesBase64.length > 0 ? [...selectedImagesBase64] : [CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.otros];
  const primaryImage = imageUrls[0] || CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.otros;

  const productData = {
    id: productId,
    title,
    description,
    price,
    category,
    neighborhood: neighborhoodStr.toLowerCase(),
    neighborhood_name: neighborhoodStr,
    seller_name: sellerName,
    seller_phone: sellerPhone,
    delivery_badge: deliveryBadge,
    image: primaryImage,
    images: imageUrls,
    created_at: new Date().toISOString()
  };

  // ⚡ 1. Instant UI update (0ms delay for user!)
  productsState.unshift(productData);
  saveToLocalStorage();
  renderProducts();
  updateStats();
  closeModal();

  showToast('¡Publicado en La Vitrina Pereirana! 🎉 Todos pueden verlo ya.', 'success');

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar en Mercado Pereira';
  }

  // 📡 2. Background Cloud Sync (Non-blocking!)
  if (supabaseClient) {
    (async () => {
      try {
        if (selectedFilesList.length > 0) {
          const uploadedUrls = await uploadImagesToStorage(selectedFilesList, productId);
          if (uploadedUrls && uploadedUrls.length > 0) {
            productData.images = uploadedUrls;
            productData.image = uploadedUrls[0];
            const idx = productsState.findIndex(p => p.id === productId);
            if (idx !== -1) productsState[idx] = productData;
            saveToLocalStorage();
            renderProducts();
          }
        }
        await supabaseClient.from(TABLE).insert([productData]);
        console.log('✅ Guardado exitoso en la nube Supabase.');
      } catch (err) {
        console.warn('Sincronización en segundo plano:', err);
      }
    })();
  }
}

// ─── Toast Notifications ──────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const iconMap = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${iconMap[type] || 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(110%)';
    toast.style.transition = 'all 0.35s ease';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}

})();
