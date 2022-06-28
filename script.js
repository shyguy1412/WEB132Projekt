const PRODUCT_LIST_PATH = 'products.json';

let productList;

function evaluateTemplate(templateHTML, data) {
    //get all the keys from the template
    const keys = [...templateHTML.matchAll(/\$[a-zA-Z$_][a-zA-Z0-9$_]*/g)] //returns array of result array
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

function generateProductElements(products, target_container) {
    const templateHTML = /* html */`
    <div class="shop-item grogu-card grogu-card-clickable" id="$ID">
        <h3>$name</h3>
        <img class="product-img" src="$img_link" alt="$name">
        <div class="product-info">
            <p>$description</p>
        </div>
        <div class="product-price">
            <p>$price</p>
        </div>
        <button onclick="addToCart('$ID')">Buy!</Button>
    </div>
    `;

    products.forEach(product => {
        const productHTML = evaluateTemplate(templateHTML, product); //crate product HTML
        document.querySelector('.product-list').innerHTML += productHTML;  //append product to list
    })

}

function generateFeaturedProductElements(products, target_container) {
    const templateHTML = /* html */`
    <a href="shop#$ID" class="featured-item grogu-card grogu-card-clickable" id="$ID">
        <h3>$name</h3>
        <img class="product-img" src="$img_link" alt="$name">
        <div class="product-info">
            <p>$description</p>
        </div>
        <div class="product-price">
           <p>$price</p>
        </div>
    </a>
    `;

    products.forEach(product => {
        const productHTML = evaluateTemplate(templateHTML, product); //crate product HTML
        document.querySelector('.featured-product-list').innerHTML += productHTML;  //append product to list
    })

}

function updateCartCounter() {

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const counter = document.querySelector('.fa-solid.fa-bag-shopping > .cart-counter');
    console.log(counter);
    if (counter) {
        const count = cart.length
        if (!count) counter.style.opacity = 0;
        else counter.style.opacity = 1;
        counter.innerHTML = count;
    }

}

function updateCartTotal(products = productList) {
    if (!products) throw new Error('Cart update without product list');
    const cartTotalElement = document.querySelector('.cart-total');
    if (!cartTotalElement) return;
    cartTotalElement.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const cartProducts = cart.reduce((acc, productID, index, arr) => {
        if (index == arr.indexOf(productID)) {
            acc.push({
                ...products.filter(product => product.ID == productID)[0],
                count: cart.filter(value => value == productID).length
            });
        }
        return acc;
    }, []);

    let sum = 0;

    cartProducts.forEach(product => {
        sum += product.price * product.count;
    });

    sum = sum.toFixed(2);
    cartTotalElement.innerHTML = sum + '€';
}

function updateCheckoutCartElement(products = productList) {
    if (!products) throw new Error('Cart update without product list');
    const shoppingCartElement = document.querySelector('.checkout-cart');
    if (!shoppingCartElement) return;
    shoppingCartElement.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const templateHTML = /* html */`
    <div id="$ID" class="checkout-item">
        <h3>$name</h3>
        <span>$price€</span>
        <span>Amount: $count</span>
        <span>Total: $sum€</span>
    </div>
    `
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
    if (!products) throw new Error('Cart update without product list');
    const shoppingCartElement = document.querySelector('.shopping-cart');
    if (!shoppingCartElement) return;
    shoppingCartElement.innerHTML = '';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const templateHTML = /* html */`
    <div id="$ID" class="cart-item grogu-card">
        <img class="product-img" src="$img_link" alt="$name">
        <h3>$name</h3>
        <div>$price€</div>
        <div>Amount: $count</div>
        <div>Total: $sum€</div>
        <div class="cart-buttons">
            <button onclick="addToCart('$ID')"><i class="fa-solid fa-plus"></i></button>
            <button onclick="removeFromCart('$ID')"><i class="fa-solid fa-minus"></i></button>
            <button onclick="removeAllFromCart('$ID')"><i class="fa-solid fa-xmark"></i>    </button>
        </div>
    </div>
    `
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

function addToCart(ID) {
    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    //add new item
    cart.push(ID);
    console.log(ID, cart);
    //save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

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

function removeAllFromCart(ID) {
    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        .filter(value => value != ID);//remove items
    //save cart
    localStorage.setItem('cart', JSON.stringify(cart));

    const cartChangedEvent = new Event('cart-changed');
    document.dispatchEvent(cartChangedEvent);
}

function emptyCart() {
    localStorage.setItem('cart', JSON.stringify([]));
}

document.addEventListener('cart-changed', () => updateShoppingCartElement());
document.addEventListener('cart-changed', () => updateCartCounter());
document.addEventListener('cart-changed', () => updateCartTotal());

document.addEventListener('DOMContentLoaded', e => {
    loadProductList().then(products => {
        productList = products
        if (document.querySelector('.product-list')) generateProductElements(products);
        if (document.querySelector('.featured-product-list')) generateFeaturedProductElements(products);
        if (document.querySelector('.shopping-cart')) updateShoppingCartElement(products);
        if (document.querySelector('.checkout-cart')) updateCheckoutCartElement(products);
        if (document.querySelector('.cart-total')) updateCartTotal(products);

        if (document.location.hash) {
            const target = document.querySelector(document.location.hash);
            target.scrollIntoView();
        }
        updateCartCounter();
    });
});

const burgerMenu = document.querySelector('.burger-menu');
const hamburger = burgerMenu.querySelector('.hamburger');
console.log(hamburger);
hamburger.addEventListener('click', () => {
    if (burgerMenu.classList.contains('burger-menu-active')) {
        burgerMenu.classList.remove('burger-menu-active');
    } else {
        burgerMenu.classList.add('burger-menu-active');
    }
});

const darkmodeToggle = document.querySelector('.darkmode-toggle');
darkmodeToggle.addEventListener('click', () => {
    if (document.body.classList.contains('darkmode')) {
        document.body.classList.remove('darkmode');
    } else {
        document.body.classList.add('darkmode');
    }
});