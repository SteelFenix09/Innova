// ── Datos de los modelos ──────────────────────────────────────────────────────
const MODELS = [

    {
        name: 'Iglesia de Colores',
        description: 'Se venera al "Cristo Negro". La devoción es tan grande que incluso se cuenta que durante la Revolución, habitantes choles escondieron la imagen original para evitar que fuera quemada.',
        src: './../figuras/iglesia.glb', // reemplaza con tu modelo
    }
];

// ── Referencias DOM ───────────────────────────────────────────────────────────
const startScreen = document.getElementById('start-screen');
const modelScreen = document.getElementById('model-screen');
const arContainer = document.getElementById('ar-container');
const startButton = document.getElementById('start-button');
const backBtn = document.getElementById('back-btn');
const arButton = document.getElementById('ar-button');

/*const exitArBtn = document.getElementById('exit-ar-btn');
const captureBtn = document.getElementById('capture-btn');
const camaraPreview = document.getElementById('camara-preview');
const photoCanvas = document.getElementById('photo-canvas');*/


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
//let camaraStream = null;

// ── Inicializar carrusel ──────────────────────────────────────────────────────
totalModelsEl.textContent = MODELS.length;

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

// ── Navegación entre pantallas ────────────────────────────────────────────────
startButton.addEventListener('click', () => {
    startScreen.style.display = 'none';
    modelScreen.style.display = 'flex';
    updateCarouselUI();
});

backBtn.addEventListener('click', () => {
    modelScreen.style.display = 'none';
    startScreen.style.display = 'flex';
});

// ── Activar AR ────────────────────────────────────────────────────────────────
arButton.addEventListener('click', async () => {
    const activeModel = MODELS[currentSlide];
    arModel.setAttribute('src', activeModel.src);

    modelScreen.style.display = 'none';
    arContainer.style.display = 'flex';

    // Solicitar acceso a cámara
    try {
    } catch (error) {
        console.warn('No se pudo acceder a la cámara:', error);
    }

    if (arModel.activateAR) {
        arModel.activateAR();
    }

    /*arModel.setAttribute('camera-controls', '');
    arModel.style.pointerEvents = 'auto'; */
});

// ── Salir de AR (botón manual) ────────────────────────────────────────────────
/*exitArBtn.addEventListener('click', () => {
    arContainer.style.display = 'none';
    modelScreen.style.display = 'flex';
    resetAR();
});

// ── Eventos del AR model-viewer ───────────────────────────────────────────────
if (arModel) {
    arModel.addEventListener('click', () => {
        if (!modelPlaced && arModel.hasAttribute('ar')) {
            modelPlaced = true;
            arModel.removeAttribute('camera-controls');
            arModel.style.pointerEvents = 'none';
            arModel.classList.add('model-locked');
        }
    }); 

captureBtn.addEventListener('click', async () => {
    if (arModel && arModel.toBlob) {
        try {
            const blob = await arModel.toBlob({ idealAspect: true })
            if (blob) {
                downloadBlob(blob)
                return
            }
        } catch (error) {
            console.warn('No se pudo capturar desde el model-viewer, intentando con camara: ', error)
        }
    }

    if (!camaraPreview || !photoCanvas || !camaraPreview.videoWidth || !camaraPreview.videoHeight) {
        alert('No hay señal de camara disponible todavia para tomar foto.')
        return
    }

    const ctx = photoCanvas.getContext('2d')
    photoCanvas.width = camaraPreview.videoWidth
    photoCanvas.height = camaraPreview.videoHeight
    ctx.drawImage(camaraPreview, 0, 0, photoCanvas.width, photoCanvas.height)
    photoCanvas.toBlob(blob => {
        if (blob) downloadBlob(blob)
    }, 'image/jpeg', 0.95)
}) */

if (arModel) {
    arModel.addEventListener('ar-status', e => {
        console.log('Estado AR:', e.detail.status);

        if (e.detail.status === 'not-presenting' || e.detail.status === 'session-ended') {
            arContainer.style.display = 'none';
            modelScreen.style.display = 'flex';
            resetAR();
        }

        /* if (e.detail.status === 'session-started') {
             modelPlaced = false;
             arModel.setAttribute('camera-controls', '');
             arModel.style.pointerEvents = 'auto';
             arModel.classList.remove('model-locked');
         } */
    });
}

function resetAR() {
  /*  modelPlaced = false;
    if (arModel) {
        arModel.setAttribute('camera-controls', '');
        arModel.style.pointerEvents = 'auto';
        arModel.classList.remove('model-locked');
    } */
   if(camaraStream){
    camaraStream.getTracks().forEach(track => track.stop())
    camaraStream = null
   }
   if(camaraPreview){
    camaraPreview.srcObject = null
   }
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

window.addEventListener('beforeunload', () => {
    if (camaraStream){
        camaraStream.getTracks().forEach(track => track.stop())
    }
})

// ── Detección de dispositivo ──────────────────────────────────────────────────
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isAndroid = /Android/.test(navigator.userAgent);
console.log(`Dispositivo: ${isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop'}`);