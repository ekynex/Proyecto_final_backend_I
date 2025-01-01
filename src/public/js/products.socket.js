const productSocket = io();

const productsList = document.getElementById("products-list");
const productsForm = document.getElementById("products-form");
const inputProductId = document.getElementById("input-product-id");
const btnDeleteProduct = document.getElementById("btn-delete-product");
const errorMessage = document.getElementById("error-message");

productSocket.on("products-list", (data) => {
    const products = data.products || [];

    productsList.innerText = "";

    products.forEach((products) => {
        productsList.innerHTML += `<li>Id: ${products.id} - Nombre: ${products.title}</li>`;
    });
});

productsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    errorMessage.innerText = "";
    form.reset();    

    productSocket.emit("insert-product", {
        title: formdata.get("title"),
        description: formdata.get("description"),
        code: formdata.get("code"),
        price:formdata.get("price"),
        category: formdata.get("category"),
        status: formdata.get("status") || "off",
        stock: formdata.get("stock"),
    })   
});

btnDeleteProduct.addEventListener("click", () => {    
    const id = inputProductId.value;
    inputProductId.innerText = "";
    errorMessage.innerText = "";

    if (id > 0) {
        productSocket.emit("delete-product", { id });
    }      
});
productSocket.on("connect", () => {
    console.log("Conexión establecida con el servidor.");
});

productSocket.on("error-message", (data) => {
    errorMessage.innerText = data.message;
});

productSocket.on("cart-updated", (data) => {
    console.log("Carrito actualizado:", data.cart);
});

productSocket.on("cart-cleared", (data) => {
    console.log("Carrito vaciado:", data.cartId);
});

productSocket.on("products-list", (data) => {
    console.log("Recibido products-list:", data);
});

