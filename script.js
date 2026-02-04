// Variáveis globais
let cart = [];
let total = 0;
let subtotal = 0;
let discount = 0;
let currentDrinkData = null;
let currentUpsellData = null;
let currentCategory = 'mais-pedidos';

// Slider de imagens
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar slider
    startSlider();
    
    // Inicializar carrinho do localStorage
    loadCartFromStorage();
    
    // Configurar observador de rolagem para categorias
    setupCategoryObserver();
    
    // Configurar botões do slider
    document.querySelector('.slider-btn.prev').addEventListener('click', prevSlide);
    document.querySelector('.slider-btn.next').addEventListener('click', nextSlide);
    
    // Configurar dots do slider
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
});

// Slider functions
function startSlider() {
    setInterval(nextSlide, 5000);
}

function showSlide(n) {
    // Reset slides
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Ajustar índice se necessário
    if (n >= slides.length) slideIndex = 0;
    if (n < 0) slideIndex = slides.length - 1;
    
    // Mostrar slide atual
    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
}

function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
}

function prevSlide() {
    slideIndex--;
    showSlide(slideIndex);
}

function goToSlide(n) {
    slideIndex = n;
    showSlide(slideIndex);
}

// SCROLL PARA SEÇÃO
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        // Atualizar categoria ativa
        setActiveCategory(id);
        currentCategory = id;
    }
}

// Configurar observador de rolagem para categorias
function setupCategoryObserver() {
    const categories = document.querySelectorAll('.category');
    const categoryButtons = document.querySelectorAll('.cat-btn');
    const currentCategoryElement = document.getElementById('current-category');
    const categoryNames = {
        'mais-pedidos': '⭐ Mais Pedidos',
        'smash': '🍔 Smash',
        'premium': '👑 Premium',
        'combos': '🎁 Combos',
        'promocoes': '🔥 Promoções',
        'acompanhamentos': '🍟 Acompanhamentos',
        'bebidas': '🥤 Bebidas'
    };

    const options = {
        root: null,
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                setActiveCategory(id);
                currentCategory = id;
                
                // Atualizar categoria atual no menu fixo
                if (currentCategoryElement && categoryNames[id]) {
                    currentCategoryElement.innerHTML = `<i class="fas ${getCategoryIcon(id)}"></i> <span>${categoryNames[id]}</span>`;
                }
            }
        });
    }, options);

    categories.forEach(category => {
        observer.observe(category);
    });
}

function getCategoryIcon(categoryId) {
    const icons = {
        'mais-pedidos': 'fa-fire',
        'smash': 'fa-hamburger',
        'premium': 'fa-crown',
        'combos': 'fa-gift',
        'promocoes': 'fa-bolt',
        'acompanhamentos': 'fa-french-fries',
        'bebidas': 'fa-glass-whiskey'
    };
    return icons[categoryId] || 'fa-utensils';
}

function setActiveCategory(id) {
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        // Verificar se o botão corresponde à categoria
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(id)) {
            btn.classList.add('active');
        }
    });
}

// CARRINHO DE COMPRAS
function addToCart(name, price, type = 'item') {
    // Adicionar item ao carrinho
    const item = {
        id: Date.now(),
        name: name,
        price: parseFloat(price),
        type: type,
        quantity: 1
    };
    
    cart.push(item);
    
    // Atualizar totais
    updateTotals();
    
    // Renderizar carrinho
    renderCart();
    
    // Salvar no localStorage
    saveCartToStorage();
    
    // Mostrar confirmação
    showNotification(`${name} adicionado ao carrinho!`);
    
    // Sugerir upsell para certos produtos
    if (type === 'hamburger' && price > 25) {
        setTimeout(() => {
            suggestUpsell(name, price);
        }, 500);
    }
}

function removeFromCart(id) {
    // Encontrar índice do item
    const index = cart.findIndex(item => item.id === id);
    
    if (index !== -1) {
        // Remover item
        cart.splice(index, 1);
        
        // Atualizar totais
        updateTotals();
        
        // Renderizar carrinho
        renderCart();
        
        // Salvar no localStorage
        saveCartToStorage();
        
        // Mostrar confirmação
        showNotification('Item removido do carrinho!');
    }
}

function updateQuantity(id, change) {
    // Encontrar item
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        // Atualizar quantidade
        cart[itemIndex].quantity += change;
        
        // Se quantidade for 0 ou menos, remover item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Atualizar totais
        updateTotals();
        
        // Renderizar carrinho
        renderCart();
        
        // Salvar no localStorage
        saveCartToStorage();
    }
}

function updateTotals() {
    // Calcular subtotal
    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Aplicar descontos (se houver promoções ativas)
    discount = calculateDiscounts();
    
    // Calcular total
    total = subtotal - discount;
    
    // Atualizar contador do carrinho
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    document.getElementById('cart-count').textContent = itemCount;
}

function calculateDiscounts() {
    let totalDiscount = 0;
    
    // Verificar promoções ativas no carrinho
    // Exemplo: se tiver 2 hambúrguers, aplicar desconto
    const burgerCount = cart.filter(item => item.type === 'hamburger').reduce((count, item) => count + item.quantity, 0);
    
    if (burgerCount >= 2) {
        // Aplicar 10% de desconto em hambúrgueres
        const burgerTotal = cart.filter(item => item.type === 'hamburger')
                               .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalDiscount += burgerTotal * 0.1;
    }
    
    // Verificar se tem combo e batata (desconto adicional)
    const hasCombo = cart.some(item => item.type === 'combo');
    const hasSide = cart.some(item => item.type === 'side');
    
    if (hasCombo && hasSide) {
        totalDiscount += 5; // R$ 5,00 de desconto adicional
    }
    
    return totalDiscount;
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<li class="empty-cart">Seu carrinho está vazio</li>';
    } else {
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div class="item-details">
                    <div class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }
    
    // Atualizar totais na interface
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('discount').textContent = `R$ ${discount.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// CARRINHO DESLIZANTE
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');
}

// MODAIS DE BEBIDAS
function showDrinkModal(name, basePrice, cocaPremium) {
    currentDrinkData = { name, basePrice, cocaPremium };
    
    const modal = document.getElementById('drink-modal');
    const title = document.getElementById('drink-modal-title');
    const options = document.getElementById('drink-options');
    
    title.textContent = `Selecione o refrigerante para: ${name}`;
    
    const drinkOptions = [
        { name: 'Coca-Cola', price: basePrice + cocaPremium },
        { name: 'Guaraná Antarctica', price: basePrice },
        { name: 'Fanta Laranja', price: basePrice },
        { name: 'Sprite', price: basePrice },
        { name: 'Pepsi', price: basePrice }
    ];
    
    options.innerHTML = '';
    
    drinkOptions.forEach(drink => {
        const option = document.createElement('div');
        option.className = 'drink-option';
        option.innerHTML = `
            <h4>${drink.name}</h4>
            <p>R$ ${drink.price.toFixed(2)}</p>
        `;
        
        option.addEventListener('click', () => {
            addToCart(`${name} - ${drink.name}`, drink.price, 'drink');
            closeDrinkModal();
        });
        
        options.appendChild(option);
    });
    
    modal.classList.add('active');
}

function showWaterModal(name, basePrice) {
    currentDrinkData = { name, basePrice };
    
    const modal = document.getElementById('water-modal');
    const title = document.getElementById('water-modal-title');
    const options = document.getElementById('water-options');
    
    title.textContent = `Selecione o tipo de água para: ${name}`;
    
    const waterOptions = [
        { name: 'Com gás', price: basePrice },
        { name: 'Sem gás', price: basePrice }
    ];
    
    options.innerHTML = '';
    
    waterOptions.forEach(water => {
        const option = document.createElement('div');
        option.className = 'drink-option';
        option.innerHTML = `
            <h4>${water.name}</h4>
            <p>R$ ${water.price.toFixed(2)}</p>
        `;
        
        option.addEventListener('click', () => {
            addToCart(`${name} - ${water.name}`, water.price, 'drink');
            closeWaterModal();
        });
        
        options.appendChild(option);
    });
    
    modal.classList.add('active');
}

function closeDrinkModal() {
    document.getElementById('drink-modal').classList.remove('active');
    currentDrinkData = null;
}

function closeWaterModal() {
    document.getElementById('water-modal').classList.remove('active');
    currentDrinkData = null;
}

// UPSELL
function suggestUpsell(itemName, itemPrice) {
    currentUpsellData = { itemName, itemPrice };
    
    const modal = document.getElementById('upsell-modal');
    const message = document.getElementById('upsell-message');
    const options = document.getElementById('upsell-options');
    
    message.textContent = `Você está adicionando ${itemName} por R$ ${itemPrice.toFixed(2)}. Deseja adicionar mais algum item?`;
    
    const upsellOptions = [
        { 
            name: 'Batata Cheddar & Bacon M + Refri 350ml', 
            price: 18.90,
            description: 'Aproveite essa combinação perfeita!'
        },
        { 
            name: 'Completo: Hambúrguer + Batata M + Refri 350ml', 
            price: itemPrice + 12.90,
            description: `Transforme seu ${itemName} em um combo completo!`
        },
        { 
            name: 'Nuggets 10 unidades', 
            price: 17.90,
            description: 'Perfeito para compartilhar!'
        }
    ];
    
    options.innerHTML = '';
    
    upsellOptions.forEach(optionData => {
        const option = document.createElement('div');
        option.className = 'upsell-option';
        option.innerHTML = `
            <div class="upsell-header">
                <h4>${optionData.name}</h4>
                <span class="upsell-price">R$ ${optionData.price.toFixed(2)}</span>
            </div>
            <p>${optionData.description}</p>
        `;
        
        option.addEventListener('click', () => {
            addToCart(optionData.name, optionData.price, 'upsell');
            closeUpsellModal();
            
            // Mostrar notificação de economia
            showNotification(`Combo adicionado! Você economizou R$ ${(itemPrice + 15 - optionData.price).toFixed(2)}!`);
        });
        
        options.appendChild(option);
    });
    
    modal.classList.add('active');
}

function closeUpsellModal() {
    document.getElementById('upsell-modal').classList.remove('active');
    currentUpsellData = null;
}

// NOTIFICAÇÕES
function showNotification(message) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--verde);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 2001;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// LOCALSTORAGE
function saveCartToStorage() {
    localStorage.setItem('resenhaburger_cart', JSON.stringify(cart));
    localStorage.setItem('resenhaburger_totals', JSON.stringify({ subtotal, discount, total }));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('resenhaburger_cart');
    const savedTotals = localStorage.getItem('resenhaburger_totals');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    if (savedTotals) {
        const totals = JSON.parse(savedTotals);
        subtotal = totals.subtotal || 0;
        discount = totals.discount || 0;
        total = totals.total || 0;
    }
    
    // Atualizar interface
    updateTotals();
    renderCart();
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Seu carrinho já está vazio!');
        return;
    }
    
    if (confirm('Tem certeza que deseja limpar todo o carrinho?')) {
        cart = [];
        subtotal = 0;
        discount = 0;
        total = 0;
        
        renderCart();
        saveCartToStorage();
        
        showNotification('Carrinho limpo com sucesso!');
    }
}

// CHECKOUT WHATSAPP
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio 😅');
        return;
    }

    // Número do WhatsApp
    const phoneNumber = "557133121092";
    
    // Montar mensagem
    let message = `*RESENHABURGER - PEDIDO*%0A%0A`;
    message += `*Cliente:* [NOME]%0A`;
    message += `*Endereço:* [ENDEREÇO COMPLETO]%0A`;
    message += `*Telefone:* [TELEFONE]%0A%0A`;
    message += `*ITENS DO PEDIDO:*%0A`;
    
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
    });
    
    message += `%0A`;
    message += `*Subtotal:* R$ ${subtotal.toFixed(2)}%0A`;
    
    if (discount > 0) {
        message += `*Desconto:* R$ ${discount.toFixed(2)}%0A`;
    }
    
    message += `*Total:* R$ ${total.toFixed(2)}%0A%0A`;
    message += `*FORMA DE PAGAMENTO:*%0A`;
    message += `[ ] Débito%0A`;
    message += `[ ] Crédito%0A`;
    message += `[ ] Pix%0A%0A`;
    message += `*OBSERVAÇÕES:*%0A`;
    message += `[INSIRA SUAS OBSERVAÇÕES AQUI]%0A%0A`;
    message += `🍔 *Hambúrguer 100% soteropolitano* 🔥`;
    
    // Abrir WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .notification {
        font-weight: 600;
    }
    
    .empty-cart {
        text-align: center;
        color: #AAAAAA;
        font-style: italic;
        padding: 30px 0 !important;
    }
    
    .item-info {
        flex-grow: 1;
    }
    
    .item-details {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .item-quantity {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 5px;
    }
    
    .qty-btn {
        background: var(--cinza-claro);
        color: white;
        border: none;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        transition: all 0.3s;
    }
    
    .qty-btn:hover {
        background: var(--vermelho);
    }
`;
document.head.appendChild(style);