/**
 * ==========================================================================
 * MERCADO PEREIRA RESILIENTE - APPLICATION LOGIC
 * Features: Supabase real-time DB, Product Grid, Category/Barrio Filters,
 * WhatsApp Direct Buy, Express Publishing with photo upload, live timestamps.
 * ==========================================================================
 */

// ─── Supabase Client Init ──────────────────────────────────────────────────
let supabase = null;
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
const TABLE = 'marketplace_products';

function initSupabase() {
  try {
    if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
  domicilio: '🛵 A Domicilio', recogida: '🏬 Recogida', ambos: '✨ Dom. / Recogida'
};

// ─── Application State ────────────────────────────────────────────────────
let productsState = [];
let currentCategory = 'all';
let currentNeighborhood = 'all';
let currentSearchTerm = '';
let currentSort = 'recent';
let selectedImageFile = null;  // Store the raw File for Supabase Storage upload
let selectedImageData = null;  // Store base64 preview for display
let isLoadingFromDB = false;

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
  showLoadingState();
  await loadProducts();
  renderProducts();
  updateStats();
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
  if (supabase) {
    try {
      isLoadingFromDB = true;
      const { data, error } = await supabase
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
  if (!supabase) return;
  try {
    const { error } = await supabase.from(TABLE).insert(DEFAULT_PRODUCTS);
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
  if (!supabase) return;

  supabase
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
  neighborhoodFilter.addEventListener('change', (e) => {
    currentNeighborhood = e.target.value;
    renderProducts();
  });
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderProducts();
  });
  categoryPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.category-pill');
    if (!pill) return;
    currentCategory = pill.dataset.category;
    categoryFilter.value = currentCategory;
    updateActiveCategoryPill(currentCategory);
    renderProducts();
  });

  openPublishModalBtn.addEventListener('click', openModal);
  closePublishModalBtn.addEventListener('click', closeModal);
  cancelPublishBtn.addEventListener('click', closeModal);
  emptyStatePublishBtn?.addEventListener('click', openModal);
  publishModal.addEventListener('click', (e) => { if (e.target === publishModal) closeModal(); });

  imageInput.addEventListener('change', handleImageSelect);
  removeImgBtn.addEventListener('click', removeImagePreview);

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

  publishForm.addEventListener('submit', handlePublishSubmit);
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
    const matchBarrio = currentNeighborhood === 'all' || item.neighborhood === currentNeighborhood;
    const q = currentSearchTerm;
    const matchSearch = !q ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.seller_name?.toLowerCase().includes(q) ||
      item.neighborhood_name?.toLowerCase().includes(q);
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
  const text = `Hola ${sellerName}, vi tu producto "${title}" (${formatCOP(price)}) publicado en *Mercado Pereira Resiliente* 🛍️. Deseo comprarlo / solicitarlo — Sector: ${neighborhoodName}. ¿Sigue disponible?`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
}

// ─── Product Card HTML ────────────────────────────────────────────────────
function createProductCardHTML(product) {
  const catLabel   = CATEGORY_LABELS[product.category] || '📦 Producto';
  const barrio     = product.neighborhood_name || NEIGHBORHOOD_LABELS[product.neighborhood] || 'Pereira';
  const delivery   = DELIVERY_LABELS[product.delivery_badge] || '🛵 A Domicilio';
  const waLink     = buildWhatsAppLink(product.seller_phone, product.seller_name, product.title, product.price, barrio);
  const callLink   = `tel:${product.seller_phone}`;
  const imgUrl     = product.image || CATEGORY_FALLBACK_IMAGES[product.category] || CATEGORY_FALLBACK_IMAGES.otros;
  const timeLabel  = timeAgo(product.created_at);

  return `
    <article class="product-card">
      <div class="product-image-box">
        <img src="${imgUrl}" alt="${product.title}" class="product-image" loading="lazy"
             onerror="this.src='${CATEGORY_FALLBACK_IMAGES.otros}'">
        <span class="badge-category">${catLabel}</span>
        <span class="badge-delivery">${delivery}</span>
        <span class="badge-neighborhood"><i class="fa-solid fa-location-dot"></i> ${barrio}</span>
      </div>

      <div class="product-card-body">
        <div class="product-seller">
          <i class="fa-solid fa-store"></i>
          <span>${product.seller_name}</span>
          <span class="time-ago">&bull; ${timeLabel}</span>
        </div>

        <h3 class="product-title">${product.title}</h3>
        <p class="product-description">${product.description || 'Sin descripción detallada.'}</p>

        <div class="product-footer">
          <div class="price-row">
            <span class="price-label">Precio Solidario:</span>
            <span class="product-price">${formatCOP(product.price)}</span>
          </div>

          <div class="action-buttons">
            <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> Comprar / Contactar
            </a>
            <a href="${callLink}" class="btn btn-call" title="Llamar al vendedor">
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
  removeImagePreview();
}

// ─── Image Upload ─────────────────────────────────────────────────────────
function handleImageSelect() {
  const file = imageInput.files[0];
  if (!file) return;
  selectedImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedImageData = e.target.result; // base64 for preview only
    imagePreview.src = selectedImageData;
    imagePreviewContainer.style.display = 'block';
    dropzone.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function removeImagePreview() {
  selectedImageData = null;
  selectedImageFile = null;
  imageInput.value = '';
  imagePreview.src = '';
  imagePreviewContainer.style.display = 'none';
  dropzone.style.display = 'flex';
}

// Upload image file to Supabase Storage and return public URL
async function uploadImageToStorage(file, productId) {
  if (!supabase || !file) return null;
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${productId}.${ext}`;
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (error) {
      console.warn('Storage upload error:', error.message);
      return null;
    }
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);
    return urlData?.publicUrl || null;
  } catch (e) {
    console.error('Error subiendo foto:', e);
    return null;
  }
}

// ─── Publish Submit ───────────────────────────────────────────────────────
async function handlePublishSubmit(e) {
  e.preventDefault();

  const sellerName    = document.getElementById('sellerName').value.trim();
  const sellerPhone   = document.getElementById('sellerPhone').value.trim();
  const title         = document.getElementById('productTitle').value.trim();
  const price         = parseFloat(document.getElementById('productPrice').value) || 0;
  const category      = document.getElementById('productCategory').value;
  const neighborhood  = document.getElementById('productNeighborhood').value;
  const deliveryBadge = document.getElementById('deliveryBadge').value;
  const description   = document.getElementById('productDescription').value.trim();

  if (!sellerName || !sellerPhone || !title || !price || !category || !neighborhood) {
    showToast('Completa todos los campos obligatorios (*).', 'error');
    return;
  }

  const submitBtn = publishForm.querySelector('.btn-submit');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publicando...';

  const productId = `prod-${Date.now()}`;

  // Step 1: Upload photo to Supabase Storage (if provided)
  let imageUrl = CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.otros;
  if (selectedImageFile && supabase) {
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo foto...';
    const uploadedUrl = await uploadImageToStorage(selectedImageFile, productId);
    if (uploadedUrl) {
      imageUrl = uploadedUrl;
      console.log('✅ Foto subida a Storage:', uploadedUrl);
    } else {
      // Fall back to base64 if storage fails (works locally but not cross-device)
      imageUrl = selectedImageData || imageUrl;
      console.warn('⚠️ Storage no disponible. La foto solo se verá localmente.');
    }
  } else if (selectedImageData && !supabase) {
    // No Supabase: use base64 (local only)
    imageUrl = selectedImageData;
  }

  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando producto...';

  const newProduct = {
    id: productId,
    title,
    description,
    price,
    category,
    neighborhood,
    neighborhood_name: NEIGHBORHOOD_LABELS[neighborhood] || 'Pereira',
    seller_name: sellerName,
    seller_phone: sellerPhone,
    delivery_badge: deliveryBadge,
    image: imageUrl,
    created_at: new Date().toISOString()
  };

  // Step 2: Save product record to Supabase DB
  let savedToCloud = false;
  if (supabase) {
    try {
      const { error } = await supabase.from(TABLE).insert([newProduct]);
      if (!error) {
        savedToCloud = true;
        console.log('✅ Producto guardado en Supabase.');
      } else {
        console.warn('Error al guardar en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error de red Supabase:', err);
    }
  }

  // Always update local state for immediate UI feedback
  productsState.unshift(newProduct);
  saveToLocalStorage();

  if (savedToCloud) {
    showToast('¡Producto publicado en Mercado Pereira! 🎉 Todos pueden verlo ya.', 'success');
  } else {
    showToast('Publicado localmente. Se sincronizará cuando la BD esté lista.', 'success');
  }

  renderProducts();
  updateStats();
  closeModal();

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar en Mercado Pereira';
}

// ─── Toast ────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i>
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
