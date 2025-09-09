
document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('card-container');
  const categoryContainer = document.getElementById('category-container');
  const cartList = document.getElementById('cart-list');

  // cart state
  const cart = {};

  // Delegated cart add
  cardContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-btn')) {
      const cardBody = e.target.closest('.card-body');
      if (!cardBody) return;
      const treeNameElement = cardBody.querySelector('.card-title');
      const treePriceElement = cardBody.querySelector('.tree-price');
      if (!treeNameElement || !treePriceElement) return;
      const treeName = treeNameElement.innerText.trim();
      const treePrice = parseFloat(treePriceElement.innerText.replace(/[^\d.]/g, '')) || 0;
      if (!cart[treeName]) cart[treeName] = { price: treePrice, quantity: 1 };
      else cart[treeName].quantity += 1;
      updateCartDisplay();
    }
  });

  function updateCartDisplay() {
    let total = 0;
    let cartHtml = "";
    for (const name in cart) {
      if (!Object.prototype.hasOwnProperty.call(cart, name)) continue;
      const item = cart[name];
      const itemSubtotal = item.price * item.quantity;
      total += itemSubtotal;
      cartHtml += `
        <div class="cart-item flex justify-between items-center bg-[#F0FDF4] p-4 mb-2 rounded-lg" data-name="${name}">
          <div>
            <span class="text-xl font-semibold">${name}</span>
            <p><i class="fa-solid fa-bangladeshi-taka-sign"></i>${item.price.toFixed(2)} &times; ${item.quantity}</p>
          </div>
          <div>
            <button class="cross-btn text-red-600 p-2" aria-label="remove ${name}"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      `;
    }

    if (total > 0) {
      cartHtml += `
        <div class="flex justify-between text-2xl font-thin p-4">
          <p><strong>Total:</strong></p>
          <p class="font-thin"><strong><i class="fa-solid fa-bangladeshi-taka-sign"></i>${total.toFixed(2)}</strong></p>
        </div>
      `;
    } else {
      cartHtml = `<li>Cart is empty.</li>`;
    }

    cartList.innerHTML = cartHtml;
  }

  // Delegated remove button on cartList
  cartList.addEventListener('click', (e) => {
    const btn = e.target.closest('.cross-btn');
    if (!btn) return;
    const itemEl = btn.closest('.cart-item');
    if (!itemEl) return;
    const name = itemEl.dataset.name;
    if (name && cart[name]) {
      delete cart[name];
      updateCartDisplay();
    }
  });

  // Load categories
  const loadCategory = () => {
    fetch("https://openapi.programming-hero.com/api/categories")
      .then((res) => res.json())
      .then((data) => {
        const categories = data.categories || [];
        showCategory(categories);
      })
      .catch(err => {
        console.error('Failed to load categories:', err);
      });
  };

  // Render categories
  const showCategory = (categories) => {
    // keep a clean container and add "All Trees" first
    categoryContainer.innerHTML = '';
    const allSpan = document.createElement('span');
    allSpan.className = 'category-btn hover:bg-green-700 hover:text-white p-1 cursor-pointer rounded inline-block';
    allSpan.dataset.id = 'all';
    allSpan.textContent = 'All Trees';
    allSpan.classList.add('bg-green-700','text-white');
    categoryContainer.appendChild(allSpan);

    categories.forEach(category => {
      const span = document.createElement('span');
      span.className = 'category-btn hover:bg-green-700 hover:text-white p-1 cursor-pointer rounded inline-block';
      span.dataset.id = category.id ?? category.category_id ?? category._id ?? category.id;
      span.textContent = category.category_name ?? category.name ?? 'Unknown';
      categoryContainer.appendChild(span);
    });
  };

  // Delegated category clicks: toggle active and load relevant cards
  categoryContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    // remove active only from category buttons inside the container
    categoryContainer.querySelectorAll('.category-btn').forEach(s => s.classList.remove('bg-green-700','text-white'));
    btn.classList.add('bg-green-700','text-white');

    const categoryId = btn.dataset.id;
    if (!categoryId || categoryId === 'all') {
      loadCards();
    } else {
      loadPlantsByCategory(categoryId);
    }
  });

  // Show plants/cards for a category (tree name is clickable and opens modal)
  const showPlantsByCategory = (plants) => {
    const container = document.querySelector('#card-container');
    if (!container) {
      console.error('The card container element was not found.');
      return;
    }
    container.innerHTML = "";
    plants.forEach(plant => {
      container.innerHTML += `
        <div class="card shadow-sm bg-white card-body space-y-2 ">
          <figure><img class="w-full h-48 object-cover" src="${plant.image}" alt="${plant.name}" /></figure>
          <div class="card-body">
            <h2 class="card-title open-modal cursor-pointer" data-title="${plant.name}" data-image="${plant.image}" data-desc="${(plant.description||'')}" data-price="${plant.price ?? 0}">${plant.name}</h2>
            <p class="p-1">${plant.description || ''}</p>
            <div class="flex justify-between items-center">
              <button class="btn btn-outline text-green-800 border-none rounded-4xl bg-[#F0FDF4]">${plant.category || ''}</button>
              <span class="font-bold text-lg tree-price"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${plant.price ?? 0}</span>
            </div>
            <button class="btn bg-green-700 rounded-3xl text-white cart-btn">Add to Cart</button>
          </div>
        </div>
      `;
    });
  };

  // Fetch plants by categoryId (fixed variable usage)
  const loadPlantsByCategory = (categoryId) => {
    // ensure categoryId is provided
    if (!categoryId) return;
    fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
      .then(res => res.json())
      .then(data => {
        const plants = data.plants || data.data || [];
        showPlantsByCategory(plants);
      })
      .catch(err => console.error('Error fetching plants:', err));
  };

  // Load all plant cards
  const loadCards = () => {
    fetch("https://openapi.programming-hero.com/api/plants")
      .then((res) => res.json())
      .then((data) => {
        const cards = data.plants || data.data || [];
        showCard(cards);
      })
      .catch(err => console.error('Failed to load cards:', err));
  };

  const showCard = (cards) => {
    const cardContainerLocal = document.getElementById('card-container');
    cardContainerLocal.innerHTML = "";
    cards.forEach(card => {
      cardContainerLocal.innerHTML += `
        <div class="card shadow-sm bg-white card-body space-y-2 p-2">
          <figure><img class="w-full h-48 object-cover" src="${card.image}" alt="${card.name}" /></figure>
          <div class="card-body">
            <h2 class="card-title open-modal cursor-pointer" data-title="${card.name}" data-image="${card.image}" data-desc="${(card.description||'')}" data-price="${card.price ?? 0}">${card.name}</h2>
            <p class="p-1">${card.description || ''}</p>
            <div class="flex justify-between items-center">
              <button class="btn btn-outline text-green-800 border-none rounded-4xl bg-[#F0FDF4]">${card.category || ''}</button>
              <span class="font-bold text-lg tree-price"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${card.price ?? 0}</span>
            </div>
            <button class="btn bg-green-700 rounded-3xl text-white cart-btn">Add to Cart</button>
          </div>
        </div>
      `;
    });
  };

  // Modal elements (now inside DOMContentLoaded)
  const modal = document.getElementById('detail-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalImage = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-desc');
  const modalCloseBtn = document.getElementById('modal-close');

  // Delegated modal open
  document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.open-modal');
    if (!btn) return;
    const title = btn.dataset.title || '';
    const img = btn.dataset.image || '';
    const desc = btn.dataset.desc || '';
    const priceVal = btn.dataset.price ?? '';

    if (modalTitle) modalTitle.textContent = title;
    if (modalImage) modalImage.src = img;

    if (modalDesc) {
      // render description and price on separate lines; escape user data
      const descHtml = desc ? `<div>${escapeHtml(desc)}</div>` : '';
      const priceHtml = priceVal ? `<div class="mt-2 text-lg font-semibold"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${escapeHtml(priceVal)}</div>` : '';
      modalDesc.innerHTML = descHtml + priceHtml;
    }

    // ensure dialog is visually centered (works whether showModal supported or not)
    if (modal) {
      modal.style.position = 'fixed';
      modal.style.left = '50%';
      modal.style.top = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      try {
        if (typeof modal.showModal === 'function') modal.showModal();
        else modal.classList.remove('hidden');
      } catch (err) {
        modal.classList.remove('hidden');
      }
    }
  });

  // simple HTML escaper to avoid injection when using innerHTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // close handlers
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => modal?.close?.());
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.close?.();
    });
  }

  // initial loads
  loadCards();
  loadCategory();
});
