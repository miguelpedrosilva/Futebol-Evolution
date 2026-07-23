/* ==========================================================================
   FUTEBOL EVOLUTION - LÓGICA E INTERATIVIDADE (JS)
   ========================================================================== */

let currentUser = null;
let registeredUsers = [];
let submittedVideos = [];
let currentQuestionIndex = 0;
let quizAnswers = {};

// --- ESTRUTURA COMPLETA DAS 50 PERGUNTAS DIVIDIDAS EM 7 BLOCOS ---
const questions = [
  // I. Modalidade e Adaptação
  { cat: "I. Modalidade", q: "Onde você rende melhor: campo amplo de grama ou quadra reduzida de futsal?", opts: ["Campo Amplo", "Quadra de Futsal", "Rendo bem em ambos"] },
  { cat: "I. Modalidade", q: "Como você lida com a dinâmica e transição rápida do futsal?", opts: ["Excelente", "Razoável", "Tenho dificuldades"] },
  { cat: "I. Modalidade", q: "Como lida com a exigência de corridas longas e disputas do campo?", opts: ["Muito bem, tenho fôlego", "Consigo acompanhar", "Canso rapidamente"] },
  { cat: "I. Modalidade", q: "Se tivesse que escolher apenas uma modalidade hoje, qual seria?", opts: ["Futebol de Campo", "Futsal / Quadra", "Society / Fut7"] },
  { cat: "I. Modalidade", q: "Consegue adaptar fácil seus fundamentos (chute, passe, recepção) entre campo e quadra?", opts: ["Sim, facilmente", "Levo um tempo para adaptar", "Não, meu estilo é exclusivo de uma"] },

  // II. Atributos Técnicos
  { cat: "II. Atributos Técnicos", q: "Nota de 1 a 10 para o passe curto/médio com o pé dominante?", opts: ["9 a 10 (Excelente)", "7 a 8 (Bom)", "5 a 6 (Mediano)", "Abaixo de 5"] },
  { cat: "II. Atributos Técnicos", q: "Qual é o nível de eficiência do seu pé não dominante (perna cega)?", opts: ["Uso com confiança", "Uso apenas para passes curtos", "Apenas para apoio"] },
  { cat: "II. Atributos Técnicos", q: "Usa a sola do pé para dominar (futsal) ou prefere a chapa/peito do pé (campo)?", opts: ["Prefiro usar a sola", "Prefiro chapa/peito do pé", "Uso ambas sem problemas"] },
  { cat: "II. Atributos Técnicos", q: "Qual o seu aproveitamento em chutes de fora da área?", opts: ["Alto (Trago muito perigo)", "Médio (Acerto o gol com frequência)", "Baixo (Raro acertar)"] },
  { cat: "II. Atributos Técnicos", q: "No 1 contra 1 ofensivo, prefere drible em velocidade ou recurso técnico curto?", opts: ["Drible em velocidade", "Recurso curto/curto espaço", "Evito o 1v1 e prefiro tocar"] },
  { cat: "II. Atributos Técnicos", q: "Qual a sua capacidade de reter a posse de bola sob pressão?", opts: ["Alta (Protejo e saio jogando)", "Média", "Baixa (Sinto pressão e perco a bola)"] },
  { cat: "II. Atributos Técnicos", q: "Como é a qualidade do seu cruzamento (campo) ou passe para o pivô (quadra)?", opts: ["Preciso e decisivo", "Razoável", "Precisa de muito treino"] },
  { cat: "II. Atributos Técnicos", q: "Qual sua precisão em bolas paradas (faltas, escanteios, tiro livre)?", opts: ["Sou o cobrador oficial", "Cobro bem eventualmente", "Não costumo cobrar"] },
  { cat: "II. Atributos Técnicos", q: "Com que frequência comete erros bobos de passe ou recepção no jogo?", opts: ["Raramente", "Algumas vezes por jogo", "Frequente"] },
  { cat: "II. Atributos Técnicos", q: "Como avalia o seu jogo aéreo (cabeceio ofensivo e defensivo)?", opts: ["Forte no jogo aéreo", "Mediano", "Fraco no alto"] },

  // III. Atributos Físicos
  { cat: "III. Atributos Físicos", q: "Como é sua velocidade de arranque nos primeiros 5 a 10 metros?", opts: ["Muito explodido/rápido", "Média", "Lento"] },
  { cat: "III. Atributos Físicos", q: "Como está sua resistência aeróbica nos minutos finais do jogo?", opts: ["Inteiro até o fim", "Canso no final", "Exausto na metade do jogo"] },
  { cat: "III. Atributos Físicos", q: "Tem força física para proteger a bola de costas para o marcador?", opts: ["Sim, levo vantagem física", "Consigo equilibrar", "Tenho dificuldades"] },
  { cat: "III. Atributos Físicos", q: "Qual sua agilidade para mudar de direção sem perder o equilíbrio?", opts: ["Excelente agilidade", "Boa", "Sinto rigidez/dificuldade"] },
  { cat: "III. Atributos Físicos", q: "Como é a sua capacidade de impulsão?", opts: ["Pulo alto", "Média", "Baixa"] },
  { cat: "III. Atributos Físicos", q: "Consegue se recuperar rápido entre um sprint (tiro) e outro?", opts: ["Sim, rápida recuperação", "Preciso de um tempo respirando", "Demoro bastante"] },
  { cat: "III. Atributos Físicos", q: "Sofre com lesões musculares frequentes? Em quais locais?", opts: ["Raramente me lesiono", "Coxa/Posterior", "Panturrilha/Tornozelo"] },
  { cat: "III. Atributos Físicos", q: "Como é sua recuperação física entre jogos durante a semana?", opts: ["Rápida (Estou pronto no dia seguinte)", "Preciso de 2 a 3 dias", "Fico dolorido por muito tempo"] },

  // IV. Atributos Táticos e Visão de Jogo
  { cat: "IV. Atributos Táticos", q: "Olhar ao redor para escanear o campo antes de receber a bola é um hábito?", opts: ["Sim, faço sempre", "Às vezes esqueço", "Raramente escanemanento"] },
  { cat: "IV. Atributos Táticos", q: "Qual sua atitude imediata quando o time perde a bola?", opts: ["Pressiono imediatamente (Perde e Pressiona)", "Recomponho minha posição defensiva", "Demoro para reage"] },
  { cat: "IV. Atributos Táticos", q: "Prefere jogar de frente para o gol ou de costas para a zaga?", opts: ["De frente para o gol", "De costas (Como pivô)", "Indiferente"] },
  { cat: "IV. Atributos Táticos", q: "Sabe identificar e ocupar espaços vazios sem a bola?", opts: ["Sim, me movimento constantemente", "Às vezes fico estático", "Tenho dificuldade de leitura"] },
  { cat: "IV. Atributos Táticos", q: "Conhece e cumpre suas obrigações defensivas na sua posição?", opts: ["Cumpro à risca", "Faço o básico", "Prefiro focar no ataque"] },
  { cat: "IV. Atributos Táticos", q: "Qual sua facilidade para dar passes decisivos que deixam o colega na cara do gol?", opts: ["Elevada (Visão de jogo afiada)", "Moderada", "Baixa"] },
  { cat: "IV. Atributos Táticos", q: "O que faz na transição defensiva (contra-ataque do adversário)?", opts: ["Volto dando sprint para ajudar", "Certo o espaço estratégico", "Demoro a recompor"] },
  { cat: "IV. Atributos Táticos", q: "Orientar e conversar com os companheiros durante o jogo é um costume seu?", opts: ["Sim, falo e oriento o tempo todo", "Falo apenas o necessário", "Sou quieto em campo"] },
  { cat: "IV. Atributos Táticos", q: "Consegue ler o ritmo do jogo (saber quando acelerar ou cadenciar)?", opts: ["Sim, controlo o ritmo", "Tenho certa noção", "Jogos num ritmo só"] },

  // V. Atributos Mentais e Psicológicos
  { cat: "V. Atributos Mentais", q: "Como reage logo após cometer um erro grave na partida?", opts: ["Mantenho a cabeça erguida e foco no próximo lance", "Fico chateado por uns minutos", "Sinto o baque e perco a confiança"] },
  { cat: "V. Atributos Mentais", q: "Como é seu desempenho sob pressão (jogos decisivos, torcida, placar adverso)?", opts: ["Cresço no jogo", "Mantenho o padrão", "Sinto nervosismo"] },
  { cat: "V. Atributos Mentais", q: "Consegue manter a calma com provocações de adversários ou arbitragem?", opts: ["Totalmente frio/focado", "Às vezes me irrita", "Fácil de perder a cabeça"] },
  { cat: "V. Atributos Mentais", q: "Tem perfil de liderança/comunicação ou prefere focar só na sua função?", opts: ["Líder/Comunicador", "Foco apenas no meu desempenho"] },
  { cat: "V. Atributos Mentais", q: "Tem disciplina tática para fazer o que o treinador pede, mesmo sem gostar?", opts: ["Sim, 100% disciplinado", "Faço com ressalvas", "Tenho tendência a improvisar"] },
  { cat: "V. Atributos Mentais", q: "Seu foco e competitividade duram do primeiro ao último minuto?", opts: ["Sim, intensidade máxima", "Flutua durante o jogo", "Perco o foco com facilidade"] },
  { cat: "V. Atributos Mentais", q: "Como lida emocionalmente com a reserva ou substituições?", opts: ["Respeito e trabalho mais", "Fico chateado mas aceito", "Demonstro insatisfação"] },
  { cat: "V. Atributos Mentais", q: "Sente ansiedade antes dos jogos que atrapalhe seu futebol?", opts: ["Não, fico tranquilo", "Uma ansiedade saudável", "Sim, trava meu futebol"] },

  // VI. Posições e Preferências
  { cat: "VI. Posições e Preferências", q: "No Campo, em qual função renderia mais?", opts: ["Atacante / Ponta / Centroavante", "Meio-campo / Volante", "Defensor / Zagueiro / Lateral", "Goleiro"] },
  { cat: "VI. Posições e Preferências", q: "Na Quadra, em qual função renderia mais?", opts: ["Pivô / Ala Driblador", "Fixo / Ala Construtor", "Goleiro"] },
  { cat: "VI. Posições e Preferências", q: "Seu perfil é mais criador/controlador ou finalizador/veloz?", opts: ["Criador / Controlador", "Finalizador / Veloz"] },
  { cat: "VI. Posições e Preferências", q: "Na defesa, rende melhor em marcação individual ou por zona?", opts: ["Marcação Individual", "Marcação por Zona"] },
  { cat: "VI. Posições e Preferências", q: "Prefere jogar aberto pelas laterais ou focado no centro do jogo?", opts: ["Aberto pelas pontas/laterais", "No centro do campo/quadra"] },

  // VII. Mapeamento de Pontos Fortes e Fracos
  { cat: "VII. Pontos Fortes e Fracos", q: "Qual a sua maior virtude declarada no jogo?", opts: ["Técnica e Visão", "Velocidade e Físico", "Raça e Marcação", "Finalização"] },
  { cat: "VII. Pontos Fortes e Fracos", q: "Qual área precisa de melhora mais urgente?", opts: ["Uso da perna ruim", "Resistência Física", "Concentração/Calma", "Marcação/Posicionamento"] },
  { cat: "VII. Pontos Fortes e Fracos", q: "Qual fundamento hoje é seu maior gargalo?", opts: ["Chute / Cabeceio", "Passe / Controle", "Marcação / Desarme"] },
  { cat: "VII. Pontos Fortes e Fracos", q: "O que seus companheiros mais elogiam no seu jogo?", opts: ["Entrega/Raça", "Habilidade/Passe", "Inteligência Tática", "Gols"] },
  { cat: "VII. Pontos Fortes e Fracos", q: "O que os adversários mais tentam explorar contra você?", opts: ["Minha perna ruim", "Minha velocidade/fôlego", "Minha paciência/temperamento"] }
];

// --- AUTENTICAÇÃO E REGISTRO ---
function handleAuth(event) {
  event.preventDefault();
  
  currentUser = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    role: document.getElementById('user-role').value,
    age: document.getElementById('user-age').value,
    height: document.getElementById('user-height').value,
    weight: document.getElementById('user-weight').value,
    diagnosis: 'Pendente (Teste não realizado)'
  };

  registeredUsers.push(currentUser);

  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('nav-user-name').innerText = currentUser.name;
  
  if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').classList.remove('hidden');
    renderAdminUsers();
  }

  document.getElementById('welcome-message').innerText = `Bem-vindo, ${currentUser.name}!`;
  
  initCharts();
  loadQuizQuestion();
}

function toggleAdminField() {
  const role = document.getElementById('user-role').value;
  const athleteFields = document.getElementById('athlete-fields');
  if (athleteFields) {
    athleteFields.style.display = role === 'admin' ? 'none' : 'block';
  }
}

function logout() {
  location.reload();
}

// --- NAVEGAÇÃO DE ABAS ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('text-emerald-400', 'bg-slate-800'));
  
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  
  const navBtn = document.getElementById('nav-' + tabId);
  if (navBtn) navBtn.classList.add('text-emerald-400', 'bg-slate-800');
}

// --- QUIZ TÁTICO (50 PERGUNTAS) ---
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

  qData.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = "w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3.5 rounded-xl text-sm text-slate-200 transition font-medium hover:border-emerald-500/50";
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
  const positionResult = quizAnswers[40] || "Meia-Atacante / Ala";
  currentUser.diagnosis = positionResult;

  document.getElementById('quiz-container').innerHTML = `
    <div class="text-center py-8 space-y-4">
      <i class="fa-solid fa-circle-check text-emerald-400 text-6xl"></i>
      <h3 class="text-2xl font-bold text-white">Mapeamento Tático Concluído!</h3>
      <p class="text-slate-400 text-sm max-w-md mx-auto">Analisamos suas 50 respostas. Seu perfil tático e físico foi processado com sucesso.</p>
      <button onclick="switchTab('home')" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition">Ver Diagnóstico Completo</button>
    </div>
  `;
  
  const planCard = document.getElementById('training-plan-card');
  const details = document.getElementById('training-details');
  planCard.classList.remove('hidden');
  
  details.innerHTML = `
    <p><strong>Perfil de Posição:</strong> ${positionResult}</p>
    <p><strong>Plano de Treino Recomendado:</strong> Treino Tático Integrado + Tomada de Decisão em Espaço Reduzido.</p>
    <p><strong>Trabalho Específico:</strong> Ajuste de perna não-dominante e aprimoramento de transição defensiva.</p>
  `;

  renderAdminUsers();
}

// --- PAINEL DO ADMINISTRADOR ---
function renderAdminUsers() {
  const list = document.getElementById('admin-user-list');
  if (!list) return;

  if (registeredUsers.length === 0) {
    list.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">Nenhum atleta cadastrado até o momento.</td></tr>`;
    return;
  }

  list.innerHTML = registeredUsers.map(u => `
    <tr class="hover:bg-slate-950/50 transition">
      <td class="p-3 font-semibold text-white">${u.name}</td>
      <td class="p-3">${u.email}</td>
      <td class="p-3">${u.age ? u.age + ' anos' : 'N/I'}</td>
      <td class="p-3">${u.height ? u.height + 'cm' : '-'} / ${u.weight ? u.weight + 'kg' : '-'}</td>
      <td class="p-3 text-emerald-400 font-medium">${u.diagnosis}</td>
    </tr>
  `).join('');
}

function submitVideo(event) {
  event.preventDefault();
  const title = document.getElementById('video-title').value;
  const url = document.getElementById('video-url').value;

  submittedVideos.push({
    title,
    url,
    user: currentUser ? currentUser.name : 'Atleta'
  });

  alert('Vídeo enviado com sucesso para a comissão técnica!');
  renderAdminVideos();
  event.target.reset();
}

function renderAdminVideos() {
  const list = document.getElementById('admin-video-list');
  if (!list || submittedVideos.length === 0) return;

  list.innerHTML = submittedVideos.map(v => `
    <div class="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
      <div>
        <p class="text-white font-semibold">${v.title}</p>
        <p class="text-xs text-slate-500">Enviado por: ${v.user}</p>
      </div>
      <a href="${v.url}" target="_blank" class="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs px-3 py-1.5 rounded-md font-medium">Assistir</a>
    </div>
  `).join('');
}

function saveAdminSettings() {
  const msg = document.getElementById('admin-announcement-input').value;
  if (msg) {
    document.getElementById('admin-custom-announcement').innerText = msg;
    alert('Aviso do site atualizado!');
  }
}

// --- GRÁFICOS (CHART.JS) ---
function initCharts() {
  const radarEl = document.getElementById('attributesChart');
  if (radarEl) {
    const ctxRadar = radarEl.getContext('2d');
    new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Passe', 'Finalização', 'Velocidade', 'Defesa', 'Físico', 'Visão Tática'],
        datasets: [{
          label: 'Atributos do Atleta',
          data: [78, 70, 85, 60, 75, 82],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: '#10b981',
          pointBackgroundColor: '#10b981'
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: { color: '#334155' },
            grid: { color: '#334155' },
            pointLabels: { color: '#94a3b8' },
            ticks: { display: false }
          }
        }
      }
    });
  }

  const lineEl = document.getElementById('progressChart');
  if (lineEl) {
    const ctxLine = lineEl.getContext('2d');
    new Chart(ctxLine, {
      type: 'line',
      data: {
        labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
        datasets: [{
          label: 'Rendimento nos Treinos (%)',
          data: [65, 75, 82, 90],
          borderColor: '#10b981',
          tension: 0.3
        }]
      },
      options: {
        scales: {
          x: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
          y: { grid: { color: '#334155' }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
}