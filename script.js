/* ==========================================================================
   FUTEBOL EVOLUTION - LÓGICA E SCRIPT PRINCIPAL (script.js)
   ========================================================================== */

// 1. ESTADO GLOBAL DA APLICAÇÃO
let currentUser = {
    name: "Arthur Silva",
    email: "arthur@futebolevolution.com",
    role: "atleta",
    position: "MEI",
    modality: "Campo",
    overall: 88,
    stats: {
        pas: 91,
        fis: 85,
        def: 78,
        vel: 90,
        chu: 86,
        vis: 92
    }
};

let radarChartInstance = null;
let evolutionChartInstance = null;
let timerInterval = null;
let currentQuizIndex = 0;
let currentTacticalIndex = 0;

// 2. BANCO DINÂMICO DE PERGUNTAS ADAPTATIVAS (SISTEMA ANTI-COLA)
const quizBank = [
    {
        id: 1,
        question: "Ao receber a bola sob alta pressão no meio-campo, qual é a tua leitura primária?",
        options: [
            { text: "Tocar de primeira para o homem livre no espaço vazio.", points: 3, valencia: "PAS" },
            { text: "Usar o corpo para proteger a bola e tentar girar.", points: 2, valencia: "FIS" },
            { text: "Bater para a frente imediatamente sem olhar.", points: 1, valencia: "DEF" }
        ]
    },
    {
        id: 2,
        question: "Numa transição defensiva rápida, qual a tua prioridade tática imediata?",
        options: [
            { text: "Pressionar a portador da bola para cortar o ataque na origem.", points: 3, valencia: "DEF" },
            { text: "Temporizar e recompor a linha defensiva do setor.", points: 2, valencia: "VIS" },
            { text: "Acompanhar apenas o teu marcador individual direto.", points: 1, valencia: "FIS" }
        ]
    },
    {
        id: 3,
        question: "Como atacas os espaços em blocos defensivos adversários fechados?",
        options: [
            { text: "Movimentação em diagonal atacando as costas da linha.", points: 3, valencia: "VEL" },
            { text: "Arriscar o remate de fora da área para tentar a sobra.", points: 2, valencia: "CHU" },
            { text: "Pedir a bola sempre no pé sem criar desmarque.", points: 1, valencia: "PAS" }
        ]
    },
    {
        id: 4,
        question: "Quando o teu equipa está a perder nos minutos finais, como reages taticamente?",
        options: [
            { text: "Aumentas o ritmo de passe e procuras ruturas rápidas.", points: 3, valencia: "VIS" },
            { text: "Forças jogadas individuais de 1v1 em velocidade.", points: 2, valencia: "VEL" },
            { text: "Tentas remates de qualquer distância com pressa.", points: 1, valencia: "CHU" }
        ]
    }
];

// 3. BANCO DE DESAFIOS DA PRANCHETA TÁTICA
const tacticalScenarios = [
    {
        title: "Contra-ataque 3x2",
        description: "Infiltração rápida pela meia-esquerda com 2 defesas perfilados. Qual a melhor decisão?",
        badge: "Desafio 1/20"
    },
    {
        title: "Saída de Bola Sob Pressão",
        description: "Adversário em bloco alto no teu terço defensivo. Como realizar a progressão?",
        badge: "Desafio 2/20"
    },
    {
        title: "Duelo 1v1 na Linha Lateral",
        description: "Espaço aberto na ponta contra o lateral adversário. Como finalizar a jogada?",
        badge: "Desafio 3/20"
    }
];

// 4. INICIALIZAÇÃO E AUTENTICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o aplicativo inicia no estado correto se já houver dados
    console.log("Futebol Evolution v2.0 carregado com sucesso.");
});

function handleLogin(event) {
    event.preventDefault();
    
    const roleInput = document.getElementById('login-role').value;
    const nameInput = document.getElementById('login-name').value;
    const emailInput = document.getElementById('login-email').value;

    if (!nameInput.trim()) return;

    currentUser.role = roleInput;
    currentUser.name = nameInput;
    currentUser.email = emailInput;

    // Atualiza a Interface do Usuário
    document.getElementById('top-user-name').textContent = currentUser.name;
    document.getElementById('card-name').textContent = currentUser.name.split(' ')[0];
    document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    // Troca de Tela
    document.getElementById('screen-login').classList.add('hidden');
    document.getElementById('screen-app').classList.remove('hidden');

    // Inicializa Gráficos e Quiz
    initCharts();
    renderQuizQuestion();
}

function logout() {
    document.getElementById('screen-app').classList.add('hidden');
    document.getElementById('screen-login').classList.remove('hidden');
}

// 5. NAVEGAÇÃO ENTRE ABAS
function switchTab(tabId) {
    // Oculta todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove estado ativo de todos os botões do menu
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'text-emerald-400', 'bg-slate-800/80');
        btn.classList.add('text-slate-400');
    });

    // Mostra a aba selecionada
    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }

    // Ativa o botão correspondente no menu
    const activeBtn = document.getElementById(`nav-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-emerald-400', 'bg-slate-800/80');
    }

    // Atualiza o Título do Header
    const titleMap = {
        'inicio': 'Início (Dashboard)',
        'avaliacao': 'Avaliação Técnica',
        'treinos': 'Central de Treinos',
        'futucard': 'Evolution Card',
        'agenda': 'Agenda & Streak',
        'videos': 'Vídeos & Lances',
        'config': 'Configurações',
        'admin': 'Técnico Supervisor'
    };
    document.getElementById('current-tab-title').textContent = titleMap[tabId] || tabId.toUpperCase();
}

// 6. PAINEL PROTEGIDO DO TÉCNICO SUPERVISOR
function openSupervisorAuth() {
    const pin = prompt("Insira o PIN de acesso do Técnico Supervisor:");
    if (pin === "3020") {
        switchTab('admin');
    } else if (pin !== null) {
        alert("PIN Incorreto! Acesso negado.");
    }
}

// 7. MOTOR DO QUESTIONÁRIO TÁTICO (ANTI-COLA & EMBARALHAMENTO)
function renderQuizQuestion() {
    const currentQuestion = quizBank[currentQuizIndex % quizBank.length];
    
    document.getElementById('quiz-step-label').textContent = `Pergunta ${currentQuizIndex + 1} de 50`;
    document.getElementById('quiz-question-text').textContent = currentQuestion.question;

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    // Algoritmo de Embaralhamento (Fisher-Yates) para evitar respostas idênticas
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);

    shuffledOptions.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = "w-full text-left p-3 rounded-lg bg-slate-800 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-200 transition duration-150";
        button.textContent = `${String.fromCharCode(65 + index)}) ${option.text}`;
        button.onclick = () => processQuizAnswer(option.points);
        optionsContainer.appendChild(button);
    });
}

function processQuizAnswer(points) {
    currentQuizIndex++;
    if (currentQuizIndex < 50) {
        renderQuizQuestion();
    } else {
        alert("Avaliação Concluída! O teu novo Overall e valências foram recalculados.");
        currentQuizIndex = 0;
        switchTab('inicio');
    }
}

// 8. PRANCHETA VISUAL DE DECISÕES TÁTICAS
function nextTacticalScenario() {
    currentTacticalIndex = (currentTacticalIndex + 1) % tacticalScenarios.length;
    const scenario = tacticalScenarios[currentTacticalIndex];

    document.getElementById('tactical-step-badge').textContent = scenario.badge;
    document.getElementById('tactical-scenario-text').textContent = `${scenario.title}: ${scenario.description}`;
}

// 9. CRONÓMETRO INTERATIVO DE DESCANSO
function startTimer(seconds) {
    clearInterval(timerInterval);
    let timeLeft = seconds;
    const display = document.getElementById('timer-display');

    timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const secs = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${minutes}:${secs}`;

        if (--timeLeft < 0) {
            clearInterval(timerInterval);
            display.textContent = "DESCANSO CONCLUÍDO! 🔥";
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer-display').textContent = "00:00";
}

// 10. RECONHECIMENTO DE VOZ (WEB SPEECH API)
function toggleVoiceInput() {
    const btn = document.getElementById('btn-voice');
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.interimResults = false;

        btn.classList.add('bg-rose-500/20', 'text-rose-400');
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> A ouvir...`;

        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            alert(`Resposta Capturada por Voz: "${transcript}"`);
            btn.classList.remove('bg-rose-500/20', 'text-rose-400');
            btn.innerHTML = `<i class="fa-solid fa-microphone"></i> Responder por Voz`;
            processQuizAnswer(3);
        };

        recognition.onerror = () => {
            alert("Não foi possível reconhecer a voz. Tenta novamente.");
            btn.classList.remove('bg-rose-500/20', 'text-rose-400');
            btn.innerHTML = `<i class="fa-solid fa-microphone"></i> Responder por Voz`;
        };
    } else {
        alert("O teu navegador não suporta reconhecimento de voz direto.");
    }
}

// 11. GRÁFICOS INTERATIVOS (CHART.JS)
function initCharts() {
    // Renderiza Radar Chart das Valências
    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        if (radarChartInstance) radarChartInstance.destroy();

        radarChartInstance = new Chart(ctxRadar.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['PAS', 'DEF', 'CHU', 'FIS', 'VEL', 'VIS'],
                datasets: [{
                    label: 'Valências Táticas',
                    data: [
                        currentUser.stats.pas,
                        currentUser.stats.def,
                        currentUser.stats.chu,
                        currentUser.stats.fis,
                        currentUser.stats.vel,
                        currentUser.stats.vis
                    ],
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    borderColor: '#10b981',
                    borderWidth: 2,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // Renderiza Linha de Evolução Temporal
    const ctxEvolution = document.getElementById('evolutionChart');
    if (ctxEvolution) {
        if (evolutionChartInstance) evolutionChartInstance.destroy();

        evolutionChartInstance = new Chart(ctxEvolution.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4'],
                datasets: [{
                    label: 'Progresso Overall',
                    data: [72, 79, 83, currentUser.overall],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
}

// 12. UTILITÁRIOS E GERENCIADORES DE DADOS
function toggleDay(buttonElement) {
    buttonElement.classList.toggle('bg-emerald-500');
    buttonElement.classList.toggle('text-slate-950');
    buttonElement.classList.toggle('bg-slate-800');
    buttonElement.classList.toggle('text-slate-400');
}

function updatePlayerPosition(newPos) {
    currentUser.position = newPos;
    document.getElementById('card-pos').textContent = newPos;
}

function downloadCard() {
    alert("A gerar e descarregar o teu Evolution Card Ouro em PNG HD...");
}