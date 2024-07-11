const fotos = [
    'cartafgato',
    'cartafcao',
    'cartafmsqt',
    'cartafvac',
    'cartafvaca',
    'cartafcrpt',
    'cartafpsr',
    'cartafrato',
];

let pontosPartidas = [];
let tentativas = 0;
let erros = 0;

let tempoDecorrido = 0;
const setinha = document.getElementById('setaInicio')
setinha.addEventListener("click", () => console.log("Voltar"))

function exibirMaiorPontuacao() {
    const pontuacoes = JSON.parse(localStorage.getItem('pontuacoes')) || [];
    if (pontuacoes.length === 0) {
        document.getElementById('melhorPontuacao').textContent = 'N/A';
        return;
    }

    const melhorPontuacao = pontuacoes.reduce((max, p) => p.pontos > max ? p.pontos : max, 0);
    const melhorPontuacaoPorNivel = {
        'Fácil': pontuacoes.filter(p => p.modo === 'Fácil').reduce((max, p) => p.pontos > max ? p.pontos : max, 0),
        'Médio': pontuacoes.filter(p => p.modo === 'Médio').reduce((max, p) => p.pontos > max ? p.pontos : max, 0),
        'Difícil': pontuacoes.filter(p => p.modo === 'Difícil').reduce((max, p) => p.pontos > max ? p.pontos : max, 0),
    };

    document.getElementById('melhorPontuacao').textContent = `${melhorPontuacao}`;
    document.getElementById('melhorPontuacaoFacil').textContent = `${melhorPontuacaoPorNivel['Fácil']}`;
    document.getElementById('melhorPontuacaoMedio').textContent = `${melhorPontuacaoPorNivel['Médio']}`;
    document.getElementById('melhorPontuacaoDificil').textContent = `${melhorPontuacaoPorNivel['Difícil']}`;
}

document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('index.html')) {
        exibirMaiorPontuacao();
    }
    if (window.location.pathname.endsWith('memozoon.html')) {
        const params = getParams();
        const modoElement = document.getElementById('modoSelecionado');
        modoElement.textContent = `Modo: ${params.modo}`;
        console.log(`Modo: ${params.modo}`);
        temporizador();
        loadJogo();
    }
    if (window.location.pathname.endsWith('relatida.html')) {
        exibirResumoPartida();
        tocarSomResumo();
        document.getElementById('reiniciarBtn').addEventListener('click', reiniciarPartida);
    }
});

function getParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const queryArray = queryString.split('&');
    queryArray.forEach(function (param) {
        const [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    return params;
}

const checkFimdeJogo = (totalCartas) => {
    const cartasDesabilitadas = document.querySelectorAll('.desabilitar-carta');
    setTimeout(() => {
        if (cartasDesabilitadas.length === totalCartas) {
            clearInterval(this.loop);
            let tempoFinal = tempoContado - 5;
            if (tempoFinal < 0) tempoFinal = 0;
            const modo = getParams().modo;
            let pontos = 0;
            switch (modo) {
                case 'Fácil':
                    pontos = 240 / tempoFinal + 10 * Math.pow(0.8, erros);
                    break;
                case 'Médio':
                    pontos = 720 / tempoFinal + 20 * Math.pow(0.8, erros);
                    break;
                case 'Difícil':
                    pontos = 640 / tempoFinal + 80 * Math.pow(0.8, erros);
                    break;
                default:
                    pontos = 0;
                    break;
            }
            pontos = Math.round(pontos);
            const pontuacoes = JSON.parse(localStorage.getItem('pontuacoes')) || [];
            pontuacoes.push({ modo, pontos });
            localStorage.setItem('pontuacoes', JSON.stringify(pontuacoes));

            localStorage.setItem('pontos', pontos);
            localStorage.setItem('tempo', tempoFinal);
            localStorage.setItem('modo', modo);
            localStorage.setItem('tentativas', tentativas);

            console.log(`Pontuação: ${pontos}`);
            window.location.href = 'relatida.html';
        }
    }, 800);
}

function exibirResumoPartida() {
    const pontos = localStorage.getItem('pontos');
    const tempo = localStorage.getItem('tempo');
    const modo = localStorage.getItem('modo');
    const tentativas = localStorage.getItem('tentativas');

    document.getElementById('pontos').textContent = pontos;
    document.getElementById('tempodtm').textContent = `${tempo} segundos`;
    document.getElementById('modofinal').textContent = modo;
    document.getElementById('tentativas').textContent = tentativas;

    console.log('Pontuação: ', pontos);
}

function tocarSomResumo() {
    const resumaudio = new Audio('resumossom.mp3');
    resumaudio.volume = 0.5;
    resumaudio.play();
}

function reiniciarPartida() {
    const modo = localStorage.getItem('modo');
    localStorage.removeItem('pontos');
    localStorage.removeItem('tempo');
    localStorage.removeItem('tentativas');
    window.location.href = `memozoon.html?modo=${modo}`;
}

let primeiraCarta = '';
let segundaCarta = '';

const checarCartas = () => {
    const primeiraFoto = primeiraCarta.getAttribute('data-foto');
    const segundaFoto = segundaCarta.getAttribute('data-foto');

    if (primeiraFoto === segundaFoto) {
        primeiraCarta.firstChild.classList.add('desabilitar-carta');
        segundaCarta.firstChild.classList.add('desabilitar-carta');
        primeiraCarta = '';
        segundaCarta = '';
        tentativas++;
        const totalCartas = document.querySelectorAll('.carta').length;
        checkFimdeJogo(totalCartas);

    } else {
        setTimeout(() => {
            primeiraCarta.classList.remove('revelar-carta');
            segundaCarta.classList.remove('revelar-carta');
            primeiraCarta = '';
            segundaCarta = '';
            erros++;
            tentativas++;
        }, 500);

    }
}

const audio = new Audio('virarsom.mp3');
audio.playbackRate = 2.0;

const revelarCarta = ({ target }) => {
    if (tempoDecorrido >= 5) {
        audio.play();
    }

    if (target.parentNode.className.includes('revelar-carta')) {
        return;
    }

    if (primeiraCarta === '') {
        target.parentNode.classList.add('revelar-carta');
        primeiraCarta = target.parentNode;
    } else if (segundaCarta === '') {
        target.parentNode.classList.add('revelar-carta');
        segundaCarta = target.parentNode;
        checarCartas();
    }
}

const criarElemento = (tag, className) => {
    const element = document.createElement(tag);
    element.className = className;
    return element;
}

const criarCarta = (foto) => {
    const carta = criarElemento('div', 'carta');
    const frente = criarElemento('div', 'lado frente');
    const verso = criarElemento('div', 'lado verso');

    frente.style.backgroundImage = `url('${foto}.png')`;

    carta.appendChild(frente);
    carta.appendChild(verso);

    carta.addEventListener('click', revelarCarta);
    carta.setAttribute('data-foto', foto)

    return carta;
}

const embaralharFotos = (array) => {
    const arrayEmbaralhado = array.slice();

    for (let i = arrayEmbaralhado.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayEmbaralhado[i], arrayEmbaralhado[j]] = [arrayEmbaralhado[j], arrayEmbaralhado[i]];
    }

    return arrayEmbaralhado;
};

const selecionarCartas = (numeroDeCartas) => {
    const fotosEmbaralhadas = embaralharFotos(fotos);
    const cartasSelecionadas = [];
    for (let i = 0; i < numeroDeCartas; i++) {
        cartasSelecionadas.push(fotosEmbaralhadas[i]);
    }
    return cartasSelecionadas;
};

const memosom = new Audio('somemo.mp3');
memosom.volume = 0.3;

const loadJogo = () => {
    memosom.play();
    const params = getParams();
    const modoSelecionado = params.modo;
    let numeroDeCartas = 0;
    switch (modoSelecionado) {
        case 'Fácil':
            numeroDeCartas = 4;
            break;
        case 'Médio':
            numeroDeCartas = 6;
            break;
        case 'Difícil':
            numeroDeCartas = 8;
            break;
        default:
            numeroDeCartas = 4;
            break;
    }
    const cartasSelecionadas = selecionarCartas(numeroDeCartas);
    const duplicarFoto = [...cartasSelecionadas, ...cartasSelecionadas];

    const embaralharLista = duplicarFoto.sort(() => Math.random() - 0.5);

    const grid = document.querySelector('.grid');
    embaralharLista.forEach((foto) => {
        const carta = criarCarta(foto);
        grid.appendChild(carta);
    });

    const cartasViradas = document.querySelectorAll('.carta');
    cartasViradas.forEach(carta => carta.classList.add('revelar-carta'));
    setTimeout(() => {
        cartasViradas.forEach(carta => carta.classList.remove('revelar-carta'));
    }, 5000);
}

const tempo = document.getElementById('tempo');
let tempoContado = 0;
const temporizador = () => {
    this.loop = setInterval(() => {
        tempoContado++;
        tempoDecorrido++;
        tempo.innerHTML = tempoContado;
    }, 1000);
}

const salvarPontuacao = (pontos) => {
    pontuacoes.push(pontos);
    pontuacoes.sort((a, b) => b - a);
    localStorage.setItem('pontuacoes', JSON.stringify(pontuacoes));
};

const getMaiorPontuacao = () => {
    const pontuacoesArmazenadas = localStorage.getItem('pontuacoes');
    if (pontuacoesArmazenadas) {
        const pontuacoes = JSON.parse(pontuacoesArmazenadas);
        return pontuacoes.length > 0 ? pontuacoes[0] : -Infinity;
    } else {
        return -Infinity;
    }
};
