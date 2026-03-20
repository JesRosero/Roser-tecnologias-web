// Mobile menu toggle - Esperar a que el navbar esté listo
document.addEventListener('navbarReady', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const menuButton = document.querySelector('.menu-button');
    const sidebarDropdown = document.querySelector('.sidebar-dropdown');
    const sectionHeaders = document.querySelectorAll('.section-header');

    if (!hamburger || !menuButton || !sidebarDropdown) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Menu button toggle
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarDropdown.classList.toggle('active');
    });

// Section headers toggle
sectionHeaders.forEach(sectionHeader => {
    sectionHeader.setAttribute('tabindex', '0');
    
    const toggleSection = (e) => {
        e.stopPropagation();
        const subsection = sectionHeader.nextElementSibling;
        const sectionArrow = sectionHeader.querySelector('.section-arrow');
        
        subsection.classList.toggle('active');
        if (sectionArrow) {
            sectionArrow.style.transform = subsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    };
    
    sectionHeader.addEventListener('click', toggleSection);
    
    sectionHeader.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleSection(e);
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const subsection = sectionHeader.nextElementSibling;
            const sectionArrow = sectionHeader.querySelector('.section-arrow');
            
            if (!subsection.classList.contains('active')) {
                subsection.classList.add('active');
                if (sectionArrow) {
                    sectionArrow.style.transform = 'rotate(180deg)';
                }
            }
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const subsection = sectionHeader.nextElementSibling;
            const sectionArrow = sectionHeader.querySelector('.section-arrow');
            
            if (subsection.classList.contains('active')) {
                subsection.classList.remove('active');
                if (sectionArrow) {
                    sectionArrow.style.transform = 'rotate(0deg)';
                }
            }
        }
    });
});

// Apps header toggle
document.querySelectorAll('.apps-header').forEach(appsHeader => {
    appsHeader.setAttribute('tabindex', '0');
    
    const toggleAppsSubmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const subSubsection = appsHeader.nextElementSibling;
        const sectionArrow = appsHeader.querySelector('.section-arrow');
        
        if (subSubsection && subSubsection.classList.contains('sub-subsection')) {
            subSubsection.classList.toggle('active');
            if (sectionArrow) {
                sectionArrow.style.transform = subSubsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    };
    
    appsHeader.addEventListener('click', toggleAppsSubmenu);
    
    appsHeader.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            toggleAppsSubmenu(e);
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const subSubsection = appsHeader.nextElementSibling;
            const sectionArrow = appsHeader.querySelector('.section-arrow');
            
            if (subSubsection && subSubsection.classList.contains('sub-subsection') && !subSubsection.classList.contains('active')) {
                subSubsection.classList.add('active');
                if (sectionArrow) {
                    sectionArrow.style.transform = 'rotate(180deg)';
                }
            }
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const subSubsection = appsHeader.nextElementSibling;
            const sectionArrow = appsHeader.querySelector('.section-arrow');
            
            if (subSubsection && subSubsection.classList.contains('sub-subsection') && subSubsection.classList.contains('active')) {
                subSubsection.classList.remove('active');
                if (sectionArrow) {
                    sectionArrow.style.transform = 'rotate(0deg)';
                }
            }
        }
    });
});

// Prototypes header toggle
document.querySelectorAll('.prototypes-header').forEach(prototypesHeader => {
    prototypesHeader.setAttribute('tabindex', '0');
    
    const togglePrototypesSubmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prototypeSubsection = prototypesHeader.nextElementSibling;
        const sectionArrow = prototypesHeader.querySelector('.section-arrow');
        
        if (prototypeSubsection && prototypeSubsection.classList.contains('prototype-subsection')) {
            prototypeSubsection.classList.toggle('active');
            if (sectionArrow) {
                sectionArrow.style.transform = prototypeSubsection.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        }
    };
    
    prototypesHeader.addEventListener('click', togglePrototypesSubmenu);
    
    prototypesHeader.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            togglePrototypesSubmenu(e);
        }
    });
});

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuButton.contains(e.target) && !sidebarDropdown.contains(e.target)) {
            sidebarDropdown.classList.remove('active');
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));

    // Close sidebar dropdown when clicking on a link
    document.querySelectorAll('.sidebar-dropdown a:not(.apps-header)').forEach(n => n.addEventListener('click', () => {
        sidebarDropdown.classList.remove('active');
    }));
});

// Search functionality
const searchBar = document.querySelector('.search-bar');
const clearButton = document.querySelector('.clear-button');
const productsGrid = document.querySelector('.products-grid');

if (searchBar) {
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const products = document.querySelectorAll('.product-item');
        
        products.forEach(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();
            const description = product.querySelector('.product-description').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
        
        // Show/hide clear button
        if (searchTerm) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    });
}

if (clearButton) {
    clearButton.addEventListener('click', function() {
        searchBar.value = '';
        searchBar.dispatchEvent(new Event('input'));
        searchBar.focus();
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile app interactions
document.querySelectorAll('.green-btn, .outline-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        if (this.textContent.includes('Calcular costo')) {
            alert('Navegando a calculadora de costos...');
        } else if (this.textContent.includes('Configurar empresa')) {
            alert('Abriendo configuración de empresa...');
        } else if (this.textContent.includes('Continuar')) {
            alert('Continuando al siguiente paso...');
        } else if (this.textContent.includes('Mostrar ayuda')) {
            alert('Mostrando ayuda del sistema...');
        }
    });
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
        this.reset();
    });
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

function openProductModal(productId) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    // Add click outside to close functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeProductModal();
        }
    });
    
    if (productId === 'chasis-gamer') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Chasis gamer/1.jpg" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Chasis gamer/1.jpg')">
                        <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                            <img src="Marketplace/Chasis gamer/1.jpg" onclick="changeImage('Marketplace/Chasis gamer/1.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #2196F3;">
                            <img src="Marketplace/Chasis gamer/2.jpg" onclick="changeImage('Marketplace/Chasis gamer/2.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/3.jpg" onclick="changeImage('Marketplace/Chasis gamer/3.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/4.jpg" onclick="changeImage('Marketplace/Chasis gamer/4.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/5.jpg" onclick="changeImage('Marketplace/Chasis gamer/5.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/6.jpg" onclick="changeImage('Marketplace/Chasis gamer/6.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/7.jpg" onclick="changeImage('Marketplace/Chasis gamer/7.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/8.jpg" onclick="changeImage('Marketplace/Chasis gamer/8.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Chasis gamer/9.jpg" onclick="changeImage('Marketplace/Chasis gamer/9.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                        </div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Chasis Gamer Cougar Panzer Evo RGB (Usado)</h2>
                        <div style="background: #FF9800; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Usado</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$599.000 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 1 día</div>
                        
                        <div style="margin-bottom: 20px;">
                            <div style="background: #FF5722; color: white; padding: 10px 15px; border-radius: 8px; text-align: center; font-weight: 600; margin-bottom: 15px;">
                                ⚠️ Última Unidad Disponible
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: $599.000 COP</div>
                        </div>
                        
                        <button onclick="contactWhatsApp('Chasis Gamer Cougar Panzer Evo RGB (Usado)', null, null)" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">PANZER EVO RGB - El Titán Cristalino RGB</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Panzer EVO RGB es la combinación perfecta de vidrio templado e iluminación RGB. Con cuatro ventiladores ARGB de nueva generación con control remoto y más de 100 efectos RGB programados, ésta es una de las cajas más bonitas que se haya visto jamás.</p>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Características del producto</h3>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Cougar</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Línea</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">PANZER</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">PANZER EVO RGB</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo alfanumérico</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">CGR-6AMTB-RGB</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Color</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Negro</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Dimensiones</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Altura x Ancho x Largo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">61.2 cm x 26.6 cm x 55.6 cm</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Incluye fuente de alimentación</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Bahías</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">2.5 in, 3.5 in</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Tipo de estructura</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Torre</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Materiales de la caja</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Metal, Plástico ABS, Vidrio templado</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Placas madre compatibles</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Mini ITX / Micro ATX / ATX / CEB / E-ATX (E-ATX hasta 12"x11")</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Es gamer</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Cantidad máxima de ventiladores</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">8</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Incluye panel lateral</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Accesorios incluidos</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Soporte diadema auriculares</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    } else if (productId === 'soporte-qr') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Soporte QR/QR1.jpg" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Soporte QR/QR1.jpg')">
                        <div style="display: flex; gap: 8px; margin-top: 15px;">
                            <img src="Marketplace/Soporte QR/QR1.jpg" onclick="changeImage('Marketplace/Soporte QR/QR1.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #2196F3;">
                            <img src="Marketplace/Soporte QR/QR2.jpg" onclick="changeImage('Marketplace/Soporte QR/QR2.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Soporte QR/QR3.jpg" onclick="changeImage('Marketplace/Soporte QR/QR3.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                        </div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Soporte QR para Negocios</h2>
                        <div style="background: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Nuevo</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$98.000 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 5 días</div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: #333; font-weight: 600; margin-bottom: 10px; display: block;">Cantidad:</label>
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <button onclick="changeQuantity('soporte-qr', -1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">-</button>
                                <span id="quantity-soporte-qr" style="font-size: 1.2rem; font-weight: 600; min-width: 30px; text-align: center;">1</span>
                                <button onclick="changeQuantity('soporte-qr', 1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">+</button>
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: <span id="total-soporte-qr">$98.000 COP</span></div>
                        </div>
                        <button onclick="contactWhatsApp('Soporte QR para Negocios', null, 'soporte-qr')" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: #333; margin-bottom: 15px;">Video Demostrativo</h3>
                    <div style="position: relative; width: 60%; padding-bottom: 33.75%; height: 0; overflow: hidden; border-radius: 10px; margin: 0 auto;">
                        <video controls style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain; border-radius: 10px;">
                            <source src="Marketplace/Soporte QR/Soporte QR Clip Mercadolibre.mp4" type="video/mp4">
                            Tu navegador no soporta el elemento de video.
                        </video>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">Descripción del producto</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Solución práctica y estética para mostrar códigos QR de pagos, redes sociales o contacto de forma profesional en tu negocio. Permite exhibir el QR junto con información de contacto, facilitando el acceso rápido a pagos digitales.</p>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">Su diseño moderno y minimalista es ideal para tiendas, restaurantes, cafés, peluquerías, barberías, consultorios y cualquier punto de atención al público.</p>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Características del producto</h3>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Fabricante</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Tecnologías</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">QR-Stand Pro</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Plast</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Color</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Negro</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Dimensiones</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Largo x Ancho</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">26 cm x 18 cm</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Forma</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Rectangular Vertical</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Materiales</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">PLA</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Usos recomendados</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Interior</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Es personalizado</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    } else if (productId === 'organizador-magnetico') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Organizador Magnético De Cables Hasta 80cm Hexastack H1-80/Negro/1.jpg" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Organizador Magnético De Cables Hasta 80cm Hexastack H1-80/Negro/1.jpg')">
                        <div id="thumbnailContainer" style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;"></div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Organizador Magnético HexaStack H1-80</h2>
                        <div style="background: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Nuevo</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$61.069 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 3 días</div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">Selecciona el color:</h4>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button onclick="changeColor('Negro')" style="background: #333; width: 40px; height: 40px; border: 4px solid #2196F3; border-radius: 50%; cursor: pointer; transform: scale(1.1); box-shadow: 0 0 10px rgba(33, 150, 243, 0.5); transition: all 0.3s ease;"></button>
                                <button onclick="changeColor('Azul')" style="background: #2196F3; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></button>
                                <button onclick="changeColor('Plateado')" style="background: #C0C0C0; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></button>
                                <button onclick="changeColor('Rojo')" style="background: #F44336; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></button>
                                <button onclick="changeColor('Blanco')" style="background: #FFF; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; box-shadow: 0 0 0 1px #ddd; transition: all 0.3s ease;"></button>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: #333; font-weight: 600; margin-bottom: 10px; display: block;">Cantidad:</label>
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <button onclick="changeQuantity('organizador-magnetico', -1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">-</button>
                                <span id="quantity-organizador-magnetico" style="font-size: 1.2rem; font-weight: 600; min-width: 30px; text-align: center;">1</span>
                                <button onclick="changeQuantity('organizador-magnetico', 1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">+</button>
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: <span id="total-organizador-magnetico">$61.069 COP</span></div>
                        </div>
                        
                        <button onclick="contactWhatsApp('Organizador Magnético HexaStack H1-80', currentColor, 'organizador-magnetico')" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">Descripción del Producto</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Caja organizadora magnética apilable para cables de hasta 80 cm. Su diseño hexagonal permite apilarla fácilmente junto a otras unidades, ocupando menos espacio y manteniendo el orden en escritorios, mochilas o estaciones de trabajo.</p>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Modular</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">HexaStack H1-80</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Dimensiones</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Altura x Ancho</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">3 cm x 7 cm</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Material</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">PLA</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Cantidad de compartimentos</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">1</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Es a prueba de agua</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Con correa de mano</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Cable incluido</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
        
        // Initialize with Negro color
        changeColor('Negro');
    } else if (productId === 'baluns-borneras-pequeno') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Caja Para Cables CCTV Cámaras De Seguridad/Negra/1.png" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Caja Para Cables CCTV Cámaras De Seguridad/Negra/1.png')">
                        <div id="thumbnailContainer" style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;"></div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Organizador de Cables UTP RP-DVRbox44</h2>
                        <div style="background: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Nuevo</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$36.900 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 3 días</div>
                        
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #333; margin-bottom: 10px;">Selecciona el color:</h4>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button onclick="changeColorBaluns('Negra')" style="background: #333; width: 40px; height: 40px; border: 4px solid #2196F3; border-radius: 50%; cursor: pointer; transform: scale(1.1); box-shadow: 0 0 10px rgba(33, 150, 243, 0.5); transition: all 0.3s ease;"></button>
                                <button onclick="changeColorBaluns('Indigo')" style="background: #4B0082; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></button>
                                <button onclick="changeColorBaluns('Gris')" style="background: #808080; width: 40px; height: 40px; border: 4px solid transparent; border-radius: 50%; cursor: pointer; transition: all 0.3s ease;"></button>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: #333; font-weight: 600; margin-bottom: 10px; display: block;">Cantidad:</label>
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <button onclick="changeQuantity('baluns-borneras-pequeno', -1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">-</button>
                                <span id="quantity-baluns-borneras-pequeno" style="font-size: 1.2rem; font-weight: 600; min-width: 30px; text-align: center;">1</span>
                                <button onclick="changeQuantity('baluns-borneras-pequeno', 1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">+</button>
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: <span id="total-baluns-borneras-pequeno">$36.900 COP</span></div>
                        </div>
                        
                        <button onclick="contactWhatsApp('Organizador de Cables UTP RP-DVRbox44', currentColorBaluns, 'baluns-borneras-pequeno')" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #2196F3;">
                    <h3 style="color: #333; margin-bottom: 15px;">Antes y Después de la Instalación</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #ddd; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 6:</strong><br><span style="color: #888; font-size: 0.9rem;">Antes</span></div>
                        </div>
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #ddd; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 7:</strong><br><span style="color: #888; font-size: 0.9rem;">Cables desordenados</span></div>
                        </div>
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #2196F3; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 8:</strong><br><span style="color: #888; font-size: 0.9rem;">Con nuestra caja - Cables organizados</span></div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">Descripción del producto</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Organizador de Cables UTP para DVR y Cámaras de Seguridad. Diseñado especialmente para centralizar y organizar las conexiones en la zona del DVR, ideal para instaladores y técnicos de CCTV.</p>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Características del producto</h3>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Plast</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">RP-DVRbox44</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Capacidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">4 baluns + 4 borneras</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Entradas UTP</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">4 con prensa cables</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Dimensiones</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Altura x Ancho x Profundidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">22 x 115 x 105 mm</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Material</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Plástico de alta resistencia</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Uso recomendado</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">DVR, CCTV, cámaras IP y análogas</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Formato del organizador</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Organizador de cables</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Baluns y borneras incluidos</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Etiqueta de originalidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
        
        // Initialize with Negra color
        changeColorBaluns('Negra');
    } else if (productId === 'baluns-borneras') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/1.png" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/1.png')" onerror="console.log('Error loading image:', this.src)">
                        <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/1.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/1.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #2196F3;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/2.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/2.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/3.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/3.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/4.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/4.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/5.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/5.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" title="Antes">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" title="Cables desordenados">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png" onclick="changeImage('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;" title="Con nuestra caja - Cables organizados">
                        </div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Caja Para Cables CCTV Cámaras De Seguridad</h2>
                        <div style="background: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Nuevo</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$49.800 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 3 días</div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: #333; font-weight: 600; margin-bottom: 10px; display: block;">Cantidad:</label>
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <button onclick="changeQuantity('baluns-borneras', -1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">-</button>
                                <span id="quantity-baluns-borneras" style="font-size: 1.2rem; font-weight: 600; min-width: 30px; text-align: center;">1</span>
                                <button onclick="changeQuantity('baluns-borneras', 1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">+</button>
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: <span id="total-baluns-borneras">$49.800 COP</span></div>
                        </div>
                        
                        <button onclick="contactWhatsApp('Organizador de Cables UTP RP-DVRbox88', null, 'baluns-borneras')" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 4px solid #2196F3;">
                    <h3 style="color: #333; margin-bottom: 15px;">Antes y Después de la Instalación</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center;">
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/6.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #ddd; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 6:</strong><br><span style="color: #888; font-size: 0.9rem;">Antes</span></div>
                        </div>
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/7.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #ddd; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 7:</strong><br><span style="color: #888; font-size: 0.9rem;">Cables desordenados</span></div>
                        </div>
                        <div style="text-align: center;">
                            <img src="Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png" onclick="openImageModal('Marketplace/Baluns Y Borneras Caja Para Cables Cctv Cámaras 8 Canales/8.png')" style="width: 100px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 2px solid #2196F3; cursor: pointer;">
                            <div><strong style="color: #666;">Imagen 8:</strong><br><span style="color: #888; font-size: 0.9rem;">Con nuestra caja - Cables organizados</span></div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">Descripción del producto</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">Organizador de Cables UTP para DVR y Cámaras de Seguridad modelo RP-DVRbox88. Diseñado para centralizar y organizar las conexiones en la zona del DVR con mayor capacidad, ideal para instaladores y técnicos de CCTV con instalaciones más grandes.</p>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Características del producto</h3>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Plast</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">RP-DVRbox88</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Capacidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">8 baluns + 8 borneras</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Entradas UTP</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">8 con prensa cables</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Dimensiones</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Altura x Ancho x Profundidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">22 x 219 x 105 mm</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Material</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Plástico de alta resistencia</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Uso recomendado</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">DVR, CCTV, cámaras IP y análogas</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Formato del organizador</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Organizador de cables</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Baluns y borneras incluidos</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Etiqueta de originalidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    } else if (productId === 'caja-tactica') {
        modalBody.innerHTML = `
            <div style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <img id="mainImage" src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/1.jpg" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px; cursor: pointer;" onclick="openImageModal('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/1.jpg')">
                        <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/1.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/1.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid #2196F3;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/2.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/2.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/3.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/3.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/4.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/4.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/5.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/5.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                            <img src="Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/6.jpg" onclick="changeImage('Marketplace/Caja Táctica Para Munición 9mm  Roser Tactical Tacbox M9-v1/6.jpg')" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent;">
                        </div>
                    </div>
                    <div>
                        <h2 style="color: #333; margin-bottom: 15px;">Caja Táctica Roser Tactical Tacbox M9-v1</h2>
                        <div style="background: #4CAF50; color: white; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; display: inline-block; margin-bottom: 15px;">Nuevo</div>
                        <div style="font-size: 1.8rem; font-weight: 600; color: #2196F3; margin-bottom: 15px;">$81.400 COP</div>
                        <div style="color: #FF9800; font-size: 0.9rem; margin-bottom: 25px;">⏱️ Preparación: 2 días</div>
                        
                        <div style="margin-bottom: 20px;">
                            <label style="color: #333; font-weight: 600; margin-bottom: 10px; display: block;">Cantidad:</label>
                            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                <button onclick="changeQuantity('caja-tactica', -1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">-</button>
                                <span id="quantity-caja-tactica" style="font-size: 1.2rem; font-weight: 600; min-width: 30px; text-align: center;">1</span>
                                <button onclick="changeQuantity('caja-tactica', 1)" style="background: #f0f0f0; border: 1px solid #ddd; width: 40px; height: 40px; border-radius: 5px; cursor: pointer; font-size: 1.2rem;">+</button>
                            </div>
                            <div style="font-size: 1.4rem; font-weight: 600; color: #2196F3;">Total: <span id="total-caja-tactica">$81.400 COP</span></div>
                        </div>
                        
                        <button onclick="contactWhatsApp('Caja Táctica Roser Tactical Tacbox M9-v1', null, 'caja-tactica')" style="background: #25D366; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 10px; width: 100%;">
                            <img src="Marketplace/Iconos/whatsapp.png" alt="WhatsApp" style="width: 20px; height: 20px;">
                            Contactar por WhatsApp
                        </button>
                    </div>
                </div>
                
                <div>
                    <h3 style="color: #333; margin-bottom: 15px;">Descripción del producto</h3>
                    <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">La TacBox M9-V1 de Roser Tactical es una caja diseñada para almacenar de forma segura y ordenada hasta 50 cartuchos calibre 9mm (9x19 Luger). Con un diseño robusto, compacto y elegante, es ideal tanto para tiradores deportivos como para coleccionistas o aficionados responsables que buscan un almacenamiento confiable y estéticamente cuidado.</p>
                    
                    <h3 style="color: #333; margin-bottom: 15px;">Características del producto</h3>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Características principales</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Marca</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Roser Tactical</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Modelo</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Tacbox M9-v1</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Calibre</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">9mm</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Capacidad</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">50 cartuchos</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Configuración</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">5x10</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Color</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Negro Táctico</td>
                        </tr>
                    </table>
                    
                    <h4 style="color: #333; margin: 20px 0 10px 0;">Otros</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Material</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Polímero de alta resistencia</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Uso recomendado</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Almacenamiento de munición</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Resistente al agua</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Sistema de cierre</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Seguro táctico</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Personalizable</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Sí</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Fabricado en</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">Colombia</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd; font-weight: 600; color: #333;">Munición incluida</td>
                            <td style="padding: 12px; border: 1px solid #ddd; color: #666;">No</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

function changeImage(imageSrc) {
    const mainImage = document.getElementById('mainImage');
    mainImage.src = imageSrc;
    mainImage.onclick = () => openImageModal(imageSrc);
    
    // Update thumbnail borders
    document.querySelectorAll('.modal img[onclick^="changeImage"]').forEach(thumb => {
        thumb.style.border = '2px solid transparent';
    });
    event.target.style.border = '2px solid #2196F3';
}

function openImageModal(imageSrc) {
    const imageModal = document.getElementById('imageModal') || createImageModal();
    const modalImage = imageModal.querySelector('#modalImage');
    modalImage.src = imageSrc;
    imageModal.style.display = 'block';
}

function createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.style.cssText = 'display: none; position: fixed; z-index: 3000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.9);';
    modal.innerHTML = `
        <span onclick="closeImageModal()" style="position: absolute; top: 20px; right: 30px; color: white; font-size: 40px; cursor: pointer;">&times;</span>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 90%; max-height: 90%;">
            <img id="modalImage" src="" alt="Imagen ampliada" style="width: 100%; height: auto; max-height: 80vh; object-fit: contain; border-radius: 10px;">
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeImageModal();
    });
    
    return modal;
}

function closeImageModal() {
    const imageModal = document.getElementById('imageModal');
    if (imageModal) imageModal.style.display = 'none';
}

function contactWhatsApp(productName, color = null, productId = null) {
    let message = `Hola Roser Tecnologias, estoy interesado en el producto: ${productName}`;
    
    if (productId) {
        const quantity = document.getElementById(`quantity-${productId}`).textContent;
        const total = document.getElementById(`total-${productId}`).textContent;
        message += ` - Cantidad: ${quantity} unidades - Total: ${total}`;
    }
    
    if (color) {
        message += ` de color ${color.toLowerCase()}`;
    }
    
    // Add shipping info if available
    const department = $('#department').val();
    const city = $('#city').val();
    const postalCode = $('#postal-code').val();
    
    if (department && city) {
        message += `\n\nDatos de envío:\n📍 ${city}, ${department}`;
        if (postalCode) {
            message += `\n📮 Código postal: ${postalCode}`;
        }
        message += `\n📦 Envío estándar: $8.000 COP (3-5 días)\n🚚 Envío express: $15.000 COP (1-2 días)`;
    }
    
    const phone = '573113579437';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

let currentColor = 'Negro';
let currentColorBaluns = 'Negra';

const productPrices = {
    'chasis-gamer': 599000,
    'soporte-qr': 98000,
    'organizador-magnetico': 61069,
    'caja-tactica': 81400,
    'baluns-borneras-pequeno': 36900,
    'baluns-borneras': 49800
};

function changeQuantity(productId, change) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    const totalElement = document.getElementById(`total-${productId}`);
    
    let currentQuantity = parseInt(quantityElement.textContent);
    currentQuantity = Math.max(1, currentQuantity + change);
    
    quantityElement.textContent = currentQuantity;
    
    const unitPrice = productPrices[productId];
    const total = unitPrice * currentQuantity;
    totalElement.textContent = `$${total.toLocaleString()} COP`;
}

function changeColor(color) {
    currentColor = color;
    const basePath = `Marketplace/Organizador Magnético De Cables Hasta 80cm Hexastack H1-80/${color}/`;
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    // Update main image
    mainImage.src = `${basePath}1.jpg`;
    mainImage.onclick = () => openImageModal(`${basePath}1.jpg`);
    
    // Update color button borders
    document.querySelectorAll('button[onclick^="changeColor"]').forEach(btn => {
        btn.style.border = '4px solid transparent';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = btn.style.background === '#FFF' || btn.style.background === 'rgb(255, 255, 255)' ? '0 0 0 1px #ddd' : 'none';
    });
    event.target.style.border = '4px solid #2196F3';
    event.target.style.transform = 'scale(1.1)';
    event.target.style.boxShadow = '0 0 10px rgba(33, 150, 243, 0.5)';
    
    // Update thumbnails based on color - only JPG files
    const validImages = {
        'Negro': [1,2,3,4,5,6,7,8,9,10],
        'Azul': [1,2,3,4,5,9,10,11,12],
        'Blanco': [1,2,3,7,8,9],
        'Plateado': [1,2,3,4],
        'Rojo': [1,2,3,4,5]
    };
    
    thumbnailContainer.innerHTML = '';
    validImages[color].forEach((num, index) => {
        const img = document.createElement('img');
        img.src = `${basePath}${num}.jpg`;
        img.onclick = () => changeImage(`${basePath}${num}.jpg`);
        img.style.cssText = `width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: ${index === 0 ? '2px solid #2196F3' : '2px solid transparent'};`;
        thumbnailContainer.appendChild(img);
    });
}

function changeColorBaluns(color) {
    currentColorBaluns = color;
    const basePath = `Marketplace/Caja Para Cables CCTV Cámaras De Seguridad/${color}/`;
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    // Update main image
    const extension = color === 'Negra' ? 'png' : 'jpg';
    mainImage.src = `${basePath}1.${extension}`;
    mainImage.onclick = () => openImageModal(`${basePath}1.${extension}`);
    
    // Update color button borders
    document.querySelectorAll('button[onclick^="changeColorBaluns"]').forEach(btn => {
        btn.style.border = '4px solid transparent';
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = 'none';
    });
    event.target.style.border = '4px solid #2196F3';
    event.target.style.transform = 'scale(1.1)';
    event.target.style.boxShadow = '0 0 10px rgba(33, 150, 243, 0.5)';
    
    // Update thumbnails based on color
    const imageCount = {
        'Negra': 8,
        'Indigo': 4,
        'Gris': 5
    };
    
    thumbnailContainer.innerHTML = '';
    for (let i = 1; i <= imageCount[color]; i++) {
        const img = document.createElement('img');
        img.src = `${basePath}${i}.${extension}`;
        img.onclick = () => changeImage(`${basePath}${i}.${extension}`);
        img.style.cssText = `width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: ${i === 1 ? '2px solid #2196F3' : '2px solid transparent'};`;
        thumbnailContainer.appendChild(img);
    }
}

// Image Slider Functionality
let currentSlideIndex = 0;
let slideInterval;
let isPaused = false;
const slides = document.querySelectorAll('.slide');
const progressBars = document.querySelectorAll('.progress-bar');
const pauseBtn = document.getElementById('pauseBtn');

function goToSlide(index) {
    slides[currentSlideIndex].classList.remove('active');
    progressBars[currentSlideIndex].classList.remove('active');
    progressBars[currentSlideIndex].querySelector('.progress-fill').style.width = '0%';
    
    currentSlideIndex = index;
    slides[currentSlideIndex].classList.add('active');
    progressBars[currentSlideIndex].classList.add('active');
    
    if (!isPaused) resetInterval();
}

function showNextSlide() {
    const nextIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextIndex);
}

function resetInterval() {
    clearInterval(slideInterval);
    if (!isPaused) {
        slideInterval = setInterval(showNextSlide, 8000);
    }
}

function togglePause() {
    isPaused = !isPaused;
    const pauseIcon = pauseBtn.querySelector('.pause-icon');
    const playIcon = pauseBtn.querySelector('.play-icon');
    
    if (isPaused) {
        clearInterval(slideInterval);
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'block';
        progressBars[currentSlideIndex].querySelector('.progress-fill').style.animationPlayState = 'paused';
    } else {
        resetInterval();
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        progressBars[currentSlideIndex].querySelector('.progress-fill').style.animationPlayState = 'running';
    }
}

// Initialize slider
if (slides.length > 0) {
    progressBars.forEach((bar, index) => {
        bar.addEventListener('click', () => goToSlide(index));
    });
    
    pauseBtn.addEventListener('click', togglePause);
    
    // Add arrow navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const prevIndex = currentSlideIndex === 0 ? slides.length - 1 : currentSlideIndex - 1;
            goToSlide(prevIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showNextSlide();
        });
    }
    
    resetInterval();
}

// Categories Navigation
function goToCategory(category) {
    const parts = window.location.pathname.split('/').filter(Boolean);
    const up = parts.length > 1 ? '../'.repeat(parts.length - 1) : '';
    window.location.href = `${up}Marketplace/marketplace.html?category=${encodeURIComponent(category)}`;
}

let currentCategorySlide = 0;
const maxCategorySlides = 2;

function slideCategories(direction) {
    const container = document.querySelector('.categories-container');
    const dots = document.querySelectorAll('.dot');
    
    currentCategorySlide += direction;
    
    if (currentCategorySlide < 0) currentCategorySlide = maxCategorySlides;
    if (currentCategorySlide > maxCategorySlides) currentCategorySlide = 0;
    
    const translateX = -currentCategorySlide * 33.33;
    container.style.transform = `translateX(${translateX}%)`;
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCategorySlide);
    });
}