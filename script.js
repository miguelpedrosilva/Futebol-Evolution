/* ==========================================================================
   FUTEBOL EVOLUTION v2.0 - JAVASCRIPT COMPLETO & REVISADO
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. ESTADO GLOBAL DA APLICAÇÃO
// --------------------------------------------------------------------------
let radarChartInstance = null;

// Dados do Atleta Padrão (Podem ser alterados no Admin ou Form)
let athleteProfile = {
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
// 2. INICIALIZAÇÃO E EVENT LISTENERS
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    // Configura o formulário de login/cadastro se existir no DOM
    const authForm = document.getElementById("auth-form");
    if (authForm) {
        authForm.addEventListener("submit", handleLogin);
    }

    // Atualiza a interface com os dados iniciais do atleta
    updateAthleteUI();
});

// --------------------------------------------------------------------------
// 3. SISTEMA DE NAVEGAÇÃO DE TELAS (SWITCH VIEW)
// --------------------------------------------------------------------------
/**
 * Alterna visibilidade entre as seções da aplicação sem recarregar a página
 * @param {string} viewId - ID do elemento da seção ('hero-view', 'login-view', 'dashboard-view', 'admin-view')
 */
function switchView(viewId) {
    const views = ['hero-view', 'login-view', 'dashboard-view', 'admin-view'];

    views.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = (id === viewId) ? 'block' : 'none';
        }
    });

    // Se a view for a Dashboard, renderiza/redesenha o Gráfico de Radar
    if (viewId === 'dashboard-view') {
        // Pequeno atraso para garantir que a div esteja visível antes do Chart.js calcular as dimensões
        setTimeout(() => {
            renderRadarChart();
        }, 100);
    }

    // Rola suavemente até o topo da página ao mudar de tela
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 4. AUTENTICAÇÃO E CADASTRO
// --------------------------------------------------------------------------
/**
 * Processa a entrada/cadastro do usuário no sistema
 * @param {Event} event 
 */
function handleLogin(event) {
    if (event) event.preventDefault();

    const profileSelect = document.getElementById('access-profile');
    const nameInput = document.getElementById('user-name');
    const emailInput = document.getElementById('user-email');

    if (nameInput && nameInput.value.trim() !== '') {
        athleteProfile.nome = nameInput.value.trim();
    }
    
    if (emailInput && emailInput.value.trim() !== '') {
        athleteProfile.email = emailInput.value.trim();
    }

    const selectedProfile = profileSelect ? profileSelect.value : 'atleta';
    athleteProfile.perfil = selectedProfile;

    // Atualiza elementos visuais da interface
    updateAthleteUI();

    // Redirecionamento por perfil
    if (selectedProfile === 'admin') {
        switchView('admin-view');
    } else {
        switchView('dashboard-view');
    }
}

/**
 * Realiza o encerramento da sessão
 */
function logout() {
    switchView('hero-view');
}

// --------------------------------------------------------------------------
// 5. ATUALIZAÇÃO DA INTERFACE DO ATLETA & CARDS
// --------------------------------------------------------------------------
/**
 * Sincroniza os dados do objeto JavaScript com o HTML
 */
function updateAthleteUI() {
    // Nome e Posição
    const nameEl = document.getElementById('card-athlete-name');
    const posEl = document.getElementById('card-position');
    const overallEl = document.getElementById('card-overall');

    if (nameEl) nameEl.innerText = athleteProfile.nome;
    if (posEl) posEl.innerText = athleteProfile.posicao;
    if (overallEl) overallEl.innerText = athleteProfile.overall;

    // Valores dos Atributos individuais
    const attrs = athleteProfile.atributos;
    for (const key in attrs) {
        const attrElement = document.getElementById(`val-${key}`);
        if (attrElement) {
            attrElement.innerText = attrs[key];
        }
    }

    // Se o gráfico já existir, atualiza os dados em tempo real
    if (radarChartInstance) {
        radarChartInstance.data.datasets[0].data = [
            attrs.pas, attrs.rit, attrs.fin, attrs.dri, attrs.def, attrs.fis
        ];
        radarChartInstance.update();
    }
}

// --------------------------------------------------------------------------
// 6. RENDERIZAÇÃO DO GRÁFICO DE RADAR (CHART.JS)
// --------------------------------------------------------------------------
/**
 * Inicializa ou recria o gráfico de teia tática (Radar Chart)
 */
function renderRadarChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const attrs = athleteProfile.atributos;

    // Se o gráfico já existe, destrói para recriar de forma limpa
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
                backgroundColor: 'rgba(0, 230, 118, 0.25)',  // Verde Menta Transparente
                borderColor: '#00e676',                      // Verde Vibrante
                borderWidth: 2,
                pointBackgroundColor: '#f59e0b',             // Pontos em Dourado
                pointBorderColor: '#ffffff',
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#f59e0b',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    angleLines: { 
                        color: '#1e293b' // Linhas de fundo escuras
                    },
                    grid: { 
                        color: '#1e293b' 
                    },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { 
                            size: 11, 
                            weight: 'bold', 
                            family: "'Inter', sans-serif" 
                        }
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
                legend: { 
                    display: false 
                },
                tooltip: {
                    backgroundColor: '#131c2e',
                    titleColor: '#00e676',
                    bodyColor: '#ffffff',
                    borderColor: '#1e293b',
                    borderWidth: 1
                }
            }
        }
    });
}

// --------------------------------------------------------------------------
// 7. FUNÇÕES DO PAINEL ADMIN
// --------------------------------------------------------------------------
/**
 * Atualiza os atributos de um atleta via Painel Admin
 * @param {Object} newAttributes - Objeto com os novos atributos
 */
function updateAthleteAttributes(newAttributes) {
    if (!newAttributes) return;

    athleteProfile.atributos = { ...athleteProfile.atributos, ...newAttributes };
    
    // Recalcula o Overall médio
    const vals = Object.values(athleteProfile.atributos);
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    athleteProfile.overall = avg;

    updateAthleteUI();
}