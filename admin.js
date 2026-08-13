/**
 * ==========================================================================
 * LA VITRINA PEREIRANA - ADMIN DASHBOARD LOGIC
 * Dedicated Admin Route: /admin.html
 * ==========================================================================
 */

(function () {
  'use strict';

  // ─── Config & Constants ──────────────────────────────────────────────────
  let supabaseClient = null;
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
  const TABLE = 'marketplace_products';
  const ADMIN_PIN = '1234';

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

  const DELIVERY_LABELS = {
    domicilio: '🛵 A Domicilio', recogida: '🏬 Punto Físico / Recogida'
  };

  // ─── App State ────────────────────────────────────────────────────────────
  let productsState = [];
  let selectedFilesList = [];
  let selectedImagesBase64 = [];
  let editingProductId = null;
  let pendingDeleteId = null;
  let adminSearchTerm = '';
  let adminCategory = 'all';

  // ─── DOM References ───────────────────────────────────────────────────────
  const loginSection              = document.getElementById('loginSection');
  const dashboardSection          = document.getElementById('dashboardSection');
  const adminLoginForm            = document.getElementById('adminLoginForm');
  const logoutBtn                 = document.getElementById('logoutBtn');
  const adminTableBody            = document.getElementById('adminTableBody');
  const adminCardsGrid            = document.getElementById('adminCardsGrid');
  const adminTotalCount           = document.getElementById('adminTotalCount');
  const adminSellersCount         = document.getElementById('adminSellersCount');
  const adminSearchInput          = document.getElementById('adminSearchInput');
  const adminCategorySelect       = document.getElementById('adminCategorySelect');
  const adminProductModal         = document.getElementById('adminProductModal');
  const openAdminPublishModalBtn  = document.getElementById('openAdminPublishModalBtn');
  const closeAdminProductModalBtn = document.getElementById('closeAdminProductModalBtn');
  const cancelAdminProductBtn     = document.getElementById('cancelAdminProductBtn');
  const adminProductForm          = document.getElementById('adminProductForm');
  const adminImageInput           = document.getElementById('adminImageInput');
  const adminDropzone             = document.getElementById('adminDropzone');
  const adminImagePreviewGrid     = document.getElementById('adminImagePreviewGrid');
  const adminProductPriceInput    = document.getElementById('adminProductPrice');
  const deleteConfirmModal        = document.getElementById('deleteConfirmModal');
  const deleteConfirmText         = document.getElementById('deleteConfirmText');
  const confirmDeleteBtn          = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn           = document.getElementById('cancelDeleteBtn');

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    initSupabase();
    setupEventListeners();
    checkAuth();
    if (isAuthenticated()) {
      await loadProducts();
      renderAdminView();
    }
  });

  function initSupabase() {
    try {
      if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase conectado en Admin.');
      }
    } catch (e) {
      console.error('Error init Supabase:', e);
    }
  }

  function isAuthenticated() {
    return sessionStorage.getItem('pereira_admin_logged') === 'true';
  }

  function checkAuth() {
    if (isAuthenticated()) {
      if (loginSection) loginSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    } else {
      if (loginSection) loginSection.style.display = 'flex';
      if (dashboardSection) dashboardSection.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }

  // ─── Event Listeners ──────────────────────────────────────────────────────
  function setupEventListeners() {
    // Login submit
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('adminPinInput').value.trim();
        if (pin === ADMIN_PIN) {
          sessionStorage.setItem('pereira_admin_logged', 'true');
          showToast('🔓 Sesión de Administrador iniciada', 'success');
          checkAuth();
          loadProducts().then(() => renderAdminView());
        } else {
          showToast('Clave PIN incorrecta. Intenta con 1234.', 'error');
        }
      });
    }

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('pereira_admin_logged');
        showToast('🔒 Sesión de Administrador cerrada', 'success');
        checkAuth();
      });
    }

    // Price dots formatting
    if (adminProductPriceInput) {
      adminProductPriceInput.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/\D/g, '');
        if (raw) {
          e.target.value = new Intl.NumberFormat('es-CO').format(parseInt(raw, 10));
        } else {
          e.target.value = '';
        }
      });
    }

    // Search and category filter
    if (adminSearchInput) {
      adminSearchInput.addEventListener('input', (e) => {
        adminSearchTerm = e.target.value.toLowerCase().trim();
        renderAdminView();
      });
    }

    if (adminCategorySelect) {
      adminCategorySelect.addEventListener('change', (e) => {
        adminCategory = e.target.value;
        renderAdminView();
      });
    }

    // Modals
    if (openAdminPublishModalBtn) openAdminPublishModalBtn.addEventListener('click', () => openAdminModal());
    if (closeAdminProductModalBtn) closeAdminProductModalBtn.addEventListener('click', () => closeAdminModal());
    if (cancelAdminProductBtn) cancelAdminProductBtn.addEventListener('click', () => closeAdminModal());
    if (adminProductModal) {
      adminProductModal.addEventListener('click', (e) => {
        if (e.target === adminProductModal) closeAdminModal();
      });
    }

    // Custom Delete Confirm Modal
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => closeDeleteConfirmModal());
    if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', () => executePendingDelete());
    if (deleteConfirmModal) {
      deleteConfirmModal.addEventListener('click', (e) => {
        if (e.target === deleteConfirmModal) closeDeleteConfirmModal();
      });
    }

    // Image Upload
    if (adminImageInput) adminImageInput.addEventListener('change', handleImageSelect);
    if (adminDropzone) {
      adminDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        adminDropzone.style.borderColor = 'var(--pereira-yellow)';
      });
      adminDropzone.addEventListener('dragleave', () => {
        adminDropzone.style.borderColor = 'rgba(255, 199, 44, 0.4)';
      });
      adminDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        adminDropzone.style.borderColor = 'rgba(255, 199, 44, 0.4)';
        if (e.dataTransfer.files?.[0]) {
          adminImageInput.files = e.dataTransfer.files;
          handleImageSelect();
        }
      });
    }

    if (adminProductForm) adminProductForm.addEventListener('submit', handleAdminProductSubmit);

    // Global event delegation for Edit & Delete buttons (works on both table and mobile cards)
    document.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-admin-edit');
      const deleteBtn = e.target.closest('.btn-admin-delete');

      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = editBtn.dataset.id;
        openAdminModal(id);
      } else if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = deleteBtn.dataset.id;
        promptDeleteProduct(id);
      }
    });
  }

  // ─── Data Loading ─────────────────────────────────────────────────────────
  async function loadProducts() {
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from(TABLE)
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          productsState = data;
          console.log(`✅ ${data.length} productos cargados desde Supabase.`);
        } else {
          loadFromLocalStorage();
        }
      } catch (e) {
        loadFromLocalStorage();
      }
    } else {
      loadFromLocalStorage();
    }
  }

  function loadFromLocalStorage() {
    const saved = localStorage.getItem('pereira_marketplace_products');
    if (saved) {
      try { productsState = JSON.parse(saved); } catch { productsState = []; }
    } else {
      productsState = [];
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem('pereira_marketplace_products', JSON.stringify(productsState));
  }

  // ─── Render View (Table + Mobile Cards) ──────────────────────────────────
  function renderAdminView() {
    let filtered = productsState.filter(item => {
      const matchCat = adminCategory === 'all' || item.category === adminCategory;
      const q = adminSearchTerm;
      const matchSearch = !q ||
        item.title?.toLowerCase().includes(q) ||
        item.seller_name?.toLowerCase().includes(q) ||
        (item.neighborhood_name || item.neighborhood || '')?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    // Update stats
    if (adminTotalCount) adminTotalCount.textContent = productsState.length;
    const sellers = new Set(productsState.map(p => (p.seller_name || '').toLowerCase().trim()));
    if (adminSellersCount) adminSellersCount.textContent = sellers.size;

    // Render Table (Desktop)
    if (adminTableBody) {
      if (filtered.length === 0) {
        adminTableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No se encontraron publicaciones.
            </td>
          </tr>
        `;
      } else {
        adminTableBody.innerHTML = filtered.map(item => {
          const img = (item.images && item.images[0]) || item.image || CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.otros;
          const cat = CATEGORY_LABELS[item.category] || '📦 Producto';
          const barrio = item.neighborhood_name || item.neighborhood || 'Pereira';
          const delivery = DELIVERY_LABELS[item.delivery_badge] || '🛵 A Domicilio';

          return `
            <tr>
              <td>
                <div class="admin-product-cell">
                  <img src="${img}" alt="${item.title}" class="admin-thumb" onerror="this.src='${CATEGORY_FALLBACK_IMAGES.otros}'">
                  <div>
                    <strong class="admin-prod-title">${item.title}</strong>
                    <span class="admin-prod-cat">${cat}</span>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <strong>${item.seller_name || 'Vendedor'}</strong><br>
                  <a href="https://wa.me/57${(item.seller_phone || '').replace(/\D/g, '')}" target="_blank" style="color:var(--whatsapp-green);font-size:0.82rem;text-decoration:underline;">
                    <i class="fa-brands fa-whatsapp"></i> ${item.seller_phone || 'Sin cel'}
                  </a>
                </div>
              </td>
              <td><i class="fa-solid fa-location-dot" style="color:var(--pereira-yellow);"></i> ${barrio}</td>
              <td><strong style="color:var(--pereira-yellow);">${formatCOP(item.price)}</strong></td>
              <td><span class="badge-delivery">${delivery}</span></td>
              <td style="text-align: right;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                  <button type="button" class="btn-admin-edit" data-id="${item.id}" title="Editar publicación">
                    <i class="fa-solid fa-pen-to-square"></i> Editar
                  </button>
                  <button type="button" class="btn-admin-delete" data-id="${item.id}" title="Eliminar publicación">
                    <i class="fa-solid fa-trash-can"></i> Eliminar
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Render Cards Grid (Mobile View)
    if (adminCardsGrid) {
      if (filtered.length === 0) {
        adminCardsGrid.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-muted);">No hay publicaciones que coincidan.</div>`;
      } else {
        adminCardsGrid.innerHTML = filtered.map(item => {
          const img = (item.images && item.images[0]) || item.image || CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.otros;
          const cat = CATEGORY_LABELS[item.category] || '📦 Producto';
          const barrio = item.neighborhood_name || item.neighborhood || 'Pereira';

          return `
            <div class="admin-mobile-card">
              <div class="admin-mobile-card-top">
                <img src="${img}" alt="${item.title}" class="admin-thumb-lg" onerror="this.src='${CATEGORY_FALLBACK_IMAGES.otros}'">
                <div class="admin-mobile-meta">
                  <span class="badge-category" style="position:static;display:inline-block;margin-bottom:0.3rem;">${cat}</span>
                  <h3 class="admin-prod-title">${item.title}</h3>
                  <div class="product-price" style="font-size:1.2rem;">${formatCOP(item.price)}</div>
                  <div style="font-size:0.82rem;color:var(--text-secondary);margin-top:0.2rem;">
                    <i class="fa-solid fa-store"></i> ${item.seller_name || 'Vendedor'} &bull; <i class="fa-solid fa-location-dot"></i> ${barrio}
                  </div>
                </div>
              </div>

              <div class="admin-card-actions" style="margin-top:0.8rem;">
                <button type="button" class="btn-admin-edit" data-id="${item.id}">
                  <i class="fa-solid fa-pen-to-square"></i> Editar
                </button>
                <button type="button" class="btn-admin-delete" data-id="${item.id}">
                  <i class="fa-solid fa-trash-can"></i> Eliminar
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function formatCOP(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(amount || 0);
  }

  // ─── Custom Delete Confirm Modal ──────────────────────────────────────────
  function promptDeleteProduct(id) {
    const product = productsState.find(p => String(p.id) === String(id));
    if (!product) return;

    pendingDeleteId = id;
    if (deleteConfirmText) {
      deleteConfirmText.textContent = `¿Estás seguro de eliminar permanentemente "${product.title}"? Esta acción no se puede deshacer.`;
    }

    if (deleteConfirmModal) {
      deleteConfirmModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDeleteConfirmModal() {
    pendingDeleteId = null;
    if (deleteConfirmModal) {
      deleteConfirmModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async function executePendingDelete() {
    if (!pendingDeleteId) return;
    const targetId = pendingDeleteId;
    closeDeleteConfirmModal();

    // Remove from Supabase
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.from(TABLE).delete().eq('id', targetId);
        if (error) console.warn('Supabase delete error:', error.message);
      } catch (e) {
        console.error('Error delete Supabase:', e);
      }
    }

    // Remove from local state & storage
    productsState = productsState.filter(p => String(p.id) !== String(targetId));
    saveToLocalStorage();
    renderAdminView();
    showToast('Publicación eliminada correctamente.', 'success');
  }

  // ─── Modal & Form Operations ──────────────────────────────────────────────
  function openAdminModal(id = null) {
    editingProductId = id ? String(id) : null;
    const heading = document.getElementById('adminModalHeading');

    if (editingProductId) {
      const product = productsState.find(p => String(p.id) === String(editingProductId));
      if (!product) {
        showToast('No se encontró la publicación a editar.', 'error');
        return;
      }

      if (heading) heading.textContent = 'Editar Publicación';
      document.getElementById('adminSellerName').value = product.seller_name || '';
      document.getElementById('adminSellerPhone').value = product.seller_phone || '';
      document.getElementById('adminProductTitle').value = product.title || '';
      document.getElementById('adminProductPrice').value = new Intl.NumberFormat('es-CO').format(product.price || 0);
      document.getElementById('adminProductCategory').value = product.category || '';
      document.getElementById('adminProductNeighborhood').value = product.neighborhood_name || product.neighborhood || '';
      document.getElementById('adminDeliveryBadge').value = product.delivery_badge || 'domicilio';
      document.getElementById('adminProductDescription').value = product.description || '';

      selectedFilesList = [];
      selectedImagesBase64 = product.images || (product.image ? [product.image] : []);
      renderImagePreviews();
    } else {
      if (heading) heading.textContent = 'Publicar Nuevo Producto (Admin)';
      if (adminProductForm) adminProductForm.reset();
      selectedFilesList = [];
      selectedImagesBase64 = [];
      renderImagePreviews();
    }

    if (adminProductModal) {
      adminProductModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAdminModal() {
    if (adminProductModal) {
      adminProductModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (adminProductForm) adminProductForm.reset();
    editingProductId = null;
    selectedFilesList = [];
    selectedImagesBase64 = [];
    renderImagePreviews();
  }

  // ─── Image Upload Handling ────────────────────────────────────────────────
  function handleImageSelect() {
    if (!adminImageInput || !adminImageInput.files) return;
    const files = Array.from(adminImageInput.files);
    if (files.length === 0) return;

    if (selectedFilesList.length + files.length > 3) {
      showToast('Puedes subir como máximo 3 fotografías por producto.', 'error');
    }

    const remaining = 3 - selectedFilesList.length;
    const filesToAdd = files.slice(0, remaining);

    filesToAdd.forEach(file => {
      selectedFilesList.push(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImagesBase64.push(e.target.result);
        renderImagePreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderImagePreviews() {
    if (!adminImagePreviewGrid) return;

    if (selectedImagesBase64.length === 0) {
      adminImagePreviewGrid.style.display = 'none';
      adminImagePreviewGrid.innerHTML = '';
      if (adminDropzone) adminDropzone.style.display = 'flex';
      return;
    }

    adminImagePreviewGrid.style.display = 'grid';
    adminImagePreviewGrid.innerHTML = selectedImagesBase64.map((src, index) => `
      <div class="preview-thumb-card">
        <img src="${src}" alt="Foto ${index + 1}">
        <button type="button" class="btn-remove-thumb" data-index="${index}" title="Eliminar foto">&times;</button>
      </div>
    `).join('');

    if (selectedFilesList.length >= 3) {
      if (adminDropzone) adminDropzone.style.display = 'none';
    } else {
      if (adminDropzone) adminDropzone.style.display = 'flex';
    }

    adminImagePreviewGrid.querySelectorAll('.btn-remove-thumb').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index, 10);
        selectedFilesList.splice(idx, 1);
        selectedImagesBase64.splice(idx, 1);
        if (adminImageInput) adminImageInput.value = '';
        renderImagePreviews();
      });
    });
  }

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
        console.error('Error upload:', e);
      }
    }
    return urls;
  }

  // ─── Submit Form ──────────────────────────────────────────────────────────
  async function handleAdminProductSubmit(e) {
    e.preventDefault();

    const sellerName      = document.getElementById('adminSellerName').value.trim();
    const sellerPhone     = document.getElementById('adminSellerPhone').value.trim();
    const title           = document.getElementById('adminProductTitle').value.trim();
    const priceRaw        = document.getElementById('adminProductPrice').value.replace(/\D/g, '');
    const price           = parseFloat(priceRaw) || 0;
    const category        = document.getElementById('adminProductCategory').value;
    const neighborhoodStr = document.getElementById('adminProductNeighborhood').value.trim();
    const deliveryBadge   = document.getElementById('adminDeliveryBadge').value;
    const description     = document.getElementById('adminProductDescription').value.trim();

    if (!sellerName || !sellerPhone || !title || !price || !category || !neighborhoodStr) {
      showToast('Completa todos los campos obligatorios (*).', 'error');
      return;
    }

    const submitBtn = document.getElementById('submitAdminProductBtn');
    const isEditing = Boolean(editingProductId);
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${isEditing ? 'Guardando...' : 'Publicando...'}`;

    const productId = editingProductId || `prod-${Date.now()}`;

    let imageUrls = selectedImagesBase64.length > 0 ? [...selectedImagesBase64] : [CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.otros];

    if (selectedFilesList.length > 0 && supabaseClient) {
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo fotos...';
      const uploadedUrls = await uploadImagesToStorage(selectedFilesList, productId);
      if (uploadedUrls && uploadedUrls.length > 0) {
        imageUrls = uploadedUrls;
      }
    }

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
      created_at: isEditing ? (productsState.find(p => String(p.id) === String(productId))?.created_at || new Date().toISOString()) : new Date().toISOString()
    };

    // Save/Update in Supabase
    if (supabaseClient) {
      try {
        if (isEditing) {
          await supabaseClient.from(TABLE).update(productData).eq('id', productId);
        } else {
          await supabaseClient.from(TABLE).insert([productData]);
        }
      } catch (err) {
        console.error('Error Supabase submit:', err);
      }
    }

    // Update local state
    if (isEditing) {
      const idx = productsState.findIndex(p => String(p.id) === String(productId));
      if (idx !== -1) productsState[idx] = productData;
    } else {
      productsState.unshift(productData);
    }

    saveToLocalStorage();
    showToast(isEditing ? '¡Publicación actualizada correctamente!' : '¡Producto publicado!', 'success');
    renderAdminView();
    closeAdminModal();

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
  }

  // ─── Toast ────────────────────────────────────────────────────────────────
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
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

})();
