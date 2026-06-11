const URL_API =
  "https://script.google.com/macros/s/AKfycbwPY75uUTYVo7jYfZhWY_vbUzHWaWXtJO7_FH0LsXQBBZ74tz92RilbaswHdIYwa07p/exec";

const VALOR_POR_PARTICIPANTE = 20;

const ranking = document.getElementById("ranking");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const premioTotalEl = document.getElementById("premioTotal");

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

    const lista = linhas
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
      });

    const premioTotal = lista.length * VALOR_POR_PARTICIPANTE;

    mostrarPremio(premioTotal);
    mostrarRanking(lista);
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

function mostrarPremio(valor) {
  if (!premioTotalEl) return;

  premioTotalEl.textContent = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarRanking(lista) {
  ranking.innerHTML = "";

  if (lista.length === 0) {
    ranking.innerHTML = `
      <p class="erro">
        Nenhum palpiteiro encontrado na planilha.
      </p>
    `;
    mostrarPremio(0);
    return;
  }

  lista.forEach((pessoa, index) => {
    const item = document.createElement("div");

    item.classList.add("ranking-item");

    if (index === 0) item.classList.add("top1");
    if (index === 1) item.classList.add("top2");
    if (index === 2) item.classList.add("top3");

    item.innerHTML = `
      <span class="posicao">${index + 1}º</span>
      <span class="nome">${pessoa.nome}</span>
      <span class="pontos">
        <strong>${pessoa.pontos}</strong> pts
      </span>
    `;

    ranking.appendChild(item);
  });
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

carregarRanking();

setInterval(carregarRanking, 10000);