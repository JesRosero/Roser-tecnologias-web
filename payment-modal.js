// payment-modal.js - Modal de Métodos de Pago Global
const PaymentModal = {
    selectedMethod: null,
    callback: null,
    basePath: '../Marketplace/metodos de pago/',
    methods: [],

    init(config = {}) {
        this.basePath = config.basePath || '../Marketplace/metodos de pago/';
        this.methods = [
            { name: 'Nequi', logo: this.basePath + 'Nequi.png' },
            { name: 'Daviplata', logo: this.basePath + 'Daviplata.png' },
            { name: 'Bancolombia', logo: this.basePath + 'Bancolombia.png' },
            { name: 'Efecty', logo: this.basePath + 'Efecty.png' },
            { name: 'Visa', logo: this.basePath + 'Visa.png' },
            { name: 'Mastercard', logo: this.basePath + 'Mastercard.png' },
            { name: 'PSE', logo: this.basePath + 'PSE.png' }
        ];
        if (!document.getElementById('paymentModal')) {
            document.body.insertAdjacentHTML('beforeend', this.getHTML());
            this.attachEvents();
            this.addStyles();
        }
        // Crear botón flotante si no existe
        if (!document.querySelector('.floating-payment-btn')) {
            this.createFloatingButton();
        }
    },

    addStyles() {
        if (!document.getElementById('paymentModalStyles')) {
            const style = document.createElement('style');
            style.id = 'paymentModalStyles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .payment-option {
                    padding: 15px;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-align: center;
                    background: white;
                }
                .payment-option:hover {
                    border-color: #2196F3;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
                }
                .payment-option.selected {
                    border-color: #4CAF50;
                    background: #e8f5e9;
                    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
                }
                .payment-option img {
                    width: 80px;
                    height: 50px;
                    object-fit: contain;
                    margin-bottom: 8px;
                }
                #paymentModal .close {
                    color: #f44336;
                    font-size: 32px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.2s;
                }
                #paymentModal .close:hover {
                    color: #d32f2f;
                }
                .floating-payment-btn {
                    position: fixed;
                    bottom: 100px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    cursor: pointer;
                    z-index: 9998;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                .floating-payment-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                }
                .floating-payment-btn img {
                    width: 35px;
                    height: 35px;
                    object-fit: contain;
                }
            `;
            document.head.appendChild(style);
        }
    },

    createFloatingButton() {
        const btn = document.createElement('div');
        btn.className = 'floating-payment-btn';
        btn.title = 'Métodos de Pago';
        btn.onclick = () => this.open();
        btn.innerHTML = `<img src="${this.basePath}M.png" alt="Métodos de Pago">`;
        document.body.appendChild(btn);
    },

    getHTML() {
        const options = this.methods.map(m => `
            <div class="payment-option" data-method="${m.name}">
                <img src="${m.logo}" alt="${m.name}">
                <div style="font-weight: 600;">${m.name}</div>
            </div>
        `).join('');

        return `
            <div id="paymentModal" class="modal">
                <div class="modal-content" style="max-width: 600px; margin-top: 10vh; position: relative;">
                    <button class="close" style="position: absolute; top: 15px; right: 15px; background: #f44336; color: white; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(244,67,54,0.3); transition: all 0.2s; z-index: 1;" onmouseover="this.style.background='#d32f2f'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='#f44336'; this.style.transform='scale(1)'">&times;</button>
                    <div class="payment-header" style="padding: 20px; border-bottom: 1px solid #eee;">
                        <h2 style="margin: 0; color: #333; font-size: 1.5rem;">Selecciona tu Método de Pago</h2>
                        <p style="margin: 5px 0 0; color: #666;">Elige cómo prefieres pagar tu pedido</p>
                    </div>
                    <div class="payment-body" style="padding: 30px 20px;">
                        <div class="payment-options-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 20px;">
                            ${options}
                        </div>
                    </div>
                    <div class="payment-footer" style="padding: 20px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px;">
                        <button data-action="cancel" style="background: #f5f5f5; color: #333; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancelar</button>
                        <button data-action="confirm" style="background: #2196F3; color: white; border: none; padding: 10px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 10px rgba(33, 150, 243, 0.3);">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
    },

    attachEvents() {
        const modal = document.getElementById('paymentModal');
        const closeBtn = modal.querySelector('.close');
        
        closeBtn.onclick = () => this.close();
        
        modal.querySelectorAll('[data-action="cancel"]').forEach(el => {
            el.onclick = () => this.close();
        });

        modal.querySelector('[data-action="confirm"]').onclick = () => this.confirm();

        modal.querySelectorAll('.payment-option').forEach(el => {
            el.onclick = () => this.select(el.dataset.method, el);
        });

        modal.onclick = (e) => {
            if (e.target === modal) this.close();
        };
    },

    open(callback) {
        this.callback = callback;
        const savedMethod = localStorage.getItem('selectedPayment');
        if (savedMethod) {
            this.selectedMethod = savedMethod;
        }
        document.getElementById('paymentModal').style.display = 'block';
        setTimeout(() => {
            if (savedMethod) {
                const option = document.querySelector(`.payment-option[data-method="${savedMethod}"]`);
                if (option) option.classList.add('selected');
            }
        }, 50);
    },

    close() {
        document.getElementById('paymentModal').style.display = 'none';
        document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
    },

    select(method, element) {
        this.selectedMethod = method;
        document.querySelectorAll('.payment-option').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    },

    playSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) {
            console.log('Audio context not supported');
        }
    },

    showNotification(method) {
        let toast = document.querySelector('.toast-notification');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        toast.innerHTML = `
            <div class="toast-icon-container"><span class="toast-icon">✓</span></div>
            <div class="toast-content">
                <span class="toast-title">¡Método Confirmado!</span>
                <span class="toast-message">Pago actualizado a: ${method}</span>
            </div>
        `;
        
        void toast.offsetWidth;
        toast.classList.add('show');
        this.playSound();
        
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        window.toastTimeout = setTimeout(() => { toast.classList.remove('show'); }, 4000);
    },

    confirm() {
        if (!this.selectedMethod) {
            alert('Por favor selecciona un método de pago');
            return;
        }
        localStorage.setItem('selectedPayment', this.selectedMethod);
        this.close();
        this.showNotification(this.selectedMethod);
        if (this.callback) {
            this.callback(this.selectedMethod);
        }
    },

    getSelected() {
        return this.selectedMethod;
    }
};

// No auto-inicializar, esperar configuración manual

// Funciones globales para compatibilidad con código existente
function openPaymentModal(callback) {
    PaymentModal.open(callback);
}

function closePaymentModal() {
    PaymentModal.close();
}

function selectPayment(method, element) {
    PaymentModal.select(method, element);
}

function confirmPaymentSelection() {
    PaymentModal.confirm();
}
