let construcostCurrentSlide = 0;
let construcostSlides = [];
let construcostIndicators = [];

document.addEventListener('DOMContentLoaded', () => {
  construcostSlides = document.querySelectorAll('.carousel-slide');

  createConstrucostIndicators();
  showConstrucostSlide(0);
  setupConstrucostButtons();
  setupScrollAnimations();
  setupScrollToTop();
  setupWhatsAppButton();
});

function createConstrucostIndicators() {
  const container = document.getElementById('carouselIndicators');
  if (!container || construcostSlides.length === 0) return;

  container.innerHTML = '';

  construcostSlides.forEach((_, index) => {
    const indicator = document.createElement('span');
    indicator.className = 'indicator';

    if (index === 0) indicator.classList.add('active');

    indicator.addEventListener('click', () => {
      showConstrucostSlide(index);
    });

    container.appendChild(indicator);
  });

  construcostIndicators = document.querySelectorAll('.indicator');
}

function showConstrucostSlide(index) {
  const track = document.getElementById('carouselSlides');
  if (!track || construcostSlides.length === 0) return;

  if (index < 0) {
    construcostCurrentSlide = construcostSlides.length - 1;
  } else if (index >= construcostSlides.length) {
    construcostCurrentSlide = 0;
  } else {
    construcostCurrentSlide = index;
  }

  track.style.transform = `translateX(-${construcostCurrentSlide * 100}%)`;

  construcostIndicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === construcostCurrentSlide);
  });
}

function changeConstrucostSlide(direction) {
  showConstrucostSlide(construcostCurrentSlide + direction);
}

window.changeConstrucostSlide = changeConstrucostSlide;

function setupConstrucostButtons() {
  const prevButton = document.querySelector('.prev-btn');
  const nextButton = document.querySelector('.next-btn');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      changeConstrucostSlide(-1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      changeConstrucostSlide(1);
    });
  }
}

function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-visible');
      }
    });
  }, { threshold: 0.15 });

  animatedElements.forEach((element) => observer.observe(element));
}

function setupScrollToTop() {
  const scrollButton = document.getElementById('scrollToTop');
  if (!scrollButton) return;

  window.addEventListener('scroll', () => {
    scrollButton.classList.toggle('visible', window.scrollY > 350);
  });

  scrollButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function setupWhatsAppButton() {
  if (typeof $ === 'undefined') return;
  if (typeof $.fn.floatingWhatsApp === 'undefined') return;

  $('#BotonWA').floatingWhatsApp({
    phone: '573137331538',
    popupMessage: 'Hola, quiero más información sobre ConstruCost.',
    message: 'Hola, estoy interesado en ConstruCost.',
    showPopup: true,
    showOnIE: false,
    position: "right",

    headerTitle: 'Roser Tecnologías',
    headerColor: '#1e88e5',
    backgroundColor: '#25D366',

    buttonImage: '<img src="/Imagenes/whatsapp.png" alt="WhatsApp" />'
});
}