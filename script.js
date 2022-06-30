//Path to file containing products
const PRODUCT_LIST_PATH = 'products.json';

//To memoize the product list
let productList;

//Takes a template string and replaces placeholders with data from an objet
function evaluateTemplate(templateHTML, data) {
    //get all the keys from the template
    const keys = [...templateHTML.matchAll(/\$[a-zA-Z$_][a-zA-Z0-9$_]*/g)] //returns array of result arrays
        .flat() //converts array of arrays into array of strings
        .filter((value, index, arr) => index == arr.lastIndexOf(value)); //removes duplicates

    let elementHTML = templateHTML; //get template html

    keys.forEach(key => { //for each key, replace placeholder with actual value
        try {
            elementHTML = elementHTML.replaceAll(key, data[key.replace('$', '')]);
        } catch (e) {
            console.warn(e);
        }
    });

    return elementHTML;
}

async function loadProductList() {
    //fetch the product list
    return await fetch(PRODUCT_LIST_PATH).then(response => response.json());
}

//Generates and inserts the HTML for products
function generateProductElements(products) {
    //HTML Template for products
    const templateHTML = /* html */`
    <div class="shop-item grogu-card grogu-card-clickable" id="$ID">
        <h3>$name</h3>
        <img class="product-img" src="$img_link" alt="$img_alt">
        <div class="product-info">
            <p>$description</p>
        </div>
        <div class="product-price">
            <p>$price€</p>
        </div>
        <button id="btn_$ID" onclick="addToCart('$ID')"><span>Buy!</span><i class="fa-solid fa-check"></i></Button>
    </div>
    `;

    products.forEach(product => {
        const productHTML = evaluateTemplate(templateHTML, product); //create product HTML
        document.querySelector('.product-list').innerHTML += productHTML;  //append product to list
    })

}

//Generates and inserts the HTML for featured products
function generateFeaturedProductElements(products) {
    //HTML Template
    const templateHTML = /* html */`
    <a href="shop.html#$ID" class="featured-item grogu-card grogu-card-clickable" id="$ID">
        <h3>$name</h3>
        <img class="product-img" src="$img_link" alt="$img_alt">
        <div class="product-info">
            <p>$description</p>
        </div>
        <div class="product-price">
           <p>$price€</p>
        </div>
    </a>
    `;

    products.forEach(product => {
        if (!product.featured) return;
        const productHTML = evaluateTemplate(templateHTML, product); //crate product HTML
        document.querySelector('.featured-product-list').innerHTML += productHTML;  //append product to list
    })

}

//Updates the cart counter when the cart changes
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const counter = document.querySelector('.fa-solid.fa-bag-shopping > .cart-counter');

    if (counter) {
        const count = cart.length
        if (!count) counter.style.opacity = 0; //hide counter if count == 0
        else counter.style.opacity = 1;
        counter.innerHTML = count;
    }

}

//Updates the combined total of all products in the cart
function updateCartTotal(products = productList) {
    if (!products) throw new Error('Cart update without product list'); //ensure product list is loaded
    const cartTotalElement = document.querySelector('.cart-total');
    if (!cartTotalElement) return; //ensure cart element exists
    cartTotalElement.innerHTML = ''; //clear html

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    //converts the array of product IDs into an array of products with their count
    const cartProducts = cart.reduce((acc, productID, index, arr) => {
        if (index == arr.indexOf(productID)) {
            acc.push({
                ...products.filter(product => product.ID == productID)[0],
                count: cart.filter(value => value == productID).length
            });
        }
        return acc;
    }, []);

    //Sum up the total
    let sum = 0;
    cartProducts.forEach(product => {
        sum += product.price * product.count;
    });
    sum = sum.toFixed(2); //round to 2 digits to avoid floating point imprecision


    cartTotalElement.innerHTML = sum + '€';
}

//Updates the cart elements
function updateCheckoutCartElement(products = productList) {
    if (!products) throw new Error('Cart update without product list'); //ensure product list is loaded
    const shoppingCartElement = document.querySelector('.checkout-cart');
    if (!shoppingCartElement) return; //ensure cart element exists
    shoppingCartElement.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const templateHTML = /* html */`
    <div id="$ID" class="cart-item">
        <h3>$name</h3>
        <span>$price€</span>
        <span>x $count</span>
        <span>Total: $sum€</span>
    </div>
    `
    //converts the array of product IDs into an array of products with their count
    const cartProducts = cart.reduce((acc, productID, index, arr) => {
        if (index == arr.indexOf(productID)) {
            acc.push({
                ...products.filter(product => product.ID == productID)[0],
                count: cart.filter(value => value == productID).length
            });
        }
        return acc;
    }, []);

    cartProducts.forEach(product => {
        product.sum = (product.price * product.count).toFixed(2);
        const productHTML = evaluateTemplate(templateHTML, product);
        shoppingCartElement.innerHTML += productHTML;
    });
}

function updateShoppingCartElement(products = productList) {
    if (!products) throw new Error('Cart update without product list'); //ensure product list is loaded
    const shoppingCartElement = document.querySelector('.shopping-cart');
    if (!shoppingCartElement) return; //ensure cart element exists
    shoppingCartElement.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const templateHTML = /* html */`
    <div id="$ID" class="cart-item">
        <img class="product-img" src="$img_link" alt="$img_alt">
        <span>
            <h3>$name
            </h3>
            <div>$price€</div>
            <div>x $count</div>
            <div class="add-remove-btn-wrapper">
            <button onclick="addToCart('$ID')"><i class="fa-solid fa-plus"></i></button>
            <button onclick="removeFromCart('$ID')"><i class="fa-solid fa-minus"></i></button>
            <button onclick="removeAllFromCart('$ID')"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div>Total: $sum€</div>
        </span>
    </div>
    `
    //converts the array of product IDs into an array of products with their count
    const cartProducts = cart.reduce((acc, productID, index, arr) => {
        if (index == arr.indexOf(productID)) {
            acc.push({
                ...products.filter(product => product.ID == productID)[0],
                count: cart.filter(value => value == productID).length
            });
        }
        return acc;
    }, []);

    cartProducts.forEach(product => {
        product.sum = (product.price * product.count).toFixed(2);
        const productHTML = evaluateTemplate(templateHTML, product);
        shoppingCartElement.innerHTML += productHTML;
    });
}

//Adds an item to the cart
function addToCart(ID) {
    //try to trigger animation
    const btn = document.getElementById('btn_' + ID);
    console.log(btn, 'btn_' + ID);
    if (btn) {
        btn.firstChild.style.animation = '';
        btn.lastChild.style.animation = '';

        setTimeout(() => {
            btn.firstChild.style.animation = 'fade-in-out 2s ease-in-out';
            btn.lastChild.style.animation = 'show-checkmark 2s ease-in-out';
        }, 0)
    }

    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    //add new item
    cart.push(ID);
    //save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

//Removes an item from the cart
function removeFromCart(ID) {
    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    //remove item
    cart.splice(cart.lastIndexOf(ID), 1);
    //save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

//Removes all of an item from the cart
function removeAllFromCart(ID) {
    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        .filter(value => value != ID);//remove items
    //save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

//Completly empties the cart
function emptyCart() {
    localStorage.setItem('cart', JSON.stringify([]));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

//Set listeners to update cart counter, cart and cart total when the cart changes
document.addEventListener('cart-changed', () => updateShoppingCartElement());
document.addEventListener('cart-changed', () => updateCheckoutCartElement());
document.addEventListener('cart-changed', () => updateCartCounter());
document.addEventListener('cart-changed', () => updateCartTotal());

//When dom finishes loading. Not necissary but doesnt cause harm either
document.addEventListener('DOMContentLoaded', e => {
    //load products
    loadProductList().then(products => {
        //when products are loaded
        productList = products //memoize products

        //Initialize elements
        if (document.querySelector('.product-list')) generateProductElements(products);
        if (document.querySelector('.featured-product-list')) generateFeaturedProductElements(products);
        if (document.querySelector('.shopping-cart')) updateShoppingCartElement(products);
        if (document.querySelector('.checkout-cart')) updateCheckoutCartElement(products);
        if (document.querySelector('.cart-total')) updateCartTotal(products);
        updateCartCounter();

        //fixes products not being scrolled into view as they are not loaded when the page first loads
        if (document.location.hash) {
            const target = document.querySelector(document.location.hash);
            target.scrollIntoView();
        }

    });
});

//Toggle for the burger menu
const burgerMenu = document.querySelector('.burger-menu');
const hamburger = burgerMenu.querySelector('.hamburger');
hamburger.addEventListener('click', () => {
    if (burgerMenu.classList.contains('burger-menu-active')) {
        burgerMenu.classList.remove('burger-menu-active');
    } else {
        burgerMenu.classList.add('burger-menu-active');
    }
});

//Toggle for darkmode
const darkmodeToggle = document.querySelector('.darkmode-toggle');
darkmodeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('darkmode')) {
        document.body.classList.remove('darkmode');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('darkmode');
        localStorage.setItem('theme', 'dark');
    }
});

//detect system theme
const themeMediaMatch = window.matchMedia("(prefers-color-scheme: dark)");

//set darkmode if system prefers it and no other specified
if (themeMediaMatch.matches && (!localStorage.getItem('theme') || localStorage.getItem('theme') == 'dark')) {
    document.body.classList.add('darkmode');
}

//set theme to prefered when system settings change
themeMediaMatch.addEventListener("change", function (e) {
    if (themeMediaMatch.matches && !localStorage.getItem('theme')) {
        document.body.classList.add('darkmode');
    } else {
        document.body.classList.remove('darkmode');
    }
});