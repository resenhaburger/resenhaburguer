// Variáveis globais otimizadas
let cart = [];
let total = 0;
let subtotal = 0;
let pointsDiscount = 0;
let currentDrinkData = null;
let currentUpsellData = null;
let currentCategory = 'mais-pedidos';
let totalPoints = 0;
let purchaseCount = 0;
let lastAddedItem = null;

// Slider de imagens
let slideIndex = 0;
let sliderInterval;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

// Otimização de performance
let isCartOpen = false;
let observer;

// Inicialização otimizada
document.addEventListener('DOMContentLoaded', function() {
    console.log('ResenhaBurger carregado com sucesso!');
    
    // Iniciar slider com otimização
    startSlider();
    
    // Carregar dados do localStorage
    loadCartFromStorage();
    loadPointsAndPurchases();
    
    // Configurar observador de rolagem para categorias
    setupCategoryObserver();
    
    // Configurar eventos do slider
    document.querySelector('.slider-btn.prev').addEventListener('click', prevSlide);
    document.querySelector('.slider-btn.next').addEventListener('click', nextSlide);
    
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Configurar carregamento lazy de imagens
    setupLazyLoading();
    
    // Configurar micro-interações
    setupMicroInteractions();
    
    // Inicializar estado do carrinho
    updateCheckoutButton();
    
    // Adicionar evento para fechar modais com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
    
    // Atualizar status do estabelecimento
    updateBusinessStatus();
    setInterval(updateBusinessStatus, 60000); // Atualiza a cada minuto
    
    // Fechar carrinho ao clicar no overlay
    document.getElementById('overlay').addEventListener('click', function() {
        if (isCartOpen) {
            toggleCart();
        }
    });
    
    // Log para remarketing
    logPageView();
});

// Função para atualizar status "Aberto agora" / "Fechado agora"
function updateBusinessStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Horário de funcionamento: Quinta a Domingo, 18:30h às 23:00h
    const isOpenDay = day >= 4 || day === 0; // 4=Quinta, 5=Sexta, 6=Sábado, 0=Domingo
    const currentTime = hours + (minutes / 60);
    const openTime = 18.5; // 18:30
    const closeTime = 23; // 23:00
    
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    if (isOpenDay && currentTime >= openTime && currentTime < closeTime) {
        // Aberto
        statusIndicator.classList.add('open');
        statusIndicator.classList.remove('closed');
        statusText.textContent = 'Aberto agora';
    } else {
        // Fechado
        statusIndicator.classList.add('closed');
        statusIndicator.classList.remove('open');
        statusText.textContent = 'Fechado agora';
    }
}

// Slider functions otimizadas
function startSlider() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(nextSlide, 5000);
}

function showSlide(n) {
    // Otimização: usar requestAnimationFrame
    requestAnimationFrame(() => {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        if (n >= slides.length) slideIndex = 0;
        if (n < 0) slideIndex = slides.length - 1;
        
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
    });
}

function nextSlide() {
    slideIndex++;
    showSlide(slideIndex);
    resetSliderTimer();
}

function prevSlide() {
    slideIndex--;
    showSlide(slideIndex);
    resetSliderTimer();
}

function goToSlide(n) {
    slideIndex = n;
    showSlide(slideIndex);
    resetSliderTimer();
}

function resetSliderTimer() {
    clearInterval(sliderInterval);
    startSlider();
}

// SCROLL PARA SEÇÃO COM OTIMIZAÇÃO
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ 
            behavior: "smooth",
            block: "start"
        });
        setActiveCategory(id);
        currentCategory = id;
        
        // Log para analytics
        logCategoryView(id);
    }
}

// Configurar observador de rolagem otimizado
function setupCategoryObserver() {
    const categories = document.querySelectorAll('.category');
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
        threshold: 0.1
    };

    observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                setActiveCategory(id);
                currentCategory = id;
                
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
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(id)) {
            btn.classList.add('active');
        }
    });
}

// CARRINHO DE COMPRAS OTIMIZADO
function addToCart(name, price, type = 'item') {
    // Verificar se item já está no carrinho
    const existingItemIndex = cart.findIndex(item => item.name === name);
    
    if (existingItemIndex !== -1) {
        // Incrementar quantidade
        cart[existingItemIndex].quantity += 1;
        lastAddedItem = cart[existingItemIndex];
    } else {
        // Adicionar novo item
        const item = {
            id: Date.now() + Math.random(),
            name: name,
            price: parseFloat(price),
            type: type,
            quantity: 1,
            addedAt: new Date().toISOString()
        };
        
        cart.push(item);
        lastAddedItem = item;
    }
    
    // Atualizar interface
    updateTotals();
    renderCart();
    saveCartToStorage();
    
    // Mostrar confirmação com micro-interação
    showNotification(`${name} adicionado ao carrinho!`, 'success');
    
    // Ativar botão de checkout
    updateCheckoutButton();
    
    // Log para analytics
    logAddToCart(name, price, type);
    
    // Upsell inteligente baseado no tipo (APENAS para combos e promoções)
    if (type === 'combo' || type === 'promo') {
        setTimeout(() => {
            suggestIntelligentUpsell(name, price, type);
        }, 800);
    }
}

function removeFromCart(id) {
    const index = cart.findIndex(item => item.id === id);
    
    if (index !== -1) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        
        updateTotals();
        renderCart();
        saveCartToStorage();
        
        showNotification(`${removedItem.name} removido do carrinho`, 'warning');
        updateCheckoutButton();
    }
}

function updateQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
        
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        updateTotals();
        renderCart();
        saveCartToStorage();
        updateCheckoutButton();
    }
}

function updateTotals() {
    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const pointsThisPurchase = Math.floor(subtotal);
    
    // Sem desconto automático - o desconto só será aplicado se o cliente confirmar no checkout
    pointsDiscount = 0;
    total = Math.max(0, subtotal - pointsDiscount);
    
    const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
    document.getElementById('cart-count').textContent = itemCount;
    
    updatePointsDisplay(pointsThisPurchase);
    
    // Atualizar o total destacado no botão do WhatsApp
    updateCheckoutButton();
}

function updatePointsDisplay(pointsThisPurchase) {
    document.getElementById('points-earned').textContent = pointsThisPurchase;
    
    const totalPointsAfterPurchase = totalPoints + pointsThisPurchase;
    const progressPercentage = Math.min((totalPointsAfterPurchase / 150) * 100, 100);
    document.getElementById('points-progress').style.width = `${progressPercentage}%`;
    
    // Atualizar informações de desconto
    updateDiscountInfo(pointsThisPurchase);
    
    // Sem desconto automático no carrinho
    document.getElementById('points-discount').textContent = `R$ 0,00`;
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${total.toFixed(2)}`;
}

// Função para atualizar informações de desconto no carrinho
function updateDiscountInfo(pointsThisPurchase) {
    const discountInfo = document.getElementById('points-discount-info');
    
    if (purchaseCount === 0) {
        // Primeira compra - sem direito a desconto
        discountInfo.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>Próximo desconto disponível na 2ª compra</span>
        `;
        discountInfo.style.borderLeftColor = '#FF9800';
    } else {
        // Segunda compra ou mais
        const totalPointsAfterPurchase = totalPoints + pointsThisPurchase;
        
        if (totalPointsAfterPurchase >= 150) {
            // Tem pontos suficientes para desconto
            discountInfo.innerHTML = `
                <i class="fas fa-tag"></i>
                <span>Você tem ${totalPointsAfterPurchase} pontos! Pode aplicar R$ 10,00 de desconto no checkout.</span>
            `;
            discountInfo.style.borderLeftColor = '#4CAF50';
        } else {
            // Não tem pontos suficientes
            const pointsNeeded = 150 - totalPointsAfterPurchase;
            discountInfo.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>Faltam ${pointsNeeded} pontos para R$ 10 de desconto</span>
            `;
            discountInfo.style.borderLeftColor = '#2196F3';
        }
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const emptyState = document.getElementById('cart-empty-state');
    const cartUpsell = document.getElementById('cart-upsell');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        emptyState.style.display = 'block';
        cartUpsell.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        cartUpsell.style.display = 'block';
        
        cartItems.innerHTML = '';
        
        cart.forEach(item => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                </div>
                <div class="item-details">
                    <div class="item-quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)" aria-label="Diminuir quantidade">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="item-qty">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)" aria-label="Aumentar quantidade">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="item-price">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})" aria-label="Remover item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(li);
        });
    }
}

// CARRINHO DESLIZANTE
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    isCartOpen = !isCartOpen;
    
    if (isCartOpen) {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        logCartView();
    } else {
        cartSidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const btnSubtext = checkoutBtn.querySelector('.btn-subtext');
    
    if (cart.length > 0) {
        checkoutBtn.disabled = false;
        btnSubtext.textContent = `Total: R$ ${total.toFixed(2)}`;
        checkoutBtn.innerHTML = `
            <i class="fab fa-whatsapp"></i> 
            <div class="whatsapp-btn-content">
                <span class="btn-text">Finalizar no WhatsApp</span>
                <span class="btn-subtext">Total: R$ ${total.toFixed(2)}</span>
            </div>
        `;
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = `
            <i class="fab fa-whatsapp"></i> 
            <div class="whatsapp-btn-content">
                <span class="btn-text">Finalizar no WhatsApp</span>
                <span class="btn-subtext">Adicione itens ao carrinho</span>
            </div>
        `;
    }
}

// MODAIS DE BEBIDAS
function showDrinkModal(name, basePrice, cocaPremium) {
    currentDrinkData = { name, basePrice, cocaPremium };
    
    const modal = document.getElementById('drink-modal');
    const title = document.getElementById('drink-modal-title');
    const options = document.getElementById('drink-options');
    
    title.textContent = `Escolha o refrigerante para acompanhar seu pedido:`;
    
    const drinkOptions = [
        { name: 'Coca-Cola', price: basePrice + cocaPremium, icon: 'fa-coca-cola' },
        { name: 'Guaraná Antarctica', price: basePrice, icon: 'fa-beer' },
        { name: 'Fanta Laranja', price: basePrice, icon: 'fa-glass-orange' },
        { name: 'Sprite', price: basePrice, icon: 'fa-lemon' },
        { name: 'Pepsi', price: basePrice, icon: 'fa-pepsi' }
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
            showNotification(`Ótima escolha! ${drink.name} adicionado.`, 'success');
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
    
    title.textContent = `Escolha o tipo de água:`;
    
    const waterOptions = [
        { name: 'Com gás', price: basePrice, icon: 'fa-bubbles' },
        { name: 'Sem gás', price: basePrice, icon: 'fa-tint' }
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

// UPSELL INTELIGENTE - APENAS PARA COMBOS
function suggestUpsell(itemName, itemPrice) {
    // Upsell básico para compatibilidade
    if (itemName.includes('Combo') || itemName.includes('Promo')) {
        suggestIntelligentUpsell(itemName, itemPrice, 'combo');
    }
}

function suggestIntelligentUpsell(itemName, itemPrice, type) {
    // Delay para melhor UX
    setTimeout(() => {
        const modal = document.getElementById('upsell-modal');
        const message = document.getElementById('upsell-message');
        const options = document.getElementById('upsell-options');
        
        // Mensagens personalizadas por tipo
        let messageText = '';
        if (type === 'combo') {
            messageText = `Você adicionou ${itemName}. Deseja adicionar mais algum item?`;
        } else if (type === 'promo') {
            messageText = `Você adicionou ${itemName}. Que tal complementar seu pedido?`;
        } else {
            return; // Não mostrar upsell para outros tipos
        }
        
        message.textContent = messageText;
        
        // Opções de upsell padronizadas
        const upsellOptions = [
            { 
                name: 'Batata Cheddar & Bacon M', 
                price: 29.90,
                description: 'O acompanhamento mais pedido!',
                saving: '+127 pedidos hoje'
            },
            { 
                name: 'Refrigerante 1L', 
                price: 16.90,
                description: 'Para toda a família!',
                saving: 'Melhor custo-benefício'
            },
            { 
                name: 'Nuggets 10 unidades', 
                price: 22.90,
                description: 'Mais crocância para compartilhar!',
                saving: 'Acompanha 2 molhos'
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
                <small class="upsell-saving">${optionData.saving}</small>
            `;
            
            option.addEventListener('click', () => {
                addToCart(optionData.name, optionData.price, 'upsell');
                closeUpsellModal();
                
                // Mensagem de confirmação
                showNotification(`✅ ${optionData.name} adicionado!`, 'success');
                
                // Log para analytics
                logUpsellConversion(itemName, optionData.name);
            });
            
            options.appendChild(option);
        });
        
        modal.classList.add('active');
        
        // Garantir que o modal esteja visível e o botão de cancelar também
        setTimeout(() => {
            const modalFooter = modal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.style.display = 'flex';
            }
        }, 100);
    }, 1000);
}

function closeUpsellModal() {
    document.getElementById('upsell-modal').classList.remove('active');
    currentUpsellData = null;
}

function closeAllModals() {
    closeDrinkModal();
    closeWaterModal();
    closeUpsellModal();
}

// NOTIFICAÇÕES MELHORADAS
function showNotification(message, type = 'info') {
    // Remover notificações anteriores
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Ícones por tipo
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-times-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--whatsapp-green)' : 
                     type === 'warning' ? 'var(--laranja)' : 
                     type === 'error' ? 'var(--vermelho)' : 'var(--azul)'};
        color: white;
        padding: 15px 25px;
        border-radius: 12px;
        z-index: 2001;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// LOCALSTORAGE E SISTEMA DE PONTOS OTIMIZADO
function saveCartToStorage() {
    try {
        localStorage.setItem('resenhaburger_cart', JSON.stringify(cart));
        localStorage.setItem('resenhaburger_totals', JSON.stringify({ 
            subtotal, 
            pointsDiscount, 
            total 
        }));
    } catch (e) {
        console.warn('Não foi possível salvar no localStorage:', e);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('resenhaburger_cart');
        const savedTotals = localStorage.getItem('resenhaburger_totals');
        
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        if (savedTotals) {
            const totals = JSON.parse(savedTotals);
            subtotal = totals.subtotal || 0;
            pointsDiscount = totals.pointsDiscount || 0;
            total = totals.total || 0;
        }
        
        updateTotals();
        renderCart();
        updateCheckoutButton();
    } catch (e) {
        console.warn('Não foi possível carregar do localStorage:', e);
    }
}

function loadPointsAndPurchases() {
    try {
        const savedPoints = localStorage.getItem('resenhaburger_points');
        const savedPurchaseCount = localStorage.getItem('resenhaburger_purchaseCount');
        
        totalPoints = savedPoints ? parseInt(savedPoints) : 0;
        purchaseCount = savedPurchaseCount ? parseInt(savedPurchaseCount) : 0;
    } catch (e) {
        console.warn('Erro ao carregar pontos:', e);
    }
}

function savePointsAndPurchases() {
    try {
        localStorage.setItem('resenhaburger_points', totalPoints.toString());
        localStorage.setItem('resenhaburger_purchaseCount', purchaseCount.toString());
    } catch (e) {
        console.warn('Erro ao salvar pontos:', e);
    }
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Seu carrinho já está vazio!', 'info');
        return;
    }
    
    // Confirmação com sweet alert style
    const confirmClear = confirm('Tem certeza que deseja limpar todo o carrinho?');
    
    if (confirmClear) {
        const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
        cart = [];
        subtotal = 0;
        pointsDiscount = 0;
        total = 0;
        
        // Zera apenas os pontos do carrinho atual, mantém os pontos de compras anteriores
        // (os pontos totais não são zerados aqui)
        
        updateTotals();
        renderCart();
        saveCartToStorage();
        updateCheckoutButton();
        
        showNotification(`Carrinho limpo! ${itemCount} item(s) removido(s).`, 'warning');
        
        // Garantir que o localStorage seja atualizado
        localStorage.removeItem('resenhaburger_cart');
        localStorage.removeItem('resenhaburger_totals');
    }
}

// CHECKOUT WHATSAPP MELHORADO - COM SISTEMA DE PONTOS CORRIGIDO
function checkout() {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio 😅 Adicione itens deliciosos!', 'warning');
        return;
    }

    // Verificar horário de funcionamento
    if (!estaNoHorarioFuncionamento()) {
        // Fora do horário - enviar mensagem informando horário
        const mensagemForaHorario = encodeURIComponent(
            `Fala, chefia! 👊\n` +
            `A ResenhaBurger tá fechada agora 😴\n` +
            `Funcionamos de quinta a domingo, das 18:30 às 23:00.\n` +
            `Amanhã tem rango pesado 🍔🔥`
        );
        
        window.open(`https://wa.me/557133121092?text=${mensagemForaHorario}`, '_blank');
        showNotification('Fora do horário de funcionamento!', 'warning');
        return;
    }

    // Número do WhatsApp
    const phoneNumber = "557133121092";
    
    // Calcular pontos desta compra (baseado no subtotal)
    const pointsEarned = Math.floor(subtotal);
    let discountApplied = false;
    
    // VERIFICAR SE PODE APLICAR DESCONTO (apenas a partir da 2ª compra)
    if (purchaseCount >= 1) {
        const totalPointsAfterPurchase = totalPoints + pointsEarned;
        
        if (totalPointsAfterPurchase >= 150) {
            // Perguntar ao cliente se deseja aplicar o desconto
            const applyDiscount = confirm(`Você tem ${totalPoints} pontos acumulados e ganhará mais ${pointsEarned} pontos nesta compra.\n\nTotal de pontos após esta compra: ${totalPointsAfterPurchase}\n\nDeseja aplicar o desconto de R$ 10,00 nesta compra?`);
            
            if (applyDiscount) {
                pointsDiscount = 10.00;
                total = Math.max(0, subtotal - pointsDiscount);
                discountApplied = true;
                showNotification(`Desconto de R$ 10,00 aplicado com sucesso!`, 'success');
            }
        }
    }
    
    // Montar mensagem otimizada para conversão
    let message = `*RESENHABURGER - NOVO PEDIDO*%0A%0A`;
    message += `*Olá! Gostaria de fazer um pedido:*%0A%0A`;
    
    message += `*🍔 ITENS DO PEDIDO:*%0A`;
    
    cart.forEach((item, index) => {
        message += `➤ ${item.name} x${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
    });
    
    message += `%0A`;
    message += `*💰 RESUMO DO PEDIDO:*%0A`;
    message += `Subtotal: R$ ${subtotal.toFixed(2)}%0A`;
    
    if (discountApplied) {
        message += `Desconto Pontos: -R$ ${pointsDiscount.toFixed(2)}%0A`;
    }
    
    message += `*TOTAL: R$ ${total.toFixed(2)}*%0A`;
    message += `Pontos ganhos nesta compra: ${pointsEarned} pontos%0A`;
    
    if (discountApplied) {
        message += `Pontos totais após esta compra: ${totalPoints + pointsEarned} pontos%0A`;
        message += `*Desconto aplicado: R$ 10,00*%0A`;
    } else {
        message += `Pontos totais após esta compra: ${totalPoints + pointsEarned} pontos%0A`;
    }
    
    message += `%0A`;
    
    message += `*👤 MEUS DADOS:*%0A`;
    message += `Nome: ________________________%0A`;
    message += `Endereço: ________________________%0A`;
    message += `Telefone: ________________________%0A`;
    message += `Ponto de referência: ________________________%0A%0A`;
    
    message += `*💳 FORMA DE PAGAMENTO:*%0A`;
    message += `[ ] Cartão de crédito%0A`;
    message += `[ ] Cartão de débito%0A`;
    message += `[ ] Pix%0A`;
    message += `[ ] Dinheiro (troco para: ________)%0A%0A`;
    
    message += `*📝 OBSERVAÇÕES:*%0A`;
    message += `(Ex: sem cebola, mais molho, etc)%0A`;
    message += `________________________________________%0A%0A`;
    
    message += `_Pedido feito através do site resenhaburger.com_%0A`;
    message += `🍔 *Hambúrguer 100% soteropolitano* 🔥`;
    
    // Atualizar pontos (se aplicou desconto, não deduz os pontos)
    totalPoints += pointsEarned;
    purchaseCount += 1;
    savePointsAndPurchases();
    
    // Log para analytics
    logCheckoutInitiated(total);
    
    // Abrir WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
    
    // Limpar carrinho após finalização
    const oldCart = [...cart];
    cart = [];
    subtotal = 0;
    pointsDiscount = 0;
    total = 0;
    
    renderCart();
    saveCartToStorage();
    updateCheckoutButton();
    
    // Limpar localStorage do carrinho
    localStorage.removeItem('resenhaburger_cart');
    localStorage.removeItem('resenhaburger_totals');
    
    // Mostrar confirmação
    if (discountApplied) {
        showNotification(`Pedido enviado! Você ganhou ${pointsEarned} pontos e aplicou R$ 10,00 de desconto!`, 'success');
    } else {
        showNotification(`Pedido enviado! Você ganhou ${pointsEarned} pontos! Em breve retornaremos.`, 'success');
    }
    
    // Log de conversão
    logPurchaseComplete(oldCart, total);
}

// FUNÇÃO PARA VERIFICAR HORÁRIO DE FUNCIONAMENTO
function estaNoHorarioFuncionamento() {
    const agora = new Date();
    const dia = agora.getDay(); // 0 = Domingo
    const hora = agora.getHours();
    const minutos = agora.getMinutes();
    const horaAtual = hora + minutos/60;
    
    // Quinta a Domingo, 18:30 às 23:00
    const diasFuncionamento = [0, 4, 5, 6]; // Dom, Qui, Sex, Sáb
    const abertura = 18.5;
    const fechamento = 23;
    
    return diasFuncionamento.includes(dia) && 
           horaAtual >= abertura && 
           horaAtual < fechamento;
}

// FUNÇÕES DE OTIMIZAÇÃO
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para browsers antigos
        images.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

function setupMicroInteractions() {
    // Efeito de clique nos botões
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Efeito hover nos cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '';
        });
    });
}

// LOGS PARA ANALYTICS E REMARKETING
function logPageView() {
    console.log('Página visualizada:', window.location.href);
    // Aqui você integra com Google Analytics, Facebook Pixel, etc.
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'page_view',
            'page_path': window.location.pathname
        });
    }
}

function logCategoryView(categoryId) {
    console.log('Categoria visualizada:', categoryId);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'view_category',
            'category': categoryId
        });
    }
}

function logAddToCart(productName, price, type) {
    console.log('Produto adicionado ao carrinho:', productName, price, type);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'add_to_cart',
            'product_name': productName,
            'product_price': price,
            'product_type': type
        });
    }
}

function logCartView() {
    console.log('Carrinho visualizado. Itens:', cart.length);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'view_cart',
            'items_count': cart.length,
            'cart_value': total
        });
    }
}

function logUpsellConversion(mainProduct, upsellProduct) {
    console.log('Upsell convertido:', mainProduct, '->', upsellProduct);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'upsell_conversion',
            'main_product': mainProduct,
            'upsell_product': upsellProduct
        });
    }
}

function logCheckoutInitiated(totalValue) {
    console.log('Checkout iniciado. Valor:', totalValue);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'begin_checkout',
            'value': totalValue,
            'items': cart.map(item => ({
                'item_name': item.name,
                'price': item.price,
                'quantity': item.quantity
            }))
        });
    }
}

function logPurchaseComplete(cartItems, totalValue) {
    console.log('Compra concluída. Valor:', totalValue);
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'purchase',
            'transaction_id': 'RES' + Date.now(),
            'value': totalValue,
            'items': cartItems.map(item => ({
                'item_name': item.name,
                'price': item.price,
                'quantity': item.quantity
            }))
        });
    }
}

// Adicionar animações CSS dinamicamente
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
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .cart-item {
        animation: fadeIn 0.3s ease-out;
    }
    
    .notification-success {
        background: var(--whatsapp-green) !important;
    }
    
    .notification-warning {
        background: var(--laranja) !important;
    }
    
    .notification-error {
        background: var(--vermelho) !important;
    }
    
    .notification-info {
        background: var(--azul) !important;
    }
    
    .upsell-saving {
        color: var(--amarelo);
        font-weight: 600;
        display: block;
        margin-top: 5px;
        font-size: 0.85rem;
    }
    
    /* Melhorias de acessibilidade */
    button:focus, 
    .cat-btn:focus,
    .add-to-cart:focus {
        outline: 3px solid var(--amarelo);
        outline-offset: 2px;
    }
    
    /* Otimização de performance */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
`;
document.head.appendChild(style);

// Otimização de performance ao sair da página
window.addEventListener('beforeunload', function() {
    // Pausar animações
    clearInterval(sliderInterval);
    
    // Limpar observer
    if (observer) {
        observer.disconnect();
    }
    
    // Salvar estado atual
    saveCartToStorage();
    savePointsAndPurchases();
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('ServiceWorker registrado com sucesso: ', registration.scope);
        }, function(err) {
            console.log('Falha ao registrar ServiceWorker: ', err);
        });
    });
}