/* ==========================================================================
   FUTEBOL EVOLUTION - LÓGICA E INTERATIVIDADE (JS)
   ========================================================================== */

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let currentUser = null;
let submittedVideos = [];
let currentQuestionIndex = 0;
let quizAnswers = {};

// --- BANCO DE DADOS: 50 PERGUNTAS DE AVALIAÇÃO TÁTICA E FÍSICA ---
const questions = Array.from({ length: 50 }, (_, i) => {
  const num = i + 1;
  if (num === 1) return { q: "Qual a sua perna/pé preferencial?", opts: ["Direito", "Esquerdo", "Ambidestro"] };
  if (num === 2) return { q: "Em qual modalidade você joga principalmente?", opts: ["Campo (11v11)", "Quadra / Futsal", "Society / Fut7"] };
  if (num === 3) return { q: "Como você avalia sua perna não-dominante (ruim)?", opts: ["Excelente", "Razoável", "Apenas para apoio"] };
  if (num === 4) return { q: "Qual o seu maior forte em jogo?", opts: ["Velocidade e Drible", "Visão de Jogo e Passe", "Marcação e Força", "Finalização e Posicionamento"] };
  if (num === 5) return { q: "Em qual setor você prefere atuar?", opts: ["Defesa / Goleiro", "Meio-campo / Armação", "Ataque / Ponta", "Ala / Lateral"] };
  
  return {
    q: `Pergunta ${num}: Como você reage sob pressão alta do adversário no setor ${num % 2 === 0 ? 'defensivo' : 'ofensivo'}?`,
    opts: ["Busco o passe rápido de primeira", "Tento a jogada individual / drible", "Recuo a bola com segurança", "Protejo o corpo e aguardo apoio"]
  };
});

// --- AUTENTICAÇÃO E TELA DE BLOQUEIO ---
function handleAuth(event) {
  event.preventDefault();
  
  currentUser = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    role: document.getElementById('user-role').value,
    height: document.getElementById('user-height').value,
    weight: document.getElementById('user-weight').value
  };

  // Oculta a tela de bloqueio
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('nav-user-name').innerText = currentUser.name;
  
  // Exibe o botão do painel se for Admin
  if (currentUser.role === 'admin') {
    document.getElementById('nav-admin').classList.remove('hidden');
  }

  document.getElementById('welcome-message').innerText = `Bem-vindo, ${currentUser.name}!`;
  
  // Inicializa componentes
  initCharts();
  loadQuizQuestion();
}

function toggleAdminField() {
  const role = document.getElementById('user-role').value;
  const athleteFields = document.getElementById('athlete-fields');
  if (athleteFields) {
    athleteFields.style.display = role === 'admin' ? 'none' : 'grid';
  }
}

function logout() {
  location.reload();
}

// --- NAVEGAÇÃO DE ABAS (SINGLE PAGE APPLICATION) ---
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('text-emerald-400', 'bg-slate-800'));
  
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  
  const navBtn = document.getElementById('nav-' + tabId);
  if (navBtn) navBtn.classList.add('text-emerald-400', 'bg-slate-800');
}

// --- SISTEMA DE QUIZ (TESTE DE 50 PERGUNTAS) ---
function loadQuizQuestion() {
  if (currentQuestionIndex >= questions.length) {
    finishQuiz();
    return;
  }

  const qData = questions[currentQuestionIndex];
  document.getElementById('quiz-progress').innerText = `Pergunta ${currentQuestionIndex + 1} de 50`;
  document.getElementById('quiz-question').innerText = qData.q;
  
  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';

  qData.opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = "w-full text-left bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-lg text-sm text-slate-200 transition";
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
  document.getElementById('quiz-container').innerHTML = `
    <div class="text-center py-8">
      <i class="fa-solid fa-circle-check text-emerald-400 text-5xl mb-4"></i>
      <h3 class="text-2xl font-bold text-white mb-2">Diagnóstico Concluído!</h3>
      <p class="text-slate-400 text-sm mb-6">Mapeamos seu perfil técnico e geramos seu plano de treinos personalizado.</p>
      <button onclick="switchTab('home')" class="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 rounded-lg transition">Ver Treino Recomendado</button>
    </div>
  `;
  
  // Exibe o card de treino recomendado no Dashboard
  const planCard = document.getElementById('training-plan-card');
  const details = document.getElementById('training-details');
  planCard.classList.remove('hidden');
  
  details.innerHTML = `
    <p><strong>Posição Diagnosticada:</strong> Meia-Atacante / Ponta</p>
    <p><strong>Foco Recomendado:</strong> Treino Misto (Controle de Bola + Explosão Física sem Bola)</p>
    <p><strong>Perna Não-Dominante:</strong> Exercícios diários de passe e condução com o pé fraco (15 min/dia).</p>
  `;
}

// --- CUSTOMIZAÇÃO DE AVATAR (SVG DINÂMICO) ---
function updateAvatar(part, value) {
  if (part === 'hairColor') {
    document.getElementById('avatar-hair').setAttribute('fill', value);
  }
  if (part === 'shirt') {
    document.getElementById('avatar-shirt').setAttribute('fill', value);
  }
  if (part === 'shoes') {
    document.getElementById('avatar-shoes').setAttribute('fill', value);
    document.getElementById('avatar-shoes-2').setAttribute('fill', value);
  }
}

function toggleAccessory() {
  const acc = document.getElementById('avatar-accessory');
  acc.classList.toggle('hidden');
}

// --- ENVIO DE VÍDEOS & GERENCIAMENTO ADMIN ---
function submitVideo(event) {
  event.preventDefault();
  const title = document.getElementById('video-title').value;
  const url = document.getElementById('video-url').value;

  submittedVideos.push({
    title,
    url,
    user: currentUser ? currentUser.name : 'Atleta Anônimo'
  });

  alert('Vídeo enviado com sucesso para a avaliação da comissão técnica!');
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
    alert('Aviso do site atualizado com sucesso!');
  }
}

// --- GRÁFICOS INTERATIVOS (CHART.JS) ---
function initCharts() {
  const radarEl = document.getElementById('attributesChart');
  if (radarEl) {
    const ctxRadar = radarEl.getContext('2d');
    new Chart(ctxRadar, {
      type: 'radar',
      data: {
        labels: ['Passe', 'Finalização', 'Velocidade', 'Defesa', 'Físico', 'Visão de Jogo'],
        datasets: [{
          label: 'Atributos do Atleta',
          data: [75, 68, 82, 55, 70, 80],
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
          data: [60, 72, 80, 88],
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