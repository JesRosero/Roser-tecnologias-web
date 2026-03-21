// navbar-component.js - Componente de Navbar Global
const NavbarComponent = {
    init(config = {}) {
        const defaults = {
            logoPath: '/Imagenes/Rosero.png',
            homeUrl: '/Pagina Principal/index.html',
            marketplaceUrl: '/Marketplace/Pagina Marketplace/marketplace.html',
            marketplaceIcon: '/Marketplace/Iconos/Marketplace.png',
            cartIcon: '/Imagenes/Carrito.png',
            sidebarBasePath: '/'
        };
        
        const settings = { ...defaults, ...config };
        
        if (!document.querySelector('.navbar')) {
            const firstSection = document.querySelector('section, main, .hero');
            if (firstSection) {
                firstSection.insertAdjacentHTML('beforebegin', this.getHTML(settings));
            } else {
                document.body.insertAdjacentHTML('afterbegin', this.getHTML(settings));
            }
            this.injectStyles();
            // Disparar evento cuando el navbar esté listo
            setTimeout(() => {
                document.dispatchEvent(new Event('navbarReady'));
            }, 50);
        }
    },

    injectStyles() {
        if (!document.getElementById('navbar-search-styles')) {
            const style = document.createElement('style');
            style.id = 'navbar-search-styles';
            style.textContent = `
                .search-box .cancel-icon {
                    position: absolute;
                    right: 50px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 30px;
                    height: 30px;
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2;
                }
                
                .search-box .cancel-icon svg {
                    width: 20px;
                    height: 20px;
                    fill: #664AFF;
                    transition: transform 0.3s;
                }
                
                .search-box .cancel-icon.active {
                    opacity: 1;
                    visibility: visible;
                }
                
                .search-box .cancel-icon.active svg {
                    transform: rotate(360deg);
                }
                
                .logo-link:hover {
                    transform: scale(1.05);
                }
                
                .nav-logo a {
                    transition: transform 0.2s;
                }
                
                .nav-logo a:hover {
                    transform: scale(1.02);
                }
                
                .marketplace-link:hover {
                    background: #1976d2 !important;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                }
                
                .marketplace-link:hover span {
                    color: white !important;
                }
            `;
            document.head.appendChild(style);
        }
    },

    getHTML(settings) {
        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="menu-button">
                        <span class="menu-lines">☰</span>
                    </div>
                    <div class="nav-logo">
                        <a href="${settings.homeUrl}" style="display: flex; align-items: center; gap: 8px; text-decoration: none;">
                            <img src="${settings.logoPath}" alt="Roser Tecnologías" class="logo-img">
                            <h2>Roser Tecnologías</h2>
                        </a>
                        <a href="${settings.marketplaceUrl}" class="marketplace-link" style="display: flex; align-items: center; gap: 6px; text-decoration: none; margin-left: 20px; padding: 8px 12px; background: #e3f2fd; border-radius: 6px; transition: all 0.3s ease;">
                            <img src="${settings.marketplaceIcon}" alt="Marketplace" style="width: 20px; height: 20px;">
                            <span style="color: #1976d2; font-weight: 500; font-size: 0.9rem;">Marketplace</span>
                        </a>
                    </div>
                    <ul class="nav-menu"></ul>
                    <div class="nav-right">
                        <div class="search-box">
                            <input type="text" placeholder="Buscar productos...">
                            <div class="search-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                                </svg>
                            </div>
                            <div class="cancel-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </div>
                            <div class="search-results" id="search-results"></div>
                            <div class="search-shortcuts" id="search-shortcuts"></div>
                        </div>
                    </div>
                    <div class="cart-icon" onclick="event.preventDefault(); event.stopPropagation(); openCartModal();" style="position: relative; cursor: pointer; display: flex; align-items: center; margin-left: 15px; min-width: 40px; min-height: 40px; justify-content: center;">
                        <img src="${settings.cartIcon}" alt="Carrito" width="24" height="24">
                        <span class="cart-count" id="cart-count" style="position: absolute; top: 2px; right: 2px; background: #ff4444; color: white; border-radius: 50%; width: 16px; height: 16px; display: none; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">0</span>
                    </div>
                    <div class="hamburger">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                
                <!-- Dropdown Menu -->
                <div class="sidebar-dropdown">
                    <div class="dropdown-section">
                        <div class="section-header">
                            <img src="${settings.sidebarBasePath}Imagenes/Servicios.png" alt="Servicios" class="section-icon">
                            <span class="section-title">Servicios</span>
                            <span class="section-arrow">▼</span>
                        </div>
                        <div class="subsection">
                            <a href="${settings.sidebarBasePath}Servicios/Diseños-3D/disenos-3.html">
                                <img src="${settings.sidebarBasePath}Imagenes/d3d.png" alt="Diseños 3D" class="subsection-icon">
                                Diseños 3D
                            </a>
                            <a href="${settings.sidebarBasePath}Servicios/Impresiones-3D/impresiones-3d.html">
                                <img src="${settings.sidebarBasePath}Imagenes/i3d.png" alt="Impresión 3D" class="subsection-icon">
                                Impresión 3D
                            </a>
                            <a href="${settings.sidebarBasePath}Servicios/Diseño Electrico/diseno-electrico.html">
                                <img src="${settings.sidebarBasePath}Imagenes/D_electrico.png" alt="Diseño Eléctrico" class="subsection-icon">
                                Diseño Eléctrico
                            </a>
                            <a href="${settings.sidebarBasePath}Servicios/Diseño mecanico/diseno-mecanico.html">
                                <img src="${settings.sidebarBasePath}Imagenes/D_mecanico.png" alt="Diseño Mecánico" class="subsection-icon">
                                Diseño Mecánico
                            </a>
                            <a href="${settings.sidebarBasePath}Servicios/Fabricacion de sistemas mecanicos/fabricacion-sistemas-mecanicos.html">
                                <img src="${settings.sidebarBasePath}Imagenes/F_mecanico.png" alt="Fabricación de Sistemas Mecánicos" class="subsection-icon">
                                Fabricación de Sistemas Mecánicos
                            </a>
                        </div>
                    </div>
                    <div class="dropdown-section">
                        <div class="section-header">
                            <img src="${settings.sidebarBasePath}Imagenes/PTS.png" alt="Productos" class="section-icon">
                            <span class="section-title">Productos</span>
                            <span class="section-arrow">▼</span>
                        </div>
                        <div class="subsection">
                            <div class="prototypes-header">
                                <img src="${settings.sidebarBasePath}Imagenes/Proto.png" alt="Prototipos" class="subsection-icon">
                                Prototipos
                                <span class="section-arrow">▼</span>
                            </div>
                            <div class="prototype-subsection">
                                <a href="${settings.sidebarBasePath}Productos-Roser/Prototipos/DePie/DePie.html">
                                    <img src="${settings.sidebarBasePath}Imagenes/ceo.png" alt="DePie" class="subsection-icon">
                                    DePie
                                </a>
                            </div>
                            <div class="apps-header" data-toggle="apps">
                                <img src="${settings.sidebarBasePath}Imagenes/apps.png" alt="Apps" class="subsection-icon">
                                Apps
                                <span class="section-arrow">▼</span>
                            </div>
                            <div class="sub-subsection">
                                <a href="${settings.sidebarBasePath}Productos-Roser/Apps/3dcost/3dcost.html">
                                    <img src="${settings.sidebarBasePath}Imagenes/3D.png" alt="3D" class="subsection-icon">
                                    3DCost
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="dropdown-section">
                        <div class="section-header">
                            <img src="${settings.sidebarBasePath}Imagenes/empresa.png" alt="Empresa" class="section-icon">
                            <span class="section-title">Empresa</span>
                            <span class="section-arrow">▼</span>
                        </div>
                        <div class="subsection">
                            <a href="${settings.sidebarBasePath}Empresa/Conocenos/conocenos.html">
                                <img src="${settings.sidebarBasePath}Imagenes/ceo.png" alt="CEO" class="subsection-icon">
                                Conocenos
                            </a>
                            <a href="${settings.sidebarBasePath}Empresa/Mision y Vision/mision-vision.html">
                                <img src="${settings.sidebarBasePath}Imagenes/vision.png" alt="Vision" class="subsection-icon">
                                Misión y Visión
                            </a>
                            <a href="${settings.sidebarBasePath}Empresa/Terminos y Condiciones/terminos-condiciones.html">
                                <img src="${settings.sidebarBasePath}Imagenes/terminos.png" alt="Terminos" class="subsection-icon">
                                Términos y Condiciones
                            </a>
                            <a href="${settings.sidebarBasePath}Empresa/Politicas y Privacidad/politica-privacidad.html">
                                <img src="${settings.sidebarBasePath}Imagenes/privacidad.png" alt="Privacidad" class="subsection-icon">
                                Privacidad
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NavbarComponent.init());
} else {
    NavbarComponent.init();
}
