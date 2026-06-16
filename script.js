const URL_API =
  "https://script.google.com/macros/s/AKfycbwPY75uUTYVo7jYfZhWY_vbUzHWaWXtJO7_FH0LsXQBBZ74tz92RilbaswHdIYwa07p/exec";

const VALOR_POR_PARTICIPANTE = 20;

const ranking = document.getElementById("ranking");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const premioTotalEl = document.getElementById("premioTotal");
const liderAtualEl = document.getElementById("liderAtual");
const btnBusca = document.getElementById("btnBusca");
const areaBusca = document.getElementById("areaBusca");
const buscaParticipante = document.getElementById("buscaParticipante");
const resultadoBusca = document.getElementById("resultadoBusca");

let listaRanking = [];

async function carregarRanking() {
  try {
    const urlSemCache = `${URL_API}?cachebuster=${Date.now()}`;

    const resposta = await fetch(urlSemCache, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível acessar a API.");
    }

    const dados = await resposta.json();
    const linhas = dados.slice(1);

    listaRanking = linhas
      .map(colunas => {
        return {
          nome: limparCampo(colunas[0]),
          pontos: converterNumero(colunas[1])
        };
      })
      .filter(item => item.nome)
      .sort((a, b) => {
        if (b.pontos !== a.pontos) {
          return b.pontos - a.pontos;
        }

        return a.nome.localeCompare(b.nome, "pt-BR", {
          sensitivity: "base"
        });
      })
      .map((pessoa, index) => {
        return {
          ...pessoa,
          posicaoAtual: index + 1
        };
      });

    const premioTotal = listaRanking.length * VALOR_POR_PARTICIPANTE;

    mostrarPremio(premioTotal);
    mostrarLiderAtual();
    mostrarRanking();
    atualizarBusca();
    atualizarHorario();

  } catch (erro) {
    console.error("Erro ao carregar ranking:", erro);

    ranking.innerHTML = `
      <p class="erro">
        Erro ao carregar a planilha.
      </p>
    `;
  }
}

function mostrarRanking() {
  ranking.innerHTML = "";

  if (listaRanking.length === 0) {
    ranking.innerHTML = `
      <p class="erro">
        Nenhum palpiteiro encontrado na planilha.
      </p>
    `;
    mostrarPremio(0);
    mostrarLiderAtual();
    return;
  }

  listaRanking.forEach(pessoa => {
    const item = document.createElement("div");

    item.classList.add("ranking-item");

    if (pessoa.posicaoAtual === 1) item.classList.add("top1");
    if (pessoa.posicaoAtual === 2) item.classList.add("top2");
    if (pessoa.posicaoAtual === 3) item.classList.add("top3");

    item.innerHTML = `
      <span class="posicao">${pessoa.posicaoAtual}º</span>
      <span class="nome">${pessoa.nome}</span>
      <span class="pontos">
        <strong>${pessoa.pontos}</strong> pts
      </span>
    `;

    ranking.appendChild(item);
  });
}

function mostrarLiderAtual() {
  if (!liderAtualEl) return;

  if (listaRanking.length === 0) {
    liderAtualEl.textContent = "Sem líder";
    return;
  }

  const lider = listaRanking[0];
  liderAtualEl.textContent = lider.nome;
}

function atualizarBusca() {
  if (!buscaParticipante || !resultadoBusca) return;

  const termo = buscaParticipante.value.trim().toLowerCase();

  if (!termo) {
    resultadoBusca.textContent = "Digite um nome para consultar.";
    return;
  }

  const pessoa = listaRanking.find(item =>
    item.nome.toLowerCase().includes(termo)
  );

  if (!pessoa) {
    resultadoBusca.textContent = "Participante não encontrado.";
    return;
  }

  const lider = listaRanking[0];
  const diferenca = lider.pontos - pessoa.pontos;

  if (pessoa.posicaoAtual === 1) {
    resultadoBusca.innerHTML = `
      🏆 <strong>${pessoa.nome}</strong>, você é o líder do bolão!
      <br>
      Pontuação: <strong>${pessoa.pontos} pts</strong>
    `;
    return;
  }

  resultadoBusca.innerHTML = `
    <strong>${pessoa.nome}</strong> está em 
    <strong>${pessoa.posicaoAtual}º lugar</strong>.
    <br>
    Pontuação: <strong>${pessoa.pontos} pts</strong>.
    <br>
    Está a <strong>${diferenca} pts</strong> do líder 
    <strong>${lider.nome}</strong>.
  `;
}

function mostrarPremio(valor) {
  if (!premioTotalEl) return;

  premioTotalEl.textContent = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function limparCampo(campo) {
  if (!campo) return "";

  return String(campo)
    .replaceAll('"', "")
    .replace(/\r/g, "")
    .trim();
}

function converterNumero(valor) {
  const numero = limparCampo(valor)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number(numero) || 0;
}

function atualizarHorario() {
  if (!ultimaAtualizacao) return;

  const agora = new Date();

  ultimaAtualizacao.textContent =
    "Última atualização: " +
    agora.toLocaleDateString("pt-BR") +
    " " +
    agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
}

btnBusca.addEventListener("click", () => {
  areaBusca.classList.toggle("ativa");

  if (areaBusca.classList.contains("ativa")) {
    buscaParticipante.focus();
  }
});

buscaParticipante.addEventListener("input", atualizarBusca);

carregarRanking();

setInterval(carregarRanking, 15000);