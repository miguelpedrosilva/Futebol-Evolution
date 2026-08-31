// NAVEGAÇÃO ENTRE ABAS
function switchTab(tabId, event) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const targetTab = document.getElementById('tab-' + tabId);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// CALCULADORA DE CANSAÇO E FÔLEGO DIÁRIO
function calculateStamina(lossPercentage, btnElement) {
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) {
        btnElement.classList.add('active');
    }

    let remaining = 100 - lossPercentage;
    const valElem = document.getElementById('folego-val');
    const fillBar = document.getElementById('folego-fill-bar');
    const recText = document.getElementById('folego-rec');

    if (valElem) valElem.innerText = remaining + '%';
    if (fillBar) fillBar.style.width = remaining + '%';

    if (recText) {
        if (remaining >= 85) {
            recText.innerText = "Treino Indicado: Intenso / Alta Carga";
            recText.style.color = "#00ff88";
        } else if (remaining >= 60) {
            recText.innerText = "Treino Indicado: Moderado / Técnico";
            recText.style.color = "#ffd700";
        } else {
            recText.innerText = "Treino Indicado: Leve / Regenerativo";
            recText.style.color = "#ef4444";
        }
    }
}

// RECONHECIMENTO DE VOZ (MICROFONE NAS AVALIAÇÕES)
function startVoiceInput(targetId) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('O seu navegador não suporta a entrada por voz. Por favor, digite no campo de texto.');
        return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.start();

    recognition.onresult = function(event) {
        const text = event.results[0][0].transcript;
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.value = text;
        }
    };
}

// MODAL DO PAINEL ADMIN (PIN DE SEGURANÇA: 1234)
function openAdminModal() {
    const modal = document.getElementById('pin-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAdminModal() {
    const modal = document.getElementById('pin-modal');
    if (modal) modal.style.display = 'none';
}

function checkPin() {
    const inputPin = document.getElementById('pin-input').value;
    if (inputPin === '1234') {
        closeAdminModal();
        switchTab('admin');
    } else {
        alert('PIN Incorreto! Tente novamente.');
    }
}

// ATUALIZAR MURAL DO TREINADOR (CMS)
function updateCMS() {
    const text = document.getElementById('cms-input').value;
    if (text.trim() !== "") {
        document.getElementById('cms-notice-text').innerHTML = `<strong>MURAL DO TREINADOR:</strong> ${text}`;
        alert('Mural publicado com sucesso!');
    }
}

// FILTRO DE CATEGORIA POR IDADE NO COMPARADOR
function filterPlayersByAge() {
    const category = document.getElementById('age-category-filter').value;
    const catName = category === 'sub14' ? 'Até 14 anos' : '15 anos ou mais';
    alert(`Filtrando comparador para a categoria: ${catName}`);
}

// INICIALIZAÇÃO DE GRÁFICOS (CHART.JS)
document.addEventListener('DOMContentLoaded', function() {
    // 1. RADAR DE ATRIBUTOS EA FC / FIFA
    const radarCanvas = document.getElementById('radarChart');
    if (radarCanvas) {
        const ctxRadar = radarCanvas.getContext('2d');
        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['PAS', 'CHU', 'VEL', 'FIS', 'DEF', 'TAC'],
                datasets: [{
                    label: 'Atributos OVR',
                    data: [85, 80, 92, 78, 65, 86],
                    backgroundColor: 'rgba(0, 255, 136, 0.25)',
                    borderColor: '#00ff88',
                    pointBackgroundColor: '#ffd700',
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    r: {
                        angleLines: { color: '#1e293b' },
                        grid: { color: '#1e293b' },
                        pointLabels: { color: '#ffd700', font: { size: 12, weight: 'bold' } },
                        ticks: { display: false },
                        min: 0,
                        max: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // 2. TIMELINE DE EVOLUÇÃO OVR
    const timelineCanvas = document.getElementById('timelineChart');
    if (timelineCanvas) {
        const ctxTimeline = timelineCanvas.getContext('2d');
        new Chart(ctxTimeline, {
            type: 'line',
            data: {
                labels: ['Mês 1', 'Mês 2', 'Mês 3', 'Mês 4', 'Atual'],
                datasets: [{
                    label: 'Evolução OVR',
                    data: [72, 75, 79, 82, 85],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
                    x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
});