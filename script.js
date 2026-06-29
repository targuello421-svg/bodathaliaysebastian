/* ============================================================
   Sebastián & Thalía — lógica de la invitación
   ============================================================ */

/* -------- CONFIGURACIÓN (edita aquí) ----------------------- */
const CONFIG = {
  // Fecha y hora de la boda (Bogotá = UTC-5)
  weddingDate: '2026-10-28T17:00:00-05:00',

  // URL del Web App de Google Apps Script donde se guardan las confirmaciones.
  // Sigue los pasos de RSVP_SETUP.md y pega aquí la URL que termina en /exec
  rsvpEndpoint: '',

  // WhatsApp de respaldo: se usa SOLO si rsvpEndpoint está vacío.
  // Formato internacional SIN '+' ni espacios. Ej: 573001234567 (Colombia)
  whatsapp: '34600000000',
};

/* ============================================================
   1) CUENTA ATRÁS
   ============================================================ */
(function countdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const el = {
    days: document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins: document.getElementById('cd-mins'),
    secs: document.getElementById('cd-secs'),
  };
  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      el.days.textContent = '0';
      el.hours.textContent = el.mins.textContent = el.secs.textContent = '00';
      return;
    }
    const s = Math.floor(diff / 1000);
    el.days.textContent = Math.floor(s / 86400);
    el.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    el.mins.textContent = pad(Math.floor((s % 3600) / 60));
    el.secs.textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============================================================
   2) NUESTRA CANCIÓN — carga YouTube solo al hacer clic
   ============================================================ */
(function songPlayer() {
  const box = document.getElementById('video');
  if (!box) return;
  function play() {
    const id = box.dataset.videoId;
    if (!id || id === 'REEMPLAZA_VIDEO_ID') {
      alert('Pega el ID del vídeo de YouTube en index.html (data-video-id).');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    box.innerHTML = '';
    box.appendChild(iframe);
  }
  box.addEventListener('click', play);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
  });
})();

/* ============================================================
   3) MINI JUEGO
   ============================================================
   ⚠️ EDITA estas preguntas. 'correct' = índice (0-based) de la
   respuesta correcta. Solo la 1ª venía en el diseño; las demás
   son de ejemplo para que las cambies por las vuestras.        */
const QUIZ = [
  {
    q: '¿En qué ciudad se conocieron Sebastián y Thalía?',
    options: ['Barcelona', 'Madrid', 'Alicante', 'Valencia'],
    correct: 2, // Alicante
  },
  {
    q: '¿Cómo se conocieron?',
    options: ['Los presentó un amigo', 'En un café', 'Los presentó su madre', 'En una fiesta'],
    correct: 2, // Los presentó su madre  ('En una fiesta' = opción de relleno, cámbiala si quieres)
  },
  {
    q: '¿Quién es más probable que llegue tarde?',
    options: ['Sebastián', 'Thalía', 'Los dos', 'Son puntuales'],
    correct: 1, // Thalía
  },
  {
    q: '¿Su plan perfecto juntos?',
    options: ['Maratón de series', 'Cocinar en casa', 'Viajar', 'Salir con amigos'],
    correct: 2, // Viajar
  },
  {
    q: '¿Quién manda en la cocina?',
    options: ['Sebastián', 'Thalía', 'Cocinan juntos', 'Piden a domicilio'],
    correct: 0, // Sebastián
  },
  {
    q: '¿Cuál fue su primer viaje juntos?',
    options: ['Valencia', 'Colombia', 'Ecuador', 'México'],
    correct: 0, // Valencia  ('México' = opción de relleno, cámbiala si quieres)
  },
  {
    q: '¿Dónde fue la propuesta?',
    options: ['Madrid', 'Alicante', 'Salamanca', 'Bogotá'],
    correct: 2, // Salamanca  ('Bogotá' = opción de relleno, cámbiala si quieres)
  },
  {
    q: '"Nuestra canción" es de…',
    options: ['El Kanka', 'Manu Chao', 'Jorge Drexler', 'Rozalén'],
    correct: 0, // El Kanka
  },
  {
    q: '¿A quién esperan con más anhelo en su boda?',
    options: ['A ti, te esperamos con mucho cariño'],
    correct: 0, // única respuesta — el cierre bonito del juego
  },
];

(function quiz() {
  const elProgress = document.getElementById('quiz-progress');
  const elScore = document.getElementById('quiz-score');
  const elQuestion = document.getElementById('quiz-question');
  const elOptions = document.getElementById('quiz-options');
  const card = document.getElementById('quiz');
  if (!card) return;

  const PER_ROUND = 5;
  let idx = 0, score = 0, answered = false;

  // Cada partida: 4 preguntas al azar + la última SIEMPRE fija al final.
  function buildRound() {
    const fixed = QUIZ[QUIZ.length - 1];
    const pool = QUIZ.slice(0, -1);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, PER_ROUND - 1).concat(fixed);
  }
  const round = buildRound();

  function render() {
    answered = false;
    const item = round[idx];
    elProgress.textContent = `${idx + 1} de ${round.length}`;
    elScore.textContent = `${score} pts`;
    elQuestion.textContent = item.q;
    elOptions.innerHTML = '';
    item.options.forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'quiz-opt';
      b.textContent = opt;
      b.addEventListener('click', () => choose(i, b));
      elOptions.appendChild(b);
    });
  }

  function choose(i, btn) {
    if (answered) return;
    answered = true;
    const item = round[idx];
    const buttons = [...elOptions.querySelectorAll('.quiz-opt')];
    buttons.forEach((b) => (b.disabled = true));

    if (i === item.correct) {
      score += 10;
      btn.classList.add('correct');
    } else {
      score -= 5;
      btn.classList.add('wrong');
      buttons[item.correct].classList.add('correct');
    }
    elScore.textContent = `${score} pts`;

    setTimeout(() => {
      idx++;
      if (idx < round.length) render();
      else finish();
    }, 1100);
  }

  function finish() {
    const max = round.length * 10;
    let msg;
    if (score >= max) msg = '¡Perfecto! Os conocéis de memoria. 💕';
    else if (score >= max * 0.6) msg = '¡Muy bien! Casi de la familia.';
    else if (score > 0) msg = 'No está mal… habrá que repasar.';
    else msg = '¿Seguro que nos conoces? 😅';

    card.innerHTML = `
      <div class="quiz__result">
        <p class="quiz__result-score">${score} pts</p>
        <p class="quiz__result-msg">${msg}</p>
        <button class="quiz__retry" id="quiz-retry">Volver a jugar</button>
      </div>`;
    document.getElementById('quiz-retry').addEventListener('click', () => {
      idx = 0; score = 0;
      card.innerHTML = `
        <div class="quiz__head">
          <span class="quiz__progress" id="quiz-progress">1 de ${PER_ROUND}</span>
          <span class="quiz__score" id="quiz-score">0 pts</span>
        </div>
        <p class="quiz__question" id="quiz-question"></p>
        <div class="quiz__options" id="quiz-options"></div>`;
      // re-bind refs
      quiz();
    });
  }

  render();
})();

/* ============================================================
   4) RSVP
   ============================================================ */
(function rsvp() {
  const form = document.getElementById('rsvp-form');
  if (!form) return;
  const attendInput = document.getElementById('rsvp-attend');
  const toggleBtns = [...form.querySelectorAll('.toggle__btn')];
  const feedback = document.getElementById('rsvp-feedback');

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-checked', 'true');
      attendInput.value = btn.dataset.value;
    });
  });

  const submitBtn = form.querySelector('#rsvp-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const attend = attendInput.value;
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name) { showFeedback('Escribe tu nombre, porfa. 🙏', false); return; }
    if (!attend) { showFeedback('Dinos si podrás venir. 🙏', false); return; }

    const attendTxt = attend === 'si' ? 'Sí' : 'No';

    // Opción A (recomendada): guardar en la Hoja de Google.
    if (CONFIG.rsvpEndpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
      try {
        const body = new URLSearchParams({ name, attend: attendTxt, message });
        // Apps Script no devuelve cabeceras CORS: usamos no-cors (envío "a ciegas", sin leer respuesta).
        await fetch(CONFIG.rsvpEndpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
          body: body.toString(),
        });
        const msg = attend === 'si'
          ? '¡Gracias! Hemos guardado tu confirmación. Nos vemos el 28. 💕'
          : 'Gracias por avisar. Te echaremos de menos. 💛';
        showFeedback(msg, true);
        form.querySelectorAll('input, textarea, button').forEach((el) => (el.disabled = true));
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar asistencia';
        showFeedback('Ups, no se pudo enviar. Revisa tu conexión e inténtalo otra vez. 🙏', false);
      }
      return;
    }

    // Respaldo: sin endpoint configurado → WhatsApp a los novios.
    const text =
      `*Confirmación de boda*%0A` +
      `Nombre: ${encodeURIComponent(name)}%0A` +
      `Asistencia: ${encodeURIComponent(attend === 'si' ? '✅ Ahí estaré' : '❌ No puedo ir')}` +
      (message ? `%0AMensaje: ${encodeURIComponent(message)}` : '');
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${text}`, '_blank');
    showFeedback('¡Gracias! Se abrirá WhatsApp para enviar tu confirmación. 💌', true);
    submitBtn.disabled = true;
  });

  function showFeedback(msg, ok) {
    feedback.hidden = false;
    feedback.textContent = msg;
    feedback.style.color = ok ? '#3f6b3a' : '#b35a44';
    feedback.style.background = ok ? 'rgba(143,185,138,0.14)' : 'rgba(224,138,114,0.14)';
  }
})();

/* ============================================================
   5) APARICIÓN AL HACER SCROLL (reveal)
   ============================================================ */
(function reveal() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll(
    '.eyebrow, .names, .hero__date, .countdown, .blessing, ' +
    '.section__title, .lead, .quote, .closing-line, .detail-card, ' +
    '.cancion__quote, .video, .juego__rules, .quiz, .rsvp__deadline, .rsvp__form'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  targets.forEach((el) => {
    el.classList.add('reveal');
    // pequeño escalonado entre hermanos de la misma sección
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i * 0.08, 0.32) + 's';
    io.observe(el);
  });
})();

/* ============================================================
   6) MENÚ DE PUNTOS LATERAL
   ============================================================ */
(function dotnav() {
  const sections = [
    { id: 'inicio',    label: 'Inicio' },
    { id: 'reflexion', label: 'Nosotros' },
    { id: 'detalles',  label: 'Detalles' },
    { id: 'cancion',   label: 'Canción' },
    { id: 'juego',     label: 'Juego' },
    { id: 'rsvp',      label: 'Asistencia' },
  ];

  const nav = document.createElement('nav');
  nav.className = 'dotnav';
  nav.setAttribute('aria-label', 'Secciones');
  sections.forEach((s) => {
    if (!document.getElementById(s.id)) return;
    const a = document.createElement('a');
    a.href = '#' + s.id;
    a.dataset.label = s.label;
    a.setAttribute('aria-label', s.label);
    nav.appendChild(a);
  });
  document.body.appendChild(nav);

  const links = [...nav.querySelectorAll('a')];
  if (!('IntersectionObserver' in window)) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
      }
    });
  }, { threshold: 0.5 });

  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) spy.observe(el);
  });
})();
