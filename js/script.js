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

// =========================================================================
// PARTE 3: PREENCHIMENTO AUTOMÁTICO DA TABELA + ENVIO PARA WHATSAPP
// =========================================================================
const formularioAgendamento = document.querySelector(".formulario-agendamento");
const corpoTabelaAgenda = document.querySelector("#corpo-tabela-agenda");

// Função que cria uma nova linha <tr> na tabela de forma segura
function adicionarLinhaNaTabela(cliente, dataFormatada, hora, servico, status = "Solicitado") {
  if (corpoTabelaAgenda === null) {
    return;
  }

  const novaLinha = document.createElement("tr");
  const dadosColunas = [cliente, dataFormatada, hora, servico, status];

  dadosColunas.forEach((texto) => {
    const celula = document.createElement("td");
    celula.textContent = texto;
    novaLinha.append(celula);
  });

  corpoTabelaAgenda.append(novaLinha);
}

const agendamentosSalvos = JSON.parse(localStorage.getItem("agendaBellaNails")) || [];
agendamentosSalvos.forEach((item) => {
  adicionarLinhaNaTabela(item.cliente, item.data, item.hora, item.servico, item.status);
});

if (formularioAgendamento !== null) {
  formularioAgendamento.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.querySelector("#nome-cliente").value.trim();
    const telefone = document.querySelector("#telefone-cliente").value.trim();
    const data = document.querySelector("#data-agendamento").value;
    const campoHora = document.querySelector("#hora-agendamento");
    const hora = campoHora ? campoHora.value : "A combinar";

    const selectServico = document.querySelector("#servico-escolhido");
    const servicoTexto = selectServico.options[selectServico.selectedIndex].text;

    const dataFormatada = data.split("-").reverse().join("/");

    // 1. Insere imediatamente na tabela da página
    adicionarLinhaNaTabela(nome, dataFormatada, hora, servicoTexto, "Pré-agendado");

    // 2. Salva no localStorage para manter na tabela mesmo ao atualizar a página
    agendamentosSalvos.push({
      cliente: nome,
      data: dataFormatada,
      hora: hora,
      servico: servicoTexto,
      status: "Pré-agendado"
    });
    localStorage.setItem("agendaBellaNails", JSON.stringify(agendamentosSalvos));

    // 3. Limpa o formulário após inserir na tabela
    formularioAgendamento.reset();

    // 4. Abre o WhatsApp com os dados preenchidos
    const numeroEstudio = "5583988345583";
    const mensagem = "Olá, Espaço Bella Nails! Gostaria de solicitar um agendamento:\n\n" +
      "*Nome:* " + nome + "\n" +
      "*WhatsApp:* " + telefone + "\n" +
      "*Serviço:* " + servicoTexto + "\n" +
      "*Data:* " + dataFormatada + "\n" +
      "*Horário:* " + hora;

    const urlWhatsApp = "https://wa.me/" + numeroEstudio + "?text=" + encodeURIComponent(mensagem);
    window.open(urlWhatsApp, "_blank", "noopener,noreferrer");
  });
}
