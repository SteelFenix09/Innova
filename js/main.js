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
const arContainer = document.getElementById('ar-container');
const cameraContainer = document.getElementById('camera-container');
const arButton = document.getElementById('ar-button');
const exitArBtn = document.getElementById('exit-ar-btn');

// ── Variables de cámara ───────────────────────────────────────────────────────
let camaraStream = null;
let camaraPreview = null;

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

// ── Abrir cámara ──────────────────────────────────────────────────────────────
if (arButton) {
    arButton.addEventListener('click', async () => {
        await abrirCamara();
    });
}

async function abrirCamara() {
    try {
        // Solicitar acceso a la cámara
        camaraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' },
            audio: false 
        });

        // Crear contenedor de cámara si no existe
        if (!camaraPreview) {
            const container = document.createElement('div');
            container.id = 'camera-container';
            container.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 200;
                background: #000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            `;

            camaraPreview = document.createElement('video');
            camaraPreview.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
            `;
            camaraPreview.autoplay = true;
            camaraPreview.playsinline = true;
            camaraPreview.srcObject = camaraStream;

            // Botones de control
            const controls = document.createElement('div');
            controls.style.cssText = `
                position: absolute;
                bottom: 40px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                z-index: 201;
            `;

            const btnCapturar = document.createElement('button');
            btnCapturar.textContent = 'Capturar';
            btnCapturar.style.cssText = `
                background: rgba(200,169,110,0.9);
                color: #0d0f14;
                border: none;
                padding: 12px 22px;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
            `;
            btnCapturar.addEventListener('click', capturarFoto);

            const btnSalir = document.createElement('button');
            btnSalir.textContent = 'Cerrar';
            btnSalir.style.cssText = `
                background: rgba(13,15,20,0.85);
                color: #f0ece4;
                border: 1px solid rgba(255,255,255,0.07);
                padding: 12px 22px;
                border-radius: 50px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                font-family: 'DM Sans', sans-serif;
            `;
            btnSalir.addEventListener('click', cerrarCamara);

            controls.appendChild(btnCapturar);
            controls.appendChild(btnSalir);
            container.appendChild(camaraPreview);
            container.appendChild(controls);
            document.body.appendChild(container);
        } else {
            camaraPreview.srcObject = camaraStream;
            const container = document.getElementById('camera-container');
            if (container) container.style.display = 'flex';
        }

        // Ocultar carrusel
        if (modelScreen) modelScreen.style.display = 'none';

    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
}

function cerrarCamara() {
    if (camaraStream) {
        camaraStream.getTracks().forEach(track => track.stop());
        camaraStream = null;
    }
    
    const container = document.getElementById('camera-container');
    if (container) {
        container.style.display = 'none';
    }

    if (modelScreen) modelScreen.style.display = 'flex';
}

function capturarFoto() {
    const canvas = document.createElement('canvas');
    canvas.width = camaraPreview.videoWidth;
    canvas.height = camaraPreview.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(camaraPreview, 0, 0);
    
    canvas.toBlob(blob => {
        downloadBlob(blob);
    }, 'image/jpeg', 0.95);
}

// ── Salir de AR (botón manual) ────────────────────────────────────────────────
if (exitArBtn) {
    exitArBtn.addEventListener('click', () => {
        if (arContainer) arContainer.style.display = 'none';
        if (modelScreen) modelScreen.style.display = 'flex';
        resetAR();
    });
}

function resetAR() {
    cerrarCamara();
}

function downloadBlob(blob){
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ar-foto-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(()=> URL.revokeObjectURL(url),1500)
}

// ── Limpiar recursos al cerrar ────────────────────────────────────────────────
window.addEventListener('beforeunload', () => {
    if (camaraStream) {
        camaraStream.getTracks().forEach(track => track.stop());
        camaraStream = null;
    }
});

// ── Detección de dispositivo ──────────────────────────────────────────────────
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
console.log(`Dispositivo: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);