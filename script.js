// STATE E DADOS LOCAIS DA APLICAÇÃO
let athleteData = JSON.parse(localStorage.getItem('FE_athleteData')) || {
    nome: "Arthur Silva",
    dob: "2009-05-14",
    altura: "175 cm",
    peso: "68 kg",
    posicao: "MEI",
    modalidade: "campo",
    stats: { pas: 91, def: 78, chu: 86, fis: 85, vel: 90, vis: 92 },
    streak: 14,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop"
};

let isAdminLoggedIn = false;
let timerInterval = null;
let currentRadarChart = null;
let currentLineChart = null;

// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    updatePositionsOptions();
    renderAthleteData();
    initCharts();
    renderWorkouts('casa', true);
});

// ALTA DE NAVEGAÇÃO / ABA
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const selectedTab = document.getElementById(`tab-${tabId}`);
    const selectedBtn = document.getElementById(`nav-${tabId}`);

    if (selectedTab) selectedTab.classList.remove('hidden');
    if (selectedBtn) selectedBtn.classList.add('active');
}

// ATUALIZAÇÃO DAS OPÇÕES DE POSIÇÃO
function updatePositionsOptions() {
    const mod = document.getElementById('quiz-modalidade').value;
    const posSelect = document.getElementById('quiz-posicao');
    posSelect.innerHTML = '';

    const options = (mod === 'quadra') 
        ? ['Goleiro', 'Fixo', 'Ala', 'Pivô'] 
        : ['Goleiro', 'Zagueiro', 'Meia', 'Atacante'];

    options.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.substring(0, 3).toUpperCase();
        opt.textContent = p;
        posSelect.appendChild(opt);
    });
}

// ATUALIZA INTERFACE COM DADOS DO ATLETA
function renderAthleteData() {
    const overall = Math.round((athleteData.stats.pas + athleteData.stats.def + athleteData.stats.chu + athleteData.stats.fis + athleteData.stats.vel + athleteData.stats.vis) / 6);
    
    // Nomes
    document.getElementById('dash-atleta-nome').textContent = athleteData.nome;
    document.getElementById('sidebar-name').textContent = athleteData.nome;
    document.getElementById('card-nome').textContent = athleteData.nome;
    document.getElementById('full-card-nome').textContent = athleteData.nome;

    // Stats Card Mini
    document.getElementById('card-overall').textContent = overall;
    document.getElementById('card-pos').textContent = athleteData.posicao;
    document.getElementById('stat-pas').textContent = athleteData.stats.pas;
    document.getElementById('stat-def').textContent = athleteData.stats.def;
    document.getElementById('stat-chu').textContent = athleteData.stats.chu;
    document.getElementById('stat-fis').textContent = athleteData.stats.fis;
    document.getElementById('stat-vel').textContent = athleteData.stats.vel;
    document.getElementById('stat-vis').textContent = athleteData.stats.vis;

    // Stats Card Full
    document.getElementById('full-card-overall').textContent = overall;
    document.getElementById('full-card-pos').textContent = athleteData.posicao;
    document.getElementById('full-stat-pas').textContent = athleteData.stats.pas;
    document.getElementById('full-stat-def').textContent = athleteData.stats.def;
    document.getElementById('full-stat-chu').textContent = athleteData.stats.chu;
    document.getElementById('full-stat-fis').textContent = athleteData.stats.fis;
    document.getElementById('full-stat-vel').textContent = athleteData.stats.vel;
    document.getElementById('full-stat-vis').textContent = athleteData.stats.vis;

    localStorage.setItem('FE_athleteData', JSON.stringify(athleteData));
}

// GRÁFICOS DINÂMICOS VIA CHART.JS
function initCharts() {
    const ctxRadar = document.getElementById('chartRadar').getContext('2d');
    const ctxLine = document.getElementById('chartLine').getContext('2d');

    if (currentRadarChart) currentRadarChart.destroy();
    if (currentLineChart) currentLineChart.destroy();

    currentRadarChart = new Chart(ctxRadar, {
        type: 'radar',
        data: {
            labels: ['PAS', 'DEF', 'CHU', 'FIS', 'VEL', 'VIS'],
            datasets: [{
                label: 'Atributos Táticos',
                data: [athleteData.stats.pas, athleteData.stats.def, athleteData.stats.chu, athleteData.stats.fis, athleteData.stats.vel, athleteData.stats.vis],
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: '#10b981',
                borderWidth: 2,
                pointBackgroundColor: '#10b981'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: '#334155' } } },
            plugins: { legend: { display: false } }
        }
    });

    currentLineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4'],
            datasets: [{
                label: 'Progresso',
                data: [72, 78, 83, 88],
                borderColor: '#10b981',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 50, max: 100, grid: { color: '#334155' } }, x: { grid: { display: false } } },
            plugins: { legend: { display: false } }
        }
    });
}

// CRONÔMETRO DE DESCANSO
function startRestTimer(seconds) {
    clearInterval(timerInterval);
    let remaining = seconds;
    const display = document.getElementById('timer-display');

    timerInterval = setInterval(() => {
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        display.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (--remaining < 0) {
            clearInterval(timerInterval);
            display.textContent = "DESCANSO CONCLUÍDO! 🔥";
        }
    }, 1000);
}

function skipRestTimer() {
    clearInterval(timerInterval);
    document.getElementById('timer-display').textContent = "PRONTO! ⚡";
}

// RENDER DE EXERCÍCIOS
function renderWorkouts(local, comBola) {
    const list = document.getElementById('workout-list');
    list.innerHTML = '';

    const treinos = [
        { titulo: "Passe & Visão Periférica", series: "3 Série x 15 Repetições", desc: "Controle de bola rápido virando a cabeça antes do receção." },
        { titulo: "Explosão Curta & Mudança de Direção", series: "4 Séries x 10m", desc: "Pique de aceleração com foco na recuperação física rápida." },
        { titulo: "Prevenção & Mobilidade de Quadril", series: "2 Séries x 12 Repetições", desc: "Exercício fundamental para evitar dores e lesões no joelho." }
    ];

    treinos.forEach(t => {
        list.innerHTML += `
            <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                    <span class="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">${local} • ${comBola ? 'Com Bola' : 'Sem Bola'}</span>
                    <h4 class="text-sm font-bold text-white mt-2">${t.titulo}</h4>
                    <p class="text-xs text-slate-400 mt-1">${t.desc}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>${t.series}</span>
                    <i class="fa-solid fa-circle-play text-emerald-400 text-base"></i>
                </div>
            </div>
        `;
    });
}

function setWorkoutFilter(local, comBola) {
    document.querySelectorAll('.wk-filter').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderWorkouts(local, comBola);
}

// EXPORTAR FUTUCARD EM PNG
function downloadFutuCard() {
    const cardNode = document.getElementById('futucard-full');
    html2canvas(cardNode, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `FutuCard_${athleteData.nome.replace(/\s+/g, '_')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// PAINEL ADMIN (MIGUEL PRIME)
function loginAdmin() {
    const pin = document.getElementById('admin-pin-input').value;
    if (pin === '3020') {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-box').classList.add('hidden');
        document.getElementById('admin-dashboard').classList.remove('hidden');
        renderAdminTable();
    } else {
        alert("PIN Incorreto! Acesso negado.");
    }
}

function logoutAdmin() {
    isAdminLoggedIn = false;
    document.getElementById('admin-login-box').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function renderAdminTable() {
    const table = document.getElementById('admin-athletes-table');
    table.innerHTML = `
        <tr>
            <td class="py-3 flex items-center gap-2">
                <img src="${athleteData.avatar}" class="w-6 h-6 rounded-full object-cover">
                ${athleteData.nome}
            </td>
            <td class="py-3">${athleteData.posicao}</td>
            <td class="py-3 text-emerald-400">88</td>
            <td class="py-3">
                <button onclick="alert('Relatório PDF gerado para o atleta!')" class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">Ficha Scout PDF</button>
            </td>
        </tr>
    `;
}

function publishAnnouncement() {
    const txt = document.getElementById('admin-aviso-input').value;
    if (txt) {
        document.getElementById('mural-avisos').classList.remove('hidden');
        document.getElementById('mural-texto').textContent = txt;
        document.getElementById('admin-aviso-input').value = '';
        alert("Aviso publicado no topo da plataforma de todos os atletas!");
    }
}