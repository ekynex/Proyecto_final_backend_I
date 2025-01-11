const productSocket = io("http://localhost:8080", {
    transports: ["websocket", "polling"], 
});

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
        price: Number(formdata.get("price")),
        category: formdata.get("category"),
        status: formdata.get("status") === "on",
        stock: Number(formdata.get("stock")),
        thumbnail: formdata.get("file"),
    })   
});

btnDeleteProduct.addEventListener("click", () => {
    const id = inputProductId.value.trim();
    errorMessage.innerText = "";
    inputProductId.value = "";

    if (id) {
        console.log("ID enviado para eliminar:", id); 
        productSocket.emit("delete-product", { id });
    } else {
        errorMessage.innerText = "Por favor, ingresa un ID válido";
    }
});

productSocket.on("connect", () => {
    console.log("Conexión establecida con el servidor.");
});

productSocket.on("error-message", (data) => {
    errorMessage.innerText = data.message;
});

productSocket.on("connect_error", (err) => {
    console.error("Error de conexión:", err);
});

productSocket.on("cart-updated", (data) => {
    console.log("Carrito actualizado:", data.cart);
});

productSocket.on("cart-cleared", (data) => {
    console.log("Carrito vaciado:", data.cartId);
});

productSocket.on("products-list", (data) => {
    const products = data.products || [];
    productsList.innerText = ""; // Limpiar la lista anterior

    products.forEach((product) => {
        productsList.innerHTML += `<li>Id: ${product._id} - Nombre: ${product.title}</li>`;
    });
    console.log("Lista de productos actualizada:", products);
});

