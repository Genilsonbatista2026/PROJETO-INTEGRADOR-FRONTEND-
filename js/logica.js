/*
 * Tema: Análise de Agendamentos e Serviços - Espaço Bella Nails
 * Entrada: Preço mínimo desejado via prompt() e comandos de consulta.
 * Processamento: Classifica agendamentos (if/else if/else), verifica horários (switch), resume totais (for...of) e calcula promoções (map/filter/reduce).
 * Saída: Relatório no console (console.table) e dados processados para a página.
 * 
 * Pseudocódigo:
 * 1. Declarar listas de agendamentos e catálogo de serviços.
 * 2. Validar entrada numérica do prompt e analisar agendamentos no console.
 * 3. Disponibilizar funções puras de cálculo e classificação de serviços.
 * 4. Executar laço while até o usuário digitar "sair".
 */

// =========================================================================
// BLOCO A: LÓGICA DO CONSOLE (Aula 09)
// =========================================================================
const agendamentosSemana = [
  { cliente: "Ana Paula", valor: 160, dia: "terca" },
  { cliente: "Beatriz Souza", valor: 85, dia: "quarta" },
  { cliente: "Carla Mendes", valor: 110, dia: "sexta" },
  { cliente: "Daniela Lima", valor: 130, dia: "sabado" },
  { cliente: "Eduarda Alves", valor: 65, dia: "quinta" }
];

let comandoUsuario = "";
while (comandoUsuario !== "sair") {
  const acao= prompt("Digite 'total' para ver o total de horários cadastrados ou 'sair' para encerrar:");

  if (acao === null) {
    comandoUsuario = "sair";
  } else{ 
    comandoUsuario = acao.trim().toLowerCase();


    if (comandoUsuario === "novo") {
  const novocliente = prompt('Digite o nome do novo cliente:');
  const novovalor = prompt('Digite o valor do serviço para o novo cliente:');
  const novodia = prompt('Digite o dia da semana para o novo agendamento (ex: terca, quarta, quinta, sexta, sabado):');
  const novohorario = prompt('Digite o horário do agendamento (ex: 14:00):');


  if (novocliente && !isNaN(novovalor) && novodia && novohorario) {
    agendamentosSemana.push({
       cliente: novocliente,
        valor: Number(novovalor),
         dia: novodia
         .trim()
         .toLowerCase()
         .replace("-feira","")
         .replace("feira","")
         .normalize("NFD")
         .replace(/[\u0300-\u036f]/g, "")
        .trim(),
         horario: novohorario
         });

    console.log(`agendamento de ${novocliente} adicionado!`);
  } else {
    alert("Dados inválidos. Agendamento cancelado.");
  }
    }else if (comandoUsuario === "total") {
      console.log(`Total de horários cadastrados na semana: ${agendamentosSemana.length}`);
    }    
  }
}


const entradaMinimo = prompt("Espaço Bella Nails - Digite um valor mínimo de serviço para filtrar (ex: 100):");
const valorMinimo = Number(entradaMinimo);

if (entradaMinimo === null || entradaMinimo.trim() === "" || Number.isNaN(valorMinimo) || valorMinimo < 0) {
  console.warn("Entrada inválida para valor mínimo. A análise numérica não foi executada.");
} else {
  let faturamentoTotal = 0;
  let qtdAcimaMinimo = 0;
  const relatorioConsole = [];

  for (const agendamento of agendamentosSemana) {
    let faixaPreco = "";
    if (agendamento.valor >= 150) {
      faixaPreco = "Premium";
    } else if (agendamento.valor >= 100) {
      faixaPreco = "Intermediário";
    } else {
      faixaPreco = "Básico";
    }

    let turnoAtendimento = "";
    switch (agendamento.dia) {
      case "terca":
      case "quarta":
      case "quinta":
        turnoAtendimento = "09h às 18h";
        break;
      case "sexta":
      case "sabado":
        turnoAtendimento = "09h às 20h";
        break;
      default:
        turnoAtendimento = "Estúdio Fechado";
        break;
    }

    faturamentoTotal += agendamento.valor;
    if (agendamento.valor >= valorMinimo) {
      qtdAcimaMinimo++;
    }

    relatorioConsole.push({
      Cliente: agendamento.cliente,
      Valor: `R$ ${agendamento.valor}`,
      Faixa: faixaPreco,
      Dia: agendamento.dia,
      Horario: agendamento.horario || "Horário não informado",
      HorarioFuncionamento: turnoAtendimento
    });
  }

  console.log(`Faturamento previsto: R$ ${faturamentoTotal.toFixed(2)} | Agendamentos >= R$ ${valorMinimo}: ${qtdAcimaMinimo}`);
  console.table(relatorioConsole);
  const elementofaturamento = document.getElementById("resumo-faturamento");
 const containerAgendamentos = document.getElementById("lista-agendamentos");

 if (elementofaturamento) {
    elementofaturamento.textContent = `Faturamento previsto: R$ ${faturamentoTotal.toFixed(2)} | total de horários:  ${agendamentosSemana.length}`;
 }
 if (containerAgendamentos) {
    containerAgendamentos.innerHTML = "";

    relatorioConsole.forEach((item) => {
      const card = document.createElement("div");
      card.classList.add("card-agendamento");
      card.innerHTML = `
        <p>
        <strong>${item.Cliente}</strong> | Valor: ${item.Valor} | Faixa: ${item.Faixa})<br>
        <small>Dia: ${item.Dia} | Horário: ${item.Horario} | Funcionamento: ${item.HorarioFuncionamento}</small>
        </p>
        <hr>
      `;
      containerAgendamentos.appendChild(card);
     });
    }

}
 
// =========================================================================
// BLOCO B: LÓGICA PURA DE FUNÇÕES E ARRAYS (Aula 11)
// =========================================================================
const catalogoServicos = [
  { nome: "Esmaltação Tradicional", duracaoMin: 45, preco: 45 },
  { nome: "Esmaltação em Gel", duracaoMin: 75, preco: 70 },
  { nome: "Manutenção de Gel", duracaoMin: 110, preco: 110 },
  { nome: "Alongamento na Tip", duracaoMin: 150, preco: 140 },
  { nome: "Spa dos Pés Completo", duracaoMin: 60, preco: 70 }
];

// Função pura que processa (calcula valor promocional sem alterar o array original)
function calcularValorPromocional(servico, descontoPercentual = 10) {
  const valorFinal = servico.preco * (1 - descontoPercentual / 100);
  return {
    ...servico,
    valorPromocional: Number(valorFinal.toFixed(2))
  };
}

// Função pura que classifica a duração em 3 faixas
function classificarDuracao(minutos) {
  if (minutos <= 60) {
    return { rotulo: "Sessão Rápida", classeCss: "faixa-rapida" };
  } else if (minutos <= 120) {
    return { rotulo: "Sessão Média", classeCss: "faixa-media" };
  } else {
    return { rotulo: "Sessão Longa", classeCss: "faixa-longa" };
  }
}


const servicosComDesconto = catalogoServicos.map((item) => calcularValorPromocional(item, 15));
const servicosLongos = servicosComDesconto.filter((item) => item.duracaoMin > 60);
const somaPromocional = servicosComDesconto.reduce((acumulador, item) => acumulador + item.valorPromocional, 0);

/*
 * Teste de Mesa (3 primeiras voltas do laço principal, considerando valorMinimo = 100):
 * Volta 1: cliente="Ana Paula", valor=160 -> faixaPreco="Premium", turno="09h às 18h", faturamentoTotal=160, qtdAcimaMinimo=1
 * Volta 2: cliente="Beatriz Souza", valor=85 -> faixaPreco="Básico", turno="09h às 18h", faturamentoTotal=245, qtdAcimaMinimo=1
 * Volta 3: cliente="Carla Mendes", valor=110 -> faixaPreco="Intermediário", turno="09h às 20h", faturamentoTotal=355, qtdAcimaMinimo=2
 */
