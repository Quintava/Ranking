const URL_PLANILHA =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_gmljlZhPy8DdT6Nbn-D9WgSwuL_IIq3ZlAsIYdea9e2ZZh34J5lftUhgo2sew2ErVRHb9SCVmbS0/pub?output=csv";

const ranking = document.getElementById("ranking");

async function carregarRanking() {
  try {
    const resposta = await fetch(URL_PLANILHA);

    if (!resposta.ok) {
      throw new Error("Não foi possível acessar a planilha.");
    }

    const texto = await resposta.text();

    const linhas = texto.trim().split("\n").slice(1);

    const lista = linhas
      .map(linha => {
        const colunas = linha.split(",");

        return {
          nome: limparCampo(colunas[0]),
          pontos: Number(limparCampo(colunas[1])) || 0
        };
      })
      .filter(item => item.nome)
      .sort((a, b) => b.pontos - a.pontos);

    mostrarRanking(lista);

  } catch (erro) {
    console.error("Erro:", erro);

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

function mostrarRanking(lista) {
  ranking.innerHTML = "";

  lista.forEach((pessoa, index) => {
    const item = document.createElement("div");

    item.classList.add("ranking-item");

    if (index === 0) item.classList.add("top1");
    if (index === 1) item.classList.add("top2");
    if (index === 2) item.classList.add("top3");

    item.innerHTML = `
      <span class="posicao">${index + 1}º</span>
      <span class="nome">${pessoa.nome}</span>
      <span class="pontos">${pessoa.pontos} pts</span>
    `;

    ranking.appendChild(item);
  });
}

carregarRanking();
setInterval(carregarRanking, 30000);