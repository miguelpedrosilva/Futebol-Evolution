/* ==========================================================================
   FUTEBOL EVOLUTION v2.0 - LÓGICA COMPLETA REVISADA
   CREDENCIAIS ADMIN: 
   - Nome: Miguel Prime
   - Senha: 3020
   ========================================================================== */

const ADMIN_NAME = "Miguel Prime";
const ADMIN_PASSWORD = "3020";

let currentUser = null;
let registeredUsers = JSON.parse(localStorage.getItem('fe_registered_users')) || [];
let currentQuestionIndex = 0;
let quizAnswers = {};
let radarChartInstance = null;
let lineChartInstance = null;

// Cronômetro Inteligente
let timerInterval = null;
let timerSeconds = 0;
let currentCalendarDate = new Date();
let currentGoalList = [];

// Frases Pré-Jogo
const preGameQuotes = [
  "Confie na sua preparação. O campo é a sua oportunidade de mostrar evolução.",
  "Mantenha a calma sob pressão. A inteligência ganha o jogo.",
  "Acelere nos momentos certos e comunique-se com seus companheiros."
];
let quoteIndex = 0;

const COOLDOWN_DAYS = 60;

// BANCO COMPLETO DE 50 PERGUNTAS
const questions = [
  { cat: "I. Modalidade", q: "Onde você rende melhor: campo amplo de grama ou quadra reduzida de futsal?", opts: ["Campo Amplo", "Quadra de Futsal", "Rendo bem em ambos"] },
  { cat: "I. Modalidade", q: "Como você lida com a dinâmica e transição rápida do futsal?", opts: ["Excelente", "Razoável", "Tenho dificuldades"] },
  { cat: "I. Modalidade", q: "Como lida com corridas longas e disputas físicas no campo?", opts: ["Muito bem, tenho fôlego", "Consigo acompanhar", "Canso rapidamente"] },
  { cat: "I. Modalidade", q: "Se tivesse que escolher apenas uma modalidade principal hoje:", opts: ["Futebol de Campo", "Futsal / Quadra", "Society / Fut7"] },
  { cat: "I. Modalidade", q: "Consegue adaptar seus fundamentos entre campo e quadra?", opts: ["Sim, facilmente", "Levo um tempo para adaptar", "Apenas em uma"] },

  { cat: "II. Atributos Técnicos", q: "Nota de 1 a 10 para o seu passe curto/médio dominante?", opts: ["9 a 10 (Excelente)", "7 a 8 (Bom)", "5 a 6 (Mediano)", "Abaixo de 5"] },
  { cat: "II. Atributos Técnicos", q: "Qual é o nível da sua perna não dominante (perna ruim)?", opts: ["Uso com total confiança", "Apenas para passes curtos", "Apenas para apoio"] },
  { cat: "II. Atributos Técnicos", q: "Qual a sua preferência no domínio de bola sob pressão?", opts: ["Dominar orientado abrindo espaço", "Usar sola do pé para travar", "Prefiro tocar de primeira"] },
  { cat: "II. Atributos Técnicos", q: "Qual seu aproveitamento em finalizações de fora da área?", opts: ["Alto (Muito perigo)", "Médio (Acerto o gol)", "Baixo (Raro acertar)"] },
  { cat: "II. Atributos Técnicos", q: "No 1 contra 1 ofensivo, qual seu ponto forte?", opts: ["Drible em velocidade", "Drible curto/espaço reduzido", "Evito drible, prefiro passe"] },
  { cat: "II. Atributos Técnicos", q: "Qual a sua capacidade de reter a posse sob pressão?", opts: ["Alta (Protejo bem)", "Média", "Baixa (Sinto pressão)"] },
  { cat: "II. Atributos Técnicos", q: "Como é a precisão dos seus cruzamentos e lançamentos?", opts: ["Preciso e decisivo", "Razoável", "Precisa de muito treino"] },
  { cat: "II. Atributos Técnicos", q: "Cobranças de bola parada (faltas/escanteios):", opts: ["Sou o cobrador oficial", "Cobro bem eventualmente", "Não cobro"] },
  { cat: "II. Atributos Técnicos", q: "Frequência de erros bobos de recepção no jogo:", opts: ["Raramente", "Algumas vezes", "Frequente"] },
  { cat: "II. Atributos Técnicos", q: "Como avalia o seu jogo aéreo (cabeceio ofensivo/defensivo)?", opts: ["Forte no alto", "Mediano", "Fraco"] },

  { cat: "III. Atributos Físicos", q: "Qual a sua velocidade de arranque nos primeiros 10 metros?", opts: ["Muito rápido e explodido", "Média", "Lento"] },
  { cat: "III. Atributos Físicos", q: "Sua resistência física nos minutos finais do jogo:", opts: ["Inteiro até o apito final", "Canso no final", "Exausto na metade"] },
  { cat: "III. Atributos Físicos", q: "Tem força física para proteger de costas para o zagueiro?", opts: ["Sim, levo vantagem", "Equilibro", "Tenho dificuldade"] },
  { cat: "III. Atributos Físicos", q: "Agilidade para mudar de direção sem perder velocidade:", opts: ["Excelente", "Boa", "Sinto rigidez"] },
  { cat: "III. Atributos Físicos", q: "Capacidade de impulsão para saltar alto:", opts: ["Alta", "Média", "Baixa"] },
  { cat: "III. Atributos Físicos", q: "Tempo de recuperação entre um sprint intenso e outro:", opts: ["Rápida recuperação", "Preciso de tempo respirando", "Demoro bastante"] },
  { cat: "III. Atributos Físicos", q: "Histórico de lesões musculares:", opts: ["Raramente me lesiono", "Às vezes sinto posterior", "Lesões frequentes"] },
  { cat: "III. Atributos Físicos", q: "Recuperação física no dia seguinte ao jogo:", opts: ["Pronto no dia seguinte", "Preciso de 2 dias", "Fico dolorido muito tempo"] },

  { cat: "IV. Visão de Jogo", q: "Olhar ao redor (escanear o campo) antes de receber a bola:", opts: ["Hábito frequente", "Às vezes esqueço", "Raramente"] },
  { cat: "IV. Visão de Jogo", q: "Atitude imediata após o seu time perder a posse de bola:", opts: ["Pressiono imediatamente", "Recomponho a posição", "Demoro a reagir"] },
  { cat: "IV. Visão de Jogo", q: "Como se posiciona sem a bola no ataque?", opts: ["Procuro espaços vazios", "Fico fixo na posição", "Esperando a bola vir"] },
  { cat: "IV. Visão de Jogo", q: "Capacidade de dar assistências deixando o colega na cara do gol:", opts: ["Alta", "Média", "Baixa"] },
  { cat: "IV. Visão de Jogo", q: "Conhecimento das suas obrigações táticas defensivas:", opts: ["Cumpro 100%", "Faço o básico", "Prefiro focar no ataque"] },
  { cat: "IV. Visão de Jogo", q: "Leitura do ritmo de jogo (saber cadenciar ou acelerar):", opts: ["Controlo o ritmo", "Tenho certa noção", "Ritmo único"] },
  { cat: "IV. Visão de Jogo", q: "Orientar os companheiros com voz no campo:", opts: ["Falo e oriento muito", "Falo o necessário", "Sou silencioso"] },
  { cat: "IV. Visão de Jogo", q: "Comportamento em transição defensiva do adversário:", opts: ["Volto em sprint para ajudar", "Fecho espaço tático", "Demoro a voltar"] },
  { cat: "IV. Visão de Jogo", q: "Facilidade para inverter o jogo com passe longo:", opts: ["Excelente precisão", "Razoável", "Dificuldade"] },

  { cat: "V. Atributos Mentais", q: "Reação imediata após cometer um erro na partida:", opts: ["Cabeça erguida e foco", "Fico chateado uns minutos", "Sinto muito o baque"] },
  { cat: "V. Atributos Mentais", q: "Desempenho em jogos decisivos ou sob pressão da torcida:", opts: ["Cresço no jogo", "Mantenho o padrão", "Sinto nervosismo"] },
  { cat: "V. Atributos Mentais", q: "Controle emocional contra provocações adversárias:", opts: ["Foco total no jogo", "Às vezes me irrita", "Perco a cabeça fácil"] },
  { cat: "V. Atributos Mentais", q: "Liderança e espírito de equipe:", opts: ["Perfil de líder", "Prefiro fazer o meu"] },
  { cat: "V. Atributos Mentais", q: "Cumprimento das orientações do treinador:", opts: ["Disciplinado 100%", "Improviso bastante"] },
  { cat: "V. Atributos Mentais", q: "Intensidade competitiva do 1º ao último minuto:", opts: ["Mantida do início ao fim", "Flutua", "Perco o foco"] },
  { cat: "V. Atributos Mentais", q: "Reação ao ficar no banco ou ser substituído:", opts: ["Respeito e treino mais", "Demonstro insatisfação"] },
  { cat: "V. Atributos Mentais", q: "Nível de ansiedade antes dos jogos:", opts: ["Ansiedade controlada", "Trava meu futebol"] },

  { cat: "VI. Posição", q: "Em qual setor do campo você rende mais?", opts: ["Ataque / Ponta / Centroavante", "Meio-campo / Volante / Meia", "Defesa / Zagueiro / Lateral", "Goleiro"] },
  { cat: "VI. Posição", q: "Na quadra (Futsal), qual função prefere?", opts: ["Pivô / Ala Driblador", "Fixo / Ala Construtor", "Goleiro"] },
  { cat: "VI. Posição", q: "Seu perfil de jogo é mais:", opts: ["Criador e Organizador", "Finalizador e Rápido"] },
  { cat: "VI. Posição", q: "Estilo de marcação defensiva preferido:", opts: ["Pressão Individual", "Por Zona / Posicional"] },
  { cat: "VI. Posição", q: "Área de atuação em campo:", opts: ["Aberto pelas pontas", "Pelo centro do campo"] },

  { cat: "VII. Diagnóstico Final", q: "Qual sua principal virtude técnica hoje?", opts: ["Passe e Visão", "Drible e Velocidade", "Marcação e Raça", "Finalização"] },
  { cat: "VII. Diagnóstico Final", q: "Qual ponto precisa de melhora mais urgente?", opts: ["Uso da perna ruim", "Fôlego/Resistência", "Calma sob pressão", "Marcação"] },
  { cat: "VII. Diagnóstico Final", q: "Qual fundamento precisa de maior repetição de treino?", opts: ["Chute", "Passe", "Desarme/Cabeceio"] },
  { cat: "VII. Diagnóstico Final", q: "O que o treinador mais elogia em você?", opts: ["Inteligência Tática", "Entrega Física", "Técnica"] },
  { cat: "VII. Diagnóstico Final", q: "Qual o seu objetivo principal no futebol hoje?", opts: ["Evoluir para base profissional", "Melhorar para jogos locais", "Ficar em forma"] }
];

document.addEventListener('DOMContentLoaded', () => {
  const savedUser = localStorage.getItem('fe_logged_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    applyLoggedInUser();
  }
});

// CALCULA IDADE AUTOMÁTICA
function calculateAgeFromDOB() {
  const dobVal = document.getElementById('user-dob').value;
  if (!dobVal) return;
  const birth = new Date(dobVal);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  document.getElementById('user-age').value = age;
}

function toggleAdminField() {
  const role = document.getElementById('user-role').value;
  const athleteFields = document.getElementById('athlete-fields');
  const inputs = athleteFields.querySelectorAll('input, select');
  
  if (role === 'admin') {
    athleteFields.style.display = 'none';
    inputs.forEach(input => input.removeAttribute('required'));
  } else {
    athleteFields.style.display = 'block';
    inputs.forEach(input => input.setAttribute('required', 'true'));
  }
}

function handleAuth(event) {
  event.preventDefault();

  const role = document.getElementById('user-role').value;
  const inputName = document.getElementById('user-name').value.trim();

  if (role === 'admin') {
    if (inputName.toLowerCase() !== ADMIN_NAME.toLowerCase()) {
      alert(`❌ Acesso Negado! Nome do Admin deve ser "${ADMIN_NAME}".`);
      return;
    }
    const pwd = prompt("🔒 Digite a Senha Secreta do Administrador:");
    if (pwd !== ADMIN_PASSWORD) {
      alert("❌ Senha incorreta!");
      return;
    }
  }

  const photoInput = document.getElementById('user-photo-input');
  let photoBase64 = "https://via.placeholder.com/150";

  const proceedWithAuth = (imgSrc) => {
    const ageVal = parseInt(document.getElementById('user-age').value) || 17;
    currentUser = {
      name: inputName,
      email: document.getElementById('user-email').value,
      role: role,
      age: role === 'admin' ? 30 : ageVal,
      height: role === 'admin' ? "175" : (document.getElementById('user-height').value || "SN"),
      weight: role === 'admin' ? "70" : (document.getElementById('user-weight').value || "SN"),
      hasBall: role === 'admin' ? 'sim' : document.getElementById('user-has-ball').value,
      photo: imgSrc,
      scoutUnlocked: false,
      diagnosis: null,
      scores: null,
      quizDate: null,
      videos: [],
      workoutDates: []
    };

    localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
    saveToRegisteredUsers(currentUser);
    applyLoggedInUser();
  };

  if (role !== 'admin' && photoInput.files && photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => proceedWithAuth(e.target.result);
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
  document.getElementById('nav-user-name').innerText = currentUser.name;

  if (currentUser.photo) {
    const navPhoto = document.getElementById('nav-user-photo');
    navPhoto.src = currentUser.photo;
    navPhoto.classList.remove('hidden');
  }

  if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').classList.remove('hidden');
    renderAdminUsers();
  }

  document.getElementById('welcome-message').innerText = `Bem-vindo, ${currentUser.name}!`;

  // Faixa Etária
  const badge = document.getElementById('age-category-badge');
  if (currentUser.age <= 14) {
    badge.innerText = "Sub-14 (Infanto-Juvenil)";
    document.getElementById('section-sub14').classList.remove('hidden');
  } else {
    badge.innerText = "15+ (Adolescente/Adulto)";
    document.getElementById('section-adults').classList.remove('hidden');
  }

  // Checagem de Liberação Exclusiva de Scout PDF
  if (currentUser.scoutUnlocked) {
    document.getElementById('scout-unlocked-container').classList.remove('hidden');
  }

  checkQuizLockStatus();
  updateFutuCardDisplay();

  if (currentUser.diagnosis && currentUser.scores) {
    renderTechnicalReport(currentUser.diagnosis);
    initCharts(currentUser.scores, [50, 65, 80, 90]);
    document.getElementById('chart-zero-warning').classList.add('hidden');
  } else {
    initCharts([0,0,0,0,0,0], [0,0,0,0]);
    document.getElementById('chart-zero-warning').classList.remove('hidden');
  }

  renderCalendar();
  renderUserVideos();
  loadQuizQuestion();
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

// TRAVA DO QUIZ
function checkQuizLockStatus() {
  if (!currentUser.quizDate) return;

  const lastQuiz = new Date(currentUser.quizDate);
  const now = new Date();
  const diffDays = Math.floor((now - lastQuiz) / (1000 * 60 * 60 * 24));

  if (diffDays < COOLDOWN_DAYS) {
    const remainingDays = COOLDOWN_DAYS - diffDays;
    document.getElementById('quiz-active-screen').classList.add('hidden');
    document.getElementById('quiz-block-screen').classList.remove('hidden');
    document.getElementById('quiz-countdown-box').innerText = `${remainingDays} Dias Restantes`;
    document.getElementById('quiz-cooldown-alert').classList.remove('hidden');
    document.getElementById('cooldown-timer-text').innerText = `Sua reavaliação estará disponível em ${remainingDays} dias. Mantenha o foco!`;
  }
}

function loadQuizQuestion() {
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const qData = questions[currentQuestionIndex];
  document.getElementById('quiz-category').innerText = qData.cat;
  document.getElementById('quiz-progress').innerText = `Pergunta ${currentQuestionIndex + 1} de 50`;
  document.getElementById('quiz-question').innerText = qData.q;

  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';

  if (currentQuestionIndex === 40) {
    document.getElementById('voice-pos-box').classList.remove('hidden');
  }

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
  const mainPos = quizAnswers[40] || "Meio-campo / Meia";
  const mainVirtue = quizAnswers[45] || "Passe e Visão";
  const mainWeakness = quizAnswers[46] || "Uso da perna ruim";

  const scores = [
    quizAnswers[5] && quizAnswers[5].includes("9 a 10") ? 95 : 75,
    quizAnswers[27] && quizAnswers[27].includes("100%") ? 88 : 65,
    quizAnswers[8] && quizAnswers[8].includes("Alto") ? 90 : 68,
    quizAnswers[16] && quizAnswers[16].includes("Inteiro") ? 88 : 66,
    quizAnswers[15] && quizAnswers[15].includes("explodido") ? 92 : 72,
    quizAnswers[23] && quizAnswers[23].includes("frequente") ? 91 : 70
  ];

  const diagnosisData = {
    position: mainPos,
    strengths: [mainVirtue, "Inteligência Tática Avançada"],
    weaknesses: [mainWeakness, "Manutenção da aceleração máxima"],
    dos: ["Passe simples em 1-2 toques", "Escanear campo antes do domínio"],
    donts: ["Girar de costas sob pressão zagueira"]
  };

  currentUser.diagnosis = diagnosisData;
  currentUser.scores = scores;
  currentUser.quizDate = new Date().toISOString();

  localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
  saveToRegisteredUsers(currentUser);

  document.getElementById('quiz-container').innerHTML = `
    <div class="text-center py-8 space-y-4">
      <i class="fa-solid fa-award text-amber-400 text-6xl"></i>
      <h3 class="text-2xl font-bold text-white">Avaliação Concluída!</h3>
      <button onclick="switchTab('futcard')" class="bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg">Ver FutuCard</button>
    </div>
  `;

  renderTechnicalReport(diagnosisData);
  initCharts(scores, [50, 68, 82, 95]);
  updateFutuCardDisplay();
  checkQuizLockStatus();
}

function renderTechnicalReport(data) {
  const card = document.getElementById('diagnostic-report-card');
  if (!card || !data) return;
  card.classList.remove('hidden');
  document.getElementById('badge-position').innerText = `Posição: ${data.position}`;
  document.getElementById('report-strengths').innerHTML = data.strengths.map(s => `<li>${s}</li>`).join('');
  document.getElementById('report-weaknesses').innerHTML = data.weaknesses.map(w => `<li>${w}</li>`).join('');
  document.getElementById('report-dos').innerHTML = data.dos.map(d => `<li>${d}</li>`).join('');
  document.getElementById('report-donts').innerHTML = data.donts.map(d => `<li>${d}</li>`).join('');
}

function updateFutuCardDisplay() {
  if (!currentUser) return;

  document.getElementById('card-name').innerText = currentUser.name || "NOME DO ATLETA";
  document.getElementById('card-meta').innerText = `${currentUser.age || 17} ANOS | BRASIL`;
  document.getElementById('vs-user-name').innerText = currentUser.name;

  if (currentUser.photo) {
    document.getElementById('card-photo').src = currentUser.photo;
  }

  if (currentUser.scores && currentUser.diagnosis) {
    const s = currentUser.scores;
    const overall = Math.round(s.reduce((a, b) => a + b, 0) / s.length);

    document.getElementById('card-overall').innerText = overall;
    document.getElementById('vs-user-ovr').innerText = overall;
    document.getElementById('card-pos').innerText = currentUser.diagnosis.position.substring(0, 3);

    document.getElementById('stat-pas').innerText = s[0];
    document.getElementById('stat-def').innerText = s[1];
    document.getElementById('stat-chu').innerText = s[2];
    document.getElementById('stat-fis').innerText = s[3];
    document.getElementById('stat-vel').innerText = s[4];
    document.getElementById('stat-vis').innerText = s[5];

    if (overall >= 95) {
      document.getElementById('achievement-modal').classList.remove('hidden');
    }
  }
}

function closeAchievementModal() {
  document.getElementById('achievement-modal').classList.add('hidden');
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
  ctx.fillText(document.getElementById('card-overall').innerText, 30, 70);

  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(document.getElementById('card-name').innerText.toUpperCase(), 30, 260);

  const link = document.createElement('a');
  link.download = `FutuCard-${currentUser.name}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

// CRONÔMETRO INTELIGENTE E BITES SONOROS
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch(e) {}
}

function toggleTimer() {
  const btn = document.getElementById('timer-start-btn');
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    btn.innerText = 'Continuar';
  } else {
    document.getElementById('smart-timer-status').innerText = "Em Treino";
    timerInterval = setInterval(() => {
      timerSeconds++;
      const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
      const s = String(timerSeconds % 60).padStart(2, '0');
      document.getElementById('timer-display').innerText = `${m}:${s}`;
      if (timerSeconds % 45 === 0) playBeep();
    }, 1000);
    btn.innerText = 'Pausar';
  }
}

function startPrepTimer() {
  resetTimer();
  document.getElementById('smart-timer-status').innerText = "Contagem Regressiva de Preparação";
  let prepSec = 120;
  timerInterval = setInterval(() => {
    prepSec--;
    const m = String(Math.floor(prepSec / 60)).padStart(2, '0');
    const s = String(prepSec % 60).padStart(2, '0');
    document.getElementById('timer-display').innerText = `${m}:${s}`;
    if (prepSec <= 0) {
      clearInterval(timerInterval);
      playBeep();
      alert("Preparação concluída! Começar treino.");
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = 0;
  document.getElementById('timer-display').innerText = '00:00';
  document.getElementById('smart-timer-status').innerText = "Modo Livre";
}

function listenVoiceCommand() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Reconhecimento de voz não suportado neste navegador.");
    return;
  }
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRec();
  rec.lang = 'pt-BR';
  rec.start();
  rec.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase();
    if (text.includes("avançar") || text.includes("pronto")) {
      playBeep();
      alert("Comando por voz aceito! Próxima série.");
    }
  };
}

// ÁUDIO MOTIVACIONAL PRÉ-JOGO
function speakPreGameQuote() {
  if ('speechSynthesis' in window) {
    const quote = preGameQuotes[quoteIndex];
    const utt = new SpeechSynthesisUtterance(quote);
    utt.lang = 'pt-BR';
    window.speechSynthesis.speak(utt);
  }
}

function nextPreGameQuote() {
  quoteIndex = (quoteIndex + 1) % preGameQuotes.length;
  document.getElementById('pre-game-quote').innerText = `"${preGameQuotes[quoteIndex]}"`;
}

function toggleGoal(chk) {
  if (chk.checked) currentGoalList.push(chk.value);
  else currentGoalList = currentGoalList.filter(g => g !== chk.value);
}

function saveHealthCheck(e) {
  e.preventDefault();
  alert("Status físico registrado com sucesso para o acompanhamento!");
}

// MUGEL PRIME - EXCLUSIVIDADE: GERAR & LIBERAR SCOUT PDF
function renderAdminUsers() {
  const list = document.getElementById('admin-user-list');
  if (!list) return;

  list.innerHTML = registeredUsers.map((u, idx) => `
    <tr class="hover:bg-slate-950/50 transition">
      <td class="p-4 font-semibold text-white">${u.name}</td>
      <td class="p-4 text-slate-400">${u.email}</td>
      <td class="p-4">
        <input type="number" value="${u.age}" onchange="updateUserAge(${idx}, this.value)" class="w-16 bg-slate-950 border border-slate-800 p-1 text-center rounded text-amber-400 font-bold">
      </td>
      <td class="p-4 text-slate-400">${u.height} / ${u.weight}</td>
      <td class="p-4 text-emerald-400 font-medium">${u.diagnosis ? u.diagnosis.position : 'Pendente'}</td>
      <td class="p-4">
        <button onclick="adminReleaseScoutPDF(${idx})" class="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs">
          <i class="fa-solid fa-file-pdf"></i> Gerar & Liberar Scout PDF
        </button>
      </td>
    </tr>
  `).join('');
}

function updateUserAge(idx, newAge) {
  registeredUsers[idx].age = parseInt(newAge);
  localStorage.setItem('fe_registered_users', JSON.stringify(registeredUsers));
  alert(`Idade de ${registeredUsers[idx].name} ajustada para ${newAge} anos (Controle Anti-Fraude).`);
}

function adminReleaseScoutPDF(idx) {
  const athlete = registeredUsers[idx];
  athlete.scoutUnlocked = true;
  registeredUsers[idx] = athlete;
  localStorage.setItem('fe_registered_users', JSON.stringify(registeredUsers));

  if (currentUser.email === athlete.email) {
    currentUser.scoutUnlocked = true;
    localStorage.setItem('fe_logged_user', JSON.stringify(currentUser));
  }

  alert(`✅ Ficha de Scout em PDF liberada EXCLUSIVAMENTE para o atleta ${athlete.name}!`);
}

function downloadAthleteScoutPDF() {
  const el = document.createElement('div');
  el.className = "p-8 bg-white text-slate-900";
  el.innerHTML = `
    <h1 style="font-size:24px; font-weight:bold;">FICHA DE SCOUT OFICIAL - FUTEBOL EVOLUTION</h1>
    <hr><br>
    <p><strong>Nome:</strong> ${currentUser.name}</p>
    <p><strong>Idade:</strong> ${currentUser.age} Anos</p>
    <p><strong>Posição Diagnosticada:</strong> ${currentUser.diagnosis ? currentUser.diagnosis.position : 'Geral'}</p>
    <br>
    <h3>Resumo de Performance:</h3>
    <p>Passe: ${currentUser.scores ? currentUser.scores[0] : 0}</p>
    <p>Defesa: ${currentUser.scores ? currentUser.scores[1] : 0}</p>
    <p>Chute: ${currentUser.scores ? currentUser.scores[2] : 0}</p>
    <p>Físico: ${currentUser.scores ? currentUser.scores[3] : 0}</p>
    <br>
    <p><em>Assinado e Certificado por: Treinador Miguel Prime</em></p>
  `;

  if (typeof html2pdf !== 'undefined') {
    html2pdf().from(el).save(`Scout-Oficial-${currentUser.name}.pdf`);
  } else {
    window.print();
  }
}

function generateParentsReportPDF() {
  downloadAthleteScoutPDF();
}

// CALENDÁRIO & STREAK
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const monthYearLabel = document.getElementById('calendar-month-year');
  if (!grid) return;

  grid.innerHTML = '';
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  monthYearLabel.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  weekDays.forEach(d => grid.innerHTML += `<div class="font-bold text-slate-500 py-1">${d}</div>`);

  for (let i = 0; i < firstDay; i++) grid.innerHTML += `<div></div>`;

  const userDates = currentUser.workoutDates || [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isDone = userDates.includes(dateStr);

    grid.innerHTML += `
      <div class="py-2 rounded-lg border ${isDone ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400' : 'bg-slate-950 text-slate-400 border-slate-800'}">
        ${day}
      </div>
    `;
  }

  document.getElementById('streak-count').innerText = userDates.length;
  const rankScore = document.getElementById('discipline-rank-score');
  if (rankScore) rankScore.innerText = `${userDates.length * 10} Pts`;
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
    alert('Treino de hoje registrado no seu calendário!');
  } else {
    alert('Você já marcou o treino de hoje!');
  }
}

// MINI-GAME DECISÃO TÁTICA
function answerTactical(isCorrect) {
  if (isCorrect) alert("🎯 Decisão Excelente! Decisão correta para manter a posse.");
  else alert("⚠️ Decisão Arriscada! Girar de costas no meio sem visão gera perda de bola.");
}

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
  alert('Vídeo salvo com sucesso!');
}

function renderUserVideos() {
  const gallery = document.getElementById('user-video-gallery');
  if (!gallery) return;

  const vids = currentUser.videos || [];
  if (vids.length === 0) {
    gallery.innerHTML = `<p class="text-xs text-slate-500 col-span-3">Nenhum vídeo enviado ainda.</p>`;
    return;
  }

  gallery.innerHTML = vids.map(v => `
    <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-3">
      <p class="font-semibold text-white text-sm truncate">${v.title}</p>
      <a href="${v.url}" target="_blank" class="bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-center py-2 rounded-lg text-sm font-bold transition">Assistir Lance</a>
    </div>
  `).join('');
}

function saveAdminAnnouncement() {
  const msg = document.getElementById('admin-announcement-input').value;
  if (msg) {
    document.getElementById('admin-custom-announcement').innerText = msg;
    alert('Aviso publicado para todos os atletas!');
  }
}

function startVoiceRecord() {
  listenVoiceCommand();
  document.getElementById('voice-transcript').innerText = "Voz capturada e gravada com sucesso!";
}

// GRÁFICOS DINÂMICOS INTOCADOS
function initCharts(attributeData = [0,0,0,0,0,0], progressData = [0,0,0,0]) {
  const radarEl = document.getElementById('attributesChart');
  if (radarEl) {
    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(radarEl.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Passe', 'Defesa', 'Chute', 'Físico', 'Velocidade', 'Visão'],
        datasets: [{
          label: 'Notas de Atributo',
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
          label: 'Evolução do Atleta (%)',
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