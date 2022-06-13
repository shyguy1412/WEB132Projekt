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

function generateProductElements(products) {
    const templateHTML = /* html */`
    <div class="product">
        <h3>$name</h3>
        <span>$description</span>
        <span>$price</span>
        <button onclick="addToCart($ID)">Add to Cart</button>
    </div>
    `;

    products.forEach(product => {
        const productHTML = evaluateTemplate(templateHTML, product); //crate product HTML
        document.querySelector('.product-list').innerHTML += productHTML;  //append product to list
    })

}


function updateShoppingCartElement(products = productList) {
    if (!products) throw new Error('Cart update without product list');

    document.querySelector('.shopping-cart').innerHTML = '';

    const templateHTML = /* html */`
    <div id="$ID" class="cart-product">
        <h3>$name</h3>
        <span>$price</span>
        <span>$count</span>
        <button onclick="addToCart($ID)">+</button>
        <button onclick="removeFromCart($ID)">-</button>
        <button onclick="removeAllFromCart($ID)">X</button>
    </div>
    `
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

    cartProducts.forEach(product => {
        const productHTML = evaluateTemplate(templateHTML, product);
        document.querySelector('.shopping-cart').innerHTML += productHTML;
    });
}

function addToCart(ID) {
    //get cart items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    //add new item
    cart.push(ID);
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

document.addEventListener('cart-changed', () => updateShoppingCartElement());

document.addEventListener('DOMContentLoaded', e => {
    loadProductList().then(products => {
        productList = products
        generateProductElements(products);
        updateShoppingCartElement(products);
    });
});

const navbar = document.querySelector('nav');
const hamburger = navbar.querySelector('.hamburger');
console.log(hamburger);
hamburger.addEventListener('click', () => {
    if(navbar.classList.contains('navbar-active')){
        navbar.classList.remove('navbar-active');
    } else {
        navbar.classList.add('navbar-active');
    }
});
