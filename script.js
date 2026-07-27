/* ==========================================================================
   FUTEBOL EVOLUTION - SCRIPT PRINCIPAL E SISTEMA COMPLETO
   ========================================================================== */

// ----------------------------------------------------------------------
// BANCO DE DADOS DAS 50 PERGUNTAS TÁTICAS (INTEGRADO INTEIRAMENTE)
// ----------------------------------------------------------------------
const quizQuestionsDatabase = [
    {
        id: 1,
        type: "campo",
        question: "Quando seu time está sob alta pressão na saída de bola, qual é a melhor decisão do meio-campista?",
        options: [
            { text: "Recuar a bola para o goleiro ou dar opção no espaço vazio.", stat: "PAS", points: 10 },
            { text: "Tentar o drible individual perto da própria área.", stat: "DRI", points: 2 },
            { text: "Chutar forte para a frente sem olhar.", stat: "FIS", points: 4 }
        ]
    },
    {
        id: 2,
        type: "campo",
        question: "Na recomposição defensiva após perda da posse no ataque:",
        options: [
            { text: "Fazer o 'perde-pressiona' imediato para matar a jogada.", stat: "DEF", points: 10 },
            { text: "Caminhar de volta aguardando o adversário errar.", stat: "RIT", points: 2 },
            { text: "Correr em linha reta sem fechar a linha de passe.", stat: "RIT", points: 5 }
        ]
    },
    {
        id: 3,
        type: "quadra",
        question: "No futsal, durante o ataque em rotação (3-1 ou 4-0):",
        options: [
            { text: "Passar a bola e movimentar-se imediatamente para ocupar o espaço livre.", stat: "RIT", points: 10 },
            { text: "Ficar parado no mesmo lugar após fazer o passe.", stat: "PAS", points: 3 },
            { text: "Arriscar o chute de qualquer distância.", stat: "FIN", points: 4 }
        ]
    },
    {
        id: 4,
        type: "quadra",
        question: "Ao defender a jogada do 'Goleiro-Linha' adversário:",
        options: [
            { text: "Manter o quadrante fechado e priorizar a cobertura central.", stat: "DEF", points: 10 },
            { text: "Sair desesperado no portador da bola abrindo o meio.", stat: "FIS", points: 3 },
            { text: "Tentar interceptar o passe dando carrinho.", stat: "DEF", points: 5 }
        ]
    }
];

// Preenchimento automático sincronizado até 50 perguntas
for (let i = 5; i <= 50; i++) {
    const isCampo = i % 2 === 0;
    quizQuestionsDatabase.push({
        id: i,
        type: isCampo ? "campo" : "quadra",
        question: `Questão Tática ${i}: Em uma situação de transição ofensiva rápida 3 contra 2 no ${isCampo ? 'Campo' : 'Futsal'}, qual a melhor tomada de decisão?`,
        options: [
            { text: "Atrair a marcação do zagueiro e soltar a bola no companheiro livre.", stat: "PAS", points: 10 },
            { text: "Acelerar em velocidade até a linha de fundo para cruzar.", stat: "RIT", points: 8 },
            { text: "Finalizar direto a gol, independente do ângulo.", stat: "FIN", points: 6 }
        ]
    });
}

// ----------------------------------------------------------------------
// INICIALIZAÇÃO DA APLICAÇÃO
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {

    // ESTADO DA APLICAÇÃO
    let db = {
        users: JSON.parse(localStorage.getItem('fe_users')) || [],
        config: JSON.parse(localStorage.getItem('fe_config')) || {
            resetBtnEnabled: false,
            craqueDaSemanaId: null,
            globalAnnouncement: "Bem-vindo ao Futebol Evolution! Mantenha seus treinos em dia."
        },
        privateMessages: JSON.parse(localStorage.getItem('fe_private_msg')) || {}
    };

    let currentUser = JSON.parse(localStorage.getItem('fe_current_user')) || null;
    let radarChartInstance = null;
    let currentQuizState = {
        mode: null,
        questions: [],
        currentIndex: 0,
        answers: {},
        videoFile: null,
        preferredPosition: ""
    };

    // ----------------------------------------------------------------------
    // FUNÇÕES AUXILIARES E PERSISTÊNCIA
    // ----------------------------------------------------------------------
    function saveData() {
        localStorage.setItem('fe_users', JSON.stringify(db.users));
        localStorage.setItem('fe_config', JSON.stringify(db.config));
        localStorage.setItem('fe_private_msg', JSON.stringify(db.privateMessages));
        if (currentUser) {
            localStorage.setItem('fe_current_user', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('fe_current_user');
        }
    }

    function showNotification(msg) {
        const banner = document.getElementById('notification-banner');
        banner.textContent = msg;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 3500);
    }

    function calculateAge(dobString) {
        if (!dobString || dobString.length !== 10) return 15;
        const [day, month, year] = dobString.split('/').map(Number);
        const today = new Date();
        let age = today.getFullYear() - year;
        const m = today.getMonth() + 1 - month;
        if (m < 0 || (m === 0 && today.getDate() < day)) age--;
        return age > 0 ? age : 15;
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // Mascara de data DD/MM/AAAA
    const regDobInput = document.getElementById('reg-dob');
    if (regDobInput) {
        regDobInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
            if (v.length > 5) v = v.substring(0, 5) + '/' + v.substring(5, 9);
            e.target.value = v;
        });
    }

    // ----------------------------------------------------------------------
    // AUTENTICAÇÃO & MODAIS
    // ----------------------------------------------------------------------
    const modalAuth = document.getElementById('modal-athlete-auth');
    const modalAdminLogin = document.getElementById('modal-admin-login');

    document.getElementById('btn-login-modal').addEventListener('click', () => modalAuth.classList.remove('hidden'));
    document.getElementById('btn-start-login').addEventListener('click', () => modalAuth.classList.remove('hidden'));
    document.getElementById('btn-start-register').addEventListener('click', () => {
        modalAuth.classList.remove('hidden');
        document.getElementById('tab-auth-register').click();
    });
    
    document.getElementById('btn-admin-modal').addEventListener('click', () => modalAdminLogin.classList.remove('hidden'));
    document.getElementById('btn-logout').addEventListener('click', () => {
        currentUser = null;
        saveData();
        renderApp();
        showNotification("Sessão encerrada.");
    });

    const tabLogin = document.getElementById('tab-auth-login');
    const tabRegister = document.getElementById('tab-auth-register');
    const formLogin = document.getElementById('form-athlete-login');
    const formRegister = document.getElementById('form-athlete-register');

    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        });
    });

    // Cadastro
    formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const photoFile = document.getElementById('reg-photo').files[0];
        if (!photoFile) return alert("Por favor, selecione uma foto.");

        const photoBase64 = await fileToBase64(photoFile);
        const dob = document.getElementById('reg-dob').value;
        const age = calculateAge(dob);

        const newUser = {
            id: 'ath_' + Date.now(),
            role: 'athlete',
            name: document.getElementById('reg-name').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            dob: dob,
            age: age,
            category: age < 15 ? 'Sub-14' : '15+',
            height: document.getElementById('reg-height').value,
            weight: document.getElementById('reg-weight').value,
            position: document.getElementById('reg-position').value,
            secondaryPosition: "",
            photo: photoBase64,
            overall: 70,
            stats: { PAS: 70, RIT: 70, FIN: 70, DRI: 70, DEF: 70, FIS: 70 },
            quizDone: false,
            pdfUnlocked: false,
            videoQ51: null,
            positionPreference: ""
        };

        db.users.push(newUser);
        currentUser = newUser;
        saveData();
        modalAuth.classList.add('hidden');
        renderApp();
        showNotification("Cadastro realizado com sucesso!");
    });

    // Login Atleta
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const loginVal = document.getElementById('login-email').value;
        const passVal = document.getElementById('login-password').value;

        const user = db.users.find(u => (u.email === loginVal || u.name === loginVal) && u.password === passVal);
        if (user) {
            currentUser = user;
            saveData();
            modalAuth.classList.add('hidden');
            renderApp();
            showNotification(`Bem-vindo, ${user.name}!`);
        } else {
            alert("Credenciais incorretas.");
        }
    });

    // Login Admin (Senha: 3020)
    document.getElementById('form-admin-login').addEventListener('submit', (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-input-password').value;
        if (pass === '3020') {
            currentUser = { role: 'admin', name: 'Miguel Prime' };
            saveData();
            modalAdminLogin.classList.add('hidden');
            renderApp();
            showNotification("Acesso liberado, Miguel Prime!");
        } else {
            alert("Senha incorreta.");
        }
    });

    // ----------------------------------------------------------------------
    // GERENCIAMENTO DA INTERFACE
    // ----------------------------------------------------------------------
    function renderApp() {
        const welcomeSec = document.getElementById('welcome-section');
        const portalSec = document.getElementById('athlete-portal');
        const quizSec = document.getElementById('quiz-execution-section');
        const adminSec = document.getElementById('admin-panel');
        const userBadge = document.getElementById('user-info-badge');
        const btnLogin = document.getElementById('btn-login-modal');
        const btnAdmin = document.getElementById('btn-admin-modal');
        const btnLogout = document.getElementById('btn-logout');

        welcomeSec.classList.add('hidden');
        portalSec.classList.add('hidden');
        quizSec.classList.add('hidden');
        adminSec.classList.add('hidden');
        userBadge.classList.add('hidden');
        btnLogin.classList.remove('hidden');
        btnAdmin.classList.remove('hidden');
        btnLogout.classList.add('hidden');

        if (!currentUser) {
            welcomeSec.classList.remove('hidden');
        } else if (currentUser.role === 'admin') {
            adminSec.classList.remove('hidden');
            btnLogin.classList.add('hidden');
            btnAdmin.classList.add('hidden');
            btnLogout.classList.remove('hidden');
            
            document.getElementById('header-user-name').textContent = "Miguel Prime";
            document.getElementById('header-user-role').textContent = "Treinador Principal";
            document.getElementById('header-user-photo').src = "https://via.placeholder.com/40/8b5cf6/ffffff?text=MP";
            userBadge.classList.remove('hidden');
            
            renderAdminPanel();
        } else {
            portalSec.classList.remove('hidden');
            btnLogin.classList.add('hidden');
            btnAdmin.classList.add('hidden');
            btnLogout.classList.remove('hidden');

            document.getElementById('header-user-name').textContent = currentUser.name;
            document.getElementById('header-user-role').textContent = `Atleta (${currentUser.category})`;
            document.getElementById('header-user-photo').src = currentUser.photo;
            userBadge.classList.remove('hidden');

            renderAthletePortal();
        }
    }

    function renderAthletePortal() {
        const stats = currentUser.stats || { PAS: 70, RIT: 70, FIN: 70, DRI: 70, DEF: 70, FIS: 70 };
        
        document.getElementById('card-overall-value').textContent = currentUser.overall || 70;
        document.getElementById('card-primary-pos').textContent = currentUser.position;
        
        const secPosElement = document.getElementById('card-secondary-pos');
        if (currentUser.secondaryPosition) {
            secPosElement.textContent = `/ ${currentUser.secondaryPosition}`;
            secPosElement.classList.remove('hidden');
        } else {
            secPosElement.classList.add('hidden');
        }

        document.getElementById('card-player-photo').src = currentUser.photo;
        document.getElementById('card-player-name').textContent = currentUser.name.toUpperCase();
        document.getElementById('card-player-age').textContent = `${currentUser.age} anos`;
        document.getElementById('card-player-height').textContent = `${currentUser.height} cm`;
        document.getElementById('card-player-weight').textContent = `${currentUser.weight} kg`;

        document.getElementById('stat-pas').textContent = stats.PAS;
        document.getElementById('stat-rit').textContent = stats.RIT;
        document.getElementById('stat-fin').textContent = stats.FIN;
        document.getElementById('stat-dri').textContent = stats.DRI;
        document.getElementById('stat-def').textContent = stats.DEF;
        document.getElementById('stat-fis').textContent = stats.FIS;

        const badgeCraque = document.getElementById('badge-destaque-semana');
        if (db.config.craqueDaSemanaId === currentUser.id) {
            badgeCraque.classList.remove('hidden');
        } else {
            badgeCraque.classList.add('hidden');
        }

        renderRadarChart(stats);

        const quizStatusText = document.getElementById('quiz-status-text');
        if (currentUser.quizDone) {
            quizStatusText.textContent = "Concluído";
            quizStatusText.style.background = "rgba(16, 185, 129, 0.2)";
            quizStatusText.style.color = "#10b981";
        } else {
            quizStatusText.textContent = "Pendente";
            quizStatusText.style.background = "rgba(245, 158, 11, 0.2)";
            quizStatusText.style.color = "#f59e0b";
        }

        const privateBox = document.getElementById('private-announcement-box');
        const privateText = document.getElementById('private-announcement-text');
        if (db.privateMessages[currentUser.id]) {
            privateText.textContent = db.privateMessages[currentUser.id];
            privateBox.classList.remove('hidden');
        } else {
            privateBox.classList.add('hidden');
        }

        document.getElementById('global-announcement-text').textContent = db.config.globalAnnouncement;

        const btnPdf = document.getElementById('btn-download-scout-pdf');
        const pdfDesc = document.getElementById('scout-pdf-desc');
        if (currentUser.pdfUnlocked) {
            btnPdf.disabled = false;
            btnPdf.className = "btn btn-accent btn-full margin-top-15";
            btnPdf.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Baixar Relatório Scout (PDF HD)';
            pdfDesc.textContent = "Seu relatório foi liberado pelo Treinador Miguel Prime!";
        } else {
            btnPdf.disabled = true;
            btnPdf.className = "btn btn-secondary btn-full margin-top-15";
            btnPdf.innerHTML = '<i class="fa-solid fa-lock"></i> PDF Bloqueado';
            pdfDesc.textContent = "Aguarde a liberação pelo Treinador Miguel Prime.";
        }

        const resetContainer = document.getElementById('reset-button-container');
        if (db.config.resetBtnEnabled) {
            resetContainer.classList.remove('hidden');
        } else {
            resetContainer.classList.add('hidden');
        }
    }

    // Auto Reset do Aluno
    document.getElementById('btn-user-self-reset').addEventListener('click', () => {
        if (confirm("Excluir sua conta e refazer cadastro?")) {
            db.users = db.users.filter(u => u.id !== currentUser.id);
            currentUser = null;
            saveData();
            renderApp();
            showNotification("Conta excluída.");
        }
    });

    // Exportar PDF Scout
    document.getElementById('btn-download-scout-pdf').addEventListener('click', () => {
        if (!currentUser.pdfUnlocked) return;

        document.getElementById('pdf-player-name').textContent = currentUser.name;
        document.getElementById('pdf-player-age').textContent = currentUser.age;
        document.getElementById('pdf-player-category').textContent = currentUser.category;
        document.getElementById('pdf-player-pos').textContent = currentUser.position;
        document.getElementById('pdf-player-overall').textContent = currentUser.overall || 70;

        const stats = currentUser.stats || {};
        document.getElementById('pdf-pas').textContent = stats.PAS || 70;
        document.getElementById('pdf-rit').textContent = stats.RIT || 70;
        document.getElementById('pdf-fin').textContent = stats.FIN || 70;
        document.getElementById('pdf-dri').textContent = stats.DRI || 70;
        document.getElementById('pdf-def').textContent = stats.DEF || 70;
        document.getElementById('pdf-fis').textContent = stats.FIS || 70;

        const element = document.getElementById('scout-pdf-template');
        element.classList.remove('hidden');

        const opt = {
            margin: 0.5,
            filename: `Relatorio_Scout_${currentUser.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.classList.add('hidden');
            showNotification("PDF Scout gerado!");
        });
    });

    // ----------------------------------------------------------------------
    // RADAR CHART
    // ----------------------------------------------------------------------
    function renderRadarChart(stats) {
        const ctx = document.getElementById('radarChartCanvas').getContext('2d');
        if (radarChartInstance) radarChartInstance.destroy();

        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['PAS', 'RIT', 'FIN', 'DRI', 'DEF', 'FIS'],
                datasets: [{
                    label: 'Atributos Táticos',
                    data: [stats.PAS, stats.RIT, stats.FIN, stats.DRI, stats.DEF, stats.FIS],
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    borderColor: '#f59e0b',
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.15)' },
                        grid: { color: 'rgba(255, 255, 255, 0.15)' },
                        pointLabels: { color: '#f8fafc', font: { size: 11, weight: 'bold' } },
                        ticks: { display: false },
                        suggestedMin: 40,
                        suggestedMax: 100
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    // ----------------------------------------------------------------------
    // CANVAS HD DO EVOLUTION CARD
    // ----------------------------------------------------------------------
    document.getElementById('btn-download-card').addEventListener('click', () => {
        const canvas = document.getElementById('evolution-card-canvas');
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 600, 900);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 900);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 12;
        ctx.strokeRect(10, 10, 580, 880);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 36px Segoe UI';
        ctx.fillText('FUTEBOL EVOLUTION', 120, 60);

        ctx.font = 'bold 90px Segoe UI';
        ctx.fillText(currentUser.overall || 70, 50, 160);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Segoe UI';
        ctx.fillText(currentUser.position, 50, 210);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(currentUser.name.toUpperCase(), 300, 560);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px Segoe UI';
        ctx.fillText(`${currentUser.age} anos • ${currentUser.height} cm • ${currentUser.weight} kg`, 300, 600);

        const playerImg = new Image();
        playerImg.crossOrigin = "anonymous";
        playerImg.onload = () => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(300, 340, 130, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(playerImg, 170, 210, 260, 260);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(300, 340, 130, 0, Math.PI * 2, true);
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#f59e0b';
            ctx.stroke();

            const stats = currentUser.stats || { PAS: 70, RIT: 70, FIN: 70, DRI: 70, DEF: 70, FIS: 70 };
            ctx.textAlign = 'left';
            ctx.font = 'bold 28px Segoe UI';

            const leftX = 100;
            const rightX = 360;

            ctx.fillStyle = '#94a3b8'; ctx.fillText('PAS', leftX, 680);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.PAS, leftX + 80, 680);

            ctx.fillStyle = '#94a3b8'; ctx.fillText('RIT', rightX, 680);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.RIT, rightX + 80, 680);

            ctx.fillStyle = '#94a3b8'; ctx.fillText('FIN', leftX, 740);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.FIN, leftX + 80, 740);

            ctx.fillStyle = '#94a3b8'; ctx.fillText('DRI', rightX, 740);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.DRI, rightX + 80, 740);

            ctx.fillStyle = '#94a3b8'; ctx.fillText('DEF', leftX, 800);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.DEF, leftX + 80, 800);

            ctx.fillStyle = '#94a3b8'; ctx.fillText('FIS', rightX, 800);
            ctx.fillStyle = '#f59e0b'; ctx.fillText(stats.FIS, rightX + 80, 800);

            const imageURI = canvas.toDataURL("image/png");
            const link = document.createElement('a');
            link.download = `Evolution_Card_${currentUser.name.replace(/\s+/g, '_')}.png`;
            link.href = imageURI;
            link.click();
            showNotification("Evolution Card baixado!");
        };
        playerImg.src = currentUser.photo;
    });

    // ----------------------------------------------------------------------
    // QUIZ DE 51 QUESTÕES
    // ----------------------------------------------------------------------
    document.getElementById('btn-open-quiz').addEventListener('click', () => {
        document.getElementById('athlete-portal').classList.add('hidden');
        document.getElementById('quiz-execution-section').classList.remove('hidden');

        currentQuizState = { mode: null, questions: [], currentIndex: 0, answers: {}, videoFile: null, preferredPosition: "" };
        document.getElementById('quiz-step-mode-selection').classList.remove('hidden');
        document.getElementById('quiz-step-questions').classList.add('hidden');
        document.getElementById('quiz-step-question-51').classList.add('hidden');
    });

    document.querySelectorAll('.mode-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            currentQuizState.mode = card.dataset.mode;
            document.getElementById('btn-confirm-quiz-mode').disabled = false;
        });
    });

    document.getElementById('btn-confirm-quiz-mode').addEventListener('click', () => {
        let filteredQuestions = [];
        if (currentQuizState.mode === 'campo') {
            filteredQuestions = quizQuestionsDatabase.filter(q => q.type === 'campo');
        } else if (currentQuizState.mode === 'quadra') {
            filteredQuestions = quizQuestionsDatabase.filter(q => q.type === 'quadra');
        } else {
            const campo = quizQuestionsDatabase.filter(q => q.type === 'campo').slice(0, 25);
            const quadra = quizQuestionsDatabase.filter(q => q.type === 'quadra').slice(0, 25);
            filteredQuestions = [...campo, ...quadra];
        }

        currentQuizState.questions = filteredQuestions;
        document.getElementById('quiz-step-mode-selection').classList.add('hidden');
        document.getElementById('quiz-step-questions').classList.remove('hidden');
        renderQuizQuestion();
    });

    function renderQuizQuestion() {
        const q = currentQuizState.questions[currentQuizState.currentIndex];
        document.getElementById('quiz-question-counter').textContent = `Pergunta ${currentQuizState.currentIndex + 1} de 50`;
        document.getElementById('quiz-category-tag').textContent = q.type.toUpperCase();
        document.getElementById('quiz-question-text').textContent = q.question;

        const progressPercent = ((currentQuizState.currentIndex + 1) / 50) * 100;
        document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

        const optionsContainer = document.getElementById('quiz-options-container');
        optionsContainer.innerHTML = '';

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-button';
            if (currentQuizState.answers[q.id] === idx) {
                btn.classList.add('selected');
            }
            btn.textContent = opt.text;
            btn.addEventListener('click', () => {
                currentQuizState.answers[q.id] = idx;
                renderQuizQuestion();
                document.getElementById('btn-quiz-next').disabled = false;
            });
            optionsContainer.appendChild(btn);
        });

        document.getElementById('btn-quiz-prev').disabled = currentQuizState.currentIndex === 0;
        document.getElementById('btn-quiz-next').disabled = currentQuizState.answers[q.id] === undefined;
    }

    document.getElementById('btn-quiz-prev').addEventListener('click', () => {
        if (currentQuizState.currentIndex > 0) {
            currentQuizState.currentIndex--;
            renderQuizQuestion();
        }
    });

    document.getElementById('btn-quiz-next').addEventListener('click', () => {
        if (currentQuizState.currentIndex < currentQuizState.questions.length - 1) {
            currentQuizState.currentIndex++;
            renderQuizQuestion();
        } else {
            document.getElementById('quiz-step-questions').classList.add('hidden');
            document.getElementById('quiz-step-question-51').classList.remove('hidden');
        }
    });

    // Submeter Quiz
    document.getElementById('btn-submit-full-quiz').addEventListener('click', async () => {
        const videoInput = document.getElementById('quiz-video-upload');
        const posPref = document.getElementById('quiz-position-preference').value;

        let videoBase64 = null;
        if (videoInput.files[0]) {
            videoBase64 = await fileToBase64(videoInput.files[0]);
        }

        let statsTotals = { PAS: 60, RIT: 60, FIN: 60, DRI: 60, DEF: 60, FIS: 60 };

        currentQuizState.questions.forEach(q => {
            const selectedOptIdx = currentQuizState.answers[q.id];
            if (selectedOptIdx !== undefined) {
                const opt = q.options[selectedOptIdx];
                statsTotals[opt.stat] += opt.points;
            }
        });

        Object.keys(statsTotals).forEach(key => {
            statsTotals[key] = Math.min(99, Math.max(50, Math.round(statsTotals[key])));
        });

        const overallCalc = Math.round(
            (statsTotals.PAS + statsTotals.RIT + statsTotals.FIN + statsTotals.DRI + statsTotals.DEF + statsTotals.FIS) / 6
        );

        const userIndex = db.users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            db.users[userIndex].overall = overallCalc;
            db.users[userIndex].stats = statsTotals;
            db.users[userIndex].quizDone = true;
            db.users[userIndex].videoQ51 = videoBase64;
            db.users[userIndex].positionPreference = posPref;

            currentUser = db.users[userIndex];
            saveData();
        }

        document.getElementById('quiz-execution-section').classList.add('hidden');
        renderApp();
        showNotification("Avaliação Tática concluída!");
    });

    // ----------------------------------------------------------------------
    // PAINEL ADMIN
    // ----------------------------------------------------------------------
    function renderAdminPanel() {
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                document.getElementById(btn.dataset.tab).classList.add('active');
            });
        });

        renderAdminAthletesTable();
        renderAdminQuizTab();
        renderAdminPdfTab();
        populateAdminSelects();
    }

    function renderAdminAthletesTable() {
        const tbody = document.getElementById('admin-athletes-table-body');
        const searchTerm = document.getElementById('admin-search-athlete').value.toLowerCase();
        const catFilter = document.getElementById('admin-filter-category').value;

        tbody.innerHTML = '';

        const athletes = db.users.filter(u => u.role === 'athlete');

        athletes.forEach(ath => {
            if (searchTerm && !ath.name.toLowerCase().includes(searchTerm)) return;
            if (catFilter === 'sub14' && ath.category !== 'Sub-14') return;
            if (catFilter === 'sub15' && ath.category !== '15+') return;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${ath.photo}" class="table-avatar" alt="Foto"></td>
                <td><strong>${ath.name}</strong><br><small>${ath.email}</small></td>
                <td>${ath.dob} (${ath.age}a)</td>
                <td>${ath.height}cm / ${ath.weight}kg</td>
                <td>${ath.position} ${ath.secondaryPosition ? `/ ${ath.secondaryPosition}` : ''}</td>
                <td><strong class="accent-text">${ath.overall || 70}</strong></td>
                <td><span class="status-badge">${ath.quizDone ? 'Concluído' : 'Pendente'}</span></td>
                <td>
                    <button class="btn btn-outline btn-small btn-inspect" data-id="${ath.id}"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn btn-primary btn-small btn-edit" data-id="${ath.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger btn-small btn-delete" data-id="${ath.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-inspect').forEach(b => {
            b.addEventListener('click', () => inspectAthlete(b.dataset.id));
        });

        tbody.querySelectorAll('.btn-edit').forEach(b => {
            b.addEventListener('click', () => openEditAthleteModal(b.dataset.id));
        });

        tbody.querySelectorAll('.btn-delete').forEach(b => {
            b.addEventListener('click', () => {
                if (confirm("Remover este atleta?")) {
                    db.users = db.users.filter(u => u.id !== b.dataset.id);
                    saveData();
                    renderAdminAthletesTable();
                    showNotification("Atleta removido.");
                }
            });
        });
    }

    document.getElementById('admin-search-athlete').addEventListener('input', renderAdminAthletesTable);
    document.getElementById('admin-filter-category').addEventListener('change', renderAdminAthletesTable);

    function inspectAthlete(id) {
        const ath = db.users.find(u => u.id === id);
        if (!ath) return;

        const modal = document.getElementById('modal-admin-inspect');
        const box = document.getElementById('inspect-content-box');

        box.innerHTML = `
            <div style="text-align: center;">
                <img src="${ath.photo}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid #f59e0b;">
                <h2>${ath.name}</h2>
                <p>${ath.age} anos • ${ath.position} • Overall: <strong>${ath.overall || 70}</strong></p>
            </div>
            <hr style="margin: 15px 0; border-color: #334155;">
            <h4>Notas Táticas:</h4>
            <p>PAS: ${ath.stats?.PAS || 70} | RIT: ${ath.stats?.RIT || 70} | FIN: ${ath.stats?.FIN || 70}</p>
            <p>DRI: ${ath.stats?.DRI || 70} | DEF: ${ath.stats?.DEF || 70} | FIS: ${ath.stats?.FIS || 70}</p>
            <p class="margin-top-10"><strong>Preferência de Posição (Q51):</strong> ${ath.positionPreference || 'Nenhuma'}</p>
        `;

        modal.classList.remove('hidden');
    }

    function openEditAthleteModal(id) {
        const ath = db.users.find(u => u.id === id);
        if (!ath) return;

        document.getElementById('edit-athlete-id').value = ath.id;
        document.getElementById('edit-athlete-name').value = ath.name;
        document.getElementById('edit-athlete-dob').value = ath.dob;
        document.getElementById('edit-athlete-height').value = ath.height;
        document.getElementById('edit-athlete-weight').value = ath.weight;
        document.getElementById('edit-athlete-pos').value = ath.position;
        document.getElementById('edit-athlete-secondary-pos').value = ath.secondaryPosition || '';

        document.getElementById('modal-admin-edit-athlete').classList.remove('hidden');
    }

    document.getElementById('form-admin-edit-athlete').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-athlete-id').value;
        const userIndex = db.users.findIndex(u => u.id === id);

        if (userIndex !== -1) {
            db.users[userIndex].name = document.getElementById('edit-athlete-name').value;
            db.users[userIndex].dob = document.getElementById('edit-athlete-dob').value;
            db.users[userIndex].age = calculateAge(db.users[userIndex].dob);
            db.users[userIndex].category = db.users[userIndex].age < 15 ? 'Sub-14' : '15+';
            db.users[userIndex].height = document.getElementById('edit-athlete-height').value;
            db.users[userIndex].weight = document.getElementById('edit-athlete-weight').value;
            db.users[userIndex].position = document.getElementById('edit-athlete-pos').value;
            db.users[userIndex].secondaryPosition = document.getElementById('edit-athlete-secondary-pos').value;

            saveData();
            document.getElementById('modal-admin-edit-athlete').classList.add('hidden');
            renderAdminAthletesTable();
            showNotification("Atleta atualizado!");
        }
    });

    function renderAdminQuizTab() {
        const container = document.getElementById('admin-quiz-list-container');
        container.innerHTML = '';

        const athletes = db.users.filter(u => u.role === 'athlete');

        athletes.forEach(ath => {
            const card = document.createElement('div');
            card.className = 'card margin-top-10';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${ath.name}</strong> (${ath.category}) - Overall: <strong>${ath.overall || 70}</strong>
                        <br><small>Sugestão Q51: ${ath.positionPreference || 'Nenhuma'}</small>
                    </div>
                    <div>
                        ${ath.videoQ51 ? `<button class="btn btn-outline btn-small btn-view-video" data-video="${ath.videoQ51}"><i class="fa-solid fa-video"></i> Ver Vídeo</button>` : '<small>Sem Vídeo</small>'}
                        <button class="btn btn-danger btn-small btn-reset-quiz" data-id="${ath.id}">Zerar Teste</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-view-video').forEach(b => {
            b.addEventListener('click', () => {
                const player = document.getElementById('player-video-q51');
                player.src = b.dataset.video;
                document.getElementById('modal-video-viewer').classList.remove('hidden');
            });
        });

        container.querySelectorAll('.btn-reset-quiz').forEach(b => {
            b.addEventListener('click', () => {
                if (confirm("Zerar a avaliação deste atleta?")) {
                    const idx = db.users.findIndex(u => u.id === b.dataset.id);
                    if (idx !== -1) {
                        db.users[idx].quizDone = false;
                        db.users[idx].overall = 70;
                        saveData();
                        renderAdminQuizTab();
                        showNotification("Teste zerado.");
                    }
                }
            });
        });
    }

    function renderAdminPdfTab() {
        const container = document.getElementById('admin-pdf-list-container');
        container.innerHTML = '';

        const athletes = db.users.filter(u => u.role === 'athlete');

        athletes.forEach(ath => {
            const card = document.createElement('div');
            card.className = 'card margin-top-10';
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${ath.name}</strong> - Relatório PDF Scout
                    </div>
                    <button class="btn ${ath.pdfUnlocked ? 'btn-accent' : 'btn-outline'} btn-small btn-toggle-pdf" data-id="${ath.id}">
                        ${ath.pdfUnlocked ? '<i class="fa-solid fa-lock-open"></i> Liberado' : '<i class="fa-solid fa-lock"></i> Bloqueado'}
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        container.querySelectorAll('.btn-toggle-pdf').forEach(b => {
            b.addEventListener('click', () => {
                const idx = db.users.findIndex(u => u.id === b.dataset.id);
                if (idx !== -1) {
                    db.users[idx].pdfUnlocked = !db.users[idx].pdfUnlocked;
                    saveData();
                    renderAdminPdfTab();
                    showNotification("Status do PDF alterado!");
                }
            });
        });
    }

    function populateAdminSelects() {
        const selectPrivate = document.getElementById('select-private-athlete');
        const selectCraque = document.getElementById('select-craque-semana');

        selectPrivate.innerHTML = '<option value="">Selecione o Atleta...</option>';
        selectCraque.innerHTML = '<option value="">Nenhum (Desativar)</option>';

        const athletes = db.users.filter(u => u.role === 'athlete');

        athletes.forEach(ath => {
            selectPrivate.innerHTML += `<option value="${ath.id}">${ath.name}</option>`;
            selectCraque.innerHTML += `<option value="${ath.id}" ${db.config.craqueDaSemanaId === ath.id ? 'selected' : ''}>${ath.name}</option>`;
        });

        document.getElementById('input-global-msg-text').value = db.config.globalAnnouncement || '';
        document.getElementById('switch-enable-reset-btn').checked = db.config.resetBtnEnabled || false;
    }

    document.getElementById('form-send-private-msg').addEventListener('submit', (e) => {
        e.preventDefault();
        const athId = document.getElementById('select-private-athlete').value;
        const msg = document.getElementById('input-private-msg-text').value;

        if (athId && msg) {
            db.privateMessages[athId] = msg;
            saveData();
            document.getElementById('input-private-msg-text').value = '';
            showNotification("Mensagem enviada!");
        }
    });

    document.getElementById('form-send-global-msg').addEventListener('submit', (e) => {
        e.preventDefault();
        db.config.globalAnnouncement = document.getElementById('input-global-msg-text').value;
        saveData();
        showNotification("Mural Geral atualizado!");
    });

    document.getElementById('btn-save-craque-semana').addEventListener('click', () => {
        db.config.craqueDaSemanaId = document.getElementById('select-craque-semana').value || null;
        saveData();
        showNotification("Craque da Semana salvo!");
    });

    document.getElementById('switch-enable-reset-btn').addEventListener('change', (e) => {
        db.config.resetBtnEnabled = e.target.checked;
        saveData();
        showNotification(e.target.checked ? "Botão Excluir liberado aos alunos!" : "Botão Excluir ocultado!");
    });

    // Render Inicial
    renderApp();
});