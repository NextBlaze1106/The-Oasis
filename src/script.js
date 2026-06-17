const scriptCoffee = () => {
    // ----------------------------------------------------
    // Lógica Original de la Navbar (Hamburguesa y Scroll)
    // ----------------------------------------------------
    const burger = document.querySelector('#burger');
    const nav = document.querySelector('#nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    if (burger && nav) {
        burger.addEventListener('click', () => {
            nav.classList.toggle('nav-active');

            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            burger.classList.toggle('toggle');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('nav-active')) {
                    nav.classList.remove('nav-active');
                    burger.classList.remove('toggle');
                    navLinks.forEach(l => l.style.animation = '');
                }
            });
        });
    }

    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            } else {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }
        }
    });

    // ----------------------------------------------------
    // Lógica del Carrito y Facturación (Flujo de Caja)
    // ----------------------------------------------------

    // Estado del carrito
    let cart = [];
    let invoiceCounter = parseInt(localStorage.getItem('oasis_invoice_counter') || '1', 10);

    // Elementos del DOM
    const cartBtn = document.getElementById('cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartDrawerItems = document.getElementById('cart-drawer-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartClearBtn = document.getElementById('cart-clear-btn');
    const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutCloseBtn = document.getElementById('checkout-close-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutFormView = document.getElementById('checkout-form-view');
    const invoiceView = document.getElementById('invoice-view');

    const invoicePrintBtn = document.getElementById('invoice-print-btn');
    const invoiceNewBtn = document.getElementById('invoice-new-btn');

    // Botones de "Agregar al Carrito" en la página
    const addCartButtons = document.querySelectorAll('.btn-add-cart');

    // Cargar carrito del localStorage al iniciar
    const loadCart = () => {
        const savedCart = localStorage.getItem('oasis_cart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                cart = [];
            }
        }
        updateCartUI();
    };

    // Guardar carrito en localStorage
    const saveCart = () => {
        localStorage.setItem('oasis_cart', JSON.stringify(cart));
    };

    // Actualizar la interfaz del carrito
    const updateCartUI = () => {
        // Actualizar el Badge del carrito
        const totalItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
        cartBadge.textContent = totalItemsCount;

        // Limpiar el contenedor de items del drawer
        cartDrawerItems.innerHTML = '';

        if (cart.length === 0) {
            cartDrawerItems.innerHTML = '<div class="cart-empty-message">El carrito está vacío.</div>';
            cartTotalPrice.textContent = '$0.00';
            cartClearBtn.disabled = true;
            cartCheckoutBtn.disabled = true;
            cartClearBtn.style.opacity = '0.5';
            cartCheckoutBtn.style.opacity = '0.5';
            return;
        }

        cartClearBtn.disabled = false;
        cartCheckoutBtn.disabled = false;
        cartClearBtn.style.opacity = '1';
        cartCheckoutBtn.style.opacity = '1';

        let totalCartSum = 0;

        // Renderizar cada elemento del carrito
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalCartSum += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <img src="${item.img}" alt="${item.name}">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn minus" data-id="${item.id}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
            `;
            cartDrawerItems.appendChild(cartItemDiv);
        });

        cartTotalPrice.textContent = `$${totalCartSum.toFixed(2)}`;

        // Asignar eventos a los botones dentro de los items del carrito
        const minusBtns = cartDrawerItems.querySelectorAll('.qty-btn.minus');
        const plusBtns = cartDrawerItems.querySelectorAll('.qty-btn.plus');
        const removeBtns = cartDrawerItems.querySelectorAll('.cart-item-remove');

        minusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                updateQuantity(id, -1);
            });
        });

        plusBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                updateQuantity(id, 1);
            });
        });

        removeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                removeFromCart(id);
            });
        });
    };

    // Agregar producto al carrito
    const addToCart = (productId, name, price, img) => {
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: parseFloat(price),
                img: img,
                quantity: 1
            });
        }

        saveCart();
        updateCartUI();
        openCart(); // Abrir el panel del carrito para dar feedback visual
    };

    // Eliminar producto del carrito
    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
    };

    // Actualizar cantidad de producto
    const updateQuantity = (productId, amount) => {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += amount;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCartUI();
            }
        }
    };

    // Limpiar carrito por completo
    const clearCart = () => {
        if (confirm('¿Está seguro de que desea vaciar el carrito?')) {
            cart = [];
            saveCart();
            updateCartUI();
        }
    };

    // Abrir/Cerrar Cajón Lateral
    const openCart = () => {
        cartDrawer.classList.add('active');
        cartOverlay.classList.add('active');
    };

    const closeCart = () => {
        cartDrawer.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    // Abrir/Cerrar Modal de Pago
    const openCheckoutModal = () => {
        closeCart(); // Cerrar el carrito lateral
        checkoutFormView.style.display = 'block';
        invoiceView.style.display = 'none';
        checkoutForm.reset();
        checkoutModal.classList.add('active');
    };

    const closeCheckoutModal = () => {
        checkoutModal.classList.remove('active');
    };

    // Generar Factura
    const generateInvoice = (clientName, clientId, paymentMethod) => {
        const invoiceDate = new Date();
        
        // Formatear Fecha (DD/MM/AAAA)
        const day = String(invoiceDate.getDate()).padStart(2, '0');
        const month = String(invoiceDate.getMonth() + 1).padStart(2, '0');
        const year = invoiceDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;

        // Formatear Hora (HH:MM AM/PM)
        let hours = invoiceDate.getHours();
        const minutes = String(invoiceDate.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // el número 0 debe ser 12
        const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

        // Llenar metadatos de factura
        const formattedInvNum = String(invoiceCounter).padStart(4, '0');
        document.getElementById('inv-number').textContent = formattedInvNum;
        document.getElementById('inv-date').textContent = formattedDate;
        document.getElementById('inv-time').textContent = formattedTime;

        // Datos del cliente
        document.getElementById('inv-client-name').textContent = clientName.toUpperCase();
        document.getElementById('inv-client-id').textContent = clientId.toUpperCase();
        document.getElementById('inv-payment-method').textContent = paymentMethod;

        // Limpiar tabla de productos
        const itemsBody = document.getElementById('invoice-items-body');
        itemsBody.innerHTML = '';

        let subtotal = 0;

        // Rellenar tabla
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">$${item.price.toFixed(2)}</td>
                <td class="text-right">$${itemTotal.toFixed(2)}</td>
            `;
            itemsBody.appendChild(tr);
        });

        // Cálculos de IVA y Total
        const taxRate = 0.16; // 16% IVA
        const taxAmount = subtotal * taxRate;
        const grandTotal = subtotal + taxAmount;

        document.getElementById('inv-subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('inv-tax').textContent = `$${taxAmount.toFixed(2)}`;
        document.getElementById('inv-total').textContent = `$${grandTotal.toFixed(2)}`;

        // Incrementar y guardar contador de facturas para la próxima compra
        invoiceCounter++;
        localStorage.setItem('oasis_invoice_counter', invoiceCounter);
    };

    // Enviar formulario de checkout
    const handleCheckoutSubmit = (e) => {
        e.preventDefault();
        
        const clientName = document.getElementById('client-name').value.trim();
        const clientId = document.getElementById('client-id').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;

        if (!clientName || !clientId || !paymentMethod) {
            alert('Por favor, rellene todos los campos obligatorios.');
            return;
        }

        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const idRegex = /^[0-9]+$/;

        if (!nameRegex.test(clientName) || !idRegex.test(clientId)) {
            alert('Por favor, ingrese datos válidos.');
            return;
        }

        // Generar la factura en la vista del modal
        generateInvoice(clientName, clientId, paymentMethod);

        // Cambiar de vista en el modal (ocultar formulario, mostrar factura)
        checkoutFormView.style.display = 'none';
        invoiceView.style.display = 'flex';
    };

    // Imprimir Factura (nativo)
    const printInvoice = () => {
        window.print();
    };

    // Empezar una nueva compra (reiniciar)
    const startNewPurchase = () => {
        // Limpiar el carrito de memoria y del localStorage
        cart = [];
        saveCart();
        updateCartUI();
        
        // Cerrar el modal
        closeCheckoutModal();
    };

    // ----------------------------------------------------
    // Configuración de Event Listeners del Flujo de Caja
    // ----------------------------------------------------

    // Botones "Agregar al Carrito" en tarjetas de la página
    addCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            if (card) {
                const id = card.getAttribute('data-id');
                const name = card.getAttribute('data-name');
                const price = card.getAttribute('data-price');
                const img = card.querySelector('img').getAttribute('src');
                addToCart(id, name, price, img);
            }
        });
    });

    // Abrir Carrito
    if (cartBtn) {
        cartBtn.addEventListener('click', openCart);
    }

    // Cerrar Carrito
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }

    // Botón Vaciar Carrito (en drawer)
    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            updateCartUI();
        });
    }

    // Botón Pagar (abre formulario checkout)
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', openCheckoutModal);
    }

    // Cerrar Modal de Checkout
    if (checkoutCloseBtn) {
        checkoutCloseBtn.addEventListener('click', closeCheckoutModal);
    }

    // Enviar datos de cliente para generar factura
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmit);
    }

    // Botones de acción dentro de la factura
    if (invoicePrintBtn) {
        invoicePrintBtn.addEventListener('click', printInvoice);
    }
    if (invoiceNewBtn) {
        invoiceNewBtn.addEventListener('click', startNewPurchase);
    }

    // Restricciones de entrada en tiempo real para el formulario de checkout
    const nameInput = document.getElementById('client-name');
    const idInput = document.getElementById('client-id');

    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            // Reemplaza cualquier carácter que no sea letra, espacio o letra acentuada
            e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            e.target.setCustomValidity(''); // Limpia el mensaje personalizado
        });
        nameInput.addEventListener('invalid', (e) => {
            e.target.setCustomValidity('Por favor, ingrese datos válidos.');
        });
    }

    if (idInput) {
        idInput.addEventListener('input', (e) => {
            // Reemplaza cualquier carácter que no sea un dígito numérico
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            e.target.setCustomValidity(''); // Limpia el mensaje personalizado
        });
        idInput.addEventListener('invalid', (e) => {
            e.target.setCustomValidity('Por favor, ingrese datos válidos.');
        });
    }

    // ----------------------------------------------------
    // Lógica de Modo Claro / Oscuro (Dark/Light Mode)
    // ----------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    // Cargar tema guardado
    const currentTheme = localStorage.getItem('oasis_theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeToggleBtn) themeToggleBtn.textContent = '☀️';
    } else {
        if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            // Guardar en localStorage
            localStorage.setItem('oasis_theme', isDark ? 'dark' : 'light');
            
            // Cambiar el emoji del botón
            themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
        });
    }

    // Cargar estado inicial
    loadCart();
};

scriptCoffee();