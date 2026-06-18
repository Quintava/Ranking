const URL_API =
  "https://script.google.com/macros/s/AKfycbwPY75uUTYVo7jYfZhWY_vbUzHWaWXtJO7_FH0LsXQBBZ74tz92RilbaswHdIYwa07p/exec";

const URL_JOGOS =
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?limit=300";

const VALOR_POR_PARTICIPANTE = 20;

const traducaoTimes = {
  Brazil: "Brasil",
  Argentina: "Argentina",
  France: "França",
  Germany: "Alemanha",
  Spain: "Espanha",
  Portugal: "Portugal",
  England: "Inglaterra",
  Italy: "Itália",
  Netherlands: "Holanda",
  Belgium: "Bélgica",
  Uruguay: "Uruguai",
  Mexico: "México",
  "United States": "Estados Unidos",
  Canada: "Canadá",
  Japan: "Japão",
  "South Korea": "Coreia do Sul",
  Morocco: "Marrocos",
  Senegal: "Senegal",
  Ghana: "Gana",
  Croatia: "Croácia",
  Switzerland: "Suíça",
  Australia: "Austrália",
  Qatar: "Catar",
  "Saudi Arabia": "Arábia Saudita",
  Iran: "Irã",
  Ecuador: "Equador",
  Colombia: "Colômbia",
  Paraguay: "Paraguai",
  Tunisia: "Tunísia",
  "Ivory Coast": "Costa do Marfim",
  Egypt: "Egito",
  Algeria: "Argélia",
  "South Africa": "África do Sul",
  Scotland: "Escócia",
  Norway: "Noruega",
  Sweden: "Suécia",
  Turkey: "Turquia",
  Czechia: "Tchéquia",
  Austria: "Áustria",
  "New Zealand": "Nova Zelândia",
  Haiti: "Haiti",
  Panama: "Panamá",
  "Bosnia and Herzegovina": "Bósnia e Herzegovina",
  "Cape Verde": "Cabo Verde",
  Curacao: "Curaçao",
  "DR Congo": "RD Congo",
  Uzbekistan: "Uzbequistão",
  Iraq: "Iraque",
  Jordan: "Jordânia"
};

const ranking = document.getElementById("ranking");
const ultimaAtualizacao = document.getElementById("ultimaAtualizacao");
const premioTotalEl = document.getElementById("premioTotal");
const liderAtualEl = document.getElementById("liderAtual");

const listaJogosEl = document.getElementById("listaJogos");
const listaProximosEl = document.getElementById("listaProximos");
const listaFinalizadosEl = document.getElementById("listaFinalizados");
const ultimaAtualizacaoJogos = document.getElementById("ultimaAtualizacaoJogos");

const botoesMenu = document.querySelectorAll(".menu-btn");
const paginas = document.querySelectorAll(".pagina");

let listaRanking = [];
let listaJogos = [];

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
      .map(colunas => ({
        nome: limparCampo(colunas[0]),
        pontos: converterNumero(colunas[1])
      }))
      .filter(item => item.nome)
      .sort((a, b) => {
        if (b.pontos !== a.pontos) return b.pontos - a.pontos;

        return a.nome.localeCompare(b.nome, "pt-BR", {
          sensitivity: "base"
        });
      })
      .map((pessoa, index) => ({
        ...pessoa,
        posicaoAtual: index + 1
      }));

    const premioTotal = listaRanking.length * VALOR_POR_PARTICIPANTE;

    mostrarPremio(premioTotal);
    mostrarLiderAtual();
    mostrarRanking();
    atualizarHorario();

  } catch (erro) {
    console.error("Erro ao carregar ranking:", erro);

    ranking.innerHTML = `
      <p class="erro">Erro ao carregar a planilha.</p>
    `;
  }
}

function mostrarRanking() {
  ranking.innerHTML = "";

  if (listaRanking.length === 0) {
    ranking.innerHTML = `
      <p class="erro">Nenhum palpiteiro encontrado na planilha.</p>
    `;
    mostrarPremio(0);
    mostrarLiderAtual();
    return;
  }

  const lider = listaRanking[0];

  listaRanking.forEach(pessoa => {
    const item = document.createElement("div");

    item.classList.add("ranking-item");

    if (pessoa.posicaoAtual === 1) item.classList.add("top1");
    if (pessoa.posicaoAtual === 2) item.classList.add("top2");
    if (pessoa.posicaoAtual === 3) item.classList.add("top3");

    const diferenca = lider.pontos - pessoa.pontos;
    const textoDiferenca =
      pessoa.posicaoAtual === 1 ? "Líder" : `-${diferenca} pts`;

    item.innerHTML = `
      <span class="posicao">${pessoa.posicaoAtual}º</span>

      <span class="nome">${pessoa.nome}</span>

      <span class="pontos">
        <strong>${pessoa.pontos}</strong> pts
      </span>

      <span class="diferenca ${pessoa.posicaoAtual === 1 ? "lider" : ""}">
        ${textoDiferenca}
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

  liderAtualEl.textContent = listaRanking[0].nome;
}

function mostrarPremio(valor) {
  if (!premioTotalEl) return;

  premioTotalEl.textContent = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

async function carregarJogos() {
  try {
    const resposta = await fetch(`${URL_JOGOS}&cachebuster=${Date.now()}`, {
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar jogos.");
    }

    const dados = await resposta.json();

    listaJogos = (dados.events || []).map(evento => {
      const competicao = evento.competitions?.[0];
      const competidores = competicao?.competitors || [];

      const casa = competidores.find(time => time.homeAway === "home");
      const fora = competidores.find(time => time.homeAway === "away");

      const status = competicao?.status?.type || {};
      const dataJogo = new Date(evento.date);

      const nomeCasaOriginal = casa?.team?.displayName || "Mandante";
      const nomeForaOriginal = fora?.team?.displayName || "Visitante";

      const siglaCasa = casa?.team?.abbreviation || "";
      const siglaFora = fora?.team?.abbreviation || "";

      return {
        data: dataJogo,
        dataTexto: dataJogo.toLocaleDateString("pt-BR"),
        horaTexto: dataJogo.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit"
        }),

        timeCasa: traduzirTime(nomeCasaOriginal),
        timeFora: traduzirTime(nomeForaOriginal),

        siglaCasa,
        siglaFora,

        bandeiraCasa: gerarBandeira(siglaCasa),
        bandeiraFora: gerarBandeira(siglaFora),

        placarCasa: casa?.score ?? "-",
        placarFora: fora?.score ?? "-",

        statusNome: traduzirDescricaoStatus(status.description || "Agendado"),
        statusEstado: definirStatus(status)
      };
    });

    listaJogos.sort((a, b) => a.data - b.data);

    mostrarTodasListasJogos();
    atualizarHorarioJogos();

  } catch (erro) {
    console.error("Erro ao carregar jogos:", erro);

    const mensagem = `
      <p class="erro">
        Não foi possível carregar os jogos automaticamente agora.
      </p>
    `;

    if (listaJogosEl) listaJogosEl.innerHTML = mensagem;
    if (listaProximosEl) listaProximosEl.innerHTML = mensagem;
    if (listaFinalizadosEl) listaFinalizadosEl.innerHTML = mensagem;

    if (ultimaAtualizacaoJogos) {
      ultimaAtualizacaoJogos.textContent = "Erro ao atualizar jogos.";
    }
  }
}

function gerarBandeira(sigla) {
  if (!sigla) return "";

  const conversao = {
    ALG: "dz",
    DZA: "dz",
    ARG: "ar",
    AUS: "au",
    AUT: "at",
    BEL: "be",
    BIH: "ba",
    BRA: "br",
    CAN: "ca",
    CIV: "ci",
    COD: "cd",
    COL: "co",
    CPV: "cv",
    CRO: "hr",
    CUW: "cw",
    CZE: "cz",
    ECU: "ec",
    EGY: "eg",
    ENG: "gb-eng",
    ESP: "es",
    FRA: "fr",
    GER: "de",
    GHA: "gh",
    HTI: "ht",
    IRI: "ir",
    IRN: "ir",
    IRQ: "iq",
    JPN: "jp",
    JOR: "jo",
    KOR: "kr",
    KSA: "sa",
    MAR: "ma",
    MEX: "mx",
    NED: "nl",
    NOR: "no",
    NZL: "nz",
    PAN: "pa",
    PAR: "py",
    POR: "pt",
    QAT: "qa",
    RSA: "za",
    SCO: "gb-sct",
    SEN: "sn",
    SUI: "ch",
    SWE: "se",
    TUN: "tn",
    TUR: "tr",
    USA: "us",
    URU: "uy",
    UZB: "uz"
  };

  const codigo = conversao[sigla.toUpperCase()];

  if (!codigo) return "";

  return `https://flagcdn.com/w40/${codigo}.png`;
}

function traduzirTime(nome) {
  return traducaoTimes[nome] || nome;
}

function traduzirDescricaoStatus(status) {
  const statusTraduzidos = {
    Scheduled: "Agendado",
    Final: "Finalizado",
    "Full Time": "Fim de jogo",
    "In Progress": "Ao vivo",
    Halftime: "Intervalo",
    Postponed: "Adiado",
    Canceled: "Cancelado",
    Delayed: "Atrasado"
  };

  return statusTraduzidos[status] || status;
}

function definirStatus(status) {
  if (status.completed) return "finalizado";
  if (status.state === "in") return "aovivo";
  return "agendado";
}

function mostrarTodasListasJogos() {
  mostrarJogos(listaJogosEl, listaJogos);

  const proximos = listaJogos.filter(jogo => jogo.statusEstado === "agendado");
  mostrarJogos(listaProximosEl, proximos);

  const finalizados = listaJogos
    .filter(jogo => jogo.statusEstado === "finalizado")
    .reverse();

  mostrarJogos(listaFinalizadosEl, finalizados);
}

function mostrarJogos(elemento, jogos) {
  if (!elemento) return;

  if (!jogos || jogos.length === 0) {
    elemento.innerHTML = `
      <p class="erro">Nenhum jogo encontrado.</p>
    `;
    return;
  }

  elemento.innerHTML = jogos.map(jogo => {
    const bandeiraCasa = jogo.bandeiraCasa
      ? `<img src="${jogo.bandeiraCasa}" class="bandeira" alt="${jogo.timeCasa}">`
      : `<span class="bandeira-texto">🏳️</span>`;

    const bandeiraFora = jogo.bandeiraFora
      ? `<img src="${jogo.bandeiraFora}" class="bandeira" alt="${jogo.timeFora}">`
      : `<span class="bandeira-texto">🏳️</span>`;

    return `
      <article class="jogo-card">
        <div class="jogo-info">
          <span>${jogo.dataTexto} • ${jogo.horaTexto}</span>
          <span>${traduzirStatus(jogo.statusEstado)}</span>
        </div>

        <div class="jogo-placar">
          <div class="time casa">
            ${bandeiraCasa}
            <span>${jogo.timeCasa}</span>
            ${jogo.siglaCasa ? `<small>(${jogo.siglaCasa})</small>` : ""}
          </div>

          <div class="placar">
            ${jogo.placarCasa} x ${jogo.placarFora}
          </div>

          <div class="time fora">
            ${bandeiraFora}
            <span>${jogo.timeFora}</span>
            ${jogo.siglaFora ? `<small>(${jogo.siglaFora})</small>` : ""}
          </div>
        </div>

        <div class="status-jogo">
          ${jogo.statusNome}
        </div>
      </article>
    `;
  }).join("");
}

function traduzirStatus(status) {
  if (status === "finalizado") return "Finalizado";
  if (status === "aovivo") return "Ao vivo";
  return "Agendado";
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

function atualizarHorarioJogos() {
  if (!ultimaAtualizacaoJogos) return;

  const agora = new Date();

  ultimaAtualizacaoJogos.textContent =
    "Jogos atualizados em: " +
    agora.toLocaleDateString("pt-BR") +
    " " +
    agora.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });
}

botoesMenu.forEach(botao => {
  botao.addEventListener("click", () => {
    const pagina = botao.dataset.pagina;

    botoesMenu.forEach(item => item.classList.remove("ativo"));
    paginas.forEach(item => item.classList.remove("ativa"));

    botao.classList.add("ativo");

    const paginaSelecionada = document.getElementById(`pagina-${pagina}`);

    if (paginaSelecionada) {
      paginaSelecionada.classList.add("ativa");
    }
  });
});

carregarRanking();
carregarJogos();

setInterval(carregarRanking, 15000);
setInterval(carregarJogos, 60000);