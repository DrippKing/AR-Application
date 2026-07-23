const cart = [];
let currentProduct = null;
let currentProducts = [];
let allStoreProducts = {}; // Para almacenar todos los productos de products.json
let selectedCoupon = null;
const generatedCouponCodes = new Set();

function renderProducts(products, type) {
  return products.map((product) => {
    // Adaptar la visualización para cupones
    if (type === 'cupones') {
      return `
        <article class="store-card store-coupon-card coupon-card-btn" tabindex="0" role="button" 
          data-coupon-store="${product.tienda}" 
          data-coupon-products="${product.productos}" 
          data-coupon-discount="${product.descuento}" 
          data-coupon-price="${product.precio}" 
          data-coupon-image="${product.imagen}">
          <div class="store-coupon-badge">-${product.descuento}%</div>
          <div class="store-image store-coupon-image">
            <img src="${product.imagen}" alt="Cupón del ${product.descuento}% en ${product.tienda}" />
          </div>
          <div class="store-coupon-content">
            <h3>${product.tienda}</h3>
            <p>${product.productos} · descuento de ${product.descuento}%</p>
            <div class="store-price">${formatPrice(product.precio)}</div>
          </div>
        </article>
      `;
    }

    // Renderizado para productos normales (jerseys, balones, termos)
    return `
      <article class="store-card">
        <h3>${product.nombre}</h3>
        <button type="button" class="store-image store-product-btn" 
          data-product-type="${product.tag.toLowerCase()}" 
          data-product-name="${product.nombre}" 
          data-product-image="${product.imagen}" 
          data-product-price="${product.precio}"
          data-product-code="${product.codigo || ''}">
          <img src="${product.imagen}" alt="${product.nombre}" />
        </button>
        <div class="store-price">${formatPrice(product.precio)}</div>
      </article>
    `;
  }).join('');
}

async function loadStoreProducts() {
  const storeContent = document.getElementById('store-content');
  if (!storeContent) return;

  storeContent.innerHTML = '<div class="store-loading">Cargando productos...</div>';

  try {
    const response = await fetch('/api/products'); // Nuevo endpoint
    if (!response.ok) throw new Error('No se pudieron cargar los productos');

    allStoreProducts = await response.json(); // Guardamos todos los productos

    // currentProducts ahora será la lista de jerseys por defecto
    currentProducts = allStoreProducts.jerseys;

    storeContent.innerHTML = `
      <nav class="store-categories" aria-label="Categorías de la tienda">
        <button class="store-category-btn is-active" type="button" data-category="jerseys" aria-pressed="true">Jerseys</button>
        <button class="store-category-btn" type="button" data-category="balones" aria-pressed="false">Balones</button>
        <button class="store-category-btn" type="button" data-category="termos" aria-pressed="false">Termos</button>
        <button class="store-category-btn" type="button" data-category="cupones" aria-pressed="false">Cupones</button>
      </nav>
      <section class="store-category-view" data-category-view="jerseys">
        <div class="store-summary">Mostrando ${allStoreProducts.jerseys.length} jerseys disponibles.</div>
        <div class="store-grid">${renderProducts(allStoreProducts.jerseys, 'jersey')}</div>
      </section>
      <section class="store-category-view hidden" data-category-view="balones">
        <div class="store-summary">Mostrando ${allStoreProducts.balones.length} balones disponibles.</div>
        <div class="store-grid">${renderProducts(allStoreProducts.balones, 'balon')}</div>
      </section>
      <section class="store-category-view hidden" data-category-view="termos">
        <div class="store-summary">Mostrando ${allStoreProducts.termos.length} termos disponibles.</div>
        <div class="store-grid">${renderProducts(allStoreProducts.termos, 'termo')}</div>
      </section>
      <section class="store-category-view hidden" data-category-view="cupones">
        <div class="store-summary">Cupones de tiendas participantes.</div>
        <div class="store-grid">${renderProducts(allStoreProducts.cupones, 'cupones')}</div>
      </section>
    `;

    setupStoreEvents();
  } catch (error) {
    console.error(error);
    storeContent.innerHTML = '<div class="store-empty">No se pudieron cargar los productos. Revisa tu conexión y vuelve a intentarlo.</div>';
  }
}

function setupStoreEvents() {
  const sizeModal = document.getElementById('modal-size');
  const cartModal = document.getElementById('modal-cart');
  const cartOpenBtn = document.getElementById('cart-open-btn');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const continueBtn = document.getElementById('continue-checkout-btn');
  const confirmBtn = document.getElementById('confirm-purchase-btn');
  const addCouponToCartBtn = document.getElementById('add-coupon-to-cart-btn');
  const jerseyNameInput = document.getElementById('jersey-name');
  const closeButtons = Array.from(document.querySelectorAll('[data-close]'));

  if (jerseyNameInput) {
    jerseyNameInput.addEventListener('input', () => {
      jerseyNameInput.value = jerseyNameInput.value.toUpperCase();
    });
  }

  document.querySelectorAll('.store-category-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;

      // Actualizar currentProducts para la categoría activa
      currentProducts = allStoreProducts[category];

      document.querySelectorAll('.store-category-btn').forEach((categoryButton) => {
        const isActive = categoryButton === button;
        categoryButton.classList.toggle('is-active', isActive);
        categoryButton.setAttribute('aria-pressed', String(isActive));
      });

      document.querySelectorAll('[data-category-view]').forEach((view) => {
        view.classList.toggle('hidden', view.dataset.categoryView !== category);
      });
    });
  });

  document.querySelectorAll('.store-product-btn').forEach((button) => {
    button.addEventListener('click', (e) => {
      const productData = e.currentTarget.dataset;
      openProductModal({ // Pasamos el objeto completo del producto
        type: productData.productType,
        nombre: productData.productName,
        image: productData.productImage,
        price: Number(productData.productPrice),
        codigo: productData.productCode, // Para jerseys
      });
    });
  });

  document.querySelectorAll('.coupon-card-btn').forEach((card) => {
    const openCoupon = () => openCouponModal({
      store: card.dataset.couponStore,
      products: card.dataset.couponProducts,
      discount: card.dataset.couponDiscount,
      price: card.dataset.couponPrice,
      image: card.dataset.couponImage,
    });

    card.addEventListener('click', openCoupon);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCoupon();
      }
    });
  });

  addCouponToCartBtn?.addEventListener('click', () => {
    if (!selectedCoupon) return;

    cart.push({
      name: `Cupón ${selectedCoupon.store} - ${selectedCoupon.discount}%`,
      price: Number(selectedCoupon.price) || 0,
      quantity: 1,
      image: selectedCoupon.image,
      couponCode: selectedCoupon.code,
    });

    closeModal(document.getElementById('modal-coupon'));
    openModal(cartModal);
    renderCart();
  });

  cartOpenBtn?.addEventListener('click', () => {
    openModal(cartModal);
    renderCart();
  });

  addToCartBtn?.addEventListener('click', () => {
    const quantityInput = document.getElementById('product-quantity');
    const quantity = Math.max(1, Number(quantityInput?.value) || 1);
    const size = document.querySelector('input[name="size"]:checked')?.value || 'M';
    const jerseyName = (document.getElementById('jersey-name')?.value.trim() || 'SIN NOMBRE').toUpperCase();
    const jerseyNumber = document.getElementById('jersey-number')?.value.trim() || '00';
    if (!currentProduct) return;

    cart.push({
      name: currentProduct.nombre,
      price: currentProduct.price || 0,
      quantity,
      size: currentProduct.type === 'jersey' ? size : '',
      image: currentProduct.image,
      jerseyName: currentProduct.type === 'jersey' ? jerseyName : '',
      jerseyNumber: currentProduct.type === 'jersey' ? jerseyNumber : '',
    });

    closeModal(sizeModal);
    openModal(cartModal);
    renderCart();
  });

  continueBtn?.addEventListener('click', () => {
    showCheckoutForm();
  });

  confirmBtn?.addEventListener('click', () => {
    confirmPurchase();
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      closeModal(modal);
    });
  });

  document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });
}

function openSizeModal(product, index) {
  // Esta función ahora es un alias para jerseys
  currentProduct = {
    ...product,
    type: product.tag ? product.tag.toLowerCase() : 'jersey',
    price: product.precio,
  };

  openProductModal(currentProduct);
}

function openProductModal(product) {
  currentProduct = product;

  const sizeModal = document.getElementById('modal-size');
  const modalTitle = document.getElementById('size-title');
  const modalDescription = document.getElementById('size-description');
  const productName = document.getElementById('size-product-name');
  const productPrice = document.getElementById('size-product-price');
  const productImg = document.getElementById('size-product-img');
  const customFields = document.querySelector('.custom-fields');
  const sizeOptions = document.querySelector('.size-options');

  if (!sizeModal || !modalTitle || !modalDescription || !productName || !productPrice || !productImg) return;

  productName.textContent = currentProduct.nombre;
  productPrice.textContent = formatPrice(currentProduct.price);
  productImg.src = currentProduct.image;
  productImg.alt = currentProduct.nombre;
  modalTitle.textContent = currentProduct.type === 'jersey' ? 'Personaliza tu jersey' : 'Agrega un producto';
  modalDescription.textContent = currentProduct.type === 'jersey'
    ? 'Selecciona la talla, nombre y número antes de agregarlo al carrito.'
    : 'Selecciona cuántas unidades quieres antes de agregarlo al carrito.';
  customFields?.classList.toggle('hidden', currentProduct.type !== 'jersey');
  sizeOptions?.classList.toggle('hidden', currentProduct.type !== 'jersey');
  const quantityInput = document.getElementById('product-quantity');
  if (quantityInput) quantityInput.value = '1';

  openModal(sizeModal);
}

function openCouponModal(coupon) {
  selectedCoupon = {
    ...coupon,
    code: generateCouponCode(),
  };
  const couponModal = document.getElementById('modal-coupon');
  const couponTitle = document.getElementById('coupon-modal-title');
  const couponDetails = document.getElementById('coupon-modal-details');
  const couponCode = document.getElementById('coupon-code');

  if (!couponModal || !couponTitle || !couponDetails || !couponCode) return;

  couponTitle.textContent = `Cupón ${selectedCoupon.store}`;
  couponDetails.textContent = `${selectedCoupon.products} con ${selectedCoupon.discount}% de descuento por ${formatPrice(selectedCoupon.price)}.`;
  couponCode.textContent = selectedCoupon.code;
  openModal(couponModal);
}

function generateCouponCode() {
  const userId = localStorage.getItem('worldscan_userId') || 'guest';
  const storageKey = `worldscan_coupon_codes_${userId}`;
  let usedCodes = [];

  try {
    usedCodes = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (error) {
    usedCodes = [];
  }

  const usedCodeSet = new Set(usedCodes);
  let code = '';
  do {
    code = String(Math.floor(1000000000000000 + Math.random() * 9000000000000000));
  } while (usedCodeSet.has(code) || generatedCouponCodes.has(code));

  usedCodes.push(code);
  generatedCouponCodes.add(code);
  localStorage.setItem(storageKey, JSON.stringify(usedCodes));
  return code;
}

function openModal(modal) {
  if (!modal) return;
  document.body.classList.add('no-scroll');
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  const anyModalOpen = document.querySelector('.modal:not(.hidden)');
  if (!anyModalOpen) {
    document.body.classList.remove('no-scroll');
  }
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartTotalRow = document.getElementById('cart-total-row');
  const checkoutStep = document.getElementById('checkout-step');
  const checkoutTotal = document.getElementById('checkout-total');
  const shippingForm = document.getElementById('shipping-form');
  const purchaseSuccess = document.getElementById('purchase-success');

  if (!cartItems || !cartEmpty || !cartTotalRow || !checkoutStep || !checkoutTotal || !shippingForm || !purchaseSuccess) return;

  cartItems.innerHTML = '';
  purchaseSuccess.classList.add('hidden');
  shippingForm.classList.add('hidden');

  if (cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartTotalRow.classList.add('hidden');
    checkoutStep.classList.add('hidden');
    return;
  }

  cartEmpty.classList.add('hidden');
  cartTotalRow.classList.remove('hidden');
  checkoutStep.classList.remove('hidden');

  let total = 0;

  cart.forEach((item, index) => {
    const quantity = item.quantity || 1;
    total += item.price * quantity;
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p>Unidades: ${quantity}</p>
        ${item.size ? `<p>Talla: ${item.size}</p>` : ''}
        ${item.couponCode ? `<p>Código: <strong>${item.couponCode}</strong></p>` : ''}
        <p>${formatPrice(item.price * quantity)}</p>
      </div>
      <button class="secondary-btn cart-remove-btn" type="button" data-index="${index}">Eliminar</button>
    `;
    cartItems.appendChild(itemElement);
  });

  document.getElementById('cart-total-price').textContent = formatPrice(total);
  checkoutTotal.textContent = formatPrice(total);

  document.querySelectorAll('.cart-remove-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      cart.splice(index, 1);
      renderCart();
    });
  });
}

function showCheckoutStep() {
  const checkoutStep = document.getElementById('checkout-step');
  if (!checkoutStep) return;
  checkoutStep.classList.remove('hidden');
}

function showCheckoutForm() {
  const checkoutStep = document.getElementById('checkout-step');
  const shippingForm = document.getElementById('shipping-form');
  if (!checkoutStep || !shippingForm) return;

  checkoutStep.classList.add('hidden');
  shippingForm.classList.remove('hidden');
}

function confirmPurchase() {
  const name = document.getElementById('shipping-name').value.trim();
  const address = document.getElementById('shipping-address').value.trim();
  const city = document.getElementById('shipping-city').value.trim();
  const state = document.getElementById('shipping-state').value.trim();
  const zip = document.getElementById('shipping-zip').value.trim();
  const phone = document.getElementById('shipping-phone').value.trim();
  const purchaseSuccess = document.getElementById('purchase-success');
  const shippingForm = document.getElementById('shipping-form');
  const cartTotalRow = document.getElementById('cart-total-row');
  const checkoutStep = document.getElementById('checkout-step');
  const couponCodes = cart
    .filter((item) => item.couponCode)
    .map((item) => item.couponCode);
  const couponMessage = couponCodes.length > 0
    ? ` Códigos activados para canjearlos en tiendas participantes: ${couponCodes.join(', ')}.`
    : '';

  if (!name || !address || !city || !state || !zip || !phone) {
    alert('Por favor completa todos los campos de envío.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  if (purchaseSuccess) {
    purchaseSuccess.classList.remove('hidden');
    purchaseSuccess.textContent = `Compra confirmada. Total pagado: ${formatPrice(total)}. Envío a: ${name}, ${address}, ${city}, ${state}, ${zip}.${couponMessage}`;
  }

  if (shippingForm) shippingForm.classList.add('hidden');
  if (cartTotalRow) cartTotalRow.classList.add('hidden');
  if (checkoutStep) checkoutStep.classList.add('hidden');
  cart.length = 0;
  selectedCoupon = null;
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `${value.toLocaleString()} pts`;
  }
  const num = Number(value) || 0;
  return `${num.toLocaleString()} pts`;
}


function getStoreImage(code) {
  // Esta función ya no es necesaria si la imagen viene en el JSON, pero se mantiene como fallback.
  return code ? `./assets/jerseys/${code}.png` : './assets/trionda_ball.png';
}

loadStoreProducts();
