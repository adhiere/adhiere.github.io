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
    document.getElementById('evaluacion').scrollIntoView({ behavior: 'smooth' });
  }
}

function prevStep(current) {
  document.getElementById('step' + current).classList.remove('active');
  document.getElementById('step' + (current - 1)).classList.add('active');
  document.getElementById('evaluacion').scrollIntoView({ behavior: 'smooth' });
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

  document.getElementById('evaluacion').scrollIntoView({ behavior: 'smooth' });
}

// ---- PERSONALIZACIÓN POR BARRERA ----
// ---- CATÁLOGO DE RECURSOS REALES (Basado en tu HTML) ----
const RECURSOS = {
  videos: {
    adherencia:        { youtubeId: 'LbTidy2zSGY', title: 'Claves para una correcta adherencia terapéutica', desc: 'El empoderamiento del paciente y su relación con los profesionales sanitarios.', duracion: '6 min', autor: 'Plataforma de Organizaciones de Pacientes' },
    ansiedad:          { youtubeId: 'AvjyfxzkWBs', title: '¿Qué es la ansiedad?', desc: 'La ansiedad es una emoción normal que puede convertirse en trastorno.', duracion: '2 min', autor: 'TecSalud' },
    ataquePanico:      { youtubeId: 'gxkRwYBkyIo', title: '¿Qué causa los ataques de pánico?', desc: 'Casi un tercio de nosotros experimentaremos al menos un ataque de pánico en nuestra vida.', duracion: '5 min', autor: 'Cindy J. Aaronson' },
    estres:            { youtubeId: 'dswLKHhocxk', title: '¿Qué es el Estrés? Síntomas y Tratamiento', desc: 'Cómo identificar los síntomas del estrés y cómo tratarlo.', duracion: '2 min', autor: 'Rosa González' },
    depresion:         { youtubeId: 'xH8rEPKuZKU', title: '¿Qué es la depresión?', desc: 'La depresión es la cuarta causa de incapacidad laboral en el mundo.', duracion: '2 min', autor: 'NMás' },
    duelo:             { youtubeId: 'Ziq6IBpy7ZY', title: '¿Qué es el duelo?', desc: 'Respuestas directas de especialistas sobre el proceso del duelo.', duracion: '1 min', autor: 'Medicable' },
    bajaAutoestima:    { youtubeId: 'HYnWaRKdgaY', title: 'Baja Autoestima: causas y consecuencias', desc: 'La autoestima es la percepción evaluativa de nosotros mismos.', duracion: '3 min', autor: 'María Claros' },
    regulacionEmocional: { youtubeId: 'WskC9epIAtw', title: 'Regulación Emocional', desc: 'Salud mental y regulación emocional.', duracion: '1 min', autor: 'Minsa Perú' },
    problemaPareja:    { youtubeId: 'EB1bJoMGebc', title: '¿Cómo es una relación sana de pareja?', desc: 'La salud desde una perspectiva integral en las relaciones.', duracion: '7 min', autor: 'Arun Mansukhani' },
    dependenciaEmocional: { youtubeId: 'H5o5IWqQD88', title: 'Conoce qué es la dependencia emocional', desc: 'La dependencia emocional puede darse en pareja y también en el trabajo.', duracion: '3 min', autor: 'Top Doctors España' },
    problemaFamiliar:  { youtubeId: '6UgpaozCD1Y', title: '6 señales de que convives con un familiar tóxico', desc: 'Señales sutiles que pueden revelar comportamientos tóxicos en la familia.', duracion: '7 min', autor: 'Sapiencia práctica' },
    violenciaPsico:    { youtubeId: '830GxiiCUkU', title: 'Maltrato psicológico: ¿Qué es el abuso emocional?', desc: 'Una forma de abuso que puede resultar en trauma psicológico y estrés postraumático.', duracion: '7 min', autor: 'Francisco Shibata' },
    sexualidadSalud:   { youtubeId: 'F1WrfWtsdRY', title: 'Salud Sexual y Reproductiva', desc: 'Información sobre salud sexual y reproductiva.', duracion: '4 min', autor: 'Mario Carreón' },
    tdah:              { youtubeId: 'WcuDJ3_qLvk', title: 'TDAH ¿Qué es realmente?', desc: 'El TDAH tiene mucha prevalencia. No debemos poner etiquetas.', duracion: '6 min', autor: 'Top Doctors España' },
    tea:               { youtubeId: 'XhmvcCbd6mI', title: '¿Qué es el trastorno del espectro autista (TEA)?', desc: 'Sus características y cómo reconocerlo.', duracion: '2 min', autor: 'CNN Chile' },
    tca:               { youtubeId: '7i3fp2xj31Y', title: '¿Qué son los trastornos de la conducta alimentaria?', desc: 'Parten de creencias negativas sobre el cuerpo y el peso.', duracion: '1 min', autor: 'Universitat Rovira i Virgili' },
    adicciones:        { youtubeId: 'jXVs5dLYRz0', title: '¿Qué son las adicciones?', desc: 'Comprende qué es una adicción y cómo afecta la vida.', duracion: '3 min', autor: 'Centros de Integración Juvenil' },
    habilidadSociales: { youtubeId: 'Z5jUr2MoYc0', title: '¿Qué son las habilidades sociales?', desc: 'Son necesarias para interactuar con los demás de forma efectiva.', duracion: '1 min', autor: 'Así Funciona Nuestra Mente' },
    bullying:          { youtubeId: 'QYtmmE5W9Ow', title: '¿Qué es el bullying o acoso escolar?', desc: 'Características para detectarlo a tiempo y buscar ayuda.', duracion: '3 min', autor: 'INSM Honorio Delgado' },
    burnout:           { youtubeId: '5snOSoGQnSM', title: 'Síndrome de Burnout', desc: 'Qué es el burnout y cómo afecta la salud mental.', duracion: '4 min', autor: 'Dr. Daniel López Rosetti' },
    problemaSueño:     { youtubeId: 'xir9Qytxo80', title: '¿Cómo identificar si tengo un trastorno del sueño?', desc: 'Cómo afecta al cuerpo la falta de sueño.', duracion: '2 min', autor: 'Hospital Médica Sur' },
    ira:               { youtubeId: 'UFaAfDcLg7I', title: 'Cómo manejar la ira con una técnica de 3 pasos', desc: 'Técnica práctica para gestionar la ira.', duracion: '14 min', autor: 'Chris Núñez Psicólogo' },
    autolesiones:      { youtubeId: 'IqbOoPuduTI', title: '¿Qué es la Autolesión?', desc: 'Las autolesiones pueden ocurrir a cualquier edad.', duracion: '4 min', autor: 'Psych Hub' },
    ansiedadSocial:    { youtubeId: 'gEaadjSca28', title: 'Fobia social: síntomas, causas y tratamientos', desc: 'Qué es la ansiedad social y cómo tratarla.', duracion: '8 min', autor: 'R&A Psicólogos' },
    proyectoVida:      { youtubeId: 'qe4B5pcWEFY', title: 'Proyecto de vida y toma de decisiones', desc: 'Herramientas para construir tu proyecto de vida.', duracion: '1 min', autor: 'Tomás Onofre Sorcia' },
  },
  infografias: {
    adherencia:           { imgSrc: 'img/infografia-1.jpeg', title: 'Adherencia terapéutica', desc: 'Tu compromiso con el proceso es clave para tu bienestar.' },
    ansiedad:             { imgSrc: 'img/infografia-2.jpeg', title: 'Ansiedad', desc: 'Conocerla es el primer paso para transformarla.' },
    ataquePanico:         { imgSrc: 'img/infografia-3.jpeg', title: 'Ataques de pánico', desc: 'Entender lo que ocurre para recuperar tu calma.' },
    estres:               { imgSrc: 'img/infografia-4.jpeg', title: 'Estrés', desc: 'Entenderlo es el primer paso para gestionarlo.' },
    depresion:            { imgSrc: 'img/infografia-5.jpeg', title: 'Depresión', desc: 'Entenderla es el primer paso para sentirte mejor.' },
    duelo:                { imgSrc: 'img/infografia-6.jpeg', title: 'Duelo', desc: 'Permítete sentir para poder sanar.' },
    bajaAutoestima:       { imgSrc: 'img/infografia-7.jpeg', title: 'Baja autoestima', desc: 'Entenderla es el primer paso para fortalecerla.' },
    regulacionEmocional:  { imgSrc: 'img/infografia-8.jpeg', title: 'Regulación emocional', desc: 'Aprender a gestionar lo que sientes es aprender a vivir mejor.' },
    problemaPareja:       { imgSrc: 'img/infografia-9.jpeg', title: 'Problemas de pareja', desc: 'Entenderlos es el primer paso para mejorar la relación.' },
    dependenciaEmocional: { imgSrc: 'img/infografia-10.jpeg', title: 'Dependencia emocional', desc: 'Entenderla es el primer paso para recuperar tu bienestar.' },
    problemaFamiliar:     { imgSrc: 'img/infografia-11.jpeg', title: 'Problemas familiares', desc: 'Entenderlos es el primer paso para construir relaciones más sanas.' },
  },
  guias: {
    violenciaPsico:    { imgSrc: 'img/guia1.jpeg', title: 'Violencia Psicológica', desc: 'Técnica para identificar el desequilibrio y tomar acciones para recuperar tu bienestar.' },
    sexualidadSalud:   { imgSrc: 'img/guia2.jpeg', title: 'Sexualidad y salud sexual', desc: 'Herramientas para comprender y cuidar tu salud sexual.' },
    adicciones:        { imgSrc: 'img/guia3.jpeg', title: 'Adicciones', desc: 'Técnicas para identificar desencadenantes y recuperar tu libertad.' },
    problemaSueño:     { imgSrc: 'img/guia4.jpeg', title: 'Bitácora del descanso y sueño reparador', desc: 'Registra patrones de sueño e identifica desencadenantes para mejorar tu descanso.' },
    ira:               { imgSrc: 'img/guia5.jpeg', title: 'Bitácora del volcán emocional', desc: 'Registra e identifica la ira antes de que estalle. Desarrolla estrategias de calma.' },
    autolesiones:      { imgSrc: 'img/guia6.jpeg', title: 'Autolesiones y búsqueda de ayuda', desc: 'Crea un plan de seguridad y fortalece tu red de apoyo.' },
    ansiedadSocial:    { imgSrc: 'img/guia7.jpeg', title: 'Ansiedad social: exposición gradual', desc: 'Enfrenta miedos sociales de manera progresiva, paso a paso.' },
    proyectoVida:      { imgSrc: 'img/guia8.jpeg', title: 'Proyecto de vida y toma de decisiones', desc: 'Alinea tus valores, identifica tus metas y toma decisiones conscientes.' },
  }
};

const PSICOLOGOS = [
  {
    iniciales: 'VR', genero: 'hombre',
    imgSrc: 'img/psico 1.jpeg',
    nombre: 'Dr. Victor Ríos Cubas',
    especialidad: 'Habilidades sociales · Desarrollo organizacional',
    modalidad: 'Presencial',
    descripcion: 'Doctor en Psicología. Gerente general de Liderando Kambios. Docente investigador y consultor internacional.'
  },
  {
    iniciales: 'MD', genero: 'mujer',
    imgSrc: 'img/psico 2.jpeg',
    nombre: 'Lic. Miriam Doza Damia',
    especialidad: 'Bienestar emocional · Protección y vulnerabilidad',
    modalidad: 'Presencial',
    descripcion: 'Psicóloga con experiencia en el ámbito universitario y en el Centro Emergencia Mujer. Docente en Universidad Continental.'
  },
  {
    iniciales: 'BJ', genero: 'mujer',
    imgSrc: 'img/psico 3.jpeg',
    nombre: 'Dra. Brigitte Jacobo Orellana',
    especialidad: 'Psicología organizacional · Recursos humanos',
    modalidad: 'Presencial',
    descripcion: 'Magíster en Recursos Humanos. Doctora en Ciencias de la Educación. Psicóloga Organizacional y docente universitaria.'
  },
  {
    iniciales: 'JS', genero: 'hombre',
    imgSrc: 'img/psico 4.jpeg',
    nombre: 'Dr. Jorge Salcedo Chuquimantari',
    especialidad: 'Gestión académica · Orientación psicológica',
    modalidad: 'Presencial',
    descripcion: 'Director del Programa de Psicología en Universidad Continental. Auditor ISO 19011:2018. Docente universitario.'
  },
  {
    iniciales: 'NH', genero: 'mujer',
    imgSrc: 'img/natalyHuaraca.jpeg',
    nombre: 'Ps. Nataly Huaraca Mantari',
    especialidad: 'Terapia de pareja · Familia · Duelo',
    modalidad: 'Presencial',
    descripcion: 'Psicóloga clínica y psicoterapeuta, fundadora de Avanti Centro Psicoterapéutico. Más de 12 años de experiencia.'
  },
  {
    iniciales: 'EM', genero: 'mujer',
    imgSrc: 'img/elsaMatos.jpeg',
    nombre: 'Mag. Elsa Matos Chancas',
    especialidad: 'Recursos humanos · Desarrollo organizacional',
    modalidad: 'Presencial',
    descripcion: 'Psicóloga y magíster especialista en gestión de recursos humanos y docencia universitaria.'
  },
  {
    iniciales: 'JC', genero: 'hombre',
    imgSrc: 'img/javierCamargo.jpeg',
    nombre: 'Ps. Javier Camargo Landa',
    especialidad: 'Psicología educativa · Proyectos sociales',
    modalidad: 'Presencial',
    descripcion: 'Consultor y catedrático con amplia trayectoria en Huancayo. Especialista en psicología educativa y organizacional.'
  },
  {
    iniciales: 'SU', genero: 'hombre',
    imgSrc: 'img/sandroUrco.jpeg',
    nombre: 'Ps. Sandro Urco Cáceres',
    especialidad: 'Investigación · Psicología educativa',
    modalidad: 'Presencial',
    descripcion: 'Docente universitario y asesor de tesis en salud mental. Promueve el rigor científico en la formación de psicólogos.'
  },
  {
    iniciales: 'LL', genero: 'mujer',
    imgSrc: 'img/luciaLoo.jpeg',
    nombre: 'Ps. Lucía Loo Martínez',
    especialidad: 'Salud mental comunitaria · Género e inclusión',
    modalidad: 'Presencial',
    descripcion: 'Psicóloga clínica y ocupacional experta en salud mental comunitaria e intervenciones con enfoque de género.'
  },
  {
    iniciales: 'CA', genero: 'hombre',
    imgSrc: 'img/carlosAvila.jpeg',
    nombre: 'Ps. Carlos Ávila Benito',
    especialidad: 'Psicología clínica · Psicología forense',
    modalidad: 'Presencial',
    descripcion: 'Psicólogo Clínico y Forense con más de 25 años de experiencia. Ex perito del Ministerio Público en Junín.'
  }
];

// Nombres legibles por área
const NOMBRES_AREA = {
  adherencia: 'Adherencia terapéutica', ansiedad: 'Ansiedad', ataquePanico: 'Ataques de pánico',
  estres: 'Estrés', depresion: 'Depresión', duelo: 'Duelo', bajaAutoestima: 'Baja autoestima',
  regulacionEmocional: 'Regulación emocional', problemaPareja: 'Problemas de pareja',
  dependenciaEmocional: 'Dependencia emocional', problemaFamiliar: 'Problemas familiares',
  violenciaPsico: 'Violencia psicológica', sexualidadSalud: 'Sexualidad y salud sexual',
  tdah: 'TDAH', tea: 'TEA', tca: 'Trastornos de la conducta alimentaria',
  adicciones: 'Adicciones', habilidadSociales: 'Habilidades sociales',
  bullying: 'Acoso escolar y bullying', burnout: 'Burnout', problemaSueño: 'Problemas de sueño',
  ira: 'Manejo de la ira', autolesiones: 'Autolesiones', ansiedadSocial: 'Ansiedad social',
  proyectoVida: 'Proyecto de vida'
};

function buildVideoRec(area) {
  const v = RECURSOS.videos[area];
  if (!v) return null;
  return {
    type: 'video',
    youtubeId: v.youtubeId,
    title: v.title,
    desc: v.desc,
    duracion: v.duracion,
    autor: v.autor
  };
}

function buildInfografiaRec(area) {
  const i = RECURSOS.infografias[area];
  if (!i) return null;
  return {
    type: 'infografia',
    imgSrc: i.imgSrc,
    imgAlt: i.title,
    title: i.title,
    desc: i.desc,
    linkVerCompleta: i.imgSrc
  };
}

function buildGuiaRec(area) {
  const g = RECURSOS.guias[area];
  if (!g) return null;
  return {
    type: 'guia',
    imgSrc: g.imgSrc,
    title: g.title,
    desc: g.desc,
    paginas: 'Guía práctica',
    pdfHref: g.imgSrc
  };
}

function buildPsicologoRec(index) {
  const p = PSICOLOGOS[index];
  return {
    type: 'psicologo',
    iniciales: p.iniciales,
    imgSrc: p.imgSrc,
    nombre: p.nombre,
    especialidad: p.especialidad,
    modalidad: p.modalidad,
    descripcion: p.descripcion
  };
}

function getRecommendations(respuestas) {
  const area        = respuestas.area;
  const barrera     = respuestas.barrera;
  const primeraVez  = respuestas.primera_vez;
  const abandono    = respuestas.abandono;
  const recomendaciones = [];

  // 1. VIDEO del área
  const video = buildVideoRec(area);
  if (video) recomendaciones.push(video);

  // 2. INFOGRAFÍA del área
  const info = buildInfografiaRec(area);
  if (info) recomendaciones.push(info);

  // 3. GUÍA del área
  const guia = buildGuiaRec(area);
  if (guia) recomendaciones.push(guia);

  // 4. CONSEJO EXTRA según barrera del formulario
  const consejosPorBarrera = {
  tiempo: {
    icon: 'bi bi-calendar-check', title: 'Organiza tu semana',
    desc: 'Reserva un horario fijo semanal para tu terapia...'
  },
  desmotivacion: {
    icon: 'bi bi-graph-up-arrow', title: 'Los avances no siempre se ven',
    desc: 'La desmotivación es parte del proceso...'
  },
  economica: {
    icon: 'bi bi-hospital', title: 'Atención psicológica accesible',
    desc: 'El MINSA, hospitales públicos y consultorios universitarios...'
  },
  avances: {
    icon: 'bi bi-bullseye', title: 'Define metas concretas',
    desc: 'Pídele a tu terapeuta que establezcan objetivos medibles...'
  },
  mala_exp: {
    icon: 'bi bi-search-heart', title: 'Cada terapeuta es diferente',
    desc: 'Una mala experiencia no define a toda la terapia...'
  },
  psicologo: {
    icon: 'bi bi-people', title: 'Primera sesión exploratoria',
    desc: 'Muchos psicólogos ofrecen una primera sesión sin compromiso...'
  },
  mitos: {
    icon: 'bi bi-shield-check', title: 'Ir a terapia es fortaleza',
    desc: 'Buscar apoyo psicológico no es debilidad...'
  },
  otro: {
    icon: 'bi bi-chat-heart', title: 'Tu proceso es único',
    desc: 'No existe un camino estándar en la terapia...'
  }
};

  if (barrera && consejosPorBarrera[barrera]) {
    recomendaciones.push({ type: 'consejo', ...consejosPorBarrera[barrera] });
  }

  // 5. CONSEJO EXTRA si es primera vez
  if (primeraVez === 'si') {
    recomendaciones.push({
      type: 'consejo', icon: 'bi bi-hand-wave',
      title: 'Bienvenido/a a este primer paso',
      desc: 'Buscar apoyo por primera vez requiere valentía. Tu bienestar merece esta oportunidad. Un profesional te guiará desde el inicio.'
    });
  }

  // 6. CONSEJO si abandonó antes
  if (abandono === 'si') {
    recomendaciones.push({
      type: 'consejo', icon: 'bi bi-arrow-repeat',
      title: 'Retomar siempre es posible',
      desc: 'Haber abandonado antes no significa fracaso. Muchas personas retoman la terapia y logran avances significativos la segunda vez.'
    });
  }

  // 7. Si no hay ningún recurso de área, consejo genérico
  if (recomendaciones.length === 0) {
    recomendaciones.push({
      type: 'consejo', icon: 'bi bi-lightbulb',
      title: 'Exploración inicial',
      desc: `El primer paso ya lo diste. Un profesional evaluará tus necesidades en el área de ${NOMBRES_AREA[area] || 'tu elección'}.`
    });
  }

  // 8. PSICÓLOGO — filtrando por preferencia de género
  const generoPref = respuestas.genero; // 'hombre' | 'mujer' | 'indiferente'

  // Filtrar candidatos según preferencia
  let candidatos = PSICOLOGOS;
  if (generoPref === 'hombre' || generoPref === 'mujer') {
    const filtrados = PSICOLOGOS.filter(p => p.genero === generoPref);
    // Si hay candidatos del género preferido, usarlos; si no (por si acaso), usar todos
    if (filtrados.length > 0) candidatos = filtrados;
  }

  // Elegir uno al azar entre los candidatos filtrados
  const idx = Math.floor(Math.random() * candidatos.length);
  const psicoElegido = candidatos[idx];

  recomendaciones.push({
    type: 'psicologo',
    iniciales: psicoElegido.iniciales,
    imgSrc: psicoElegido.imgSrc,
    nombre: psicoElegido.nombre,
    especialidad: psicoElegido.especialidad,
    modalidad: psicoElegido.modalidad,
    descripcion: psicoElegido.descripcion
  });

  return recomendaciones;
}

function obtenerNombreArea(valor) {
  const nombres = {
    adherencia: "Adherencia terapéutica", ansiedad: "Ansiedad", ataquePanico: "Ataques de pánico",
    estres: "Manejo del Estrés", depresion: "Depresión", duelo: "Proceso de Duelo",
    bajaAutoestima: "Autoestima", regulacionEmocional: "Regulación emocional", tdah: "Neurodivergencia",
    burnout: "Burnout", problemaSueño: "Higiene del Sueño"
    // Agrega aquí las demás si quieres que el texto de la especialidad del psicólogo sea exacto
  };
  return nombres[valor] || "Salud Mental";
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
      <div class="rec-card rec-card--infografia">
        <div class="rec-infografia-wrap" style="cursor:pointer;">
          <img src="${r.imgSrc}" alt="${r.title}" />
          <div class="infografia-overlay">
            <a href="${r.pdfHref}" class="btn-ver-infografia" target="_blank">Ver guía</a>
          </div>
        </div>
        <div class="rec-card-body">
          <span class="resource-badge resource-badge--guia">📘 Guía práctica</span>
          <h4>${r.title}</h4>
          <p>${r.desc}</p>
        </div>
      </div>`;
  }
    

if (r.type === 'psicologo') {
  const avatar = r.imgSrc
    ? `<img src="${r.imgSrc}" alt="${r.nombre}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : r.iniciales;
  return `
    <div class="rec-card rec-card--psicologo">
      <div class="rec-psico-header">
        <div class="psico-avatar">${avatar}</div>
        <div>
          <h4>${r.nombre}</h4>
        </div>
      </div>
      <p class="rec-psico-desc">${r.descripcion}</p>
      <a href="#psicologos" class="btn-small">Ver perfil completo</a>
    </div>`;
}

  if (r.type === 'consejo') {
    return `
    <div class="rec-card rec-card--consejo">
      <div class="rec-card-icon"><i class="${r.icon || 'bi bi-lightbulb'}"></i></div>
      <div class="rec-card-body">
        <span class="resource-badge resource-badge--consejo">Consejo</span>
        <h4>${r.title}</h4>
        <p>${r.desc}</p>
      </div>
    </div>`;
  }
}

function buildResultHTML(recs) {
  return `<div class="result-recs">
    ${recs.map(r => {
      // Ícono según tipo
      const iconos = {
        video:      'bi bi-play-circle-fill',
        infografia: 'bi bi-bar-chart-fill',
        guia:       'bi bi-book-fill',
        psicologo:  'bi bi-person-circle',
        consejo:    r.icon || 'bi bi-lightbulb'
      };
      const icono = iconos[r.type] || 'bi bi-lightbulb';
      return `
        <div class="result-rec-item">
          <h4><i class="${icono}"></i> ${r.title || r.nombre}</h4>
          <p>${r.desc || r.descripcion || ''}</p>
        </div>`;
    }).join('')}
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
// CARRUSEL DE GUÍAS PRÁCTICAS (DUPLICADO INDEPENDIENTE)
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
    const track = document.getElementById('guiaTrack');
    if (!track) return;

    total = track.querySelectorAll('.info-slide').length;
    slidesPerView = getSlidesPerView();
    current = 0;

    updateCarousel();
  }


  function updateCarousel() {
    const track = document.getElementById('guiaTrack');
    if (!track) return;

    slidesPerView = getSlidesPerView();
    const gap = 20; 
    const containerW = track.parentElement.offsetWidth;

    const slideW = (containerW - (slidesPerView - 1) * gap) / slidesPerView;

    const slides = track.querySelectorAll('.info-slide');
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${slideW}px`;
    });

    const offset = current * (slideW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    const dotsContainer = document.getElementById('guiaDots');
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.info-dot').forEach((d, i) => {
        d.classList.toggle('active', i === Math.floor(current / slidesPerView));
      });
    }

    const prev = document.querySelector('.guia-carousel-wrap .info-arrow--prev');
    const next = document.querySelector('.guia-carousel-wrap .info-arrow--next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= total - slidesPerView;
  }

  function goToPage(page) {
    current = page * slidesPerView;
    updateCarousel();
  }

  window.guiaPrev = function () {
    current = Math.max(0, current - slidesPerView);
    updateCarousel();
  };

  window.guiaNext = function () {
    current = Math.min(total - slidesPerView, current + slidesPerView);
    updateCarousel();
  };

  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    if (current > total - slidesPerView) {
      current = Math.max(0, total - slidesPerView);
    }
  
    updateCarousel();
  });

  // Re-inicializa al cambiar de pestaña para evitar fallas de cálculo por el "hidden"
  document.querySelectorAll('.tab-btn, [data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      setTimeout(initCarousel, 150);
    });
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

// ============================================
// CARRUSEL DE PSICÓLOGOS
// ============================================
(function () {
  let current = 0;
  let total = 0;
  let slidesPerView = 3;

  function getSlidesPerView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function initPsicoCarousel() {
    const track = document.getElementById('psicoTrack');
    if (!track) return;
    total = track.querySelectorAll('.info-slide').length;
    slidesPerView = getSlidesPerView();
    current = 0;
    update();
  }

  function update() {
    const track = document.getElementById('psicoTrack');
    if (!track) return;
    
    slidesPerView = getSlidesPerView();
    const gap = 20; 
    const containerW = track.parentElement.offsetWidth;
    const slideW = (containerW - (slidesPerView - 1) * gap) / slidesPerView;

    const slides = track.querySelectorAll('.info-slide');
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${slideW}px`;
    });

    const offset = current * (slideW + gap);
    track.style.transform = `translateX(-${offset}px)`;

    // Flechas
    const prev = document.querySelector('.psicos-section .info-arrow--prev');
    const next = document.querySelector('.psicos-section .info-arrow--next');
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current >= total - slidesPerView;
  }

  window.psicoPrev = function () {
    current = Math.max(0, current - slidesPerView);
    update();
  };

  window.psicoNext = function () {
    current = Math.min(total - slidesPerView, current + slidesPerView);
    update();
  };

  window.addEventListener('resize', () => {
    slidesPerView = getSlidesPerView();
    update();
  });

  document.addEventListener('DOMContentLoaded', initPsicoCarousel);
})();