let radarChartInstance = null;
let timelineChartInstance = null;

// TROCA DE ABAS
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

    // Se voltar para a aba home, atualiza o dimensionamento dos gráficos
    if (tabId === 'home') {
        setTimeout(initCharts, 50);
    }
}

// CALCULADORA DE FÔLEGO DIÁRIO
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

// PREVIEW DA FOTO DO CARD
function previewPlayerPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.getElementById('player-img-preview');
            const defaultAvatar = document.getElementById('default-avatar');
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
            if (defaultAvatar) defaultAvatar.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

// MICROFONE DE VOZ
function startVoiceInput(targetId) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('O seu navegador não suporta a entrada por voz.');
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

// MODAL ADMIN (PIN: 1234)
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
        switchTab('admin', null);
    } else {
        alert('PIN Incorreto! Tente novamente.');
    }
}

// MURAL CMS
function updateCMS() {
    const text = document.getElementById('cms-input').value;
    if (text && text.trim() !== "") {
        document.getElementById('cms-notice-text').innerHTML = `<strong>MURAL DO TREINADOR:</strong> ${text}`;
        alert('Mural publicado com sucesso!');
    }
}

// FILTRO DE IDADE
function filterPlayersByAge() {
    const category = document.getElementById('age-category-filter').value;
    const catName = category === 'sub14' ? 'Até 14 anos' : '15 anos ou mais';
    alert(`Filtrando comparador para a categoria: ${catName}`);
}

// CARREGAMENTO E CRIAÇÃO DOS GRÁFICOS
function initCharts() {
    if (typeof Chart === 'undefined') {
        setTimeout(initCharts, 200);
        return;
    }

    // 1. Radar Chart
    const radarCanvas = document.getElementById('radarChart');
    if (radarCanvas) {
        if (radarChartInstance) {
            radarChartInstance.destroy();
        }
        radarChartInstance = new Chart(radarCanvas, {
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
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#1e293b' },
                        grid: { color: '#1e293b' },
                        pointLabels: { color: '#ffd700', font: { size: 11, weight: 'bold' } },
                        ticks: { display: false },
                        min: 0,
                        max: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // 2. Timeline Chart
    const timelineCanvas = document.getElementById('timelineChart');
    if (timelineCanvas) {
        if (timelineChartInstance) {
            timelineChartInstance.destroy();
        }
        timelineChartInstance = new Chart(timelineCanvas, {
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
}

// INICIALIZADORES DE CARREGAMENTO
window.addEventListener('DOMContentLoaded', initCharts);
window.addEventListener('load', initCharts);

async function perguntarAoGemini(promptTexto) {
    const vercelURL = 'https://futebol-evolution.vercel.app/api/gemini';

    try {
        const response = await fetch(vercelURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptTexto })
        });

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Resposta inesperada da IA:', data);
            return 'Não foi possível obter resposta da IA no momento.';
        }
    } catch (error) {
        console.error('Erro na ligação à Vercel:', error);
        return 'Erro de conexão com o servidor seguro.';
    }
}
async function processarAvaliaIA() {
    const resposta = document.getElementById('respostaAtleta').value.trim();
    const btn = document.getElementById('btnAvaliar');
    const boxFeedback = document.getElementById('feedbackTreinador');
    const textoFeedback = document.getElementById('textoFeedback');

    // Validação simples se o atleta escreveu algo
    if (!resposta) {
        alert("Por favor, escreve a tua resposta antes de enviar!");
        return;
    }

    // 1. Mostrar estado de carregamento
    btn.disabled = true;
    btn.innerText = "Treinador a analisar...";
    boxFeedback.style.display = "block";
    textoFeedback.innerText = "O Treinador IA está a analisar a tua resposta tática...";

    // 2. Criar o prompt com instruções para a IA agir como um Treinador Exigente
    const promptEngenharia = `
        Atua como um treinador profissional de futebol e avaliador tático.
        Um atleta respondeu à seguinte pergunta tática:
        "O teu equipa está a perder por 1-0 aos 80 minutos e o adversário faz pressão alta no teu meio-campo. Qual deve ser a tua decisão como médio-centro?"
        
        Resposta do atleta: "${resposta}"

        Responde com:
        1. Uma nota de 0 a 100 para a leitura tática dele.
        2. Um feedback curto (no máximo 3 frases) em tom motivador mas profissional, explicando o que ele fez bem e o que pode melhorar na decisão.
    `;

    // 3. Chamar o Gemini via Vercel
    const resultadoIA = await perguntarAoGemini(promptEngenharia);

    // 4. Exibir o resultado na tela
    textoFeedback.innerText = resultadoIA;

    // Restaurar botão
    btn.disabled = false;
    btn.innerText = "Enviar para Avaliação da IA";
}