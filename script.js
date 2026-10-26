const nomeInput = document.getElementById("nome");
const tamanhos = document.querySelectorAll('input[name="tamanho"]');
const adicionais = document.querySelectorAll("#adicionais > div");
const observacao = document.getElementById("observacao");

const resumoItens = document.getElementById("resumo-itens");
const totalElemento = document.getElementById("total");
const botaoConfirmar = document.getElementById("confirmar");
const mensagem = document.getElementById("mensagem");


const CHAVE_RASCUNHO = "acaiBairro_rascunho";
const CHAVE_PEDIDOS = "acaiBairro_pedidos";


const precos = {
  ovomaltine: 5.00,
  banana: 3.00,
  nescau: 3.00,
  morango: 3.00,
  uva: 3.00,
  granola: 3.00,
  leiteEmpo: 5.00,
  pacoca: 4.00,
  Chantilly: 5.00,
  mel: 3.00
};


const limites = {
  P: 2,
  G: 4
};


function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}


function obterTamanhoSelecionado() {
  const radio = document.querySelector(
    'input[name="tamanho"]:checked'
  );

  if (!radio) return null;

  const texto = radio.parentElement.textContent.trim();
  const tamanho = texto.startsWith("P") ? "P" : "G";

  return {
    radio,
    tamanho,
    preco: Number(radio.dataset.preco)
  };
}


function obterAdicionaisSelecionados() {
  const selecionados = {};
  let quantidadeTotal = 0;
  let totalAdicionais = 0;

  adicionais.forEach((adicional) => {
    const id = adicional.id;
    const input = adicional.querySelector('input[type="number"]');

    if (!input) return;

    const quantidade = Math.max(
      0,
      Math.floor(Number(input.value) || 0)
    );

    const preco = precos[id];

    if (quantidade > 0 && preco !== undefined) {
      selecionados[id] = {
        quantidade,
        preco,
        subtotal: quantidade * preco
      };

      quantidadeTotal += quantidade;
      totalAdicionais += quantidade * preco;
    }
  });

  return {
    itens: selecionados,
    quantidadeTotal,
    totalAdicionais
  };
}

function salvarRascunho() {
  const tamanho = obterTamanhoSelecionado();
  const dadosAdicionais = {};

  adicionais.forEach((adicional) => {
    const input = adicional.querySelector('input[type="number"]');

    if (input) {
      dadosAdicionais[adicional.id] = input.value;
    }
  });

  const dados = {
    nome: nomeInput.value,
    tamanhoPreco: tamanho ? String(tamanho.preco) : "",
    adicionais: dadosAdicionais,
    observacao: observacao.value
  };

  try {
    localStorage.setItem(
      CHAVE_RASCUNHO,
      JSON.stringify(dados)
    );
  } catch (erro) {
    console.error("Não foi possível salvar o rascunho:", erro);
  }
}

function carregarRascunho() {
  try {
    const salvo = localStorage.getItem(CHAVE_RASCUNHO);

    if (!salvo) return;

    const dados = JSON.parse(salvo);

    nomeInput.value = dados.nome || "";
    observacao.value = dados.observacao || "";

    if (dados.tamanhoPreco) {
      const radio = [...tamanhos].find(
        (item) => item.dataset.preco === dados.tamanhoPreco
      );

      if (radio) radio.checked = true;
    }

    adicionais.forEach((adicional) => {
      const input = adicional.querySelector('input[type="number"]');

      if (input) {
        input.value = dados.adicionais?.[adicional.id] ?? "";
      }
    });
  } catch (erro) {
    console.error("Não foi possível recuperar o rascunho:", erro);
  }
}


function salvarPedidoConfirmado(pedido) {
  try {
    const pedidos = JSON.parse(
      localStorage.getItem(CHAVE_PEDIDOS) || "[]"
    );

    pedidos.push({
      ...pedido,
      data: new Date().toISOString()
    });

    localStorage.setItem(
      CHAVE_PEDIDOS,
      JSON.stringify(pedidos)
    );

    return true;
  } catch (erro) {
    console.error("Não foi possível salvar o pedido:", erro);
    return false;
  }
}


function atualizarPedido() {
  const tamanho = obterTamanhoSelecionado();

  let total = 0;
  const itensResumo = [];

  if (!tamanho) {
    resumoItens.textContent = "Escolha um tamanho.";
    totalElemento.textContent = formatarPreco(0);
    mensagem.textContent = "";
    botaoConfirmar.disabled = true;

    salvarRascunho();
    return;
  }

  total += tamanho.preco;

  itensResumo.push(
    `Açaí ${tamanho.tamanho}: ${formatarPreco(tamanho.preco)}`
  );

  const dadosAdicionais = obterAdicionaisSelecionados();

  Object.entries(dadosAdicionais.itens).forEach(([id, item]) => {
    const nomeAdicional =
      id.charAt(0).toUpperCase() + id.slice(1);

    itensResumo.push(
      `${nomeAdicional}: ${item.quantidade} x ` +
      `${formatarPreco(item.preco)} = ` +
      formatarPreco(item.subtotal)
    );

    total += item.subtotal;
  });

  const limite = limites[tamanho.tamanho];
  const excedeuLimite =
    dadosAdicionais.quantidadeTotal > limite;

  if (excedeuLimite) {
    mensagem.textContent =
      `Você escolheu ${dadosAdicionais.quantidadeTotal} ` +
      `complementos. O tamanho ${tamanho.tamanho} ` +
      `permite até ${limite}.`;

    botaoConfirmar.disabled = true;
  } else {
    mensagem.textContent = "";

    botaoConfirmar.disabled =
      nomeInput.value.trim() === "";
  }

  resumoItens.innerHTML = "";

  itensResumo.forEach((item) => {
    const paragrafo = document.createElement("p");
    paragrafo.textContent = item;
    resumoItens.appendChild(paragrafo);
  });

  totalElemento.textContent = formatarPreco(total);

  salvarRascunho();
}


function confirmarPedido() {
  const tamanho = obterTamanhoSelecionado();

  if (!tamanho) {
    mensagem.textContent = "Escolha um tamanho.";
    return;
  }

  if (nomeInput.value.trim() === "") {
    mensagem.textContent = "Informe seu nome.";
    nomeInput.focus();
    return;
  }

  const dadosAdicionais = obterAdicionaisSelecionados();
  const limite = limites[tamanho.tamanho];

  if (dadosAdicionais.quantidadeTotal > limite) {
    mensagem.textContent =
      `O tamanho ${tamanho.tamanho} permite até ${limite} complementos.`;
    return;
  }

  let total = tamanho.preco;
  const adicionaisPedido = {};

  Object.entries(dadosAdicionais.itens).forEach(([id, item]) => {
    adicionaisPedido[id] = {
      quantidade: item.quantidade,
      precoUnitario: item.preco,
      subtotal: item.subtotal
    };

    total += item.subtotal;
  });

  const pedido = {
    nome: nomeInput.value.trim(),
    tamanho: tamanho.tamanho,
    precoAcai: tamanho.preco,
    adicionais: adicionaisPedido,
    observacoes: observacao.value.trim(),
    total: total,
    totalFormatado: formatarPreco(total)
  };

  const salvo = salvarPedidoConfirmado(pedido);

  if (!salvo) {
    mensagem.textContent =
      "Não foi possível salvar o pedido. Tente novamente.";
    return;
  }

  mensagem.textContent =
    `Pedido confirmado, ${pedido.nome}! Total: ${formatarPreco(total)}.`;

  botaoConfirmar.disabled = true;

  
  localStorage.removeItem(CHAVE_RASCUNHO);
}

tamanhos.forEach((radio) => {
  radio.addEventListener("change", atualizarPedido);
});

adicionais.forEach((adicional) => {
  const input = adicional.querySelector('input[type="number"]');

  if (input) {
    input.min = "0";
    input.step = "1";

    input.addEventListener("input", atualizarPedido);
  }
});


nomeInput.addEventListener("input", atualizarPedido);
observacao.addEventListener("input", salvarRascunho);

botaoConfirmar.addEventListener("click", confirmarPedido);


carregarRascunho();
atualizarPedido();

const listaPedidos = document.getElementById("lista-pedidos");
const contadorPedidos = document.getElementById("contador-pedidos");

function mostrarPedidosSalvos() {
  if (!listaPedidos || !contadorPedidos) return;

  listaPedidos.replaceChildren();

  let pedidos = [];

  try {
    pedidos = JSON.parse(
      localStorage.getItem("acaiBairro_pedidos") || "[]"
    );

    if (!Array.isArray(pedidos)) pedidos = [];
  } catch (erro) {
    contadorPedidos.textContent = "Erro ao carregar pedidos.";
    return;
  }

  contadorPedidos.textContent =
    `Total de pedidos salvos: ${pedidos.length}`;

  if (pedidos.length === 0) {
    listaPedidos.textContent = "Nenhum pedido salvo ainda.";
    return;
  }

  pedidos.forEach((pedido, indice) => {
    const card = document.createElement("div");
    card.className = "pedido-salvo";

    const titulo = document.createElement("h3");
    titulo.textContent = `Pedido #${indice + 1}`;
    card.appendChild(titulo);

    function adicionarLinha(rotulo, valor) {
      const p = document.createElement("p");
      p.textContent = `${rotulo}: ${valor}`;
      card.appendChild(p);
    }

    adicionarLinha("Cliente", pedido.nome || "Não informado");
    adicionarLinha("Tamanho", pedido.tamanho || "Não informado");

    if (pedido.data) {
      const data = new Date(pedido.data);
      adicionarLinha(
        "Data",
        Number.isNaN(data.getTime())
          ? pedido.data
          : data.toLocaleString("pt-BR")
      );
    }

    adicionarLinha("Adicionais", "");

    const adicionaisPedido = pedido.adicionais || {};
    const nomes = Object.keys(adicionaisPedido);

    if (nomes.length === 0) {
      adicionarLinha("Complementos", "Nenhum");
    } else {
      nomes.forEach((nome) => {
        const item = adicionaisPedido[nome];
        const quantidade =
          typeof item === "object" ? item.quantidade : item;

        adicionarLinha(nome, `${quantidade} unidade(s)`);
      });
    }

    adicionarLinha(
      "Observações",
      pedido.observacoes || "Nenhuma"
    );

    adicionarLinha(
      "Total",
      pedido.totalFormatado ||
        Number(pedido.total || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })
    );

    listaPedidos.appendChild(card);
  });
}

document
  .getElementById("atualizar-pedidos")
  .addEventListener("click", mostrarPedidosSalvos);

document
  .getElementById("limpar-pedidos")
  .addEventListener("click", () => {
    if (confirm("Deseja apagar todos os pedidos salvos?")) {
      localStorage.removeItem("acaiBairro_pedidos");
      mostrarPedidosSalvos();
    }
  });

mostrarPedidosSalvos();


window.addEventListener("storage", (evento) => {
  if (evento.key === "acaiBairro_pedidos") {
    mostrarPedidosSalvos();
  }
});