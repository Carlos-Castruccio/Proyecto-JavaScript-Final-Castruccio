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

// Función para limpiar carrito corrupto
const limpiarCarritoCorrupto = () => {
    // Verificar si hay productos en el carrito que no existen en la lista de productos
    if (carrito.length > 0) {
        const productosValidos = carrito.filter(item => {
            // Verificar que el item tenga todas las propiedades necesarias
            return item && item.id && item.nombre && item.precio && item.imagen && item.cantidad;
        });
        
        if (productosValidos.length !== carrito.length) {
            console.log('Carrito corrupto detectado, limpiando...');
            carrito = [];
            localStorage.removeItem('carrito');
        }
    }
};

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
        
        // Limpiar carrito 
        limpiarCarritoCorrupto();
        
        // Verificar si el carrito tiene datos válidos antes de renderizarlo
        if (carrito && carrito.length > 0) {
            console.log('Carrito cargado desde localStorage:', carrito);
        }
        agregarACarrito();
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        mostrarNotificacion('Error al cargar los productos', 'error');
    }
};

// Event listener principal
document.addEventListener('DOMContentLoaded', inicializarApp);

// ===== SISTEMA DE LOGIN O REGISTRO =====

// Elementos del DOM para login
const btnIniciarSesion = document.getElementById('btn-iniciar-sesion');
const btnRegistrarse = document.getElementById('btn-registrarse');
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
const loginContainer = document.getElementById('login-container');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');

// Verificar si hay un usuario logueado al cargar la página
const verificarSesion = () => {
    const usuarioLogueado = JSON.parse(localStorage.getItem('usuarioLogueado'));
    if (usuarioLogueado) {
        mostrarUsuarioLogueado(usuarioLogueado.email);
    }
};

// Función para validar email
const validarEmail = (email) => {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
};

// Función para validar contraseña
const validarPassword = (password) => {
    // Mínimo 4 caracteres numéricos
    const regexPassword = /^\d{4,}$/;
    return regexPassword.test(password);
};

// Función para mostrar formulario de login
const mostrarFormularioLogin = (esRegistro = false) => {
    const titulo = esRegistro ? 'Registrarse' : 'Iniciar Sesión';
    const textoBoton = esRegistro ? 'Registrarse' : 'Iniciar Sesión';
    
    Swal.fire({
        title: titulo,
        html: `
            <input id="swal-email" class="swal2-input" placeholder="Email" type="email">
            <input id="swal-password" class="swal2-input" placeholder="Contraseña (mínimo 4 números)" type="password">
            ${esRegistro ? '<input id="swal-confirm-password" class="swal2-input" placeholder="Confirmar contraseña" type="password">' : ''}
        `,
        showCancelButton: true,
        confirmButtonText: textoBoton,
        cancelButtonText: 'Cancelar',
        focusConfirm: false,
        preConfirm: () => {
            const email = document.getElementById('swal-email').value.trim();
            const password = document.getElementById('swal-password').value;
            
            if (!email || !password) {
                Swal.showValidationMessage('Por favor completa todos los campos');
                return false;
            }
            
            // Validar formato de email
            if (!validarEmail(email)) {
                Swal.showValidationMessage('Por favor ingresa un email válido');
                return false;
            }
            
            // Validar contraseña
            if (!validarPassword(password)) {
                Swal.showValidationMessage('La contraseña debe tener mínimo 4 números');
                return false;
            }
            
            if (esRegistro) {
                const confirmPassword = document.getElementById('swal-confirm-password').value;
                if (password !== confirmPassword) {
                    Swal.showValidationMessage('Las contraseñas no coinciden');
                    return false;
                }
            }
            
            return { email, password };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            if (esRegistro) {
                registrarUsuario(result.value.email, result.value.password);
            } else {
                iniciarSesion(result.value.email, result.value.password);
            }
        }
    });
};

// Función para registrar usuario
const registrarUsuario = (email, password) => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar si el usuario ya existe
    if (usuarios.find(u => u.email === email)) {
        mostrarNotificacion('El usuario ya existe', 'error');
        return;
    }
    
    // Agregar nuevo usuario
    usuarios.push({ email, password });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Loguear automáticamente
    localStorage.setItem('usuarioLogueado', JSON.stringify({ email }));
    mostrarUsuarioLogueado(email);
    mostrarNotificacion('Usuario registrado y logueado exitosamente', 'success');
};

// Función para iniciar sesión
const iniciarSesion = (email, password) => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        localStorage.setItem('usuarioLogueado', JSON.stringify({ email }));
        mostrarUsuarioLogueado(email);
        mostrarNotificacion('Sesión iniciada exitosamente', 'success');
    } else {
        mostrarNotificacion('Email o contraseña incorrectos', 'error');
    }
};

// Función para mostrar usuario logueado
const mostrarUsuarioLogueado = (email) => {
    loginContainer.style.display = 'none';
    userInfo.style.display = 'flex';
    userEmail.textContent = email;
};

// Función para cerrar sesión
const cerrarSesion = () => {
    localStorage.removeItem('usuarioLogueado');
    loginContainer.style.display = 'flex';
    userInfo.style.display = 'none';
    userEmail.textContent = '';
    mostrarNotificacion('Sesión cerrada exitosamente', 'info');
};

// Event listeners para login
btnIniciarSesion.addEventListener('click', () => mostrarFormularioLogin(false));
btnRegistrarse.addEventListener('click', () => mostrarFormularioLogin(true));
btnCerrarSesion.addEventListener('click', cerrarSesion);

// Verificar sesión al cargar la página
verificarSesion();
