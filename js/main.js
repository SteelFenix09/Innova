// ── Datos de los modelos ──────────────────────────────────────────────────────
const MODELS = [
    {
        name: 'Iglesia de Colores',
        description: 'Se venera al "Cristo Negro". La devoción es tan grande que incluso se cuenta que durante la Revolución, habitantes choles escondieron la imagen original para evitar que fuera quemada.',
        src: './assets/modelos/iglesia.glb', 
    }
];

// ── Referencias DOM ───────────────────────────────────────────────────────────
const startScreen = document.getElementById('start-screen');
const modelScreen = document.getElementById('model-screen');
const arContainer = document.getElementById('ar-container');
const startButton = document.getElementById('start-button');
const backBtn = document.getElementById('back-btn');
const arButton = document.getElementById('ar-button');

// Dejamos estas declaradas (fueron comentadas antes) para que no rompan el código abajo
const exitArBtn = document.getElementById('exit-ar-btn');
const captureBtn = document.getElementById('capture-btn');
const camaraPreview = document.getElementById('camara-preview');
const photoCanvas = document.getElementById('photo-canvas');

const arModel = document.getElementById('ar-model');
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
let camaraStream = null; // Descomentada para evitar errores en resetAR()

// ── Inicializar carrusel ──────────────────────────────────────────────────────
if (totalModelsEl) totalModelsEl.textContent = MODELS.length;

// ¡Aquí está! El código adaptado para crear los model-viewer dinámicamente
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

// Ejecutamos la creación de las pantallas del carrusel
createCarouselSlides();

// Crear dots
if (dotsContainer) {
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

    if (modelNameEl) modelNameEl.textContent = MODELS[currentSlide].name;
    if (modelDescEl) modelDescEl.textContent = MODELS[currentSlide].description;
    if (currentIndexEl) currentIndexEl.textContent = currentSlide + 1;

    document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });

    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === MODELS.length - 1;
}

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

// ── Navegación entre pantallas ────────────────────────────────────────────────
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

// ── Activar AR ────────────────────────────────────────────────────────────────
if (arButton) {
    arButton.addEventListener('click', async () => {
        const activeModel = MODELS[currentSlide];
        if (arModel) arModel.setAttribute('src', activeModel.src);

        if (modelScreen) modelScreen.style.display = 'none';
        if (arContainer) arContainer.style.display = 'flex';

        try {
            // Tu lógica de acceso a cámara si la necesitas en el futuro
        } catch (error) {
            console.warn('No se pudo acceder a la cámara:', error);
        }

        if (arModel && arModel.activateAR) {
            arModel.activateAR();
        }
    });
}

// En caso de que uses el botón manual de salir
if (exitArBtn) {
    exitArBtn.addEventListener('click', () => {
        if (arContainer) arContainer.style.display = 'none';
        if (modelScreen) modelScreen.style.display = 'flex';
        resetAR();
    });
}

// ── Eventos del AR model-viewer ───────────────────────────────────────────────
if (arModel) {
    arModel.addEventListener('ar-status', e => {
        console.log('Estado AR:', e.detail.status);

        if (e.detail.status === 'not-presenting' || e.detail.status === 'session-ended') {
            if (arContainer) arContainer.style.display = 'none';
            if (modelScreen) modelScreen.style.display = 'flex';
            resetAR();
        }
    });
}

function resetAR() {
   if (camaraStream) {
       camaraStream.getTracks().forEach(track => track.stop());
       camaraStream = null;
   }
   if (camaraPreview) {
       camaraPreview.srcObject = null;
   }
}

function downloadBlob(blob){
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ar-foto-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
}

window.addEventListener('beforeunload', () => {
    if (camaraStream){
        camaraStream.getTracks().forEach(track => track.stop());
    }
});

// ── Detección de dispositivo ──────────────────────────────────────────────────
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
console.log(`Dispositivo: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);