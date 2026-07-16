const cart = [];
let currentProduct = null;
let currentProducts = [];

async function loadStoreProducts() {
  const storeContent = document.getElementById('store-content');
  if (!storeContent) return;

  storeContent.innerHTML = '<div class="store-loading">Cargando productos...</div>';

  try {
    const response = await fetch('/api/paises');
    if (!response.ok) throw new Error('No se pudieron cargar los productos');

    const paises = await response.json();
    const pricesResponse = await fetch('/jerseys.json');
    if (!pricesResponse.ok) throw new Error('No se pudieron cargar los precios de jerseys');
    const jerseyPrices = await pricesResponse.json();

    currentProducts = paises.map((pais) => ({
      ...pais,
      precio: jerseyPrices[pais.codigo] ?? 0,
    }));

    const cards = currentProducts.map((pais, index) => {
      return `
        <article class="store-card">
          <h3>${pais.nombre}</h3>
          <button type="button" class="store-image store-image-btn" data-index="${index}">
            <img src="${getStoreImage(pais.codigo)}" alt="${pais.nombre}" />
          </button>
          <div class="store-price">${formatPrice(pais.precio)}</div>
        </article>
      `;
    }).join('');

    storeContent.innerHTML = `
      <div class="store-summary">Mostrando ${paises.length} productos del Mundial 2026.</div>
      <div class="store-grid">${cards}</div>
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
  const finalizeBtn = document.getElementById('finalize-purchase-btn');
  const continueBtn = document.getElementById('continue-checkout-btn');
  const confirmBtn = document.getElementById('confirm-purchase-btn');
  const jerseyNameInput = document.getElementById('jersey-name');
  const closeButtons = Array.from(document.querySelectorAll('[data-close]'));

  if (jerseyNameInput) {
    jerseyNameInput.addEventListener('input', () => {
      jerseyNameInput.value = jerseyNameInput.value.toUpperCase();
    });
  }

  document.querySelectorAll('.store-image-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.index);
      openSizeModal(currentProducts[index], index);
    });
  });

  cartOpenBtn?.addEventListener('click', () => {
    openModal(cartModal);
    renderCart();
  });

  addToCartBtn?.addEventListener('click', () => {
    const size = document.querySelector('input[name="size"]:checked')?.value || 'M';
    const jerseyName = (document.getElementById('jersey-name')?.value.trim() || 'SIN NOMBRE').toUpperCase();
    const jerseyNumber = document.getElementById('jersey-number')?.value.trim() || '00';
    if (!currentProduct) return;

    cart.push({
      name: currentProduct.nombre,
      price: currentProduct.price,
      size,
      image: currentProduct.image,
      jerseyName,
      jerseyNumber,
    });

    closeModal(sizeModal);
    openModal(cartModal);
    renderCart();
  });

  finalizeBtn?.addEventListener('click', () => {
    openModal(cartModal);
    renderCart();
    showCheckoutStep();
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
  currentProduct = {
    ...product,
    price: product.precio,
    image: getStoreImage(product.codigo),
  };

  const sizeModal = document.getElementById('modal-size');
  const productName = document.getElementById('size-product-name');
  const productPrice = document.getElementById('size-product-price');
  const productImg = document.getElementById('size-product-img');

  if (!sizeModal || !productName || !productPrice || !productImg) return;

  productName.textContent = currentProduct.nombre;
  productPrice.textContent = formatPrice(currentProduct.price);
  productImg.src = currentProduct.image;
  productImg.alt = currentProduct.nombre;

  openModal(sizeModal);
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
    total += item.price;
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p>Talla: ${item.size}</p>
        <p>${formatPrice(item.price)}</p>
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

  if (!name || !address || !city || !state || !zip || !phone) {
    alert('Por favor completa todos los campos de envío.');
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if (purchaseSuccess) {
    purchaseSuccess.classList.remove('hidden');
    purchaseSuccess.textContent = `Compra confirmada. Total pagado: ${formatPrice(total)}. Envío a: ${name}, ${address}, ${city}, ${state}, ${zip}.`;
  }

  if (shippingForm) shippingForm.classList.add('hidden');
  if (cartTotalRow) cartTotalRow.classList.add('hidden');
  if (checkoutStep) checkoutStep.classList.add('hidden');
  cart.length = 0;
}

function formatPrice(value) {
  if (typeof value === 'number') {
    return `${value.toLocaleString()} pts`;
  }
  const num = Number(value) || 0;
  return `${num.toLocaleString()} pts`;
}


function getStoreImage(code) {
  // Prefer jerseys folder in assets; filenames expected to match country code (e.g., MEX.jpg)
  return `./assets/jerseys/${code}.png` || './assets/trionda_ball.png';
}

loadStoreProducts();
