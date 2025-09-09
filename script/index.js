
const cardContainer = document.getElementById('card-container');
const categoryContainer = document.getElementById('category-container');
const cartList = document.getElementById('cart-list');
const cartBtn = document.getElementsByClassName('cart-btn');





// cart function
const cart = {};



cardContainer.addEventListener('click', function(e) {
    if (e.target.classList.contains('cart-btn')) {
        const cardBody = e.target.closest('.card-body');

        
        if (!cardBody) return; 

        // Get product details
        const treeNameElement = cardBody.querySelector('.card-title');
        const treePriceElement = cardBody.querySelector('.tree-price');

        
        if (!treeNameElement || !treePriceElement) return; 

        const treeName = treeNameElement.innerText.trim();
        
        const treePrice = parseFloat(treePriceElement.innerText.trim()) || 0; 
        if (treeName && treePrice > 0) { 
            // Add to cart logic
            if (!cart[treeName]) {
                cart[treeName] = { price: treePrice, quantity: 1 };
            } else {
                cart[treeName].quantity += 1;
            }
            updateCartDisplay();
        }
    }
});

function updateCartDisplay() {
    let total = 0;
    let cartHtml = ""; 
    for (const name in cart) {
        if (cart.hasOwnProperty(name)) { 
            const item = cart[name];
            const itemSubtotal = item.price * item.quantity;
            total += itemSubtotal;
            
            // Append the list item HTML to the string
            cartHtml += `
                <div class= "flex justify-between items-center bg-[#F0FDF4] p-4 mb-2 rounded-lg">
                <div class= "">
                   <span class= "text-xl font-semibold"> ${name} </span>
                   <p> <i class="fa-solid fa-bangladeshi-taka-sign"></i>${item.price.toFixed(2)} &times; ${item.quantity} </p>
                </div> 
                <div> 
                <span id= "cross-btn"><i class="fa-solid fa-xmark"></i></span>
                </div> 
          
                </div>
            `;
        }
    }

    // Add the total line if there are items in the cart
    if (total > 0) {
        // Use toFixed(2) for currency display
        cartHtml += `<div class= "flex justify-between text-2xl font-thin p-4">
        <p><strong>Total:</p>
        <p class= "font-thin"><strong><i class="fa-solid fa-bangladeshi-taka-sign"></i>${total.toFixed(2)}</strong></p>
        </div>

        `; 
    } else {
        cartHtml = `<li>Cart is empty.</li>`; 
    }

    // Update the DOM in a single operation for efficiency
    cartList.innerHTML = cartHtml;
}

   const crossBtns = document.querySelectorAll('.cross-btn'); // Use a class, not an ID

crossBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        
        const cart = this.parentElement.parentElement;
        cart.remove(); // This method removes the element from the DOM
    });
});





  

// load all categories

const loadCategory = () => {
  fetch("https://openapi.programming-hero.com/api/categories")
  .then((res) => res.json())
  .then((data) => {
    const categories = data.categories
    showCategory(categories)
  })

}

// show categories

 const showCategory = (categories) => {
  // categoryContainer.innerHTML = "";
  categories.forEach(category => {
    categoryContainer.innerHTML += `
    <span id="${category.id}" class=" hover:bg-green-700 hover:text-white p-1 cursor-pointer rounded category-btn">${category.category_name}</span>
            
    `
    // loadPlantsByCategory(e.target.id)
  })
 }

 categoryContainer.addEventListener('click', (e) => {
  console.log(e)
  const allSpan = document.querySelectorAll('span');
  allSpan.forEach(span => {
    span.classList.remove('bg-green-700', 'text-white');
  });

  if(e.target.localName === 'span') {
    e.target.classList.add('bg-green-700', 'text-white');
    
  }})




      // categoryContainer.addEventListener('click', (e) => {
      //   console.log(e);
      // })
//   const btn = e.target.closest('.category-btn');
//   if (!btn) return;

//   // toggle selected state — remove only from category container
//   // const allBtns = categoryContainer.querySelectorAll('.category-btn');
//   // allBtns.forEach(b => b.classList.remove('bg-green-700', 'text-white'));

//   // btn.classList.add('bg-green-700', 'text-white');

//   const categoryId = btn.dataset.id;
//   if (categoryId === 'all') {
//     loadCards(); // load all plants
//   } else {
//     loadPlantsByCategory(categoryId);
//   }
// });


const showPlantsByCategory = (plants) => {
    
    const cardContainer = document.querySelector('#card-container'); 
    if (!cardContainer) {
        console.error('The card container element was not found.');
        return;
    }

    cardContainer.innerHTML = "";
    plants.forEach(plant => {
        cardContainer.innerHTML += `
        <div class="card shadow-sm bg-white card-body space-y-2 ">
            <div class="card shadow-sm bg-white card-body space-y-2 ">
                <figure class="">
                    <img class="w-full h-48 object-cover" src="${plant.image}" alt="${plant.name}" />
                </figure>
                <div class="card-body">
                    <h2 id="tree-name" class="card-title">${plant.name}</h2>
                    <p class="p-1">${plant.description}</p>
                    <div class="flex justify-between items-center">
                        <button id="category" class="btn btn-outline text-green-800 border-none rounded-4xl bg-[#F0FDF4]">${plant.category}</button>
                        <span class="font-bold text-lg tree-price">
                            <i class="fa-solid fa-bangladeshi-taka-sign"></i>${plant.price}
                        </span>
                    </div>
                    <button class="btn bg-green-700 rounded-3xl text-white cart-btn">Add to Cart</button>
                </div>
            </div>
        </div>
        `;
    });
};

const loadPlantsByCategory = async (categoryId) => {
    console.log(categoryId);
    
    fetch(`https://openapi.programming-hero.com/api/category/${id}`)
        .then(res => res.json())
        .then(data => {
            
            if (data && data.plants) {
                showPlantsByCategory(data.plants);
            } else {
                console.error('No plants data found for this category.');
                showPlantsByCategory([]); 
            }
        })
        .catch(err => {
            console.error('Error fetching plants:', err);
        });
};

// const loadPlantsByCategory = async (categoryId) => {
//   console.log(categoryId)
//   fetch(`https://openapi.programming-hero.com/api/category/${id}`)
//   .then(res => res.json())
//   .then(data => {
//     showPlantsByCategory(data.plants)
//   })

//   const showPlantsByCategory = (plants) => {
//     cardContainer.innerHTML = "";
//     plants.forEach(plant => {
//       cardContainer.innerHTML += `
//       <div class="card shadow-sm bg-white card-body space-y-2 ">
//         <div class="card shadow-sm bg-white card-body space-y-2 ">
//   <figure class= "">
//     <img class= "w-full h-48 object-cover"
//       src="${plant.image}"
//       alt="Shoes" />
//   </figure>
//   <div class="card-body">
//     <h2 id= "tree-name" class="card-title">${plant.name}</h2>
//     <p class= "p-1">${plant.description}</p>
//     <div class="flex justify-between items-center">
//       <button id="category" class="btn btn-outline text-green-800 border-none rounded-4xl bg-[#F0FDF4]">${plant.category}</button>
//         <span class="font-bold text-lg tree-price"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${plant.price}</span>
//     </div>
//     <button class="btn bg-green-700 rounded-3xl text-white cart-btn">Add to Cart</button>
//   </div>
//   </div>

//       </div>
//       `

//     })
//   }



// }
// //   

//  click category








 
// const loadPlantsBYCategory = (categoryId) => {
//   fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
//     .then(res => res.json())
//     .then(data => {
//       const plants = data.plants;
//       showCard(plants);
//     });
// };
// function showPlantsByCategories(categories){
//   if (categories === "All Trees"){
//     showPlantsByCategories(plants);

//   } else{
//     const filtered = plants.filter(plant => plant.category === category)
//     showPlantsByCategories(filtered);
//   }

// }

  
// card function



const loadCards = () => {
    fetch("https://openapi.programming-hero.com/api/plants")
        .then((res) => res.json())
        .then((data) => {
         const cards = data.plants
         
         showCard(cards);
        
         
    });}

    const showCard = (cards) => {
      cards.forEach(card => {
        // cardContainer.innerHTML = "";
        cardContainer.innerHTML += `
        <div class="card shadow-sm bg-white card-body space-y-2 ">
  <figure class= "">
    <img class= "w-full h-48 object-cover"
      src="${card.image}"
      alt="Shoes" />
  </figure>
  <div class="card-body">
    <h2 id= "tree-name" class="card-title">${card.name}</h2>
    <p class= "p-1">${card.description}</p>
    <div class="flex justify-between items-center">
      <button id="category" class="btn btn-outline text-green-800 border-none rounded-4xl bg-[#F0FDF4]">${card.category}</button>
        <span class="font-bold text-lg tree-price"><i class="fa-solid fa-bangladeshi-taka-sign"></i>${card.price}</span>
    </div>
    <button class="btn bg-green-700 rounded-3xl text-white cart-btn">Add to Cart</button>
  </div>
  </div>

        `

      })
    }


    // modal card

//     const loadPlantDetail = async (id) => {
//     try {
//         const url = `https://openapi.programming-hero.com/api/plant/${id}`;
//         const res = await fetch(url);
//         const details = await res.json();
//         if (details.status === 'success') {
//             displayPlantDetails(details.data);
//         }
//     } catch (error) {
//         console.error("Error fetching plant details:", error);
//     }
// };

// function displayPlantDetails(plant) {
//     const modalTitle = document.getElementById("modal_title");
//     const modalImage = document.getElementById("modal_image");
//     const modalCategory = document.getElementById("modal_category");
//     const modalPrice = document.getElementById("modal_price");
//     const modalDescription = document.getElementById("modal_description");

//     if (modalTitle) modalTitle.innerText = plant.name;
//     if (modalImage) modalImage.src = plant.image;
//     if (modalCategory) modalCategory.innerText = plant.category;
//     if (modalPrice) modalPrice.innerHTML = `<i class="fa-solid fa-bangladeshi-taka-sign"></i> ${plant.price}`;
//     if (modalDescription) modalDescription.innerText = plant.description;

//     // Trigger your modal to show. Assuming a library like Bootstrap is used.
//     // For a simple modal, you might toggle a class like 'show' or change 'display' property.
//     // E.g., document.getElementById('plant-modal').style.display = 'block';
// }


    
//     id": 1,
// "image": "https://i.ibb.co.com/cSQdg7tf/mango-min.jpg",
// "name": "Mango Tree",
// "description": "A fast-growing tropical tree that produces delicious, juicy mangoes during summer. Its dense green canopy offers shade, while its sweet fruits are rich in vitamins and minerals.",
// "category": "Fruit Tree",
// "price": 500

    // 


        

    loadCards();
    loadCategory();
    
    

    
