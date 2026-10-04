const API = "http://localhost:3000";

let pedidos = [], fornecedores = [], produtos = [];

async function carregarPedidos() {
  try {
    const respostaPedidos =
    await fetch (API + "/pedidosCompra");

    pedidos = await respostaPedidos.json();

    const respostaFornecedores = await fetch (API + "/fornecedores");
    fornecedores = await respostaFornecedores.json();

    const respostaProdutos = await fetch (API + "/produtos");
    produtos = await respostaProdutos.json();

    mostrarPedidos(); preencherFornecedores(); preencherProdutos(); carregarPedidoParaAlterar();
  } catch (erro) {
    console.log("Erro ao carregar os dados.");
    }
}

function mostrarPedidos(lista = pedidos) {
  const tabela = document.getElementById("tabelaPedidos");

  if (!tabela) {
    return;
  }

  tabela.innerHTML = "";

  lista.forEach(function(pedido) {
    const fornecedor =
    fornecedores.find(function(item) {
      return item.id == pedido.fornecedorId;
    });

    const produto = 
    produtos.find(function(item) {
      return item.id == pedido.produtoId;
    });

    let nomeFornecedor = "Não encontrado";
    let nomeProduto = "Não encontrado";

    if (fornecedor) {
      nomeFornecedor = fornecedor.nome;
    }

    if (produto) {
      nomeProduto = produto.nome;
    }

    let statusClass = "";
    if (pedido.status === "Pendente") {
      statusClass = "status-pendente";
    } else {
      statusClass = "status-recebido";
    }

    const dataFormatada = formatarData(pedido.data);

    tabela.innerHTML += `
      <tr>
        <td>${pedido.id}</td>
        <td>${nomeFornecedor}</td>
        <td>${dataFormatada}</td>
        <td>${nomeProduto}</td>
        <td>${pedido.quantidade}</td>
        <td> 
          <span class="status ${statusClass}">
            ${pedido.status}
          </span>
        </td>

        <td>
         <a href="alterar-pedidos.html?id=${pedido.id}" class="botao-alterar">Alterar</a>
         <button class="botao-excluir" onclick="excluirPedido(${pedido.id})">Excluir</button>
        </td>
      </tr>
    `;
  });
}

function formatarData(data) {
  if (!data) {
    return "";
  }
  const partes = data.split("-");
  return (
    partes[2] + "/" + partes[1] + "/" + partes[0]
  );
}

function preencherFornecedores() {
  const select = document.getElementById("fornecedor");
  if (!select) {
    return;
  }
  fornecedores.forEach(function(fornecedor) {
    select.innerHTML += `
      <option value="${fornecedor.id}">
      ${fornecedor.nome}
      </option>
    `;
  });
}

function preencherProdutos() {
  const select = document.getElementById("produto");
  if (!select) {
    return;
  }
  produtos.forEach(function(produto) {
    select.innerHTML += `
      <option value="${produto.id}">
      ${produto.nome}
      </option>
    `;
  });
}

async function cadastrarPedido(event) {
  event.preventDefault();

  const fornecedorId = Number(document.getElementById("fornecedor").value);
  const produtoId = Number(document.getElementById("produto").value);
  const data = document.getElementById("data").value;
  const quantidade = Number(document.getElementById("quantidade").value);
  const status = document.getElementById("status").value;

  const novoPedido = {
    fornecedorId: fornecedorId,
    data: data,
    produtoId: produtoId,
    quantidade: quantidade,
    status: status
  };

  await fetch (API + "/pedidosCompra", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify(novoPedido)
  });

  alert("Pedido cadastrado com sucesso!");

  window.location.href = "pedidos.html";
}

function pegarId() {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get("id");
}

function carregarPedidoParaAlterar() {
const id = pegarId();

if (!id) {
  return;
}

const pedido = pedidos.find(function(item) {
  return item.id === id;
});

if (!pedido) {
  return;
}

document.getElementById("fornecedor").value = pedido.fornecedorId;
document.getElementById("data").value = pedido.data;
document.getElementById("produto").value = pedido.produtoId;
document.getElementById("quantidade").value = pedido.quantidade;
document.getElementById("status").value = pedido.status;
}

async function alterarPedido(event) {
  event.preventDefault();

  const id = pegarId();
  const fornecedorId = Number(document.getElementById("fornecedor").value);
  const produtoId = Number(document.getElementById("produto").value);
  const data = document.getElementById("data").value;
  const quantidade = Number(document.getElementById("quantidade").value);
  const status = document.getElementById("status").value;

  const pedidoAlterado = {
    id: Number(id),
    fornecedorId: fornecedorId,
    data: data,
    produtoId: produtoId,
    quantidade: quantidade,
    status: status
  };

  await fetch(API + "/pedidosCompra/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(pedidoAlterado)
  });

  alert("Pedido alterado com sucesso!");
  window.location.href = "pedidos.html";
}

async function excluirPedido(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este pedido?");
  if (!confirmar) {
    return;
  }

  await fetch(API + "/pedidosCompra/" + id, {
    method: "DELETE"
  });

  alert("Pedido excluído com sucesso!");
  carregarDados();
}

function pesquisarPedidos() {
  const texto = document.getElementById("pesquisa").value.toLowerCase();
  const resultado = pedidos.filter(function(pedido) {
    const fornecedor = 
    fornecedores.find(function(item) {
      return item.id === pedido.fornecedorId;
    });

  const produto = produtos.find(function(item) {
    return item.id === pedido.produtoId;
  });

  let nomeFornecedor = "";
  let nomeProduto = "";

  if (fornecedor) {
    nomeFornecedor = fornecedor.nome.toLowerCase();
  }

  if (produto) {
    nomeProduto = produto.nome.toLowerCase();
  }

  return nomeFornecedor.includes(texto) || nomeProduto.includes(texto);
  });

  mostrarPedidos(resultado);
}

const formNovo = document.getElementById("formNovoPedido");

if (formNovo) {
  formNovo.addEventListener("submit", cadastrarPedido);
}

const formAlterar = document.getElementById("formAlterarPedido");

if (formAlterar) {
  formAlterar.addEventListener("submit", alterarPedido);
}

carregarDados();