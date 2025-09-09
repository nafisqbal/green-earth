document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.getElementById('card-container');
  const categoryContainer = document.getElementById('category-container');
  const chipsContainer = document.getElementById('category-chips'); // new: chips target
  const cartList = document.getElementById('cart-list');

  // cart state
  const cart = {};

  // Delegated cart add
  cardContainer.addEventListener('click', function(e) {
    const addBtn = e.target.closest('.cart-btn');
    if (!addBtn) return;
    // find the card wrapper (cards are rendered with class "card")
    const cardEl = addBtn.closest('.card') || addBtn.closest('[data-card]') || addBtn.parentElement;
    if (!cardEl) return;
    const treeNameElement = cardEl.querySelector('.card-title');
    const treePriceElement = cardEl.querySelector('.tree-price');
    if (!treeNameElement || !treePriceElement) return;
    const treeName = treeNameElement.innerText.trim();
    const treePrice = parseFloat(treePriceElement.innerText.replace(/[^\d.]/g, '')) || 0;
    if (!cart[treeName]) cart[treeName] = { price: treePrice, quantity: 1 };
    else cart[treeName].quantity += 1;
    updateCartDisplay();
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
          <div class="min-w-0">
            <span class="text-xl font-semibold block truncate">${name}</span>
            <p class="whitespace-nowrap"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${item.price.toFixed(2)} &times; ${item.quantity}</p>
          </div>
          <div>
            <button class="cross-btn text-red-600 p-2" aria-label="remove ${name}"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
      `;
    }

    if (total > 0) {
      cartHtml += `
        <div class="flex justify-between items-center text-2xl font-thin p-4 flex-nowrap">
          <p class="whitespace-nowrap"><strong>Total:</strong></p>
          <p class="whitespace-nowrap font-thin"><strong><i class="fa-solid fa-bangladeshi-taka-sign"></i>${total.toFixed(2)}</strong></p>
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

  // Render categories -> populate the chips container (keeps heading intact)
  const showCategory = (categories) => {
    const chips = chipsContainer || categoryContainer.querySelector('div') || categoryContainer;
    chips.innerHTML = '';

    // All Trees (default NOT selected)
    const allSpan = document.createElement('span');
    allSpan.className = 'category-chip inline-block bg-white border rounded-full px-3 py-1 mr-2 md:mr-0 cursor-pointer whitespace-nowrap md:block md:w-full';
    allSpan.dataset.id = 'all';
    allSpan.textContent = 'All Trees';
    chips.appendChild(allSpan);

    categories.forEach(category => {
      const span = document.createElement('span');
      span.className = 'category-chip inline-block bg-white border rounded-full px-3 py-1 mr-2 md:mr-0 cursor-pointer whitespace-nowrap md:block md:w-full';
      span.dataset.id = category.id ?? category.category_id ?? category._id ?? category.id;
      span.textContent = category.category_name ?? category.name ?? 'Unknown';
      chips.appendChild(span);
    });
  };

  // Delegated category clicks: use .category-chip selector (not every span)
  categoryContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.category-chip');
    if (!btn) return;

    // Reset all chips to default (white) then activate the clicked one as green
    const allChips = (chipsContainer || categoryContainer).querySelectorAll('.category-chip');
    allChips.forEach(s => {
      s.classList.remove('bg-green-700', 'text-white');
      s.classList.add('bg-white');
    });

    // Make clicked chip green and remove the white class so green shows
    btn.classList.remove('bg-white');
    btn.classList.add('bg-green-700', 'text-white');

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
        <div class="card overflow-hidden shadow-sm bg-white h-full flex flex-col">
          <figure class="mb-0"><img class="card-image w-full" src="${plant.image}" alt="${plant.name}" /></figure>
          <div class="p-3 flex flex-col flex-1">
            <div>
              <h2 class="card-title open-modal cursor-pointer text-lg font-semibold" data-title="${plant.name}" data-image="${plant.image}" data-desc="${(plant.description||'')}" data-price="${plant.price ?? 0}">${plant.name}</h2>
              <p class="text-sm text-gray-700 mt-1">${plant.description || ''}</p>
            </div>

            <!-- bottom area: stays at bottom, keeps type+price on one line -->
            <div class="mt-auto">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm text-green-800 bg-[#F0FDF4] rounded-full px-3 py-1 max-w-[60%] sm:max-w-[65%] truncate whitespace-nowrap">${plant.category || ''}</div>
                <div class="font-bold text-lg tree-price min-w-[4.5rem] text-right whitespace-nowrap"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${plant.price ?? 0}</div>
              </div>

              <button class="btn bg-green-700 rounded-3xl text-white w-full mt-3 cart-btn">Add to Cart</button>
            </div>
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
        <div class="card overflow-hidden shadow-sm bg-white h-full flex flex-col">
          <figure class="mb-0"><img class="card-image w-full" src="${card.image}" alt="${card.name}" /></figure>
          <div class="p-3 flex flex-col flex-1">
            <div>
              <h2 class="card-title open-modal cursor-pointer text-lg font-semibold" data-title="${card.name}" data-image="${card.image}" data-desc="${(card.description||'')}" data-price="${card.price ?? 0}">${card.name}</h2>
              <p class="text-sm text-gray-700 mt-1">${card.description || ''}</p>
            </div>

            <!-- bottom area: stays at bottom, keeps type+price on one line -->
            <div class="mt-auto">
              <div class="flex items-center justify-between gap-3">
                <div class="text-sm text-green-800 bg-[#F0FDF4] rounded-full px-3 py-1 max-w-[60%] sm:max-w-[65%] truncate whitespace-nowrap">${card.category || ''}</div>
                <div class="font-bold text-lg tree-price min-w-[4.5rem] text-right whitespace-nowrap"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${card.price ?? 0}</div>
              </div>

              <button class="btn bg-green-700 rounded-3xl text-white w-full mt-3 cart-btn">Add to Cart</button>
            </div>
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




