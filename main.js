//==================================
//  Productos de Accesorios de Motos
//  "Gladiadores"
//===================================
// Elementos del DOM
const carritoBoton = document.getElementById('boton-carrito');
const carritoDinamico = document.getElementById('carrito');
const cerrarCarrito = document.getElementById('cerrar-carrito');
const contenedorProductos = document.getElementById('contenedor-productos');
const carritoDinamicoInterno = document.getElementById('carrito-dinamico-interno');
const total = document.getElementById('total');
const finalizarCompra = document.getElementById('finalizar-compra');
const contador = document.getElementById('contador-carrito');

// Variable global para almacenar los productos
let productos = [];

// Estado del carrito que se guarda en el localStorage
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para guardar carrito en localStorage
const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

// Función para mostrar notificaciones
const mostrarNotificacion = (mensaje, tipo = 'success') => {
    Swal.fire({
        text: mensaje,
        icon: tipo,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
};

// Event listeners para el carrito
carritoBoton.addEventListener("click", () => {
    carritoDinamico.classList.toggle('mostrar-carrito');
});

cerrarCarrito.addEventListener("click", () => {
    carritoDinamico.classList.remove('mostrar-carrito');
});

// Event delegation para manejar eventos del carrito dinámicamente
carritoDinamicoInterno.addEventListener('click', (event) => {
    const target = event.target;
    
    // Manejar botones de cantidad
    if (target.classList.contains('btn-cantidad')) {
        const id = parseInt(target.dataset.id);
        const accion = target.dataset.accion;
        const cambio = accion === 'sumar' ? 1 : -1;
        cambiarCantidad(id, cambio);
    }
    
    // Manejar botón de eliminar
    if (target.classList.contains('btn-eliminar')) {
        const id = parseInt(target.dataset.id);
        eliminarProducto(id);
    }
});

// Función para calcular total
const calculadoraTotal = () => {
    let total = carrito.reduce((acc, producto) => {
        return acc + (producto.precio * producto.cantidad);
    }, 0);
    return total;
};

// Función para agregar al carrito
const agregarACarrito = () => {
    carritoDinamicoInterno.innerHTML = '';
    
    if (carrito.length === 0) {
        carritoDinamicoInterno.innerHTML = '<p>El carrito está vacío</p>';
        total.innerHTML = '';
        actualizarContadorCarrito();
        return;
    }

    carrito.forEach((producto) => {
        carritoDinamicoInterno.innerHTML += `
            <div class="item-carrito">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-carrito">
                <div class="info-producto">
                    <h4>${producto.nombre}</h4>
                    <p class="precio-carrito">$${producto.precio.toLocaleString()}</p>
                    <div class="controles-cantidad">
                        <button class="btn-cantidad" data-id="${producto.id}" data-accion="restar">-</button>
                        <span class="cantidad">${producto.cantidad}</span>
                        <button class="btn-cantidad" data-id="${producto.id}" data-accion="sumar">+</button>
                    </div>
                </div>
                <button class="btn-eliminar" data-id="${producto.id}">🗑️</button>
            </div>
        `;
    });

    let calculoTotal = calculadoraTotal();
    total.innerHTML = `<p class="total">Total: $${calculoTotal.toLocaleString()}</p>`;
    actualizarContadorCarrito();
    guardarCarrito();
};

// Función para cambiar cantidad
const cambiarCantidad = (id, cambio) => {
    const producto = carrito.find(p => p.id === id);
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            eliminarProducto(id);
        } else {
            agregarACarrito();
        }
    }
};

// Función para eliminar producto
const eliminarProducto = (id) => {
    carrito = carrito.filter(p => p.id !== id);
    mostrarNotificacion('Producto eliminado del carrito', 'info');
    agregarACarrito();
};

// Función para agregar evento a botones
const agregarEventoDeBotones = () => {
    const botones = document.getElementsByClassName('boton-agregar');
    const arrayBoton = Array.from(botones);

    arrayBoton.forEach(boton => {
        boton.addEventListener('click', (event) => {
            let id = parseInt(event.target.parentElement.id);
            let producto = productos.find(el => el.id === id);
            
            if (producto) {
                // Verificar si ya existe en el carrito
                const productoEnCarrito = carrito.find(p => p.id === id);
                
                if (productoEnCarrito) {
                    productoEnCarrito.cantidad += 1;
                    mostrarNotificacion(`Se agregó otra unidad de ${producto.nombre}`);
                } else {
                    carrito.push({...producto, cantidad: 1});
                    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
                }
                
                agregarACarrito();
            }
        });
    });
};

// Función para renderizar productos
const renderizarProductos = () => {
    contenedorProductos.innerHTML = '';
    productos.forEach((producto) => {
        contenedorProductos.innerHTML += 
        `<section class="imagen-productos" id="${producto.id}">
            <img src="${producto.imagen}" alt="${producto.nombre}"/>
            <h2>${producto.nombre}</h2>
            <p class="categoria">${producto.categoria}</p>
            <span class="precio">$${producto.precio.toLocaleString()}</span>
            <p class="stock">Stock: ${producto.stock}</p>
            <button class="boton-agregar">Agregar al carrito</button>
        </section>
        `;
    });
    agregarEventoDeBotones();
};

// Event listener para finalizar compra
finalizarCompra.addEventListener('click', () => {
    if (carrito.length === 0) {
        mostrarNotificacion('El carrito está vacío', 'warning');
        return;
    }

    Swal.fire({
        title: '¿Confirmar compra?',
        text: `Total: $${calculadoraTotal().toLocaleString()}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, confirmar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            agregarACarrito();
            mostrarNotificacion('¡Compra realizada con éxito!', 'success');
        }
    });
});

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    const totalItems = carrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    contador.textContent = totalItems;
}

// Event listener para tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        carritoDinamico.classList.remove("mostrar-carrito");
    }
});

// ===== SISTEMA DE FILTROS Y BÚSQUEDA =====

let productosFiltrados = [];
let categoriaActiva = 'todos';

// Función para filtrar productos
const filtrarProductos = (categoria = 'todos', busqueda = '') => {
    let filtrados = productos;
    
    // Filtrar por categoría
    if (categoria !== 'todos') {
        filtrados = filtrados.filter(producto => producto.categoria === categoria);
    }
    
    // Filtrar por búsqueda
    if (busqueda.trim() !== '') {
        const termino = busqueda.toLowerCase();
        filtrados = filtrados.filter(producto => 
            producto.nombre.toLowerCase().includes(termino) ||
            producto.categoria.toLowerCase().includes(termino)
        );
    }
    
    productosFiltrados = filtrados;
    renderizarProductosFiltrados();
};

// Función para renderizar productos filtrados
const renderizarProductosFiltrados = () => {
    contenedorProductos.innerHTML = '';
    
    if (productosFiltrados.length === 0) {
        contenedorProductos.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros filtros o términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    productosFiltrados.forEach((producto) => {
        contenedorProductos.innerHTML += 
        `<section class="imagen-productos" id="${producto.id}">
            <img src="${producto.imagen}" alt="${producto.nombre}"/>
            <h2>${producto.nombre}</h2>
            <p class="categoria">${producto.categoria}</p>
            <span class="precio">$${producto.precio.toLocaleString()}</span>
            <p class="stock">Stock: ${producto.stock}</p>
            <button class="boton-agregar">Agregar al carrito</button>
        </section>
        `;
    });
    agregarEventoDeBotones();
};

// Función para inicializar la aplicación
const inicializarApp = async () => {
    try {
        // Cargar productos desde el JSON
        const response = await fetch('productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar productos.json');
        }
        productos = await response.json();
        
        // Inicializar productos filtrados
        productosFiltrados = [...productos];
        
        // Configurar filtros y búsqueda
        const botonesFiltro = document.querySelectorAll('.filtro-categoria');
        const inputBusqueda = document.getElementById('busqueda');
        
        // Filtros por categoría
        botonesFiltro.forEach(boton => {
            boton.addEventListener('click', () => {
                // Remover clase activo de todos los botones
                botonesFiltro.forEach(b => b.classList.remove('activo'));
                // Agregar clase activo al botón clickeado
                boton.classList.add('activo');
                
                categoriaActiva = boton.dataset.categoria;
                filtrarProductos(categoriaActiva, inputBusqueda.value);
            });
        });
        
        // Búsqueda en tiempo real
        inputBusqueda.addEventListener('input', (e) => {
            filtrarProductos(categoriaActiva, e.target.value);
        });
        
        // Limpiar búsqueda al hacer clic en "Todos"
        document.querySelector('[data-categoria="todos"]').addEventListener('click', () => {
            inputBusqueda.value = '';
        });
        
        // Renderizar productos iniciales
        renderizarProductos();
        agregarACarrito();
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar los productos', 'error');
    }
};

// Event listener principal
document.addEventListener('DOMContentLoaded', inicializarApp);