/* ==========================================================================
   FUTEBOL EVOLUTION - JAVASCRIPT PRINCIPAL v2.0
   ========================================================================== */

// Instância global do gráfico de radar
let radarChartInstance = null;

// Objeto do Atleta (Dados em memória)
const athleteData = {
    nome: "Lucas Silva",
    email: "lucas@atleta.com",
    perfil: "atleta",
    overall: 88,
    posicao: "MEI - Meia Atacante",
    atributos: {
        pas: 85, // Passe
        rit: 90, // Ritmo
        fin: 82, // Finalização
        dri: 89, // Drible
        def: 65, // Defesa
        fis: 78  // Físico
    }
};

// --------------------------------------------------------------------------
// Inicialização
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    updateCardUI();
});

// --------------------------------------------------------------------------
// Navegação de Telas sem Recarregar
// --------------------------------------------------------------------------
function switchView(viewId) {
    const views = ['hero-view', 'login-view', 'dashboard-view', 'admin-view'];

    views.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = (id === viewId) ? 'block' : 'none';
        }
    });

    // Se for para a Dashboard, inicializa ou atualiza o Gráfico de Radar
    if (viewId === 'dashboard-view') {
        setTimeout(renderRadarChart, 100);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// Processamento do Formulário de Login/Cadastro
// --------------------------------------------------------------------------
function handleLogin(event) {
    if (event) event.preventDefault();

    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');
    const profileSelect = document.getElementById('access-profile');

    if (nameInput && nameInput.value.trim() !== '') {
        athleteData.nome = nameInput.value.trim();
    }
    
    if (emailInput && emailInput.value.trim() !== '') {
        athleteData.email = emailInput.value.trim();
    }

    const selectedProfile = profileSelect ? profileSelect.value : 'atleta';
    athleteData.perfil = selectedProfile;

    // Atualiza a tela com os novos dados
    updateCardUI();

    // Redireciona
    if (selectedProfile === 'admin') {
        switchView('admin-view');
    } else {
        switchView('dashboard-view');
    }
}

// --------------------------------------------------------------------------
// Atualiza a Interface do Atleta
// --------------------------------------------------------------------------
function updateCardUI() {
    const nameEl = document.getElementById('card-athlete-name');
    const posEl = document.getElementById('card-position');
    const overallEl = document.getElementById('card-overall');

    if (nameEl) nameEl.innerText = athleteData.nome;
    if (posEl) posEl.innerText = athleteData.posicao;
    if (overallEl) overallEl.innerText = athleteData.overall;

    const attrs = athleteData.atributos;
    for (const key in attrs) {
        const el = document.getElementById(`val-${key}`);
        if (el) el.innerText = attrs[key];
    }
}

// --------------------------------------------------------------------------
// Renderização do Gráfico de Radar (Chart.js)
// --------------------------------------------------------------------------
function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const attrs = athleteData.atributos;

    // Se o gráfico já existia, destrói antes de criar um novo para não sobrepor
    if (radarChartInstance) {
        radarChartInstance.destroy();
    }

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: [
                'PAS (Passe)', 
                'RIT (Ritmo)', 
                'FIN (Finalização)', 
                'DRI (Drible)', 
                'DEF (Defesa)', 
                'FIS (Físico)'
            ],
            datasets: [{
                label: 'Atributos Táticos',
                data: [attrs.pas, attrs.rit, attrs.fin, attrs.dri, attrs.def, attrs.fis],
                backgroundColor: 'rgba(0, 230, 118, 0.25)',  // Verde Menta
                borderColor: '#00e676',                      // Verde Vibrante
                borderWidth: 2,
                pointBackgroundColor: '#f59e0b',             // Dourado
                pointBorderColor: '#ffffff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: { color: '#1e293b' },
                    grid: { color: '#1e293b' },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { size: 11, weight: 'bold', family: "'Inter', sans-serif" }
                    },
                    ticks: {
                        color: '#64748b',
                        backdropColor: 'transparent',
                        stepSize: 20
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}