/* ==========================================================================
   FUTEBOL EVOLUTION - LÓGICA INTEGRADA E COMPLETA
   ========================================================================== */

// --- VARIÁVEIS DE ESTADO E CONFIGURAÇÃO ---
let currentUser = null;
let registeredUsers = JSON.parse(localStorage.getItem('fe_registered_users')) || [];
let currentQuestionIndex = 0;
let quizAnswers = {};
let radarChartInstance = null;
let lineChartInstance = null;

// Cronômetro e Calendário
let timerInterval = null;
let timerSeconds = 0;
let currentCalendarDate = new Date();

const COOLDOWN_DAYS = 60; // Trava de 2 meses

// Reconhecimento de Voz (SpeechRecognition API)
let recognition = null;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
}

// --- BANCO COMPLETO DE PERGUNTAS (EXEMPLO BASE DA AVALIAÇÃO) ---
const questions = [
  { cat: "I. Modalidade", q: "Qual a sua modalidade principal de preferência?", opts: ["Campo", "Quadra (Futsal)", "Ambos (Campo e Quadra)", "Outros"] },
  { cat: "II. Posição", q: "Qual a sua posição principal de jogo?", opts: ["Atacante / Pivô", "Meia / Ala", "Zagueiro / Fixo", "Goleiro"] },
  { cat: "III. Atributos Técnicos", q: "Qual a qualidade do seu passe curto e médio?", opts: ["9 a 10 (Excelente)", "7 a 8 (Bom)", "5 a 6 (Mediano)", "Abaixo de 5"] },
  { cat: "III. Atributos Técnicos", q: "Como avalia o uso da sua perna não dominante (perna ruim)?", opts: ["Total confiança", "Apenas para passes simples", "Apenas apoio"] },
  { cat: "IV. Atributos Físicos", q: "Como está sua explosão nos primeiros 10 metros?", opts: ["Muito rápido e explodido", "Média", "Lento"] },
  { cat: "IV. Atributos Físicos", q: "Qual o seu nível de fôlego no final da partida?", opts: ["Inteiro até o apito final", "Canso no final", "Exausto na metade"] },
  { cat: "V. Visão & QI de Jogo", q: "Costuma olhar ao redor (escanear o campo) antes de receber a bola?", opts: ["Hábito frequente", "Às vezes esqueço", "Raramente"] },
  { cat: "VI. Mentalação & Foco", q: "Qual sua atitude após cometer um erro grave na partida?", opts: ["Foco imediato e recuperação", "Fico chateado alguns minutos", "Sinto o baque"] }
];

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('fe_logged_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    applyLoggedInUser();
  }
});

// --- LÓGICA DE CAMPOS DINÂMICOS NO CADASTRO ---
function toggleAdminField() {
  const role = document.getElementById('user-role').value;
  const athleteFields = document.getElementById('athlete-fields');
  
  if (athleteFields) {
    if (role === 'admin') {
      athleteFields.style.display = 'none';
    } else {
      athleteFields.style.display = 'block';
    }
  }
}

// --- CÁLCULO AUTOMÁTICO DE IDADE PELA DATA DE NASCIMENTO ---
function calculateAgeFromBirthdate(birthdateStr) {
  if (!birthdateStr) return 17;
  const birthDate = new Date(birthdateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// --- AUTENTICAÇÃO E CADASTRO SEGURO ---
function handleAuth(event) {
  event.preventDefault();

  const role = document.getElementById('user-role').value;
  const inputName = document.getElementById('user-name').value.trim();
  const birthdate = document.getElementById('user-birthdate') ? document.getElementById('user-birthdate').value : '';
  const calculatedAge = role === 'admin' ? 30 : calculateAgeFromBirthdate(birthdate);

  // Verificação Segura do Admin via Prompt
  if (role === 'admin') {
    if (inputName.toLowerCase() !== "miguel prime") {
      alert("Acesso Negado! Nome de Administrador inválido.");
      return;
    }
    const pwd = prompt("Digite a Senha do Administrador:");
    if (pwd !== "3020") {
      alert("Senha incorreta!");
      return;
    }
  }

  const photoInput = document.getElementById('user-photo-input');
  let photoBase64 = "https://via.placeholder.com/150";

  const proceedWithAuth = (imgSrc) => {
    currentUser = {
      name: inputName,
      email: document.getElementById('user-email').value,
      role: role,
      birthdate: birthdate,
      age: calculatedAge,
      height: role === 'admin' ? '175' : (document.getElementById('user-height') ? document.getElementById('user-height').value : '175'),
      weight: role === 'admin' ? '70' : (document.getElementById('user-weight') ? document.getElementById('user-weight').value : '70'),
      hasBall: role === 'admin' ? 'sim' : (document.getElementById('user-has-ball') ? document.getElementById('user-has-ball').value : 'sim'),
      trainingLocation: document.getElementById('user-location') ? document.getElementById('user-location').value : 'casa',
      photo: imgSrc,
      diagnosis: null,
      scores: null,
      quizDate: null,
      videos: [],
      workoutDates: [],
      goals: [],
      scoutUnlocked: false
    };

    localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
    saveToRegisteredUsers(currentUser);
    applyLoggedInUser();
  };

  if (role !== 'admin' && photoInput && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) { proceedWithAuth(e.target.result); };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    proceedWithAuth(photoBase64);
  }
}

function saveToRegisteredUsers(user) {
  const existingIdx = registeredUsers.findIndex(u => u.email === user.email);
  if (existingIdx >= 0) {
    registeredUsers[existingIdx] = user;
  } else {
    registeredUsers.push(user);
  }
  localStorage.setItem('fe_registered_users', JSON.stringify(registeredUsers));
}

function applyLoggedInUser() {
  document.getElementById('auth-screen').classList.add('hidden');
  if (document.getElementById('nav-user-name')) {
    document.getElementById('nav-user-name').innerText = currentUser.name;
  }

  if (currentUser.photo && document.getElementById('nav-user-photo')) {
    const navPhoto = document.getElementById('nav-user-photo');
    navPhoto.src = currentUser.photo;
    navPhoto.classList.remove('hidden');
  }

  if (currentUser.role === 'admin') {
    if (document.getElementById('nav-admin')) document.getElementById('nav-admin').classList.remove('hidden');
    if (document.getElementById('nav-admin-mobile')) document.getElementById('nav-admin-mobile').classList.remove('hidden');
    renderAdminUsers();
  }

  if (document.getElementById('welcome-message')) {
    document.getElementById('welcome-message').innerText = `Bem-vindo, ${currentUser.name}!`;
  }

  checkQuizLockStatus();
  updateFutuCardDisplay();

  if (currentUser.diagnosis && currentUser.scores) {
    renderTechnicalReport(currentUser.diagnosis);
    initCharts(currentUser.scores, [50, 65, 80, 90]);
    if (document.getElementById('chart-zero-warning')) {
      document.getElementById('chart-zero-warning').classList.add('hidden');
    }
  } else {
    initCharts([0,0,0,0,0,0], [0,0,0,0]);
    if (document.getElementById('chart-zero-warning')) {
      document.getElementById('chart-zero-warning').classList.remove('hidden');
    }
  }

  renderCalendar();
  renderUserVideos();
  loadQuizQuestion();
  renderAgeSpecificContent();
}

function logout() {
  localStorage.removeItem('fe_logged_user');
  location.reload();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('text-emerald-400', 'bg-slate-800'));

  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');

  const navBtn = document.getElementById('nav-' + tabId);
  if (navBtn) navBtn.classList.add('text-emerald-400', 'bg-slate-800');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- CONTEÚDO ADAPTADO POR FAIXA ETÁRIA ---
function renderAgeSpecificContent() {
  const isUnder14 = currentUser.age <= 14;
  
  const youngContainer = document.getElementById('young-athlete-features');
  const adultContainer = document.getElementById('adult-athlete-features');

  if (youngContainer && adultContainer) {
    if (isUnder14) {
      youngContainer.classList.remove('hidden');
      adultContainer.classList.add('hidden');
    } else {
      youngContainer.classList.add('hidden');
      adultContainer.classList.remove('hidden');
    }
  }
}

// --- AVALIAÇÃO & TRAVA DE 60 DIAS ---
function checkQuizLockStatus() {
  if (!currentUser.quizDate) return;

  const lastQuiz = new Date(currentUser.quizDate);
  const now = new Date();
  const diffDays = Math.floor((now - lastQuiz) / (1000 * 60 * 60 * 24));

  if (diffDays < COOLDOWN_DAYS) {
    const remainingDays = COOLDOWN_DAYS - diffDays;

    if (document.getElementById('quiz-active-screen')) document.getElementById('quiz-active-screen').classList.add('hidden');
    if (document.getElementById('quiz-block-screen')) document.getElementById('quiz-block-screen').classList.remove('hidden');
    if (document.getElementById('quiz-countdown-box')) document.getElementById('quiz-countdown-box').innerText = `${remainingDays} Dias Restantes`;

    if (document.getElementById('quiz-cooldown-alert')) document.getElementById('quiz-cooldown-alert').classList.remove('hidden');
    if (document.getElementById('cooldown-timer-text')) {
      document.getElementById('cooldown-timer-text').innerText = `Sua reavaliação estará disponível em ${remainingDays} dias. Mantenha o foco nos treinos!`;
    }
  }
}

function loadQuizQuestion() {
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const qData = questions[currentQuestionIndex];
  if (document.getElementById('quiz-category')) document.getElementById('quiz-category').innerText = qData.cat;
  if (document.getElementById('quiz-progress')) document.getElementById('quiz-progress').innerText = `Pergunta ${currentQuestionIndex + 1} de ${questions.length}`;
  if (document.getElementById('quiz-question')) document.getElementById('quiz-question').innerText = qData.q;

  const optsContainer = document.getElementById('quiz-options');
  if (!optsContainer) return;

  optsContainer.innerHTML = '';

  qData.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = "w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-xs sm:text-sm text-slate-200 transition font-medium hover:border-emerald-500/50";
    btn.innerText = opt;
    btn.onclick = () => {
      quizAnswers[currentQuestionIndex] = opt;
      currentQuestionIndex++;
      loadQuizQuestion();
    };
    optsContainer.appendChild(btn);
  });
}

function finishQuiz() {
  const mainPos = quizAnswers[1] || "Meio-campo / Meia";
  const mainVirtue = quizAnswers[2] || "Passe e Visão";

  const scores = [
    quizAnswers[2] && quizAnswers[2].includes("9 a 10") ? 95 : 78,
    quizAnswers[3] && quizAnswers[3].includes("Total") ? 88 : 70,
    85,
    quizAnswers[5] && quizAnswers[5].includes("Inteiro") ? 92 : 72,
    quizAnswers[4] && quizAnswers[4].includes("explodido") ? 96 : 74,
    quizAnswers[6] && quizAnswers[6].includes("Hábito") ? 94 : 75
  ];

  const diagnosisData = {
    position: mainPos,
    strengths: [mainVirtue, "Boa leitura tática de jogo", "Disciplinado nas orientações"],
    weaknesses: ["Intensidade nos minutos finais", "Aprimoramento da perna ruim"],
    dos: ["Jogar com 1 ou 2 toques sob pressão", "Escanear o campo antes do domínio"],
    donts: ["Girar de costas para o zagueiro sem apoio", "Evitar perdas de bola no meio defensivo"]
  };

  currentUser.diagnosis = diagnosisData;
  currentUser.scores = scores;
  currentUser.quizDate = new Date().toISOString();

  localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
  saveToRegisteredUsers(currentUser);

  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  let overall100Banner = "";
  if (overall >= 100) {
    overall100Banner = `
      <div class="bg-amber-500/20 border border-amber-500 p-4 rounded-xl my-4 text-amber-300">
        🏆 <strong>PARABÉNS! VOCÊ ALCANÇOU O NÍVEL MÁXIMO (OVERALL 100)!</strong><br>
        Compartilhe seu FutuCard com os seus parceiros de time!
      </div>
    `;
  }

  const quizContainer = document.getElementById('quiz-container');
  if (quizContainer) {
    quizContainer.innerHTML = `
      <div class="text-center py-8 space-y-4">
        <i class="fa-solid fa-award text-amber-400 text-6xl"></i>
        <h3 class="text-2xl font-bold text-white">Avaliação Concluída!</h3>
        ${overall100Banner}
        <p class="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">Seu FutuCard e plano de treino foram atualizados com sucesso.</p>
        <button onclick="switchTab('futcard')" class="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition text-sm">Ver Meu FutuCard</button>
      </div>
    `;
  }

  renderTechnicalReport(diagnosisData);
  initCharts(scores, [50, 68, 82, 94]);
  if (document.getElementById('chart-zero-warning')) document.getElementById('chart-zero-warning').classList.add('hidden');
  updateFutuCardDisplay();
  checkQuizLockStatus();
}

// --- RELATÓRIO TÉCNICO & EXERCÍCIOS DIDÁTICOS ---
function renderTechnicalReport(data) {
  const card = document.getElementById('diagnostic-report-card');
  if (!card || !data) return;

  card.classList.remove('hidden');
  if (document.getElementById('badge-position')) document.getElementById('badge-position').innerText = `Posição: ${data.position}`;

  if (document.getElementById('report-strengths')) document.getElementById('report-strengths').innerHTML = data.strengths.map(s => `<li>${s}</li>`).join('');
  if (document.getElementById('report-weaknesses')) document.getElementById('report-weaknesses').innerHTML = data.weaknesses.map(w => `<li>${w}</li>`).join('');
  if (document.getElementById('report-dos')) document.getElementById('report-dos').innerHTML = data.dos.map(d => `<li>${d}</li>`).join('');
  if (document.getElementById('report-donts')) document.getElementById('report-donts').innerHTML = data.donts.map(d => `<li>${d}</li>`).join('');

  const isUnder14 = currentUser.age <= 14;
  const location = currentUser.trainingLocation || 'casa';
  const hasBall = currentUser.hasBall === 'sim';

  if (document.getElementById('report-ball-status')) {
    document.getElementById('report-ball-status').innerText = `Plano de Treino (${isUnder14 ? 'Iniciante/Jovem' : 'Avançado'}) - Local: ${location.toUpperCase()} | Bola: ${hasBall ? 'SIM' : 'NÃO'}`;
  }

  const planText = `
    <div class="space-y-3">
      <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
        <p class="font-bold text-white text-xs">📌 Exercício 1: Passe de Primeira e Domínio Orientado</p>
        <p class="text-xs text-emerald-400 font-semibold">3 Séries x 15 Repetições | Descanso: 45s</p>
        <p class="text-slate-400 text-xs mt-1">💡 <strong>Como executar:</strong> Apoie o pé ao lado da bola, vire a chapa do pé e bata firme no meio da bola.</p>
      </div>
      <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
        <p class="font-bold text-white text-xs">📌 Exercício 2: Sprint Lateral com Mudança de Direção</p>
        <p class="text-xs text-emerald-400 font-semibold">4 Séries x 10 Tiros | Descanso: 60s</p>
        <p class="text-slate-400 text-xs mt-1">💡 <strong>Como executar:</strong> Mantenha o centro de gravidade baixo e acelere com explosão.</p>
      </div>
    </div>
  `;

  if (document.getElementById('report-training-plan')) {
    document.getElementById('report-training-plan').innerHTML = planText;
  }
}

// --- RECURSO DE TRANSCRIÇÃO POR VOZ ---
function startVoiceTranscription(targetElementId) {
  if (!recognition) {
    alert("Reconhecimento de voz não suportado neste navegador.");
    return;
  }

  recognition.start();
  recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    const inputEl = document.getElementById(targetElementId);
    if (inputEl) {
      inputEl.value = transcript;
    }
  };
}

// --- MINI-GAME TÁTICO ---
function solveTacticalGame(choice) {
  if (choice === 'tocar') {
    alert('🎯 Decisão Correta! Tocar de primeira sob pressão de costas mantém a posse e evita perdas perigosas.');
  } else {
    alert('⚠️ Atenção! Girar de costas no meio sem apoio oferece risco de contra-ataque adversário.');
  }
}

// --- RELATÓRIO PARA PAIS (PDF) ---
function generateParentsPDF() {
  alert("Gerando Relatório Infanto-Juvenil em formato legível para os pais...");
}

// --- FUTUCARD ---
function updateFutuCardDisplay() {
  if (!currentUser) return;

  if (document.getElementById('card-name')) document.getElementById('card-name').innerText = currentUser.name || "NOME DO ATLETA";
  if (document.getElementById('card-meta')) document.getElementById('card-meta').innerText = `${currentUser.age || 17} ANOS | BRASIL`;
  
  if (currentUser.photo && document.getElementById('card-photo')) {
    document.getElementById('card-photo').src = currentUser.photo;
  }

  if (currentUser.scores && currentUser.diagnosis) {
    const s = currentUser.scores;
    const overall = Math.round(s.reduce((a, b) => a + b, 0) / s.length);

    if (document.getElementById('card-overall')) document.getElementById('card-overall').innerText = overall;
    if (document.getElementById('card-pos')) document.getElementById('card-pos').innerText = currentUser.diagnosis.position.substring(0, 3);

    if (document.getElementById('stat-pas')) document.getElementById('stat-pas').innerText = s[0];
    if (document.getElementById('stat-def')) document.getElementById('stat-def').innerText = s[1];
    if (document.getElementById('stat-chu')) document.getElementById('stat-chu').innerText = s[2];
    if (document.getElementById('stat-fis')) document.getElementById('stat-fis').innerText = s[3];
    if (document.getElementById('stat-vel')) document.getElementById('stat-vel').innerText = s[4];
    if (document.getElementById('stat-vis')) document.getElementById('stat-vis').innerText = s[5];
  }
}

function downloadFutuCard() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 400;
  canvas.height = 550;

  const grad = ctx.createLinearGradient(0, 0, 0, 550);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.5, '#eab308');
  grad.addColorStop(1, '#a16207');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 400, 550);

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 380, 530);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 42px sans-serif';
  ctx.fillText(document.getElementById('card-overall') ? document.getElementById('card-overall').innerText : '00', 30, 70);

  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(document.getElementById('card-name') ? document.getElementById('card-name').innerText.toUpperCase() : 'ATLETA', 30, 260);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`PAS: ${document.getElementById('stat-pas') ? document.getElementById('stat-pas').innerText : '00'}   DEF: ${document.getElementById('stat-def') ? document.getElementById('stat-def').innerText : '00'}`, 30, 320);
  ctx.fillText(`CHU: ${document.getElementById('stat-chu') ? document.getElementById('stat-chu').innerText : '00'}   FIS: ${document.getElementById('stat-fis') ? document.getElementById('stat-fis').innerText : '00'}`, 30, 360);
  ctx.fillText(`VEL: ${document.getElementById('stat-vel') ? document.getElementById('stat-vel').innerText : '00'}   VIS: ${document.getElementById('stat-vis') ? document.getElementById('stat-vis').innerText : '00'}`, 30, 400);

  ctx.font = '12px sans-serif';
  ctx.fillText('FUTEBOL EVOLUTION CERTIFIED', 100, 500);

  const link = document.createElement('a');
  link.download = `FutuCard-${currentUser ? currentUser.name : 'atleta'}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// --- AGENDA & CALENDÁRIO ---
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYearLabel = document.getElementById('calendar-month-year');
  if (!grid) return;

  grid.innerHTML = '';
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  if (monthYearLabel) monthYearLabel.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  weekDays.forEach(d => {
    grid.innerHTML += `<div class="font-bold text-slate-500 py-1">${d}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    grid.innerHTML += `<div></div>`;
  }

  const userDates = (currentUser && currentUser.workoutDates) ? currentUser.workoutDates : [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isDone = userDates.includes(dateStr);

    grid.innerHTML += `
      <div class="py-2 rounded-lg border ${isDone ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400' : 'bg-slate-950 text-slate-400 border-slate-800'}">
        ${day}
      </div>
    `;
  }

  if (document.getElementById('streak-count')) {
    document.getElementById('streak-count').innerText = userDates.length;
  }
}

function changeMonth(delta) {
  currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
  renderCalendar();
}

function markTodayWorkout() {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!currentUser.workoutDates) currentUser.workoutDates = [];

  if (!currentUser.workoutDates.includes(todayStr)) {
    currentUser.workoutDates.push(todayStr);
    localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
    saveToRegisteredUsers(currentUser);
    renderCalendar();
    alert('🎉 Sensacional! Treino registrado no seu calendário!');
  } else {
    alert('Você já marcou o treino de hoje!');
  }
}

// --- CRONÔMETRO DE INTERVALO ---
function toggleTimer() {
  const btn = document.getElementById('timer-start-btn');
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    if (btn) {
      btn.innerText = 'Continuar';
      btn.className = 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-2 rounded-lg text-xs';
    }
  } else {
    timerInterval = setInterval(() => {
      timerSeconds++;
      const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
      const s = String(timerSeconds % 60).padStart(2, '0');
      if (document.getElementById('timer-display')) {
        document.getElementById('timer-display').innerText = `${m}:${s}`;
      }
    }, 1000);
    if (btn) {
      btn.innerText = 'Pausar';
      btn.className = 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-xs';
    }
  }
}

function skipTimerPrep() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  if (document.getElementById('timer-display')) document.getElementById('timer-display').innerText = '00:00';
  alert('Preparação concluída! Bom treino.');
}

// --- VÍDEOS DE LANCES ---
function submitVideo(e) {
  e.preventDefault();
  const title = document.getElementById('video-title').value;
  const url = document.getElementById('video-url').value;

  if (!currentUser.videos) currentUser.videos = [];
  currentUser.videos.push({ title, url });

  localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
  saveToRegisteredUsers(currentUser);

  renderUserVideos();
  e.target.reset();
  alert('Lance salvo com sucesso!');
}

function renderUserVideos() {
  const gallery = document.getElementById('user-video-gallery');
  if (!gallery) return;

  const vids = (currentUser && currentUser.videos) ? currentUser.videos : [];
  if (vids.length === 0) {
    gallery.innerHTML = `<p class="text-xs text-slate-500 col-span-3">Nenhum vídeo salvo.</p>`;
    return;
  }

  gallery.innerHTML = vids.map(v => `
    <div class="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
      <p class="font-semibold text-white text-xs truncate mr-2">${v.title}</p>
      <a href="${v.url}" target="_blank" class="bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 px-3 py-1 rounded-lg text-xs font-bold">Assistir</a>
    </div>
  `).join('');
}

// --- PAINEL ADMIN (MIGUEL PRIME) ---
function renderAdminUsers() {
  const list = document.getElementById('admin-user-list');
  if (!list) return;

  if (document.getElementById('admin-athlete-count')) {
    document.getElementById('admin-athlete-count').innerText = registeredUsers.length;
  }

  list.innerHTML = registeredUsers.map((u, idx) => `
    <tr class="hover:bg-slate-950/50 transition">
      <td class="p-3 font-semibold text-white">${u.name}</td>
      <td class="p-3">${u.email}</td>
      <td class="p-3">${u.age} anos</td>
      <td class="p-3">${u.height} / ${u.weight}</td>
      <td class="p-3 uppercase">${u.trainingLocation || 'Casa'}</td>
      <td class="p-3 text-emerald-400 font-medium">${u.diagnosis ? u.diagnosis.position : 'Pendente'}</td>
      <td class="p-3 flex items-center gap-2">
        <button onclick="toggleScoutPDF(${idx})" class="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded hover:bg-amber-500/30">
          ${u.scoutUnlocked ? '🔓 Scout Liberado' : '🔒 Liberar Scout'}
        </button>
        <button onclick="deleteUser(${idx})" class="text-xs bg-red-950 text-red-400 border border-red-800/50 px-2 py-1 rounded hover:bg-red-900">
          Excluir
        </button>
      </td>
    </tr>
  `).join('');
}

function toggleScoutPDF(index) {
  registeredUsers[index].scoutUnlocked = !registeredUsers[index].scoutUnlocked;
  localStorage.setItem('fe_registered_users', JSON.stringify(registeredUsers));
  renderAdminUsers();
  alert(`Status do PDF de Scout alterado para ${registeredUsers[index].name}!`);
}

function deleteUser(index) {
  if (confirm("Tem certeza que deseja excluir este atleta?")) {
    registeredUsers.splice(index, 1);
    localStorage.setItem('fe_registered_users', JSON.stringify(registeredUsers));
    renderAdminUsers();
  }
}

function saveAdminAnnouncement() {
  const msg = document.getElementById('admin-announcement-input').value;
  if (msg && document.getElementById('admin-custom-announcement')) {
    document.getElementById('admin-custom-announcement').innerText = msg;
    document.getElementById('admin-custom-announcement').classList.remove('hidden');
    alert('Aviso publicado no mural de todos os atletas!');
  }
}

// --- GRÁFICOS (CHART.JS) ---
function initCharts(attributeData = [0,0,0,0,0,0], progressData = [0,0,0,0]) {
  const radarEl = document.getElementById('attributesChart');
  if (radarEl) {
    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(radarEl.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Passe', 'Defesa', 'Chute', 'Físico', 'Velocidade', 'Visão'],
        datasets: [{
          label: 'Atributos Táticos',
          data: attributeData,
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            angleLines: { color: '#334155' },
            grid: { color: '#334155' },
            pointLabels: { color: '#94a3b8', font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  const lineEl = document.getElementById('progressChart');
  if (lineEl) {
    if (lineChartInstance) lineChartInstance.destroy();
    lineChartInstance = new Chart(lineEl.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4'],
        datasets: [{
          label: 'Progresso (%)',
          data: progressData,
          borderColor: '#10b981',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          y: { min: 0, max: 100, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
}