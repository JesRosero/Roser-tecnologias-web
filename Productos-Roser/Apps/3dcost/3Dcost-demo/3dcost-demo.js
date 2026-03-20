// Variables globales
let currentScreen = 1;
const totalScreens = 9;

// Función para cambiar de pantalla
function goToScreen(screenNumber) {
    // Ocultar pantalla actual
    const currentScreenElement = document.getElementById(`screen-${currentScreen}`);
    if (currentScreenElement) {
        currentScreenElement.classList.remove('active');
    }
    
    // Mostrar nueva pantalla
    const newScreenElement = document.getElementById(`screen-${screenNumber}`);
    if (newScreenElement) {
        newScreenElement.classList.add('active');
        currentScreen = screenNumber;
        
        // Agregar animación de transición
        newScreenElement.style.opacity = '0';
        newScreenElement.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            newScreenElement.style.transition = 'all 0.3s ease';
            newScreenElement.style.opacity = '1';
            newScreenElement.style.transform = 'translateX(0)';
        }, 50);
    }
    
    // Actualizar navegación
    updateNavigation();
}

// Función para actualizar la navegación
function updateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        btn.classList.remove('active');
    });
    
    // Marcar botón activo basado en la pantalla actual
    const activeIndex = getNavIndexFromScreen(currentScreen);
    if (activeIndex >= 0 && navButtons[activeIndex]) {
        navButtons[activeIndex].classList.add('active');
    }
}

// Función para obtener el índice de navegación basado en la pantalla
function getNavIndexFromScreen(screenNumber) {
    const screenToNavMap = {
        1: 0, // Inicio
        2: 1, // Empresa
        3: 2, // Datos
        4: 3, // Filamento
        5: 4, // Energía
        6: 5, // Mano de Obra
        9: 6  // Resultado
    };
    return screenToNavMap[screenNumber] || -1;
}

// Funciones para simular interacciones
function simulateCalculation() {
    // Simular cálculo con loading
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Calculando...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        goToScreen(currentScreen + 1);
    }, 1500);
}

// Función para simular exportación PDF
function simulateExport() {
    const button = event.target;
    const originalText = button.textContent;
    
    button.textContent = 'Generando PDF...';
    button.disabled = true;
    
    setTimeout(() => {
        button.textContent = '✅ PDF Generado';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 2000);
    }, 2000);
}

// Función para actualizar valores en tiempo real
function updateValue(inputElement, targetElement) {
    if (targetElement) {
        targetElement.textContent = inputElement.value;
    }
    recalculateTotal();
}

// Función para recalcular totales
function recalculateTotal() {
    // Simular recálculo de totales basado en inputs
    const filamentCost = 891.25;
    const energyCost = 423.31;
    const laborCost = 40000;
    const machineCost = 2613.53;
    
    const total = filamentCost + energyCost + laborCost + machineCost;
    
    // Actualizar displays de total si existen
    const totalElements = document.querySelectorAll('.cost-amount');
    totalElements.forEach(element => {
        if (element.textContent.includes('COP')) {
            // Mantener formato original
        }
    });
}

// Función para manejar inputs interactivos
function setupInteractiveInputs() {
    // Hacer inputs editables
    const inputs = document.querySelectorAll('.time-input, .weight-input, .price-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            recalculateTotal();
        });
        
        input.addEventListener('focus', function() {
            this.style.background = '#e3f2fd';
        });
        
        input.addEventListener('blur', function() {
            this.style.background = 'white';
        });
    });
}

// Función para agregar efectos de hover a botones
function setupButtonEffects() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Función para simular carga de datos
function simulateDataLoading() {
    const loadingElements = document.querySelectorAll('.input-field span:last-child');
    loadingElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.opacity = '1';
            }, 200);
        }, index * 100);
    });
}

// Función para navegación con teclado
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowRight':
                if (currentScreen < totalScreens) {
                    const nextScreen = currentScreen === 6 ? 9 : currentScreen + 1;
                    goToScreen(nextScreen);
                }
                break;
            case 'ArrowLeft':
                if (currentScreen > 1) {
                    const prevScreen = currentScreen === 9 ? 6 : currentScreen - 1;
                    goToScreen(prevScreen);
                }
                break;
            case 'Home':
                goToScreen(1);
                break;
            case 'End':
                goToScreen(9);
                break;
        }
    });
}

// Función para mostrar tooltips informativos
function setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.top - 30) + 'px';
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Configurar funcionalidades interactivas
    setupInteractiveInputs();
    setupButtonEffects();
    setupKeyboardNavigation();
    setupTooltips();
    
    // Mostrar pantalla inicial
    goToScreen(1);
    
    // Simular carga inicial de datos
    setTimeout(simulateDataLoading, 500);
    
    // Agregar indicador de navegación con teclado
    const keyboardHint = document.createElement('div');
    keyboardHint.innerHTML = '💡 Usa las flechas del teclado para navegar';
    keyboardHint.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.8rem;
        z-index: 1000;
    `;
    document.body.appendChild(keyboardHint);
    
    // Ocultar hint después de 5 segundos
    setTimeout(() => {
        keyboardHint.style.opacity = '0';
        keyboardHint.style.transition = 'opacity 1s';
        setTimeout(() => keyboardHint.remove(), 1000);
    }, 5000);
});

// Función para resetear demo
function resetDemo() {
    goToScreen(1);
    // Resetear todos los inputs a valores por defecto
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = input.defaultValue || '';
    });
    recalculateTotal();
}