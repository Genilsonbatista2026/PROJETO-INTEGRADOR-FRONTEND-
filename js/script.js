// =========================================================================
// PARTE 1: GRÁFICO EM CANVAS 2D (Aula 05)
// =========================================================================
const canvas = document.querySelector("#grafico-atendimentos");

if (canvas && canvas.getContext) {
  const ctx = canvas.getContext("2d");

  // Fundo da barra de progresso
  ctx.fillStyle = "#f8bbd0";
  ctx.fillRect(20, 40, 340, 30);

  // Barra preenchida (85% da meta de 200 atendimentos = 289px)
  ctx.fillStyle = "#ad1457";
  ctx.fillRect(20, 40, 289, 30);

  // Texto descritivo acima da barra
  ctx.fillStyle = "#333333";
  ctx.font = "14px Arial";
  ctx.fillText("Meta atingida: 170 de 200 atendimentos (85%)", 20, 25);
}

// =========================================================================
// PARTE 2: RENDERIZAÇÃO NO DOM (Aula 11 - usa os dados já prontos de js/logica.js)
// =========================================================================
function criarCardServicoDOM(itemProcessado) {
  const classificacao = classificarDuracao(itemProcessado.duracaoMin);

  const div = document.createElement("div");
  div.classList.add("item-resultado", classificacao.classeCss);
  div.textContent = itemProcessado.nome + " (" + itemProcessado.duracaoMin + " min - " + classificacao.rotulo + ") | De R$ " + itemProcessado.preco.toFixed(2) + " por R$ " + itemProcessado.valorPromocional.toFixed(2);

  return div;
}

const secaoResultado = document.querySelector("#resultado");

if (secaoResultado !== null) {
  // 1. Renderiza os serviços promocionais calculados em js/logica.js
  servicosComDesconto.forEach((servico) => {
    const elementoCard = criarCardServicoDOM(servico);
    secaoResultado.append(elementoCard);
  });

  const paragrafoResumo = document.createElement("p");
  paragrafoResumo.style.marginTop = "1rem";
  paragrafoResumo.style.fontWeight = "bold";
  paragrafoResumo.textContent = "Resumo: " + servicosLongos.length + " serviços exigem mais de 1 hora. Valor total do pacote promocional: R$ " + somaPromocional.toFixed(2) + ".";
  secaoResultado.append(paragrafoResumo);

  // 2. Renderiza também os agendamentos da semana na página
  const tituloAgendamentos = document.createElement("h3");
  tituloAgendamentos.textContent = "Agendamentos Analisados da Semana";
  tituloAgendamentos.style.marginTop = "1.5rem";
  secaoResultado.append(tituloAgendamentos);

  agendamentosSemana.forEach((item) => {
    const p = document.createElement("p");
    p.classList.add("item-resultado", "faixa-media");
    p.textContent = "Cliente: " + item.cliente + " | Dia: " + item.dia + " | Valor: R$ " + item.valor.toFixed(2);
    secaoResultado.append(p);
  });
}

/// =========================================================================
// PARTE 3 E 4 UNIFICADAS: AGENDA SEMANAL + FORMULÁRIO DE PRÉ-AGENDAMENTO
// Padrão: evento -> atualiza os dados -> redesenha (sem innerHTML)
// =========================================================================

// 1. FONTE DE VERDADE: Array inicial com a propriedade "cliente" incluída
const horariosIniciais = [
  { id: 1, dia: "Terça-feira", horario: "09:00", cliente: "", servico: "Alongamento na Tip", profissional: "Andreza", valor: 140.00, reservado: false },
  { id: 2, dia: "Quarta-feira", horario: "14:00", cliente: "", servico: "Esmaltação em Gel", profissional: "Andreza", valor: 70.00, reservado: false },
  { id: 3, dia: "Quinta-feira", horario: "11:00", cliente: "", servico: "Banho de Gel", profissional: "Andreza", valor: 95.00, reservado: false },
  { id: 4, dia: "Sexta-feira", horario: "10:30", cliente: "Carla Mendes", servico: "Manutenção em Gel", profissional: "Andreza", valor: 110.00, reservado: true },
  { id: 5, dia: "Sábado", horario: "15:00", cliente: "", servico: "Combo Mão + Spa dos Pés", profissional: "Andreza", valor: 140.00, reservado: false }
];

const horariosSemanal = JSON.parse(localStorage.getItem("agendaUnificadaBellaNails")) || horariosIniciais;
let proximoIdAgenda = horariosSemanal.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;

function salvarAgendaNoNavegador() {
  localStorage.setItem("agendaUnificadaBellaNails", JSON.stringify(horariosSemanal));
}

// Referências únicas do DOM
const tbodyAgendaSemanal = document.querySelector("#tbody-agenda-semanal");
const selectFiltroDia = document.querySelector("#filtro-dia");
const inputBuscaServico = document.querySelector("#busca-servico");
const paragrafoResumoAgenda = document.querySelector("#resumo-agenda");
const btnToggleNovoHorario = document.querySelector("#btn-adicionar-linha");
const painelNovoHorario = document.querySelector("#painel-novo-horario");
const formNovoHorario = document.querySelector("#form-novo-horario");
const formularioAgendamento = document.querySelector(".formulario-agendamento");

// Utilitários para o formulário principal de pré-agendamento
function obterDiaDaSemana(dataISO) {
  if (!dataISO) return "Terça-feira";
  const dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const dataObj = new Date(dataISO + "T12:00:00");
  return dias[dataObj.getDay()] || "Terça-feira";
}

function extrairValorDoServico(textoServico) {
  const match = textoServico.match(/R\$\s*(\d+[.,]?\d*)/);
  if (match) {
    return Number(match[1].replace(",", "."));
  }
  return 0;
}

// 7. FUNÇÃO PURA DE CÁLCULO DO RESUMO
function calcularResumoSemanal(listaFiltrada) {
  const total = listaFiltrada.length;
  const disponiveis = listaFiltrada.filter((item) => !item.reservado).length;
  const faturamento = listaFiltrada.reduce((soma, item) => soma + item.valor, 0);
  return { total, disponiveis, faturamento };
}

function atualizarResumoSemanal(listaFiltrada) {
  if (!paragrafoResumoAgenda) return;
  const { total, disponiveis, faturamento } = calcularResumoSemanal(listaFiltrada);
  paragrafoResumoAgenda.textContent = `Exibindo ${total} horário(s) | Vagas disponíveis: ${disponiveis} | Valor total listado: R$ ${faturamento.toFixed(2).replace(".", ",")}`;
}

// 2. CRIA UMA LINHA <tr> COM SEGURANÇA (Com a coluna Cliente)
function criarLinhaAgendaSemanal(item) {
  const tr = document.createElement("tr");
  tr.dataset.id = String(item.id);

  const tdDia = document.createElement("td");
  tdDia.textContent = item.dataFormatada ? `${item.dia} (${item.dataFormatada})` : item.dia;

  const tdHorario = document.createElement("td");
  tdHorario.textContent = item.horario;

  const tdCliente = document.createElement("td");
  tdCliente.textContent = item.cliente && item.cliente.trim() !== "" ? item.cliente : "—";

  const tdServico = document.createElement("td");
  tdServico.textContent = item.servico;

  const tdProfissional = document.createElement("td");
  tdProfissional.textContent = item.profissional;

  const tdValor = document.createElement("td");
  tdValor.textContent = item.valor > 0 ? `R$ ${item.valor.toFixed(2).replace(".", ",")}` : "A confirmar";

  const tdStatus = document.createElement("td");
  const spanBadge = document.createElement("span");
  spanBadge.className = item.reservado ? "badge ultima-vaga" : "badge disponivel";
  spanBadge.textContent = item.reservado ? "Reservado" : "Disponível";
  tdStatus.append(spanBadge);

  const tdAcoes = document.createElement("td");

  const btnReservar = document.createElement("button");
  btnReservar.type = "button";
  btnReservar.dataset.acao = "alternar-reserva";
  btnReservar.setAttribute("aria-pressed", String(item.reservado));
  btnReservar.textContent = item.reservado ? "Liberar" : "Reservar";

  const btnExcluir = document.createElement("button");
  btnExcluir.type = "button";
  btnExcluir.className = "btn-excluir";
  btnExcluir.dataset.acao = "excluir";
  btnExcluir.title = "Excluir linha";
  btnExcluir.setAttribute("aria-label", `Excluir horário de ${item.servico}`);
  btnExcluir.textContent = "🗑️";

  tdAcoes.append(btnReservar, " ", btnExcluir);
  tr.append(tdDia, tdHorario, tdCliente, tdServico, tdProfissional, tdValor, tdStatus, tdAcoes);

  return tr;
}

// 3. DESENHA A TABELA A PARTIR DOS DADOS E FILTROS
function desenharAgendaSemanal() {
  if (!tbodyAgendaSemanal) return;

  const diaEscolhido = selectFiltroDia ? selectFiltroDia.value : "todos";
  const termoBusca = inputBuscaServico ? inputBuscaServico.value.trim().toLowerCase() : "";

  const listaFiltrada = horariosSemanal.filter((item) => {
    const bateDia = diaEscolhido === "todos" || item.dia === diaEscolhido;
    const textoCompleto = `${item.servico} ${item.cliente || ""}`.toLowerCase();
    const bateBusca = textoCompleto.includes(termoBusca);
    return bateDia && bateBusca;
  });

  const linhas = listaFiltrada.map(criarLinhaAgendaSemanal);
  tbodyAgendaSemanal.replaceChildren(...linhas);
  atualizarResumoSemanal(listaFiltrada);
}

// 4. DELEGAÇÃO DE EVENTOS NA TABELA (Usa closest e dataset)
function lidarCliqueAgendaSemanal(evento) {
  const botao = evento.target.closest("button[data-acao]");
  if (!botao) return;

  const linha = botao.closest("tr[data-id]");
  if (!linha) return;

  const id = Number(linha.dataset.id);
  const acao = botao.dataset.acao;

  if (acao === "excluir") {
    const indice = horariosSemanal.findIndex((item) => item.id === id);
    if (indice !== -1) {
      horariosSemanal.splice(indice, 1);
      salvarAgendaNoNavegador();
      desenharAgendaSemanal();
    }
  } else if (acao === "alternar-reserva") {
    const itemEncontrado = horariosSemanal.find((item) => item.id === id);
    if (itemEncontrado) {
      itemEncontrado.reservado = !itemEncontrado.reservado;
      if (!itemEncontrado.reservado) {
        itemEncontrado.cliente = "";
      }
      salvarAgendaNoNavegador();
      desenharAgendaSemanal();
    }
  }
}

function iniciarDelegacaoAgendaSemanal() {
  if (tbodyAgendaSemanal) {
    tbodyAgendaSemanal.addEventListener("click", lidarCliqueAgendaSemanal);
  }
}

// 5. CONTROLE COM ESTADO (+ Novo Horário) E SUPORTE À TECLA ESCAPE
function alternarPainelNovoHorario() {
  if (!btnToggleNovoHorario || !painelNovoHorario) return;
  const estaAberto = btnToggleNovoHorario.getAttribute("aria-expanded") === "true";
  const novoEstado = !estaAberto;

  btnToggleNovoHorario.setAttribute("aria-expanded", String(novoEstado));
  painelNovoHorario.hidden = !novoEstado;

  if (novoEstado) {
    document.querySelector("#novo-dia")?.focus();
  }
}

function fecharPainelComEscape(evento) {
  if (
    evento.key === "Escape" &&
    btnToggleNovoHorario &&
    btnToggleNovoHorario.getAttribute("aria-expanded") === "true"
  ) {
    btnToggleNovoHorario.setAttribute("aria-expanded", "false");
    painelNovoHorario.hidden = true;
    btnToggleNovoHorario.focus();
  }
}

function iniciarControlePainelAgenda() {
  if (btnToggleNovoHorario) {
    btnToggleNovoHorario.addEventListener("click", alternarPainelNovoHorario);
  }
  document.addEventListener("keydown", fecharPainelComEscape);
}

// 6. FILTRO POR DIA (change) E BUSCA POR SERVIÇO/CLIENTE (input)
function iniciarFiltrosAgendaSemanal() {
  if (selectFiltroDia) {
    selectFiltroDia.addEventListener("change", desenharAgendaSemanal);
  }
  if (inputBuscaServico) {
    inputBuscaServico.addEventListener("input", desenharAgendaSemanal);
  }
}

// 8A. FORMULÁRIO RÁPIDO "+ NOVO HORÁRIO"
function salvarNovoHorarioNaTabela() {
  const campoDia = document.querySelector("#novo-dia");
  const campoCliente = document.querySelector("#novo-cliente");
  const campoHorario = document.querySelector("#novo-horario");
  const campoServico = document.querySelector("#novo-servico");
  const campoValor = document.querySelector("#novo-valor");
  const campodata = document.querySelector("#novo-data");
  const dataFormatada = campodata.value ? campodata.value.split("-").reverse().join("/") : "a definir";

  if (!campoDia || !campoHorario || !campoServico || !campoValor || !campodata) {
    alert("Erro interno: campos do novo horário não encontrados no HTML.");
    return;
  }

  const dia = campoDia.value;
  const cliente = campoCliente ? campoCliente.value.trim() : "";
  const horario = campoHorario.value.trim();
  const servico = campoServico.value.trim();
  const valorTexto = campoValor.value.trim().replace(",", ".");
  const valor = valorTexto === "" ? 0 : Number(valorTexto);

  if (!horario || !servico || Number.isNaN(valor)) {
    alert("Por favor, preencha o horário, o serviço e um valor válido.");
    return;
  }

  horariosSemanal.push({
    id: proximoIdAgenda++,
    dia,
    horario,
    cliente,
    servico,
    profissional: "Andreza",
    valor,
    reservado: cliente !== ""
  });

  salvarAgendaNoNavegador();

  // Limpa os campos manualmente
  if (campoCliente) campoCliente.value = "";
  campoHorario.value = "";
  campoServico.value = "";
  campoValor.value = "";

  desenharAgendaSemanal();
}

function iniciarFormularioNovoHorario() {
  const btnSalvarHorario = document.querySelector("#btn-salvar-horario");
  if (btnSalvarHorario) {
    btnSalvarHorario.addEventListener("click", salvarNovoHorarioNaTabela);
  }
}

/// 8A. FORMULÁRIO RÁPIDO "+ NOVO HORÁRIO"
function salvarNovoHorarioNaTabela() {
  const campoDia = document.querySelector("#novo-dia");
  const campoCliente = document.querySelector("#novo-cliente");
  const campoHorario = document.querySelector("#novo-horario");
  const campoServico = document.querySelector("#novo-servico");
  const campodata=document.querySelector("#novo-data");
  const campoValor = document.querySelector("#novo-valor");

  if (!campoDia || !campoHorario || !campoServico || !campoValor || !campodata) {
    alert("Erro interno: campos do novo horário não encontrados no HTML.");
    return;
  }

  const dia = campoDia.value;
  const cliente = campoCliente ? campoCliente.value.trim() : "";
  const horario = campoHorario.value.trim();
  const servico = campoServico.value.trim();
  const data = campodata.value;
  const dataFormatada = campodata.value ? campodata.value.split("-").reverse().join("/") :"";
  const valorTexto = campoValor.value.trim().replace(",", ".");
  const valor = valorTexto === "" ? 0 : Number(valorTexto);

  if (!horario || !servico || Number.isNaN(valor)) {
    alert("Por favor, preencha o horário, o serviço e um valor válido.");
    return;
  }

  horariosSemanal.push({
    id: proximoIdAgenda++,
    dia,
    horario,
    cliente,
    servico,
    data,
     dataFormatada,
    profissional: "Andreza",
    valor,
    reservado: cliente !== ""
  });

  salvarAgendaNoNavegador();

  // Limpa os campos manualmente
  if (campoCliente) campoCliente.value = "";
  campoHorario.value = "";
  campoServico.value = "";
  campodata .value = "";
  campoValor.value = "";

  desenharAgendaSemanal();
}

function iniciarFormularioNovoHorario() {
  const btnSalvarHorario = document.querySelector("#btn-salvar-horario");
  if (btnSalvarHorario) {
    btnSalvarHorario.addEventListener("click", salvarNovoHorarioNaTabela);
  }
}

// 8B. FORMULÁRIO PRINCIPAL "SOLICITAR AGENDAMENTO" (Insere na mesma tabela + WhatsApp)
function lidarSolicitacaoAgendamento(evento) {
  evento.preventDefault();

  const nome = document.querySelector("#nome-cliente").value.trim();
  const telefone = document.querySelector("#telefone-cliente").value.trim();
  const data = document.querySelector("#data-agendamento").value;
  const campoHora = document.querySelector("#hora-agendamento");
  const hora = campoHora && campoHora.value ? campoHora.value : "A combinar";

  const selectServico = document.querySelector("#servico-escolhido");
  const servicoTexto = selectServico.options[selectServico.selectedIndex].text;

  const dataFormatada = data ? data.split("-").reverse().join("/") : "";
  const diaSemana = obterDiaDaSemana(data);
  const valorEstimado = extrairValorDoServico(servicoTexto);

  horariosSemanal.push({
    id: proximoIdAgenda++,
    dia: diaSemana,
    dataFormatada,
    horario: hora,
    cliente: nome,
    servico: servicoTexto,
    profissional: "Andreza",
    valor: valorEstimado,
    reservado: true
  });

  salvarAgendaNoNavegador();
  desenharAgendaSemanal();
  formularioAgendamento.reset();

  document.querySelector("#agenda")?.scrollIntoView({ behavior: "smooth" });

  const numeroEstudio = "5583988345583";
  const mensagem = "Olá, Espaço Bella Nails! Gostaria de solicitar um agendamento:\n\n" +
    "*Nome:* " + nome + "\n" +
    "*WhatsApp:* " + telefone + "\n" +
    "*Serviço:* " + servicoTexto + "\n" +
    "*Data:* " + dataFormatada + "\n" +
    "*Horário:* " + hora;

  const urlWhatsApp = "https://wa.me/" + numeroEstudio + "?text=" + encodeURIComponent(mensagem);
  window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
}

function iniciarFormularioCliente() {
  if (formularioAgendamento) {
    formularioAgendamento.addEventListener("submit", lidarSolicitacaoAgendamento);
  }
}

// Inicialização única
iniciarDelegacaoAgendaSemanal();
iniciarControlePainelAgenda();
iniciarFiltrosAgendaSemanal();
iniciarFormularioNovoHorario();
iniciarFormularioCliente();
desenharAgendaSemanal();
