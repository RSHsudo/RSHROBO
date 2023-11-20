//  variables

const cartbtn = document.querySelector('.cart-btn');
const closeCartbtn = document.querySelector('.close-cart');
const ClearCartbtn = document.querySelector('.clear-cart');

const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");



//  cart 
let cart = [];


//buttons
let buttonsDOM = [];


//  getting the products
class Products {

    async getproducts() {
        try { // when show error
            let result = await fetch('products.json') // when invoked the function
            let data = await result.json();// when invoked the function

            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                const formattedPrice = parseFloat(price.replace('$', ''));

                return { title, price: formattedPrice, id, image };
            });

            return products;
        } catch (error) {
            console.log(error); // showing that error
        }
    }
}


// display products
class UI {
    constructor() {
        this.cartDOM = document.querySelector(".cart");
        this.cartOverlay = document.querySelector(".cart-overlay");
        this.cartContent = document.querySelector(".cart-content");
        this.productsDOM = document.querySelector(".products-center");
        this.cartbtn = document.querySelector('.cart-btn');
        this.closeCartbtn = document.querySelector('.close-cart');
        this.ClearCartbtn = document.querySelector('.clear-cart'); // Update this line



        this.cart = [];
        this.buttonsDOM = [];
        this.showCart = this.showCart.bind(this);
        this.hideCart = this.hideCart.bind(this);
        this.cartbtn.addEventListener('click', this.showCart);
        this.closeCartbtn.addEventListener('click', this.hideCart);
        this.cartOverlay.addEventListener('click', event => {
            if (event.target.classList.contains('cart-overlay')) {
                this.hideCart();
            }
        });
    }

    async getproducts() {
        try {
            let result = await fetch('products.json');
            let data = await result.json();
            let products = data.items.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                const formattedPrice = parseFloat(price.replace('$', ''));
                return { title, price: formattedPrice, id, image };
            });
            return products;
        } catch (error) {
            console.log(error);
        }
    }

    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `<article class="product">
                <div class="img-container">
                    <img src=${product.image} class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>${product.price}</h4>
            </article>`;
        });
        this.productsDOM.innerHTML = result;
        this.getbagbuttons();
    }

    getbagbuttons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        this.buttonsDOM = buttons;
        buttons.forEach(button => {
            button.addEventListener('click', event => {
                const id = event.target.dataset.id;
                const incart = this.cart.find(item => item.id === id);

                if (incart) {
                    // If the item is already in the cart, show a message or perform any other action
                    console.log('This item is already in the cart!');
                } else {
                    event.target.innerText = "In Cart";
                    event.target.disabled = true;

                    const cartItem = {
                        ...Storage.getproduct(id),
                        amount: 1
                    };
                    this.cart = [...this.cart, cartItem];
                    Storage.saveCart(this.cart);
                    this.setCartValues(this.cart);
                    this.addtoCartItem(cartItem);
                    this.showCart();
                }
            });
        });
    }

    setCartValues(cart) {
        let temptotal = 0;
        let itemstotal = 0;
        cart.forEach(item => {
            if (!isNaN(item.price) && !isNaN(item.amount)) {
                temptotal += item.price * item.amount;
                itemstotal += item.amount;
            }
        });
        const carttotal = document.querySelector(".cart-total");
        const cartitems = document.querySelector(".cart-items");
        carttotal.innerText = parseFloat(temptotal.toFixed(2));
        cartitems.innerText = itemstotal;
    }

    addtoCartItem(item) {
        const cartContent = document.querySelector(".cart-content");
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${item.image} alt="#">
            <div>
                <h4>${item.title}</h4>
                <h5>${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fas fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount" data-id=${item.id}>${item.amount}</p>
                <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
        cartContent.appendChild(div);
    }

    showCart() {
        this.cartOverlay.classList.add('transparentBcg');
        this.cartDOM.classList.add("showCart");
    }

    hideCart() {
        this.cartOverlay.classList.remove('transparentBcg');
        this.cartDOM.classList.remove("showCart");
    }

    updateCart() {

        this.cart = Storage.getCart();
        this.setCartValues(this.cart);
        this.popluateCart(this.cart);

        // this.closeCartbtn.addEventListener('click', this.hideCart);

        const cartbtn = document.querySelector('.cart-btn');
        cartbtn.addEventListener('click', this.showCart);
        this.closeCartbtn.addEventListener('click', this.hideCart);

        // Add an event listener to the cartOverlay to close the cart when clicked outside the cart content
        this.cartOverlay.addEventListener('click', event => {
            if (event.target.classList.contains('cart-overlay')) {
                this.hideCart();
            }
        });
    }



    popluateCart(cart) {
        cart.forEach(item => this.addtoCartItem(item));
    }

    Cartlogic() {
        this.ClearCartbtn = document.querySelector('.clear-cart');

        this.ClearCartbtn.addEventListener("click", () => {
            this.clearCart();
        });

        this.cartContent.addEventListener("click", event => {
            if (event.target.classList.contains('remove-item')) {


                let removeItem = event.target;

                let id = removeItem.dataset.id;
                this.cartContent.removeChild(removeItem.parentElement.parentElement);

                this.removeItem(id);
            }
            else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempitem = this.cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount + 1;
                Storage.saveCart(this.cart);
                this.setCartValues(this.cart);
                addAmount.nextElementSibling.innerText = tempitem.amount;
            }
            else if (event.target.classList.contains('fa-chevron-down')) {
                let lessAmount = event.target;
                let id = lessAmount.dataset.id;
                let tempitem = this.cart.find(item => item.id === id);
                tempitem.amount = tempitem.amount - 1;
                if (tempitem.amount > 0) {
                    Storage.saveCart(this.cart);
                    this.setCartValues(this.cart);
                    lessAmount.previousElementSibling.innerText = tempitem.amount;
                }
                else {
                    this.cartContent.removeChild(lessAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    // Check the logic inside the clearCart method
    clearCart() {
        let cartItems = this.cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));

        // Log the number of children in the cartContent to verify if items are removed
        console.log(this.cartContent.children);

        // Use a while loop to remove all children
        while (this.cartContent.children.length > 0) {
            this.cartContent.removeChild(this.cartContent.children[0]);
        }


        this.hideCart();

    }
    removeItem(id) {

        this.cart = this.cart.filter(item => item.id !== id); // Update to use this.cart
        this.setCartValues(this.cart);
        Storage.saveCart(this.cart);
        let button = this.getsinglebutton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    }



    getsinglebutton(id) {
        return this.buttonsDOM.find(button => button.dataset.id === id);
    }



}

class Storage {
    static saveproducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getproduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    ui.updateCart();
    ui.getproducts().then(products => {
        ui.displayProducts(products);
        Storage.saveproducts(products);
    })
        .then(() => {
            ui.getbagbuttons();
            ui.Cartlogic();
        });
});
