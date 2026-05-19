// ── Datos de los modelos ──────────────────────────────────────────────────────
const MODELS = [
    {
        name: 'Iglesia de Colores',
        description: 'Se venera al "Cristo Negro". La devoción es tan grande que incluso se cuenta que durante la Revolución, habitantes choles escondieron la imagen original para evitar que fuera quemada.',
        src: './../figuras/iglesia.glb', 
    }
];

// ── Referencias DOM ───────────────────────────────────────────────────────────
const startScreen = document.getElementById('start-screen');
const modelScreen = document.getElementById('model-screen');
const startButton = document.getElementById('start-button');
const backBtn = document.getElementById('back-btn');
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
if (totalModelsEl) totalModelsEl.textContent = MODELS.length;

function createCarouselSlides() {
    if (!carouselTrack) return;
    carouselTrack.innerHTML = ''; 

    MODELS.forEach((model, index) => {
        const slide = document.createElement('div');
        slide.classList.add('carousel-slide');
        slide.dataset.index = index;

        const viewer = document.createElement('model-viewer');
        viewer.classList.add('model-viewer-instance');
        viewer.setAttribute('src', model.src);
        viewer.setAttribute('camera-controls', '');
        viewer.setAttribute('auto-rotate', '');
        viewer.setAttribute('environment-image', 'neutral');
        viewer.setAttribute('shadow-intensity', '1.5');
        viewer.setAttribute('exposure', '1');
        viewer.setAttribute('shadow-softness', '0.8');
        viewer.setAttribute('alt', model.name);
        
        // REQUISITO PARA GITHUB PAGES / MÓVILES: Activar propiedades de AR directamente en el carrusel
        viewer.setAttribute('ar', '');
        viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
        viewer.setAttribute('ar-scale', 'auto');

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
if (dotsContainer) {
    dotsContainer.innerHTML = ''; 
    MODELS.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Ir al modelo ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });
}

function updateCarouselUI() {
    if (carouselTrack) carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    if (modelNameEl && MODELS[currentSlide]) modelNameEl.textContent = MODELS[currentSlide].name;
    if (modelDescEl && MODELS[currentSlide]) modelDescEl.textContent = MODELS[currentSlide].description;
    if (currentIndexEl) currentIndexEl.textContent = currentSlide + 1;

    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });

    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === MODELS.length - 1;
}

updateCarouselUI();

function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, MODELS.length - 1));
    updateCarouselUI();
}

if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

// ── Swipe táctil ─────────────────────────────────────────────────────────────
let touchStartX = 0;
let touchEndX = 0;

if (carouselTrack) {
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
}

// ── Navegación básica entre pantallas ──────────────────────────────────────────
if (startButton) {
    startButton.addEventListener('click', () => {
        if (startScreen) startScreen.style.display = 'none';
        if (modelScreen) modelScreen.style.display = 'flex';
        updateCarouselUI();
    });
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (modelScreen) modelScreen.style.display = 'none';
        if (startScreen) startScreen.style.display = 'flex';
    });
}

// ── Activar AR Directamente (Modificado) ───────────────────────────────────────
if (arButton) {
    arButton.addEventListener('click', () => {
        // 1. Buscamos todas las instancias de model-viewer que creamos en el carrusel
        const viewInstances = document.querySelectorAll('.model-viewer-instance');
        
        // 2. Seleccionamos exactamente la que corresponde al slide que el usuario está viendo
        const activeViewer = viewInstances[currentSlide];

        // 3. Si existe y el dispositivo soporta AR, ejecutamos el disparo directo de la cámara
        if (activeViewer && activeViewer.activateAR) {
            console.log('Lanzando AR directo para:', MODELS[currentSlide].name);
            activeViewer.activateAR();
        } else {
            console.warn('El navegador no soporta AR o el elemento no está listo.');
        }
    });
}

// ── Detección de dispositivo ──────────────────────────────────────────────────
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
console.log(`Dispositivo: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);