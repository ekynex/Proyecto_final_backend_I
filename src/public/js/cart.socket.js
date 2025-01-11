const cartSocket = io("http://localhost:8080", {
    transports: ["websocket", "polling"],
});

const errorMessage = document.getElementById("error-message");
const cartDetails = document.getElementById("cart-details");
const cartItems = document.getElementById("cart-items");
const btnDeleteCart = document.getElementById("btn-delete-cart");

const cartOffcanvas = document.getElementById("cart-offcanvas");
const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");

const cartItemsList = document.getElementById("cart-items-list");
const cartTotal = document.getElementById("cart-total");

let cartId;

const productsContainer = document.getElementById("products-container");

cartSocket.on("products-list", (data) => {
    productsContainer.innerHTML = "";
    data.products.forEach((product) => {
        productsContainer.innerHTML += `
            <div class="card">
                <img src="${product.thumbnail}" alt="${product.title}" />
                <h4>${product.title}</h4>
                <p>Precio: S/${product.price}</p>
                <button class="add-to-cart" data-product-id="${product._id}">Agregar al carrito</button>
            </div>
        `;
    });
});


cartSocket.on("cart-updated", (data) => {
    const cart = data.cart;
    const products= data.cart.products;
    cartId = cart._id;

    if (!cart || !cart.products.length) {
        cartDetails.innerText = "El carrito está vacío.";
        cartItems.innerHTML = "";
        return;
    }

    cartDetails.innerHTML = `
         <h4>Detalles</h4>
         <h5>Id: ${data.cart._id}</h5>
         <p> Creado: ${data.cart.createdAt}</p>
         <p> Modificado: ${data.cart.updatedAt}</p>
    `,

    cartItems.innerHTML = "";
    products.forEach((product) => {
        cartItems.innerHTML += `<tr>
        <td> ${product.product._id} </td>
        <td>  ${product.product.title} </td>
        <td> ${product.quantity} </td>
        <td> $${product.product.price} </td>
        <td>
            <button class="add-to-cart" data-product-id="${product.product._id}">+</button>
            <button class="remove-from-cart" data-product-id="${product.product._id}">-</button>
            <button class="delete-all-from-cart" data-product-id="${product.product._id}">Eliminar Todos</button>
        </td>
        </tr>
        `;
    });
});

btnDeleteCart.onclick = (event)=>{
    if (event.target && event.target.id === "btn-delete-cart") {
        const cartId = event.target.dataset.cartId;
        cartSocket.emit("delete-cart", { id: cartId });
    }
};

document.body.addEventListener("click", (event) => {
    const target = event.target;

    if (target.matches(".add-to-cart")) {
        const productId = target.dataset.productId;
        if (productId) {
            cartSocket.emit("add-product", { productId });
        }
    }

    if (target.matches(".remove-from-cart")) {
        const productId = target.dataset.productId;
        if (productId) {
            cartSocket.emit("remove-product", { productId });
        }
    }

    if (target.matches(".delete-all-from-cart")) {
        const productId = target.dataset.productId;
        if (productId && cartId) {
            cartSocket.emit("delete-all-products", { cartId, productId });
        }
    }
});

cartSocket.on("connect", () => {
    console.log("Conexión establecida con el servidor");
});

cartSocket.on("disconnect", () => {
    console.log("Se perdió la conexión con el servidor");
});

cartSocket.on("error-message", (data) => {
    errorMessage.innerText = data.message;
});

cartSocket.on("connect_error", (err) => {
    console.error("Error de conexión:", err);
});

cartSocket.on("cart-updated", (data) => {
    const cart = data.cart;
    let total = 0;

    cartItemsList.innerHTML = ""; // Limpiar lista
    cart.products.forEach((item) => {
        total += item.product.price * item.quantity;
        cartItemsList.innerHTML += `
            <tr>
                <td>${item.product._id}</td>
                <td>${item.product.title}</td>
                <td>${item.quantity}</td>
                <td>S/${item.product.price}</td>
                <td>
                    <button class="add-to-cart" data-product-id="${item.product._id}">+</button>
                    <button class="remove-from-cart" data-product-id="${item.product._id}">-</button>
                    <button class="delete-all-from-cart" data-product-id="${item.product._id}">Eliminar</button>
                </td>
            </tr>
        `;
    });

    cartTotal.textContent = total.toFixed(2);
});

cartSocket.on("cart-cleared", (data) => {
    console.log("Carrito vaciado:", data.cartId);
});

openCartButton.addEventListener("click", () => {
    cartSocket.emit("get-cart", { id: cartId }); // Solicitar carrito al servidor
    cartOffcanvas.classList.add("active"); // Abrir offcanvas
});

closeCartButton.addEventListener("click", () => {
    cartOffcanvas.classList.remove("active");
});
