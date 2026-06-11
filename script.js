const URL_PLANILHA_BASE =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_gmljlZhPy8DdT6Nbn-D9WgSwuL_IIq3ZlAsIYdea9e2ZZh34J5lftUhgo2sew2ErVRHb9SCVmbS0/pub?output=csv";

const ranking = document.getElementById("ranking");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");

async function carregarRanking() {
  try {
    const urlSemCache = `${URL_PLANILHA_BASE}&cachebuster=${Date.now()}`;

    const resposta = await fetch(urlSemCache, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível acessar a planilha.");
    }

    const texto = await resposta.text();

    if (!texto.trim()) {
      throw new Error("A planilha está vazia.");
    }

    const linhas = texto
      .trim()
      .split(/\r?\n/)
      .slice(1);

    const lista = linhas
      .map(linha => {
        const colunas = linha.split(",");

        return {
          nome: limparCampo(colunas[0]),
          pontos: converterPontos(colunas[1])
        };
      })
      .filter(item => item.nome)
      .sort((a, b) => b.pontos - a.pontos);

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

  return campo
    .replaceAll('"', "")
    .replace(/\r/g, "")
    .trim();
}

function converterPontos(valor) {
  const pontos = limparCampo(valor)
    .replace(",", ".")
    .replace(/[^\d.-]/g, "");

  return Number(pontos) || 0;
}

function mostrarRanking(lista) {
  ranking.innerHTML = "";

  if (lista.length === 0) {
    ranking.innerHTML = `
      <p class="erro">
        Nenhum palpiteiro encontrado na planilha.
      </p>
    `;
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