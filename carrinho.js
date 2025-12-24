// ============================================
// SISTEMA DE CARRINHO UNIFICADO
// ============================================

// Configuração inicial
const CART_KEY = 'panificadoraCart';

// ============================================
// FUNÇÕES PRINCIPAIS DO CARRINHO
// ============================================

// 1. Obter carrinho atual
function getCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        if (cartData && cartData !== 'undefined' && cartData !== 'null') {
            return JSON.parse(cartData);
        }
    } catch (error) {
        console.error('Erro ao ler carrinho:', error);
    }
    return [];
}

// 2. Salvar carrinho
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
        return false;
    }
}

// 3. Adicionar item ao carrinho (USADA NAS PÁGINAS DE PRODUTOS)
function addToCart(item) {
    console.log('📦 Adicionando item:', item.name);
    
    let cart = getCart();
    
    // Verificar se item já existe
    const existingIndex = cart.findIndex(cartItem => cartItem.name === item.name);
    
    if (existingIndex !== -1) {
        // Aumentar quantidade
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        console.log(`✅ Quantidade de "${item.name}" aumentada para: ${cart[existingIndex].quantity}`);
    } else {
        // Adicionar novo item
        item.quantity = 1;
        cart.push(item);
        console.log(`✅ Novo item adicionado: "${item.name}"`);
    }
    
    // Salvar carrinho
    saveCart(cart);
    
    // Atualizar contador
    updateCartCount();
    
    // Mostrar notificação
    showAddNotification(item.name);
    
    return cart;
}

// 4. Atualizar contador do carrinho (para todas as páginas)
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    console.log(`🔢 Contador atualizado: ${totalItems} itens`);
    
    // Atualizar todos os elementos .cart-count
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
    });
    
    return totalItems;
}

// ============================================
// FUNÇÕES PARA PÁGINA DE PEDIDO (fazerpedido.html)
// ============================================

// 5. Exibir itens do carrinho na página de pedido
function displayOrderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    
    const cart = getCart();
    
    // Limpar container
    container.innerHTML = '';
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione itens do cardápio para fazer um pedido</p>
                <a href="entradas.html" class="nav-button">Ver Cardápio</a>
            </div>
        `;
        return;
    }
    
    // Adicionar cada item
    cart.forEach((item, index) => {
        const quantity = item.quantity || 1;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-price">R$ ${item.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span class="quantity-display">${quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
            </div>
            <button class="remove-item" data-index="${index}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(itemElement);
    });
    
    // Configurar eventos dos botões
    setupOrderButtons();
}

// 6. Configurar botões da página de pedido
function setupOrderButtons() {
    // Botão de diminuir quantidade
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateItemQuantity(index, -1);
        });
    });
    
    // Botão de aumentar quantidade
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            updateItemQuantity(index, 1);
        });
    });
    
    // Botão de remover item
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            removeItemFromCart(index);
        });
    });
}

// 7. Atualizar quantidade de item
function updateItemQuantity(index, change) {
    let cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        const currentQuantity = cart[index].quantity || 1;
        const newQuantity = currentQuantity + change;
        
        if (newQuantity < 1) {
            // Remover item se quantidade for 0
            cart.splice(index, 1);
            console.log(`🗑️ Item removido do carrinho`);
        } else {
            // Atualizar quantidade
            cart[index].quantity = newQuantity;
            console.log(`🔄 Quantidade atualizada para: ${newQuantity}`);
        }
        
        saveCart(cart);
        displayOrderCart();
        updateOrderSummary();
        updateCartCount(); // Atualizar contador em todas as páginas
    }
}

// 8. Remover item do carrinho
function removeItemFromCart(index) {
    let cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        const itemName = cart[index].name;
        cart.splice(index, 1);
        saveCart(cart);
        
        console.log(`🗑️ "${itemName}" removido do carrinho`);
        
        // Atualizar interface
        displayOrderCart();
        updateOrderSummary();
        updateCartCount();
    }
}

// 9. Atualizar resumo do pedido
function updateOrderSummary() {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => {
        const quantity = item.quantity || 1;
        return sum + (item.price * quantity);
    }, 0);
    
    // Obter taxa de entrega
    let deliveryFee = 5.00;
    const deliveryOption = document.querySelector('input[name="delivery-option"]:checked');
    if (deliveryOption && deliveryOption.id === 'delivery-pickup') {
        deliveryFee = 0;
    }
    
    // Calcular total
    const total = subtotal + deliveryFee;
    
    // Atualizar elementos
    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total-price');
    
    if (subtotalEl) subtotalEl.textContent = `R$ ${subtotal.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = `R$ ${deliveryFee.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `R$ ${total.toFixed(2)}`;
    
    // Validar formulário
    validateOrderForm();
}

// ============================================
// FUNÇÕES DE INTERFACE
// ============================================

// 10. Mostrar notificação de item adicionado
function showAddNotification(itemName) {
    // Tentar usar modal existente
    const modal = document.getElementById('add-to-cart-modal');
    const modalItemName = document.getElementById('modal-item-name');
    
    if (modal && modalItemName) {
        modalItemName.textContent = itemName;
        modal.style.display = 'flex';
        
        // Fechar automaticamente após 3 segundos
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
        
        // Configurar botão de fechar
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        
        // Configurar botão de continuar
        const continueBtn = modal.querySelector('.modal-btn.continue');
        if (continueBtn) {
            continueBtn.onclick = () => modal.style.display = 'none';
        }
    } else {
        // Se não houver modal, mostrar alerta simples
        alert(`✅ "${itemName}" adicionado ao carrinho!`);
    }
}

// 11. Validar formulário de pedido
function validateOrderForm() {
    const name = document.getElementById('customer-name');
    const phone = document.getElementById('customer-phone');
    const address = document.getElementById('delivery-address');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!name || !phone || !address || !checkoutBtn) return false;
    
    const cart = getCart();
    const cartNotEmpty = cart.length > 0;
    const formValid = name.value.trim() && phone.value.trim() && address.value.trim() && cartNotEmpty;
    
    checkoutBtn.disabled = !formValid;
    return formValid;
}

// ============================================
// INICIALIZAÇÃO DO SISTEMA
// ============================================

// 12. Inicializar para páginas de produtos (pratosdoces.html, pratos principais.html)
function initProductPage() {
    console.log('🚀 Inicializando página de produtos');
    
    // Atualizar contador do carrinho
    updateCartCount();
    
    // Configurar botões "Adicionar ao Carrinho"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Remover eventos antigos
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo evento
        newButton.addEventListener('click', function() {
            try {
                const itemData = JSON.parse(this.getAttribute('data-item'));
                addToCart(itemData);
            } catch (error) {
                console.error('❌ Erro ao adicionar item:', error);
                alert('Erro ao adicionar item. Tente novamente.');
            }
        });
    });
    
    console.log(`✅ ${document.querySelectorAll('.add-to-cart').length} botões configurados`);
}

// 13. Inicializar para página de pedido (fazerpedido.html)
function initOrderPage() {
    console.log('🚀 Inicializando página de pedido');
    
    // Exibir itens do carrinho
    displayOrderCart();
    updateOrderSummary();
    
    // Configurar eventos de entrega
    document.querySelectorAll('.delivery-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.delivery-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            
            updateOrderSummary();
        });
    });
    
    // Configurar formas de pagamento
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('selected');
            });
            this.classList.add('selected');
            
            const paymentMethod = this.getAttribute('data-method');
            const changeField = document.getElementById('change-field');
            
            if (changeField) {
                changeField.style.display = paymentMethod === 'dinheiro' ? 'block' : 'none';
            }
        });
    });
    
    // Configurar validação do formulário
    ['customer-name', 'customer-phone', 'delivery-address'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', validateOrderForm);
        }
    });
    
    // Configurar botão de finalizar pedido
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!validateOrderForm()) {
                alert('Por favor, preencha todos os campos obrigatórios e adicione itens ao carrinho.');
                return;
            }
            
            // Coletar dados do pedido
            const order = {
                customer: {
                    name: document.getElementById('customer-name').value,
                    phone: document.getElementById('customer-phone').value,
                    email: document.getElementById('customer-email').value || '',
                    address: document.getElementById('delivery-address').value,
                    complement: document.getElementById('delivery-complement').value || '',
                    reference: document.getElementById('delivery-reference').value || '',
                    instructions: document.getElementById('delivery-instructions').value || ''
                },
                delivery: {
                    type: document.querySelector('input[name="delivery-option"]:checked').id,
                    fee: document.querySelector('input[name="delivery-option"]:checked').id === 'delivery-pickup' ? 0 : 5.00
                },
                payment: {
                    method: document.querySelector('.payment-method.selected').getAttribute('data-method'),
                    change: document.getElementById('change-for')?.value || 0
                },
                cart: getCart(),
                subtotal: parseFloat(document.getElementById('subtotal').textContent.replace('R$ ', '')),
                total: parseFloat(document.getElementById('total-price').textContent.replace('R$ ', '')),
                date: new Date().toLocaleString('pt-BR')
            };
            
            // Mostrar confirmação
            showOrderConfirmation(order);
            
            // Limpar carrinho após finalizar
            localStorage.removeItem(CART_KEY);
            updateCartCount();
        });
    }
    
    // Configurar modal de confirmação
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-modal');
        const continueBtn = document.getElementById('continue-shopping');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                window.location.href = 'entradas.html';
            });
        }
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

// 14. Mostrar confirmação do pedido
function showOrderConfirmation(order) {
    const details = document.getElementById('order-details');
    const modal = document.getElementById('confirmation-modal');
    
    if (!details || !modal) return;
    
    // Limpar conteúdo anterior
    details.innerHTML = '';
    
    // Adicionar itens do pedido
    order.cart.forEach(item => {
        const quantity = item.quantity || 1;
        const itemElement = document.createElement('p');
        itemElement.innerHTML = `<strong>${item.name} x${quantity}:</strong> R$ ${(item.price * quantity).toFixed(2)}`;
        details.appendChild(itemElement);
    });
    
    // Adicionar totais
    const subtotal = document.createElement('p');
    subtotal.innerHTML = `<strong>Subtotal:</strong> R$ ${order.subtotal.toFixed(2)}`;
    details.appendChild(subtotal);
    
    const delivery = document.createElement('p');
    delivery.innerHTML = `<strong>Taxa de entrega:</strong> R$ ${order.delivery.fee.toFixed(2)}`;
    details.appendChild(delivery);
    
    const total = document.createElement('p');
    total.innerHTML = `<strong>Total:</strong> R$ ${order.total.toFixed(2)}`;
    details.appendChild(total);
    
    // Mostrar modal
    modal.style.display = 'flex';
}

// 15. Função principal de inicialização
function initCartSystem() {
    console.log('🛒 Sistema de carrinho inicializando...');
    
    // Verificar qual página estamos
    if (document.getElementById('cart-items-container')) {
        // Página de pedido
        initOrderPage();
    } else {
        // Página de produtos
        initProductPage();
    }
    
    console.log('✅ Sistema de carrinho inicializado com sucesso!');
}

// ============================================
// EXECUÇÃO AUTOMÁTICA
// ============================================

// Executar quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartSystem);
} else {
    initCartSystem();
}

// ============================================
// FUNÇÕES DE DEPURAÇÃO (REMOVER EM PRODUÇÃO)
// ============================================

// Para testar: console.log(getCart());
// Para limpar: localStorage.removeItem('panificadoraCart');