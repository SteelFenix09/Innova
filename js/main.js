// ── Datos de los modelos ──────────────────────────────────────────────────────
const MODELS = [

    {
        name: 'Iglesia de Colores',
        description: 'Se venera al "Cristo Negro". La devoción es tan grande que incluso se cuenta que durante la Revolución, habitantes choles escondieron la imagen original para evitar que fuera quemada.',
        src: './../figuras/iglesia.glb', // reemplaza con tu modelo
    }
];

// ── Referencias DOM ───────────────────────────────────────────────────────────
const modelScreen = document.getElementById('model-screen');
const arButton = document.getElementById('ar-button');

const carouselTrack = document.getElementById('carousel-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const dotsContainer = document.getElementById('dots-container');
const modelNameEl = document.getElementById('model-name');
const modelDescEl = document.getElementById('model-desc');
const currentIndexEl = document.getElementById('current-index');
const totalModelsEl = document.getElementById('total-models');

// ── Estado del carrusel ───────────────────────────────────────────────────────
let currentSlide = 0;

// ── Inicializar carrusel ──────────────────────────────────────────────────────
totalModelsEl.textContent = MODELS.length;

function createCarouselSlides() {
    carouselTrack.innerHTML = '';

    MODELS.forEach((model, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        slide.dataset.index = index;

        const viewer = document.createElement('model-viewer');
        viewer.classList.add('model-viewer-instance');
        viewer.setAttribute('src', model.src);
        viewer.setAttribute('ar', '');
        viewer.setAttribute('ar-scale', 'auto');
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('auto-rotate', '');
        viewer.setAttribute('environment-image', 'neutral');
        viewer.setAttribute('shadow-intensity', '1.5');
        viewer.setAttribute('exposure', '1');
        viewer.setAttribute('shadow-softness', '0.8');
        viewer.setAttribute('alt', model.name);

        const progress = document.createElement('div');
        progress.className = 'progress-bar hide';
        progress.setAttribute('slot', 'progress-bar');
        const updateBar = document.createElement('div');
        updateBar.className = 'update-bar';
        progress.appendChild(updateBar);

        viewer.appendChild(progress);
        slide.appendChild(viewer);
        carouselTrack.appendChild(slide);
    });
}

createCarouselSlides();

// Crear dots
MODELS.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Ir al modelo ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});

function updateCarouselUI() {
    // Mover track
    carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Texto
    modelNameEl.textContent = MODELS[currentSlide].name;
    modelDescEl.textContent = MODELS[currentSlide].description;

    // Contador
    currentIndexEl.textContent = currentSlide + 1;

    // Dots
    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });

    // Botones prev/next
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === MODELS.length - 1;
}

function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, MODELS.length - 1));
    updateCarouselUI();
}

prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// ── Swipe táctil ─────────────────────────────────────────────────────────────
let touchStartX = 0;
let touchEndX = 0;

carouselTrack.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carouselTrack.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
        diff > 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
}, { passive: true });

// ── Inicializar pantalla del carrusel ─────────────────────────────────────────
if (modelScreen) {
    modelScreen.style.display = 'flex';
    updateCarouselUI();
}

// ── Activar AR ───────────────────────────────────────────────────────────────
if (arButton) {
    arButton.addEventListener('click', () => {
        // Obtener el model-viewer actual del carrusel
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides[currentSlide]) {
            const viewer = slides[currentSlide].querySelector('model-viewer');
            if (viewer && viewer.activateAR) {
                viewer.activateAR();
            }
        }
    });
}


// ── Limpiar recursos al cerrar ────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
    // Limpieza si es necesaria
});

// ── Detección de dispositivo ──────────────────────────────────────────────────
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
console.log(`Dispositivo: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);