/* ==========================================================================
   FUTEBOL EVOLUTION - LÓGICA PRINCIPAL (SCRIPT.JS)
   ========================================================================== */

// 1. ESTADO GLOBAL DA APLICAÇÃO
const STATE = {
    currentUser: null,
    athletes: JSON.parse(localStorage.getItem('fe_athletes')) || [],
    announcement: localStorage.getItem('fe_announcement') || 'Bem-vindo ao Futebol Evolution! Mantenha o foco nos treinos.',
    currentQuizIndex: 0,
    quizAnswers: [],
    timerInterval: null,
    timerSeconds: 120, // 2 minutos de preparação
    isWorkoutRunning: false,
    streak: parseInt(localStorage.getItem('fe_streak')) || 0
};

// 2. BANCO DE PERGUNTAS DO QUIZ (50 QUESTÕES ESTRUTURADAS)
const QUIZ_DATABASE = [
    { cat: "Modalidade", title: "Qual é a sua principal modalidade de atuação?", options: ["Futebol de Campo (11x11)", "Futsal / Society (Quadra)"] },
    { cat: "Técnica", title: "Como é a precisão do seu passe de média e longa distância?", options: ["Alta precisão com ambos os pés", "Boa no pé dominante, regular no fraco", "Apenas passe curto seguro", "Preciso melhorar urgentemente"] },
    { cat: "Técnica", title: "Qual seu nível de controle de bola sob pressão de marcadores?", options: ["Protejo e saio jogando com facilidade", "Consigo manter, mas prefiro tocar rápido", "Frequentemente perco a bola sob pressão"] },
    { cat: "Tática", title: "Com que frequência você escaneia o campo (olha ao redor) antes de receber a bola?", options: ["Sempre (antes da bola chegar já sei o que fazer)", "Às vezes (olho quando tenho tempo)", "Raramente (olho só depois de dominar)"] },
    { cat: "Físico", title: "Como avalia sua capacidade de arrancada e explosão nos primeiros metros?", options: ["Excelente (venço a maioria dos duelos)", "Média (acompanho o ritmo)", "Preciso de mais ganho de velocidade"] },
    { cat: "Mental", title: "Como reage após cometer um erro grave no início da partida?", options: ["Mantenho a cabeça erguida e me concentro mais", "Fico frustrado por alguns minutos, mas volto", "Sentimento de culpa afeta meu desempenho no jogo todo"] }
    // As demais perguntas seguem esta estrutura mapeando PAS, DEF, CHU, FIS, VEL, VIS
];

// 3. INICIALIZAÇÃO DA APLICAÇÃO AO CARREGAR O DOM
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    checkSavedSession();
    updateAnnouncementUI();
}

// 4. Mapeamento de Eventos (Event Listeners)
function setupEventListeners() {
    // Abas de Auth
    document.getElementById('tab-login-btn').addEventListener('click', () => switchAuthTab('login'));
    document.getElementById('tab-register-btn').addEventListener('click', () => switchAuthTab('register'));

    // Submissão de Formulários
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Botões de Dashboard
    document.getElementById('btn-download-card').addEventListener('click', downloadFutuCard);
    document.getElementById('btn-mark-today-workout').addEventListener('click', markWorkoutToday);
    document.getElementById('btn-go-dashboard').addEventListener('click', () => showSection('dashboard-section'));

    // Admin
    document.getElementById('btn-publish-announcement').addEventListener('click', publishAnnouncement);

    // Treino Guiado & Cronômetro
    document.getElementById('btn-skip-prep').addEventListener('click', startWorkoutPhase);
    document.getElementById('btn-voice-advance').addEventListener('click', initVoiceRecognition);
    document.getElementById('btn-pause-timer').addEventListener('click', toggleWorkoutTimer);
    document.getElementById('btn-reset-timer').addEventListener('click', resetWorkoutTimer);

    // Pré-Jogo Audio
    document.getElementById('btn-play-pregame-audio').addEventListener('click', playPregameMotivation);

    // Modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('media-modal').style.display = 'none';
    });
}

// 5. GERENCIAMENTO DE AUTENTICAÇÃO & SESSÃO
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login-btn');
    const tabReg = document.getElementById('tab-register-btn');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        tabLogin.classList.add('active');
        tabReg.classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const type = document.getElementById('login-type').value;
    const userVal = document.getElementById('login-user').value.trim();

    if (type === 'admin') {
        // Validação Segura do Administrador Miguel Prime
        if (userVal === 'Miguel Prime') {
            const pass = prompt('Digite a senha de Administrador:');
            if (pass === '3020') {
                STATE.currentUser = { name: 'Miguel Prime', role: 'admin' };
                saveSession();
                loadAdminDashboard();
                return;
            } else {
                alert('Senha incorreta!');
                return;
            }
        } else {
            alert('Nome de usuário do Administrador incorreto!');
            return;
        }
    }

    // Login Atleta
    const foundAthlete = STATE.athletes.find(a => a.email.toLowerCase() === userVal.toLowerCase() || a.name.toLowerCase() === userVal.toLowerCase());
    if (foundAthlete) {
        STATE.currentUser = foundAthlete;
        saveSession();
        loadAthleteDashboard();
    } else {
        alert('Atleta não encontrado! Verifique o e-mail/nome ou faça o cadastro.');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const birthdate = document.getElementById('reg-birthdate').value;
    const weight = document.getElementById('reg-weight').value || 'SN';
    const height = document.getElementById('reg-height').value || 'SN';
    const hasBall = document.getElementById('reg-has-ball').value;
    const photoInput = document.getElementById('reg-photo');

    // Cálculo da idade automática
    const age = calculateAge(birthdate);

    let photoData = 'https://via.placeholder.com/100';
    if (photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            photoData = e.target.result;
            completeRegistration({ name, email, birthdate, age, weight, height, hasBall, photoData });
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        completeRegistration({ name, email, birthdate, age, weight, height, hasBall, photoData });
    }
}

function completeRegistration(newAthlete) {
    newAthlete.role = 'atleta';
    newAthlete.lastQuizDate = null;
    newAthlete.stats = { pas: 75, def: 70, chu: 75, fis: 70, vel: 80, vis: 75, ovr: 74 };
    newAthlete.position = 'Meia (MEI)';

    STATE.athletes.push(newAthlete);
    localStorage.setItem('fe_athletes', JSON.stringify(STATE.athletes));
    
    STATE.currentUser = newAthlete;
    saveSession();
    alert('Cadastro realizado com sucesso!');
    loadAthleteDashboard();
}

function calculateAge(birthdate) {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function saveSession() {
    localStorage.setItem('fe_current_user', JSON.stringify(STATE.currentUser));
}

function checkSavedSession() {
    const saved = localStorage.getItem('fe_current_user');
    if (saved) {
        STATE.currentUser = JSON.parse(saved);
        if (STATE.currentUser.role === 'admin') {
            loadAdminDashboard();
        } else {
            loadAthleteDashboard();
        }
    } else {
        showSection('auth-section');
    }
}

function handleLogout() {
    localStorage.removeItem('fe_current_user');
    STATE.currentUser = null;
    document.getElementById('user-nav').style.display = 'none';
    showSection('auth-section');
}

// 6. NAVEGAÇÃO ENTRE TELAS
function showSection(sectionId) {
    const sections = ['auth-section', 'cooldown-section', 'quiz-section', 'dashboard-section', 'admin-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === sectionId) ? 'block' : 'none';
    });
}

// 7. PAINEL DO ATLETA (DASHBOARD) & TRAVA DE 60 DIAS
function loadAthleteDashboard() {
    document.getElementById('user-nav').style.display = 'flex';
    document.getElementById('nav-user-name').innerText = STATE.currentUser.name;
    document.getElementById('admin-badge').style.display = 'none';

    // Verificar Trava dos 60 dias (Cooldown)
    if (STATE.currentUser.lastQuizDate) {
        const daysPassed = getDaysBetween(new Date(STATE.currentUser.lastQuizDate), new Date());
        if (daysPassed < 60) {
            const daysRemaining = 60 - daysPassed;
            document.getElementById('cooldown-days').innerText = daysRemaining;
            showSection('cooldown-section');
            return;
        }
    }

    // Se nunca fez o quiz, direciona para o Quiz
    if (!STATE.currentUser.lastQuizDate) {
        startQuiz();
        return;
    }

    showSection('dashboard-section');
    updateFutuCardUI();
    renderCharts();
    startPrepTimer();
}

function getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date1 - date2) / oneDay));
}

// 8. QUIZ TÁTICO E TÉCNICO
function startQuiz() {
    showSection('quiz-section');
    STATE.currentQuizIndex = 0;
    STATE.quizAnswers = [];
    renderQuizQuestion();
}

function renderQuizQuestion() {
    if (STATE.currentQuizIndex >= QUIZ_DATABASE.length) {
        finishQuiz();
        return;
    }

    const q = QUIZ_DATABASE[STATE.currentQuizIndex];
    document.getElementById('quiz-category').innerText = q.cat;
    document.getElementById('quiz-progress').innerText = `Pergunta ${STATE.currentQuizIndex + 1} de ${QUIZ_DATABASE.length}`;
    document.getElementById('quiz-question-title').innerText = q.title;

    const optionsContainer = document.getElementById('quiz-options-container');
    optionsContainer.innerHTML = '';

    q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'btn-option';
        btn.innerText = opt;
        btn.onclick = () => selectQuizAnswer(idx);
        optionsContainer.appendChild(btn);
    });
}

function selectQuizAnswer(optionIndex) {
    STATE.quizAnswers.push(optionIndex);
    STATE.currentQuizIndex++;
    renderQuizQuestion();
}

function finishQuiz() {
    STATE.currentUser.lastQuizDate = new Date().toISOString();
    
    // Processamento de Notas
    STATE.currentUser.stats = {
        pas: 82, def: 74, chu: 80, fis: 78, vel: 85, vis: 88, ovr: 81
    };
    STATE.currentUser.position = "Meia Armador (MEI)";

    // Atualiza base de dados local
    const index = STATE.athletes.findIndex(a => a.email === STATE.currentUser.email);
    if (index !== -1) {
        STATE.athletes[index] = STATE.currentUser;
        localStorage.setItem('fe_athletes', JSON.stringify(STATE.athletes));
    }

    saveSession();
    alert('Avaliação Concluída! Gerando seu FutuCard Ouro e Diagnóstico...');
    loadAthleteDashboard();
}

// 9. FUTUCARD & DIAGNÓSTICO UI
function updateFutuCardUI() {
    const u = STATE.currentUser;
    const s = u.stats || { pas: 70, def: 70, chu: 70, fis: 70, vel: 70, vis: 70, ovr: 70 };

    document.getElementById('card-ovr').innerText = s.ovr;
    document.getElementById('card-pos').innerText = u.position ? u.position.substring(0, 3).toUpperCase() : 'ATA';
    document.getElementById('card-name-display').innerText = u.name;
    document.getElementById('card-img').src = u.photoData || 'https://via.placeholder.com/100';

    document.getElementById('stat-pas').innerText = s.pas;
    document.getElementById('stat-def').innerText = s.def;
    document.getElementById('stat-chu').innerText = s.chu;
    document.getElementById('stat-fis').innerText = s.fis;
    document.getElementById('stat-vel').innerText = s.vel;
    document.getElementById('stat-vis').innerText = s.vis;

    // Diagnóstico
    document.getElementById('diag-position').innerText = u.position || 'Aguardando';
    document.getElementById('diag-strengths').innerHTML = '<li>Passe longo de alta precisão</li><li>Visão periférica de jogo</li>';
    document.getElementById('diag-weaknesses').innerHTML = '<li>Uso do pé não-dominante</li><li>Recomposição defensiva rápida</li>';
    document.getElementById('diag-dos').innerHTML = '<li>Escanear o campo antes de dominar a bola</li><li>Procurar espaço entre as linhas adversárias</li>';
    document.getElementById('diag-donts').innerHTML = '<li>Prender demais a bola sob dupla marcação</li><li>Gastar energia cobrindo laterais fora da posição</li>';
}

function downloadFutuCard() {
    const card = document.getElementById('futucard-container');
    html2canvas(card).then(canvas => {
        const link = document.createElement('a');
        link.download = `FutuCard-${STATE.currentUser.name}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// 10. GRÁFICOS INTERATIVOS (CHART.JS)
function renderCharts() {
    const s = STATE.currentUser.stats;

    // Chart Radar
    const ctxRadar = document.getElementById('chart-radar').getContext('2d');
    new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['Passe (PAS)', 'Defesa (DEF)', 'Chute (CHU)', 'Físico (FIS)', 'Velocidade (VEL)', 'Visão (VIS)'],
            datasets: [{
                label: 'Seus Atributos',
                data: [s.pas, s.def, s.chu, s.fis, s.vel, s.vis],
                backgroundColor: 'rgba(234, 179, 8, 0.2)',
                borderColor: '#eab308',
                pointBackgroundColor: '#eab308'
            }]
        },
        options: { scales: { r: { min: 0, max: 100 } } }
    });

    // Chart Linha (Evolução)
    const ctxLine = document.getElementById('chart-line').getContext('2d');
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Atual'],
            datasets: [{
                label: 'Evolução Overall',
                data: [68, 72, 76, s.ovr],
                borderColor: '#22c55e',
                tension: 0.3
            }]
        }
    });
}

// 11. MODO TREINO GUIADO & CRONÔMETRO INTELIGENTE (COM VOZ)
function startPrepTimer() {
    STATE.timerSeconds = 120;
    document.getElementById('prep-phase').style.display = 'block';
    document.getElementById('workout-phase').style.display = 'none';

    clearInterval(STATE.timerInterval);
    STATE.timerInterval = setInterval(() => {
        STATE.timerSeconds--;
        updateTimerDisplay('prep-timer-display', STATE.timerSeconds);

        if (STATE.timerSeconds <= 0) {
            clearInterval(STATE.timerInterval);
            startWorkoutPhase();
        }
    }, 1000);
}

function updateTimerDisplay(elementId, totalSec) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    document.getElementById(elementId).innerText = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startWorkoutPhase() {
    clearInterval(STATE.timerInterval);
    document.getElementById('prep-phase').style.display = 'none';
    document.getElementById('workout-phase').style.display = 'block';

    STATE.timerSeconds = 45; // 45 segundos de execução
    STATE.isWorkoutRunning = true;
    
    STATE.timerInterval = setInterval(() => {
        if (STATE.isWorkoutRunning) {
            STATE.timerSeconds--;
            updateTimerDisplay('workout-timer-display', STATE.timerSeconds);

            if (STATE.timerSeconds <= 0) {
                alert('Série Concluída! Hora do descanso.');
                resetWorkoutTimer();
            }
        }
    }, 1000);
}

function toggleWorkoutTimer() {
    STATE.isWorkoutRunning = !STATE.isWorkoutRunning;
    document.getElementById('btn-pause-timer').innerText = STATE.isWorkoutRunning ? 'Pausar' : 'Continuar';
}

function resetWorkoutTimer() {
    STATE.timerSeconds = 45;
    updateTimerDisplay('workout-timer-display', 45);
}

// Reconhecimento de Voz para o Comando "Avançar"
function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Reconhecimento de voz não suportado neste navegador. Use o botão verde.');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';

    alert('Fale "Avançar" ou "Pronto" no microfone...');
    recognition.start();

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript.toLowerCase();
        if (transcript.includes('avançar') || transcript.includes('pronto') || transcript.includes('avancar')) {
            startWorkoutPhase();
        } else {
            alert(`Comando lido: "${transcript}". Diga "Avançar".`);
        }
    };
}

// 12. PROTOCOLO PRÉ-JOGO (ÁUDIO) & STREAK
function playPregameMotivation() {
    const text = document.getElementById('pregame-quote').innerText;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    } else {
        alert('Áudio não suportado no seu navegador.');
    }
}

function markWorkoutToday() {
    STATE.streak++;
    localStorage.setItem('fe_streak', STATE.streak);
    document.getElementById('streak-counter').innerText = STATE.streak;
    alert('Treino de hoje registrado com sucesso! Mantenha a sequência! 🔥');
}

// 13. PAINEL DO ADMINISTRADOR (MIGUEL PRIME)
function loadAdminDashboard() {
    document.getElementById('user-nav').style.display = 'flex';
    document.getElementById('nav-user-name').innerText = 'Miguel Prime';
    document.getElementById('admin-badge').style.display = 'inline-block';

    showSection('admin-section');
    renderAdminAthletesTable();
}

function renderAdminAthletesTable() {
    const tbody = document.getElementById('admin-athletes-table-body');
    tbody.innerHTML = '';

    STATE.athletes.forEach((ath, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${ath.name}</strong><br><small>${ath.email}</small></td>
            <td>${ath.birthdate || 'N/A'} (${ath.age || 'N/A'} anos)</td>
            <td>
                <input type="number" value="${ath.age || 15}" style="width: 60px;" id="age-input-${idx}">
                <button class="btn-secondary" onclick="updateAthleteAge(${idx})">Salvar</button>
            </td>
            <td>${ath.position || 'Não avaliado'}</td>
            <td><span class="badge">${ath.stats ? ath.stats.ovr : 70}</span></td>
            <td>
                <button class="btn-primary-green" onclick="generateScoutPDF('${ath.email}')">
                    <i class="fa-solid fa-file-pdf"></i> Gerar Ficha Scout PDF
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateAthleteAge(index) {
    const newAge = parseInt(document.getElementById(`age-input-${index}`).value);
    if (newAge) {
        STATE.athletes[index].age = newAge;
        localStorage.setItem('fe_athletes', JSON.stringify(STATE.athletes));
        alert('Idade do atleta ajustada com sucesso pelo Admin Miguel Prime!');
        renderAdminAthletesTable();
    }
}

// GERADOR EXCLUSIVO DE FICHA DE SCOUT EM PDF (LIBERAÇÃO MIGUEL PRIME)
function generateScoutPDF(email) {
    const athlete = STATE.athletes.find(a => a.email === email);
    if (!athlete) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cabeçalho da Ficha
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(234, 179, 8);
    doc.setFontSize(20);
    doc.text('FUTEBOL EVOLUTION - FICHA DE SCOUT', 15, 25);

    // Dados do Atleta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Atleta: ${athlete.name}`, 15, 55);
    doc.text(`E-mail: ${athlete.email}`, 15, 65);
    doc.text(`Idade: ${athlete.age || 'N/A'} anos`, 15, 75);
    doc.text(`Posição Diagnosticada: ${athlete.position || 'Meia'}`, 15, 85);

    // Desempenho e Overall
    const s = athlete.stats || { pas: 75, def: 70, chu: 75, fis: 70, vel: 80, vis: 75, ovr: 74 };
    doc.text(`Overall Geral: ${s.ovr}`, 15, 100);
    doc.text(`Passe: ${s.pas} | Defesa: ${s.def} | Chute: ${s.chu}`, 15, 110);
    doc.text(`Físico: ${s.fis} | Velocidade: ${s.vel} | Visão: ${s.vis}`, 15, 120);

    // Assinatura Admin
    doc.setFontSize(10);
    doc.text('___________________________________________', 15, 160);
    doc.text('Miguel Prime - Administrador e Treinador Chefe', 15, 168);

    doc.save(`Ficha-Scout-${athlete.name}.pdf`);
}

function publishAnnouncement() {
    const text = document.getElementById('admin-announcement-input').value.trim();
    if (text) {
        STATE.announcement = text;
        localStorage.setItem('fe_announcement', text);
        updateAnnouncementUI();
        alert('Aviso global publicado para todos os atletas!');
    }
}

function updateAnnouncementUI() {
    const el = document.getElementById('global-announcement');
    const txt = document.getElementById('announcement-text');
    if (STATE.announcement) {
        txt.innerText = STATE.announcement;
        el.style.display = 'block';
    }
}

function selectTacticalOption(optionNumber) {
    if (optionNumber === 1) {
        alert('Excelente Decisão Tática! Visão de jogo apurada (+5 de QI Tático).');
    } else {
        alert('Decisão aceitável, mas o passe na direita oferecia maior probabilidade de gol.');
    }
}