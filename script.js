/* ============================================
   ADHIERE – Lógica principal
   ============================================ */

// ---- ESTADO GLOBAL ----
const state = {
  responses: {}
};

// ---- NAVBAR ACTIVA Y SCROLL ----
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Highlight link activo
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
});

// ---- MENÚ HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
});

// Cierra menú al hacer click en un link
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinksEl.classList.remove('open'));
});

// ---- FORMULARIO MULTISTEP ----
function nextStep(current) {
  const step = document.getElementById('step' + current);
  const next = current < 4 ? 'step' + (current + 1) : null;

  // Validación básica por paso
  if (!validateStep(current)) return;

  // Guardar respuestas del paso actual
  collectStepData(current);

  step.classList.remove('active');
  if (next) {
    document.getElementById(next).classList.add('active');
  }
}

function prevStep(current) {
  document.getElementById('step' + current).classList.remove('active');
  document.getElementById('step' + (current - 1)).classList.add('active');
}

function validateStep(num) {
  if (num === 1) {
    const primeraVez = document.querySelector('input[name="primera_vez"]:checked');
    const asiste = document.querySelector('input[name="asiste"]:checked');
    const abandono = document.querySelector('input[name="abandono"]:checked');
    if (!primeraVez || !asiste || !abandono) {
      alert('Por favor, responde todas las preguntas antes de continuar.');
      return false;
    }
  }
  if (num === 2) {
    const barrera = document.querySelector('input[name="barrera"]:checked');
    if (!barrera) {
      alert('Por favor, selecciona una barrera principal.');
      return false;
    }
  }
  return true;
}

function collectStepData(num) {
  if (num === 1) {
    state.responses.primera_vez = document.querySelector('input[name="primera_vez"]:checked')?.value;
    state.responses.asiste = document.querySelector('input[name="asiste"]:checked')?.value;
    state.responses.abandono = document.querySelector('input[name="abandono"]:checked')?.value;
  }
  if (num === 2) {
    state.responses.barrera = document.querySelector('input[name="barrera"]:checked')?.value;
  }
  if (num === 3) {
    state.responses.genero = document.querySelector('input[name="genero"]:checked')?.value;
    state.responses.modalidad = document.querySelector('input[name="modalidad"]:checked')?.value;
    state.responses.area = document.getElementById('areaSelect')?.value;
    state.responses.estilo = document.querySelector('input[name="estilo"]:checked')?.value;
  }
}

function submitForm() {
  collectStepData(3);
  state.responses.esperas = document.getElementById('esperas')?.value;
  state.responses.ayuda = document.getElementById('ayuda')?.value;
  state.responses.sugerencias = document.getElementById('sugerencias')?.value;
  state.responses.fecha = new Date().toLocaleString('es-PE');

  // Guardar en localStorage
  saveResponse(state.responses);

  // Mostrar resultado
  document.getElementById('step4').classList.remove('active');
  const resultStep = document.getElementById('stepResult');
  resultStep.classList.add('active');

  // Renderizar resultado inline
  const recs = getRecommendations(state.responses);
  document.getElementById('resultContent').innerHTML = buildResultHTML(recs);

  // Renderizar sección de recomendaciones
  renderRecsSection(state.responses);
}

// ---- PERSONALIZACIÓN POR BARRERA ----
// ---- CATÁLOGO DE RECURSOS REALES (Basado en tu HTML) ----
const resourcesCatalog = {
  videos: {
    ansiedad: { type: 'video', title: '¿Qué es la ansiedad?', desc: 'La ansiedad es una emoción normal que nos permite prepararnos para actuar. En algunas ocasiones puede convertirse en un trastorno.', youtubeId: 'AvjyfxzkWBs', duracion: '2 min', autor: 'TecSalud' },
    depresion: { type: 'video', title: '¿Qué es la depresión?', desc: 'La depresión es la cuarta causa de incapacidad laboral en el mundo.', youtubeId: 'xH8rEPKuZKU', duracion: '2 min', autor: 'NMás' },
    autoestima: { type: 'video', title: 'Baja Autoestima: causas y consecuencias', desc: 'La autoestima es la percepción evaluativa de nosotros mismos. Conoce sus causas y cómo fortalecerla.', youtubeId: 'HYnWaRKdgaY', duracion: '3 min', autor: 'María Claros' },
    estres: { type: 'video', title: '¿Qué es el Estrés? Síntomas y Tratamiento', desc: 'La especialista Rosa González habla sobre qué es el estrés y cómo tratarlo.', youtubeId: 'dswLKHhocxk', duracion: '2 min', autor: 'Rosa González' },
    relaciones: { type: 'video', title: '¿Cómo es una relación sana de pareja?', desc: 'Tras más de 30 años de trabajo de campo, Mansukhani contempla la salud desde una perspectiva integral.', youtubeId: 'EB1bJoMGebc', duracion: '7 min', autor: 'Arun Mansukhani' },
    adherencia: { type: 'video', title: '¿Qué es la adherencia terapéutica?', desc: 'Se explica qué es la adherencia al tratamiento...', youtubeId: 'zxxxWRNnyZo', duracion: '1 min', autor: 'J&J Contigo' },
  },
  infografias: {
    ansiedad: { type: 'infografia', title: 'Ansiedad', desc: 'Conocerla es el primer paso para transformarla', imgSrc: 'img/infografia-2.jpeg', imgAlt: 'Infografía Ansiedad', linkVerCompleta: 'img/infografia-2.jpeg' },
    depresion: { type: 'infografia', title: 'Depresión', desc: 'Entenderla es el primer paso para sentirte mejor', imgSrc: 'img/infografia-5.jpeg', imgAlt: 'Infografía Depresión', linkVerCompleta: 'img/infografia-5.jpeg' },
    autoestima: { type: 'infografia', title: 'Baja autoestima', desc: 'Entenderla es el primer paso para fortalecerla', imgSrc: 'img/infografia-7.jpeg', imgAlt: 'Infografía Autoestima', linkVerCompleta: 'img/infografia-7.jpeg' },
    estres: { type: 'infografia', title: 'Estrés', desc: 'Entenderlo es el primer paso para gestionarlo', imgSrc: 'img/infografia-4.jpeg', imgAlt: 'Infografía Estrés', linkVerCompleta: 'img/infografia-4.jpeg' },
    relaciones: { type: 'infografia', title: 'Problemas de pareja', desc: 'Entenderlos es el primer paso para mejorar la relación', imgSrc: 'img/infografia-9.jpeg', imgAlt: 'Infografía Pareja', linkVerCompleta: 'img/infografia-9.jpeg' },
    adherencia: { type: 'infografia', title: 'Adherencia terapéutica', desc: 'Tu compromiso con el proceso es clave para tu bienestar', imgSrc: 'img/infografia-1.jpeg', imgAlt: 'Infografía Adherencia', linkVerCompleta: 'img/infografia-1.jpeg' }
  },
  guias: {
    emocional: { type: 'guia', title: 'Guía de afrontamiento emocional', desc: 'Estrategias prácticas y basadas en evidencia para atravesar momentos difíciles.', pdfHref: '#', paginas: '8 páginas' },
    psicologo: { type: 'guia', title: 'Cómo elegir un psicólogo', desc: 'Qué preguntas hacerse, qué señales observar y cómo saber si el vínculo es adecuado.', pdfHref: '#', paginas: '6 páginas' },
    tiempo: { type: 'guia', title: 'Manejo emocional diario', desc: 'Técnicas de regulación emocional que puedes aplicar entre sesiones.', pdfHref: '#', paginas: '10 páginas' }
  },
  psicologos: {
    MR: { type: 'psicologo', iniciales: 'MR', nombre: 'Lic. María Rodríguez', especialidad: 'Ansiedad · Autoestima', modalidad: 'Virtual y presencial', descripcion: 'Especialista en terapia cognitivo-conductual con enfoque empático y personalizado.' },
    CP: { type: 'psicologo', iniciales: 'CP', nombre: 'Lic. Carlos Paredes', especialidad: 'Depresión · Estrés', modalidad: 'Presencial', descripcion: 'Psicólogo clínico con formación en terapia humanista. Su estilo dinámico y directo facilita avances reales.' },
    AL: { type: 'psicologo', iniciales: 'AL', nombre: 'Lic. Andrea Luna', especialidad: 'Relaciones · Estrés', modalidad: 'Virtual', descripcion: 'Especialista en terapia sistémica y relaciones interpersonales. Crea espacios de confianza.' }
  }
};

function getRecommendations(responses) {
  const recs = [];
  const addedTitles = new Set(); // Para evitar recursos duplicados

  const addRec = (item) => {
    if (item && !addedTitles.has(item.title)) {
      recs.push(item);
      addedTitles.add(item.title);
    }
  };

  // 1. REGLA POR ÁREA (Añade 1 Video y 1 Infografía específica a su problema)
  if (responses.area && resourcesCatalog.videos[responses.area]) {
    addRec(resourcesCatalog.videos[responses.area]);
    addRec(resourcesCatalog.infografias[responses.area]);
  }

  // 2. REGLA POR BARRERA (Añade soluciones a su dificultad)
  switch (responses.barrera) {
    case 'tiempo':
      addRec(resourcesCatalog.guias.tiempo);
      addRec({ type: 'consejo', icon: '📱', title: 'Activa recordatorios', desc: 'Programar alarmas 24h antes de tus sesiones reduce la posibilidad de faltar.' });
      break;
    case 'desmotivacion':
    case 'avances':
      addRec(resourcesCatalog.videos.adherencia);
      addRec(resourcesCatalog.guias.emocional);
      break;
    case 'economica':
      addRec({ type: 'consejo', icon: '🏥', title: 'Opciones accesibles', desc: 'Recuerda que existen centros CSMC del MINSA y consultorios universitarios gratuitos en tu ciudad.' });
      break;
    case 'mala_exp':
    case 'psicologo':
      addRec(resourcesCatalog.guias.psicologo);
      // Recomendamos psicólogos según su preferencia de modalidad (si la marcó)
      if (responses.modalidad === 'presencial') {
        addRec(resourcesCatalog.psicologos.CP);
      } else if (responses.modalidad === 'virtual') {
        addRec(resourcesCatalog.psicologos.AL);
      } else {
        addRec(resourcesCatalog.psicologos.MR);
      }
      break;
    case 'mitos':
      addRec(resourcesCatalog.videos.mitos);
      addRec({ type: 'consejo', icon: '🧠', title: 'Fortaleza mental', desc: 'Buscar apoyo psicológico es un signo de inteligencia emocional, no de debilidad.' });
      break;
  }

  // 3. REGLA POR HISTORIAL DE ABANDONO (Añade refuerzo visual si antes dejó la terapia)
  if (responses.abandono === 'si') {
    addRec(resourcesCatalog.infografias.adherencia);
  }

  // 4. FALLBACK: Si no seleccionó nada clave, se muestra un kit básico
  if (recs.length === 0) {
    addRec(resourcesCatalog.guias.emocional);
    addRec({ type: 'consejo', icon: '🌟', title: 'Tu proceso importa', desc: 'Cada persona avanza a su propio ritmo. Lo importante es dar el primer paso.' });
    addRec(resourcesCatalog.psicologos.AL);
  }

  return recs;
}

function buildRecCard(r) {
  if (r.type === 'video') {
    return `
      <div class="rec-card rec-card--video">
        <div class="rec-video-wrap">
          <a class="video-thumb-link" href="https://www.youtube.com/watch?v=${r.youtubeId}" target="_blank">
            <img src="https://img.youtube.com/vi/${r.youtubeId}/mqdefault.jpg" alt="${r.title}" class="video-thumb-img" />
            <div class="video-play-overlay">
              <div class="video-play-btn"><i class="bi bi-play-fill"></i></div>
            </div>
          </a>
        </div>
        <div class="resource-card-body">
          <span class="resource-badge resource-badge--video"><i class="bi bi-youtube"></i> Video</span>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
          <span class="resource-meta">Por: ${r.autor}</span>
        </div>
      </div>`;
  }

  if (r.type === 'infografia') {
    return `
      <div class="rec-card rec-card--infografia">
        <div class="rec-infografia-wrap">
          <img src="${r.imgSrc}" alt="${r.imgAlt}" />
          <div class="infografia-overlay">
            <a href="${r.linkVerCompleta}" class="btn-ver-infografia" target="_blank">Ver completa ↗</a>
          </div>
        </div>
        <div class="rec-card-body">
          <span class="resource-badge resource-badge--info">Infografía</span>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      </div>`;
  }

  if (r.type === 'guia') {
    return `
      <div class="rec-card rec-card--guia">
        <div class="guia-preview">
          <div class="guia-icon-wrap">📄</div>
          <div class="guia-meta-wrap">
            <span class="guia-tipo">PDF · ${r.paginas}</span>
            <span class="guia-autor">Equipo ADHIERE</span>
          </div>
        </div>
        <div class="rec-card-body">
          <span class="resource-badge resource-badge--guia">📘 Guía práctica</span>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
          <a href="${r.pdfHref}" class="btn-small" download>⬇ Descargar PDF</a>
        </div>
      </div>`;
  }

  if (r.type === 'psicologo') {
    return `
      <div class="rec-card rec-card--psicologo">
        <div class="rec-psico-header">
          <div class="psico-avatar">${r.iniciales}</div>
          <div>
            <h4>${r.nombre}</h4>
            <span class="psico-tag">${r.especialidad}</span>
            <span class="psico-tag modal-tag">${r.modalidad}</span>
          </div>
        </div>
        <p class="rec-psico-desc">${r.descripcion}</p>
        <a href="#contacto" class="btn-small">Solicitar información</a>
      </div>`;
  }

  if (r.type === 'consejo') {
    return `
      <div class="rec-card rec-card--consejo">
        <div class="rec-card-icon-box">
          <span class="rec-card-icon">${r.icon}</span>
        </div>
        <div class="rec-card-body">
          <span class="resource-badge resource-badge--consejo">💡 Consejo ADHIERE</span>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      </div>`;
  }
}

function buildResultHTML(recs) {
  return `<div class="result-recs">
    ${recs.map(r => `
      <div class="result-rec-item">
        <h4>${r.type === 'consejo' ? r.icon + ' ' : ''}${r.title}</h4>
        <p>${r.desc}</p>
      </div>
    `).join('')}
  </div>`;
}

function renderRecsSection(responses) {
  const recs = getRecommendations(responses);
  const container = document.getElementById('recsContent');

  // Fallback por si la evaluación no arrojó resultados
  if (!recs || recs.length === 0) {
    container.innerHTML = `
      <div class="recs-empty">
        <p>No se encontraron recomendaciones exactas. Por favor, <a href="#evaluacion">intenta la evaluación nuevamente</a>.</p>
      </div>`;
    return;
  }

  // Inyectar el HTML
  container.innerHTML = `<div class="recs-grid">${recs.map(buildRecCard).join('')}</div>`;

  // Reconectar las animaciones para que las tarjetas no se queden invisibles
  const newCards = container.querySelectorAll('.rec-card');
  newCards.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    
    if (typeof observer !== 'undefined') {
      observer.observe(el);
    } else {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }
  });
}

// ---- LOCALSTORAGE ----
function saveResponse(data) {
  const existing = JSON.parse(localStorage.getItem('adhiere_responses') || '[]');
  existing.push(data);
  localStorage.setItem('adhiere_responses', JSON.stringify(existing));
}

// ---- EXPORTAR EXCEL con SheetJS ----
function exportExcel() {
  const raw = JSON.parse(localStorage.getItem('adhiere_responses') || '[]');

  if (raw.length === 0) {
    alert('No hay registros para exportar todavía.');
    return;
  }

  const labels = {
    fecha: 'Fecha y hora',
    primera_vez: '¿Primera vez?',
    asiste: '¿Asiste actualmente?',
    abandono: '¿Abandonó antes?',
    barrera: 'Barrera principal',
    genero: 'Preferencia de género',
    modalidad: 'Modalidad preferida',
    area: 'Área a trabajar',
    estilo: 'Estilo de atención',
    esperas: '¿Qué espera lograr?',
    ayuda: '¿Qué le ayudaría?',
    sugerencias: 'Sugerencias'
  };

  const rows = raw.map(r => {
    const row = {};
    Object.keys(labels).forEach(k => {
      row[labels[k]] = r[k] || '';
    });
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Ancho de columnas
  ws['!cols'] = Object.values(labels).map(() => ({ wch: 28 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Respuestas ADHIERE');

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `ADHIERE_respuestas_${fecha}.xlsx`);
}

// ---- PESTAÑAS PSICOEDUCACIÓN ----
function showPsicoTab(tab, btn) {
  document.querySelectorAll('.psico-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.psico-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('psico-' + tab).classList.remove('hidden');
  btn.classList.add('active');
}

// ---- CONTACTO ----
function sendContact() {
  const nombre = document.getElementById('contactNombre').value.trim();
  const email = document.getElementById('contactEmail').value.trim();
  const msg = document.getElementById('contactMsg').value.trim();
  const note = document.getElementById('contactNote');

  if (!nombre || !email || !msg) {
    note.textContent = 'Por favor, completa todos los campos.';
    note.style.color = '#C0392B';
    return;
  }

  // Guardar contacto en localStorage
  const contacts = JSON.parse(localStorage.getItem('adhiere_contacts') || '[]');
  contacts.push({ nombre, email, msg, fecha: new Date().toLocaleString('es-PE') });
  localStorage.setItem('adhiere_contacts', JSON.stringify(contacts));

  document.getElementById('contactNombre').value = '';
  document.getElementById('contactEmail').value = '';
  document.getElementById('contactMsg').value = '';

  note.textContent = '¡Mensaje enviado! Nos comunicaremos contigo pronto.';
  note.style.color = 'var(--purple-500)';
}

// ---- ANIMACIONES DE ENTRADA ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.barrier-card, .resource-card, .psico-card, .rec-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// ============================================
// CARRUSEL DE INFOGRAFÍAS (CORREGIDO)
// ============================================
(function () {
  const VISIBLE = 3;
  let current = 0;
  let total = 0;
  let slidesPerView = VISIBLE;

  function getSlidesPerView() {
    if (window.innerWidth <= 500) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
  }

  function initCarousel() {
    const track = document.getElementById('infoTrack');
    if (!track) return;

    total = track.querySelectorAll('.info-slide').length;
    slidesPerView = getSlidesPerView();
    current = 0;

    buildDots();
    updateCarousel();
  }

  function buildDots() {
    const container = document.getElementById('infoDots');
    if (!container) return;
    const pages = Math.ceil(total / slidesPerView);
    container.innerHTML = '';
    for (let i = 0; i < pages; i++) {
      const btn = document.createElement('button');
      btn.className = 'info-dot' + (i === 0 ? ' active' : '');
      btn.setAttribute('aria-label', 'Página ' + (i + 1));
      btn.onclick = () => goToPage(i);
      container.appendChild(btn);
    }
  }

  function updateCarousel() {
    const track = document.getElementById('infoTrack');
    if (!track) return;

    slidesPerView = getSlidesPerView();
    const gap = 20; // 1.25rem = 20px
    const containerW = track.parentElement.offsetWidth;

    // MATEMÁTICA CORREGIDA: Restamos los gaps del contenedor antes de dividir las tarjetas
    const slideW = (containerW - (slidesPerView - 1) * gap) / slidesPerView;

    // Asignamos el ancho responsivo exacto a cada tarjeta por JS
    const slides = track.querySelectorAll('.info-slide');
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${slideW}px`;
    });

    // El desplazamiento exacto acumulando tarjetas + espacios pasados
    const offset = current * (slideW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Se especifica el contenedor #infoDots para que no altere otros carruseles
    const dotsContainer = document.getElementById('infoDots');
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.info-dot').forEach((d, i) => {
        d.classList.toggle('active', i === Math.floor(current / slidesPerView));
      });
    }

    // Flechas de navegación activas/inactivas
    const prev = document.querySelector('.info-carousel-wrap .info-arrow--prev');
    const next = document.querySelector('.info-carousel-wrap .info-arrow--next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= total - slidesPerView;
  }

  function goToPage(page) {
    current = page * slidesPerView;
    updateCarousel();
  }

  window.infoPrev = function () {
    current = Math.max(0, current - slidesPerView);
    updateCarousel();
  };

  window.infoNext = function () {
    current = Math.min(total - slidesPerView, current + slidesPerView);
    updateCarousel();
  };

  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    if (current > total - slidesPerView) {
      current = Math.max(0, total - slidesPerView);
    }
    buildDots();
    updateCarousel();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCarousel);
  } else {
    initCarousel();
  }
})();

// ============================================
// CARRUSEL DE VIDEOS (CORREGIDO)
// ============================================
(function () {
  let current = 0;
  let total = 0;
  let slidesPerView = 3;

  function getSlidesPerView() {
    if (window.innerWidth <= 500) return 1;
    if (window.innerWidth <= 768) return 2;
    return 3;
  }

  function initVideoCarousel() {
    const track = document.getElementById('videoTrack');
    if (!track) return;
    total = track.querySelectorAll('.info-slide').length;
    slidesPerView = getSlidesPerView();
    current = 0;

    // Control de seguridad por si buildDots está definido fuera de este bloque
    if (typeof buildDots === 'function') buildDots();
    update();
  }

  function update() {
    const track = document.getElementById('videoTrack');
    if (!track) return;

    slidesPerView = getSlidesPerView();
    const gap = 20; // Equivale al gap de 1.25rem en tu CSS
    const containerW = track.parentElement.offsetWidth; // Ancho del contenedor visible

    // FORMULA CLAVE: Calculamos el ancho exacto de cada tarjeta restando los gaps visibles
    const slideW = (containerW - (slidesPerView - 1) * gap) / slidesPerView;

    // Asignamos el ancho exacto a cada slide para evitar que se estiren o colapsen
    const slides = track.querySelectorAll('.info-slide');
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${slideW}px`;
    });

    // Calculamos el desplazamiento exacto multiplicando el índice por (ancho de tarjeta + gap)
    const offset = current * (slideW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Actualización de los Dots (Puntos de paginación)
    const dotsContainer = document.getElementById('videoDots');
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.info-dot').forEach((d, i) => {
        d.classList.toggle('active', i === Math.floor(current / slidesPerView));
      });
    }

    // Activación/Desactivación de flechas de navegación
    const prev = document.querySelector('#psico-videos .info-arrow--prev');
    const next = document.querySelector('#psico-videos .info-arrow--next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= total - slidesPerView;
  }

  window.videoPrev = function () {
    current = Math.max(0, current - slidesPerView);
    update();
  };

  window.videoNext = function () {
    current = Math.min(total - slidesPerView, current + slidesPerView);
    update();
  };

  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    // Evitamos que al redimensionar el carrusel se quede en una posición vacía
    if (current > total - slidesPerView) {
      current = Math.max(0, total - slidesPerView);
    }
    if (typeof buildDots === 'function') buildDots();
    update();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoCarousel);
  } else {
    initVideoCarousel();
  }
})();
// ============================================
// LIGHTBOX
// ============================================
(function () {
  function getAllImages() {
    return Array.from(document.querySelectorAll('.info-card-img-wrap img'));
  }

  let currentLightboxIndex = 0;
  let isDragging = false;
  let hasMoved = false;
  let startX = 0, startY = 0;
  let currentX = 0, currentY = 0;

  // ---- ABRIR / NAVEGAR ----
  window.openLightbox = function (card) {
    const img = card.querySelector('.info-card-img-wrap img');
    if (!img) return;
    const allImgs = getAllImages();
    currentLightboxIndex = allImgs.indexOf(img);
    showLightboxImage(currentLightboxIndex);
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  function showLightboxImage(index) {
    const allImgs = getAllImages();
    if (index < 0 || index >= allImgs.length) return;
    currentLightboxIndex = index;

    const lb = document.getElementById('lightboxImg');
    lb.src = allImgs[index].src;
    lb.alt = allImgs[index].alt;

    // Reset zoom al cambiar imagen
    lb.classList.remove('zoomed');
    lb.style.transform = '';
    lb.style.cursor = 'zoom-in';
    currentX = 0;
    currentY = 0;

    document.querySelector('.lightbox-prev').style.visibility = index === 0 ? 'hidden' : 'visible';
    document.querySelector('.lightbox-next').style.visibility = index === allImgs.length - 1 ? 'hidden' : 'visible';
  }

  window.closeLightbox = function (e) {
    if (e && e.target.tagName === 'IMG') return;
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  };

  window.lightboxPrev = function (e) {
    e.stopPropagation();
    showLightboxImage(currentLightboxIndex - 1);
  };

  window.lightboxNext = function (e) {
    e.stopPropagation();
    showLightboxImage(currentLightboxIndex + 1);
  };

  // ---- TECLADO ----
  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxImage(currentLightboxIndex - 1);
    if (e.key === 'ArrowRight') showLightboxImage(currentLightboxIndex + 1);
  });

  // ---- ZOOM + DRAG ----
  const img = document.getElementById('lightboxImg');

  img.addEventListener('mousedown', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox.classList.contains('open')) return;
    e.preventDefault();
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    if (img.classList.contains('zoomed')) img.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !img.classList.contains('zoomed')) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!hasMoved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    hasMoved = true;
    currentX += dx;
    currentY += dy;
    startX = e.clientX;
    startY = e.clientY;
    img.style.transform = `scale(2) translate(${currentX}px, ${currentY}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    if (!hasMoved) {
      img.classList.toggle('zoomed');
      if (!img.classList.contains('zoomed')) {
        currentX = 0;
        currentY = 0;
        img.style.transform = '';
        img.style.cursor = 'zoom-in';
      } else {
        img.style.cursor = 'grab';
      }
    } else {
      img.style.cursor = 'grab';
    }
  });

})();