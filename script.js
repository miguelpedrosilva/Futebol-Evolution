/*=========================================
FUTEBOL EVOLUTION
SCRIPT.JS
PARTE 1
=========================================*/

console.log("Futebol Evolution iniciado!");

//==============================
// BANCO DE DADOS LOCAL
//==============================

let atleta = {

nome: "",

idade: "",

altura: "",

peso: "",

pe: "Direito",

objetivo: "Evoluir completo",

nivel: "Iniciante",

xp: 0,

energia: 100,

forca: 30,

velocidade: 40,

resistencia: 35,

drible: 50,

passe: 55,

finalizacao:45,

overall:60

};

//==============================
// SALVAR
//==============================

function salvar(){

localStorage.setItem(

"futebolEvolution",

JSON.stringify(atleta)

);

}

//==============================
// CARREGAR
//==============================

function carregar(){

const dados=

localStorage.getItem(

"futebolEvolution"

);

if(dados){

atleta=

JSON.parse(dados);

}

}

carregar();

//==============================
// PERFIL
//==============================

const salvarPerfil=

document.getElementById(

"salvarPerfil"

);

if(salvarPerfil){

salvarPerfil.onclick=function(){

atleta.nome=

document.getElementById("nome").value;

atleta.idade=

document.getElementById("idade").value;

atleta.altura=

document.getElementById("altura").value;

atleta.peso=

document.getElementById("peso").value;

atleta.pe=

document.getElementById("pe").value;

atleta.objetivo=

document.getElementById("objetivo").value;

salvar();

alert(

"Perfil salvo!"

);

};

}

//==============================
// CARREGAR PERFIL NA TELA
//==============================

function atualizarTela(){

if(document.getElementById("nomeCarta")){

document.getElementById(

"nomeCarta"

).innerHTML=

atleta.nome==""?

"Jogador":

atleta.nome;

}

if(document.getElementById("xp")){

document.getElementById(

"xp"

).style.width=

atleta.xp+"%";

}

}

atualizarTela();

//==============================
// GANHAR XP
//==============================

function ganharXP(valor){

atleta.xp+=valor;

if(atleta.xp>100){

atleta.xp=100;

}

atualizarTela();

salvar();

}

//==============================
// TREINO CONCLUÍDO
//==============================

const entrar=

document.getElementById(

"entrar"

);

if(entrar){

entrar.onclick=function(){

ganharXP(5);

alert(

"Treino iniciado! +5 XP"

);

};

}
/*=========================================
SCRIPT.JS
PARTE 2
IA TREINADOR + OVERALL + NÍVEIS
=========================================*/

//==============================
// IA TREINADOR
//==============================

const perguntasIA = {

"chute":"Treine finalizações dos dois pés. Foque primeiro na precisão e depois aumente a força.",

"passe":"Olhe antes de receber a bola e faça passes rápidos com os dois pés.",

"dominio":"Domine a bola orientando-a para o espaço livre, evitando parar totalmente.",

"drible":"Use mudanças de direção e aceleração após o drible. Evite driblar sem necessidade.",

"velocidade":"Faça tiros de 10, 20 e 30 metros com descanso completo.",

"resistencia":"Misture corrida contínua com treinos intervalados.",

"forca":"Fortaleça pernas, abdômen e quadril usando exercícios com o peso do corpo.",

"marcacao":"Mantenha a postura baixa e acompanhe o quadril do adversário.",

"cabecada":"Ataque a bola no ponto mais alto possível usando impulso das pernas.",

"nutricao":"Hidrate-se bem e faça refeições equilibradas para recuperar energia."

};

const botaoEnviar = document.getElementById("enviar");

if(botaoEnviar){

botaoEnviar.onclick = function(){

const pergunta = document.getElementById("pergunta").value.toLowerCase();

const mensagens = document.getElementById("mensagens");

let resposta = "Ainda estou aprendendo. Em breve responderei ainda melhor.";

for(const palavra in perguntasIA){

if(pergunta.includes(palavra)){

resposta = perguntasIA[palavra];

break;

}

}

mensagens.innerHTML += `
<p><b>Você:</b> ${pergunta}</p>
<p><b>Treinador:</b> ${resposta}</p>
`;

mensagens.scrollTop = mensagens.scrollHeight;

document.getElementById("pergunta").value="";

};

}

//==============================
// OVERALL
//==============================

function atualizarOverall(){

const media = Math.round(

(

atleta.forca +

atleta.velocidade +

atleta.resistencia +

atleta.drible +

atleta.passe +

atleta.finalizacao

)/6

);

atleta.overall = media;

const overall = document.getElementById("overall");

if(overall){

overall.innerHTML = media;

}

}

atualizarOverall();

//==============================
// SISTEMA DE NÍVEIS
//==============================

function atualizarNivel(){

const texto = document.getElementById("nivel");

if(!texto) return;

if(atleta.xp < 35){

atleta.nivel="Iniciante";

}

else if(atleta.xp < 70){

atleta.nivel="Amador";

}

else{

atleta.nivel="Base";

}

texto.innerHTML="Nível "+atleta.nivel;

}

atualizarNivel();

//==============================
// EVOLUIR ATRIBUTOS
//==============================

function evoluirAtributo(nome,valor){

if(atleta[nome]!==undefined){

atleta[nome]+=valor;

if(atleta[nome]>99){

atleta[nome]=99;

}

atualizarOverall();

salvar();

}

}

//==============================
// TREINO COMPLETO
//==============================

function concluirTreino(){

ganharXP(5);

evoluirAtributo("forca",1);

evoluirAtributo("velocidade",1);

evoluirAtributo("resistencia",1);

evoluirAtributo("drible",1);

evoluirAtributo("passe",1);

evoluirAtributo("finalizacao",1);

atualizarNivel();

alert("Parabéns! Seu treino foi registrado.");

}

if(entrar){

entrar.onclick = concluirTreino;

}
/*=========================================
SCRIPT.JS
PARTE 3
TESTE + POSIÇÃO + AGENDA
=========================================*/

//==============================
// TESTE DO ATLETA
//==============================

const resultadoTeste = {

drible:0,

passe:0,

chute:0,

velocidade:0,

marcacao:0,

fisico:0,

visao:0,

lideranca:0

};

//==============================
// ANALISAR PERFIL
//==============================

function analisarPerfil(){

let posicao="Meio-campista";

let secundaria="Atacante";

if(resultadoTeste.chute>=8 &&
resultadoTeste.drible>=8){

posicao="Atacante";

secundaria="Ponta";

}

if(resultadoTeste.passe>=8 &&
resultadoTeste.visao>=8){

posicao="Meio-campista";

secundaria="Volante";

}

if(resultadoTeste.marcacao>=8 &&
resultadoTeste.fisico>=8){

posicao="Volante";

secundaria="Zagueiro";

}

return{

principal:posicao,

secundaria:secundaria

};

}

//==============================
// MOSTRAR POSIÇÃO
//==============================

function atualizarPosicao(){

const perfil=analisarPerfil();

const campo=

document.getElementById(

"posicaoCarta"

);

if(campo){

campo.innerHTML=

"Posição: "+

perfil.principal+

" | Reserva: "+

perfil.secundaria;

}

}

atualizarPosicao();

//==============================
// RELATÓRIO
//==============================

function gerarRelatorio(){

let fortes=[];

let fracos=[];

for(let item in resultadoTeste){

if(resultadoTeste[item]>=8){

fortes.push(item);

}

if(resultadoTeste[item]<=4){

fracos.push(item);

}

}

console.log("Pontos fortes:",fortes);

console.log("Pontos fracos:",fracos);

}

//==============================
// AGENDA INTELIGENTE
//==============================

const gerarTreino=

document.getElementById(

"gerarTreino"

);

if(gerarTreino){

gerarTreino.onclick=function(){

const treino=

document.getElementById(

"treinoHoje"

);

if(atleta.objetivo=="Ganhar força"){

treino.innerHTML=

"Agachamentos • Prancha • Afundos • Flexões";

}

else if(atleta.objetivo=="Ganhar velocidade"){

treino.innerHTML=

"Tiros de 10m • 20m • Arrancadas";

}

else if(atleta.objetivo=="Melhorar resistência"){

treino.innerHTML=

"Corrida intervalada + Circuito físico";

}

else if(atleta.objetivo=="Melhorar passe"){

treino.innerHTML=

"Passe curto • Passe longo • Domínio";

}

else if(atleta.objetivo=="Melhorar chute"){

treino.innerHTML=

"Finalização • Chute colocado • Chute de primeira";

}

else{

treino.innerHTML=

"Treino completo: força, passe, domínio, velocidade e finalização.";

}

};

}

//==============================
// PRIMEIRO LOGIN
//==============================

window.onload=function(){

carregar();

atualizarTela();

atualizarOverall();

atualizarNivel();

atualizarPosicao();

};
/*=========================================
SCRIPT.JS
PARTE 4
TESTE DE 50 PERGUNTAS
=========================================*/

//==============================
// TESTE
//==============================

const teste50 = {

perguntaAtual:0,

pontuacao:{

drible:0,

passe:0,

finalizacao:0,

velocidade:0,

resistencia:0,

fisico:0,

marcacao:0,

visao:0,

lideranca:0,

controle:0

},

respondido:false

};

//==============================
// LISTA DAS PERGUNTAS
//==============================

const perguntas = [

"Você prefere driblar ou tocar a bola?",

"Você volta para marcar?",

"Você gosta de finalizar?",

"Você consegue jogar dos dois lados do campo?",

"Você se posiciona bem?",

"Você procura passes antes do chute?",

"Você corre até o fim da jogada?",

"Você domina bem a bola?",

"Você tem bom jogo de corpo?",

"Você gosta de pressionar o adversário?"

];

//==============================
// INICIAR TESTE
//==============================

const iniciarTeste = document.getElementById("iniciarTeste");

if(iniciarTeste){

iniciarTeste.onclick=function(){

teste50.perguntaAtual=0;

mostrarPergunta();

};

}

//==============================
// MOSTRAR PERGUNTA
//==============================

function mostrarPergunta(){

if(teste50.perguntaAtual>=perguntas.length){

finalizarTeste();

return;

}

const pergunta=perguntas[teste50.perguntaAtual];

const resposta=prompt(pergunta);

avaliarResposta(resposta);

teste50.perguntaAtual++;

mostrarPergunta();

}

//==============================
// AVALIAR
//==============================

function avaliarResposta(texto){

if(!texto)return;

texto=texto.toLowerCase();

if(texto.includes("drib")){

teste50.pontuacao.drible++;

}

if(texto.includes("pass")){

teste50.pontuacao.passe++;

}

if(texto.includes("chut")){

teste50.pontuacao.finalizacao++;

}

if(texto.includes("corr")){

teste50.pontuacao.resistencia++;

}

if(texto.includes("marc")){

teste50.pontuacao.marcacao++;

}

if(texto.includes("for")){

teste50.pontuacao.fisico++;

}

}

//==============================
// FINALIZAR
//==============================

function finalizarTeste(){

teste50.respondido=true;

localStorage.setItem(

"teste50",

JSON.stringify(teste50)

);

gerarRelatorioCompleto();

}

//==============================
// RELATÓRIO
//==============================

function gerarRelatorioCompleto(){

let melhor="";

let maior=0;

for(let item in teste50.pontuacao){

if(teste50.pontuacao[item]>maior){

maior=teste50.pontuacao[item];

melhor=item;

}

}

alert(

"Teste concluído!\n\nSeu principal destaque foi: "+melhor

);

definirPosicao(melhor);

}

//==============================
// DEFINIR POSIÇÃO
//==============================

function definirPosicao(habilidade){

let posicao="Meio-campista";

if(habilidade=="drible"){

posicao="Ponta";

}

if(habilidade=="finalizacao"){

posicao="Centroavante";

}

if(habilidade=="passe"){

posicao="Meia";

}

if(habilidade=="marcacao"){

posicao="Volante";

}

document.getElementById(

"posicaoCarta"

).innerHTML=

"Posição: "+posicao;

}
/*=========================================
SCRIPT.JS
PARTE 5
IA + NUTRIÇÃO + RECUPERAÇÃO + LEMBRETES
=========================================*/

//==============================
// IA TREINADOR AVANÇADA
//==============================

function gerarConselho(){

let conselho="Continue treinando!";

if(atleta.energia<40){

conselho="Hoje priorize descanso e hidratação.";

}
else if(atleta.resistencia<50){

conselho="Seu foco da semana será resistência física.";

}
else if(atleta.forca<50){

conselho="Vamos fortalecer pernas, core e tronco.";

}
else if(atleta.drible<60){

conselho="Treine mudanças de direção e domínio.";

}
else{

conselho="Bom trabalho! Continue evoluindo.";

}

const mensagens=document.getElementById("mensagens");

if(mensagens){

mensagens.innerHTML+=`

<p><b>Treinador:</b> ${conselho}</p>

`;

mensagens.scrollTop=mensagens.scrollHeight;

}

}

//==============================
// NUTRIÇÃO
//==============================

function gerarPlanoAlimentar(){

let plano=[];

plano.push("🥤 Beber bastante água.");

plano.push("🍌 Comer frutas diariamente.");

plano.push("🥚 Consumir proteínas.");

plano.push("🍚 Arroz, feijão e verduras.");

if(atleta.objetivo=="Ganhar força"){

plano.push("💪 Aumentar proteínas.");

}

if(atleta.objetivo=="Ganhar velocidade"){

plano.push("⚡ Priorizar carboidratos antes do treino.");

}

return plano.join("\n");

}

const verPlano=document.getElementById("verPlano");

if(verPlano){

verPlano.onclick=function(){

alert(gerarPlanoAlimentar());

};

}

//==============================
// RECUPERAÇÃO
//==============================

const salvarEstado=

document.getElementById("salvarEstado");

if(salvarEstado){

salvarEstado.onclick=function(){

const estado=

document.getElementById("estadoFisico").value;

localStorage.setItem(

"estadoFisico",

estado

);

alert("Estado físico salvo!");

};

}

//==============================
// LEMBRETES
//==============================

function verificarTreino(){

const hoje=new Date().getDay();

if(hoje===1){

console.log("Segunda: treino de força.");

}

if(hoje===2){

console.log("Terça: treino de velocidade.");

}

if(hoje===3){

console.log("Quarta: treino técnico.");

}

if(hoje===4){

console.log("Quinta: treino físico.");

}

if(hoje===5){

console.log("Sexta: treino completo.");

}

if(hoje===6){

console.log("Sábado: treino no campo.");

}

if(hoje===0){

console.log("Domingo: recuperação.");

}

}

verificarTreino();

//==============================
// EVOLUÇÃO DIÁRIA
//==============================

function evolucaoDiaria(){

atleta.energia-=5;

if(atleta.energia<0){

atleta.energia=0;

}

salvar();

}

setInterval(

evolucaoDiaria,

600000

);

//==============================
// INICIAR IA
//==============================

gerarConselho();
/*=========================================
SCRIPT.JS
PARTE 6
AVATAR + DESBLOQUEIOS
=========================================*/

//==============================
// DADOS DO AVATAR
//==============================

let avatar = {

cabelo:1,

camisa:1,

short:1,

meia:1,

chuteira:1,

pele:1

};

//==============================
// CARREGAR AVATAR
//==============================

function carregarAvatar(){

const dados = localStorage.getItem("avatar");

if(dados){

avatar = JSON.parse(dados);

}

}

carregarAvatar();

//==============================
// SALVAR AVATAR
//==============================

function salvarAvatar(){

localStorage.setItem(

"avatar",

JSON.stringify(avatar)

);

}

//==============================
// TROCAR CABELO
//==============================

function trocarCabelo(){

avatar.cabelo++;

if(avatar.cabelo>8){

avatar.cabelo=1;

}

salvarAvatar();

atualizarAvatar();

}

//==============================
// TROCAR CAMISA
//==============================

function trocarCamisa(){

avatar.camisa++;

if(avatar.camisa>15){

avatar.camisa=1;

}

salvarAvatar();

atualizarAvatar();

}

//==============================
// TROCAR CHUTEIRA
//==============================

function trocarChuteira(){

avatar.chuteira++;

if(avatar.chuteira>12){

avatar.chuteira=1;

}

salvarAvatar();

atualizarAvatar();

}

//==============================
// TROCAR SHORT
//==============================

function trocarShort(){

avatar.short++;

if(avatar.short>10){

avatar.short=1;

}

salvarAvatar();

atualizarAvatar();

}

//==============================
// TROCAR MEIA
//==============================

function trocarMeia(){

avatar.meia++;

if(avatar.meia>10){

avatar.meia=1;

}

salvarAvatar();

atualizarAvatar();

}

//==============================
// ATUALIZAR AVATAR
//==============================

function atualizarAvatar(){

const img=document.getElementById("avatarImagem");

if(!img)return;

// Avatar provisório.
// Futuramente será montado com várias imagens.

img.src=

"assets/avatar/avatar.png";

}

//==============================
// DESBLOQUEIOS
//==============================

function verificarDesbloqueios(){

if(atleta.xp>=20){

console.log("Nova camisa desbloqueada");

}

if(atleta.xp>=40){

console.log("Novo cabelo desbloqueado");

}

if(atleta.xp>=60){

console.log("Nova chuteira desbloqueada");

}

if(atleta.xp>=80){

console.log("Novo uniforme desbloqueado");

}

if(atleta.xp>=100){

console.log("Avatar completo desbloqueado");

}

}

//==============================
// EVOLUIR AVATAR
//==============================

function atualizarSistemaAvatar(){

atualizarAvatar();

verificarDesbloqueios();

}

atualizarSistemaAvatar();
/*=========================================
SCRIPT.JS
PARTE 7
HISTÓRICO + ESTATÍSTICAS + CRONÔMETRO
=========================================*/

//==============================
// HISTÓRICO DE TREINOS
//==============================

let historico = JSON.parse(
localStorage.getItem("historicoTreinos")
) || [];

function registrarTreino(nomeTreino){

const treino = {

nome: nomeTreino,

data: new Date().toLocaleDateString("pt-BR"),

hora: new Date().toLocaleTimeString("pt-BR"),

xp: atleta.xp,

overall: atleta.overall

};

historico.push(treino);

localStorage.setItem(
"historicoTreinos",
JSON.stringify(historico)
);

}

//==============================
// ESTATÍSTICAS
//==============================

function mostrarEstatisticas(){

const total = historico.length;

let texto = "";

texto += "Treinos realizados: " + total + "\n";

texto += "Nível: " + atleta.nivel + "\n";

texto += "Overall: " + atleta.overall + "\n";

texto += "XP: " + atleta.xp + "\n";

texto += "Energia: " + atleta.energia + "\n";

alert(texto);

}

//==============================
// CRONÔMETRO
//==============================

let segundos = 0;

let cronometro = null;

function iniciarCronometro(){

if(cronometro) return;

cronometro = setInterval(function(){

segundos++;

const minutos = Math.floor(segundos / 60);

const resto = segundos % 60;

console.log(
"Tempo: " +
minutos +
":" +
resto.toString().padStart(2,"0")
);

},1000);

}

function pararCronometro(){

clearInterval(cronometro);

cronometro = null;

}

function zerarCronometro(){

pararCronometro();

segundos = 0;

}

//==============================
// CALENDÁRIO
//==============================

const calendario = {

segunda:"Treino físico",

terca:"Velocidade",

quarta:"Passe e domínio",

quinta:"Força",

sexta:"Finalização",

sabado:"Campo",

domingo:"Descanso"

};

function mostrarTreinoDoDia(){

const dias=[

"domingo",

"segunda",

"terca",

"quarta",

"quinta",

"sexta",

"sabado"

];

const hoje=dias[new Date().getDay()];

console.log(

"Treino de hoje:",

calendario[hoje]

);

}

mostrarTreinoDoDia();

//==============================
// REGISTRAR TREINO
//==============================

const btnEntrar = document.getElementById("entrar");

if(btnEntrar){

btnEntrar.addEventListener("click",function(){

registrarTreino("Treino Diário");

iniciarCronometro();

});

}

//==============================
// SALVAR AUTOMATICAMENTE
//==============================

window.addEventListener("beforeunload",function(){

salvar();

salvarAvatar();

localStorage.setItem(

"historicoTreinos",

JSON.stringify(historico)

);

});
/*=========================================
SCRIPT.JS
PARTE 8
MISSÕES + OBJETIVOS + CONQUISTAS
=========================================*/

//==============================
// MISSÕES DIÁRIAS
//==============================

let missoes = [

{
nome:"Concluir o treino do dia",
xp:10,
concluida:false
},

{
nome:"Beber água durante o treino",
xp:5,
concluida:false
},

{
nome:"Dormir pelo menos 8 horas",
xp:10,
concluida:false
},

{
nome:"Treinar o pé fraco por 15 minutos",
xp:15,
concluida:false
}

];

//==============================
// CONCLUIR MISSÃO
//==============================

function concluirMissao(indice){

if(missoes[indice].concluida){

return;

}

missoes[indice].concluida=true;

ganharXP(missoes[indice].xp);

alert(

"Missão concluída!\n+"+

missoes[indice].xp+

" XP"

);

salvarMissoes();

}

//==============================
// SALVAR MISSÕES
//==============================

function salvarMissoes(){

localStorage.setItem(

"missoes",

JSON.stringify(missoes)

);

}

//==============================
// CARREGAR MISSÕES
//==============================

function carregarMissoes(){

const dados=

localStorage.getItem(

"missoes"

);

if(dados){

missoes=JSON.parse(dados);

}

}

carregarMissoes();

//==============================
// OBJETIVOS
//==============================

let objetivos=[

"Ganhar força",

"Ganhar velocidade",

"Melhorar passe",

"Melhorar domínio",

"Melhorar finalização",

"Melhorar jogo de corpo",

"Melhorar resistência"

];

//==============================
// CONQUISTAS
//==============================

let conquistas=[];

function desbloquear(nome){

if(conquistas.includes(nome)){

return;

}

conquistas.push(nome);

alert(

"🏆 Nova conquista:\n"+

nome

);

localStorage.setItem(

"conquistas",

JSON.stringify(conquistas)

);

}

//==============================
// VERIFICAR CONQUISTAS
//==============================

function verificarConquistas(){

if(atleta.xp>=25){

desbloquear("Primeiros Passos");

}

if(atleta.xp>=50){

desbloquear("Atleta Dedicado");

}

if(atleta.xp>=75){

desbloquear("Treinador Orgulhoso");

}

if(atleta.xp>=100){

desbloquear("Futebol Evolution");

}

}

verificarConquistas();

//==============================
// MISSÃO AUTOMÁTICA
//==============================

const treinoBtn=

document.getElementById(

"entrar"

);

if(treinoBtn){

treinoBtn.addEventListener(

"click",

function(){

concluirMissao(0);

verificarConquistas();

}

);

}
/*=========================================
SCRIPT.JS
PARTE 9
DASHBOARD + RELATÓRIOS + EVOLUÇÃO
=========================================*/

//==============================
// DASHBOARD
//==============================

function atualizarDashboard(){

const dados = {

overall: atleta.overall,

xp: atleta.xp,

nivel: atleta.nivel,

energia: atleta.energia,

forca: atleta.forca,

velocidade: atleta.velocidade,

resistencia: atleta.resistencia,

drible: atleta.drible,

passe: atleta.passe,

finalizacao: atleta.finalizacao

};

console.table(dados);

}

//==============================
// HISTÓRICO DE EVOLUÇÃO
//==============================

let evolucao = JSON.parse(

localStorage.getItem("evolucao")

) || [];

function registrarEvolucao(){

const registro = {

data: new Date().toLocaleDateString("pt-BR"),

overall: atleta.overall,

xp: atleta.xp,

nivel: atleta.nivel,

forca: atleta.forca,

velocidade: atleta.velocidade,

resistencia: atleta.resistencia,

drible: atleta.drible,

passe: atleta.passe,

finalizacao: atleta.finalizacao

};

evolucao.push(registro);

localStorage.setItem(

"evolucao",

JSON.stringify(evolucao)

);

}

//==============================
// RELATÓRIO DA IA
//==============================

function relatorioIA(){

let texto = "";

if(atleta.forca < 60){

texto += "💪 Trabalhe mais força.\n";

}

if(atleta.velocidade < 60){

texto += "⚡ Foque em velocidade.\n";

}

if(atleta.resistencia < 60){

texto += "🏃 Melhore sua resistência.\n";

}

if(atleta.drible >= 70){

texto += "🔥 Seu drible é um ponto forte.\n";

}

if(atleta.passe >= 70){

texto += "🎯 Seus passes estão evoluindo.\n";

}

if(texto===""){

texto="Excelente evolução! Continue treinando.";

}

alert(texto);

}

//==============================
// ESTATÍSTICAS
//==============================

function calcularMedia(){

const media = (

atleta.forca +

atleta.velocidade +

atleta.resistencia +

atleta.drible +

atleta.passe +

atleta.finalizacao

)/6;

return media.toFixed(1);

}

//==============================
// RESUMO
//==============================

function resumoAtleta(){

alert(

"OVERALL: " + atleta.overall +

"\nNível: " + atleta.nivel +

"\nXP: " + atleta.xp +

"\nMédia dos atributos: " +

calcularMedia()

);

}

//==============================
// TREINO FINALIZADO
//==============================

function finalizarTreinoCompleto(){

registrarTreino("Treino Completo");

registrarEvolucao();

atualizarDashboard();

verificarConquistas();

salvar();

}

//==============================
// BOTÃO
//==============================

const botaoTreino = document.getElementById("entrar");

if(botaoTreino){

botaoTreino.addEventListener(

"click",

finalizarTreinoCompleto

);

}
/*=========================================
SCRIPT.JS
PARTE 10
NOTIFICAÇÕES + PWA + VÍDEO + SINCRONIZAÇÃO
=========================================*/

//==============================
// NOTIFICAÇÕES
//==============================

function solicitarPermissaoNotificacao(){

if(!("Notification" in window)){

console.log("Notificações não suportadas.");

return;

}

if(Notification.permission==="default"){

Notification.requestPermission();

}

}

solicitarPermissaoNotificacao();

function enviarNotificacao(titulo,mensagem){

if(Notification.permission==="granted"){

new Notification(titulo,{

body:mensagem,

icon:"assets/logo.png"

});

}

}

//==============================
// LEMBRETE DE TREINO
//==============================

function lembrarTreino(){

enviarNotificacao(

"Futebol Evolution",

"Está na hora do seu treino!"

);

}

//==============================
// ANÁLISE DE VÍDEO
//==============================

const videoInput=document.querySelector(

'input[type="file"]'

);

if(videoInput){

videoInput.addEventListener("change",function(e){

const arquivo=e.target.files[0];

if(!arquivo){

return;

}

if(!arquivo.type.startsWith("video/")){

alert("Escolha um vídeo.");

return;

}

alert(

"Vídeo recebido!\n\nEm versões futuras a IA fará a análise automática."

);

});

}

//==============================
// PWA
//==============================

window.addEventListener(

"beforeinstallprompt",

function(event){

event.preventDefault();

window.promptInstalacao=event;

console.log(

"Aplicativo pronto para instalação."

);

}

//==============================
// SINCRONIZAÇÃO
//==============================

function exportarDados(){

const dados={

atleta,

avatar,

historico,

evolucao,

missoes,

conquistas

};

return JSON.stringify(dados);

}

function importarDados(json){

try{

const dados=JSON.parse(json);

console.log("Dados importados.");

return dados;

}

catch{

alert("Arquivo inválido.");

}

}

//==============================
// BACKUP
//==============================

function fazerBackup(){

const dados=exportarDados();

localStorage.setItem(

"backup",

dados

);

console.log(

"Backup salvo."

);

}

//==============================
// RESTAURAR
//==============================

function restaurarBackup(){

const backup=

localStorage.getItem("backup");

if(!backup){

return;

}

importarDados(backup);

}

//==============================
// AUTO SAVE
//==============================

setInterval(function(){

salvar();

salvarAvatar();

fazerBackup();

},60000);

//==============================
// INICIAR SISTEMA
//==============================

console.log(

"Futebol Evolution V1 carregado com sucesso."

);
