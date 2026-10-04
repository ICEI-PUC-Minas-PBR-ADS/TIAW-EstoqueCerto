"use strict";

// JSON Server fornece os arquivos da pasta public e a API na mesma origem.
const dadosMovimentacoes = { produtos: [], lotes: [] };
const formMov = document.getElementById("form-movimentacao");
const campoProduto = document.getElementById("mov-produto");
const campoLote = document.getElementById("mov-lote");
const campoQuantidade = document.getElementById("mov-quantidade");
const campoData = document.getElementById("mov-data");
const tabelaMov = document.getElementById("tabela-movimentacoes");
const mensagemMov = document.getElementById("mensagem-mov");
const buscaMov = document.getElementById("busca-mov");
const filtroTipo = document.getElementById("filtro-tipo");
let movimentacoes = [];
let idEmEdicao = null;
let apiDisponivel = false;
let ocupado = false;

function dataHoje() {
    const hoje = new Date();
    return hoje.getFullYear() + "-" + String(hoje.getMonth() + 1).padStart(2, "0") + "-" + String(hoje.getDate()).padStart(2, "0");
}

function dataValida(valor) {
    if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const data = new Date(valor + "T12:00:00Z");
    return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function formatarData(valor) {
    return valor.split("-").reverse().join("/");
}

function normalizar(texto) {
    return texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mostrarMensagem(texto, erro = false) {
    mensagemMov.textContent = texto;
    mensagemMov.classList.toggle("erro", erro);
    mensagemMov.setAttribute("role", erro ? "alert" : "status");
    mensagemMov.hidden = false;
}

function atualizarControles() {
    document.getElementById("campos-movimentacao").disabled = ocupado || !apiDisponivel;
    document.getElementById("btn-recarregar").disabled = ocupado;
    document.querySelectorAll(".acoes-linha button").forEach(botao => botao.disabled = ocupado || !apiDisponivel);
}

function mostrarErroApi(texto) {
    const aviso = document.getElementById("erro-armazenamento");
    aviso.textContent = texto;
    aviso.hidden = false;
    document.getElementById("status-api").textContent = "Sem conexão confirmada com o servidor.";
}

async function requisitar(caminho, metodo = "GET", dados) {
    const controle = new AbortController();
    const limite = setTimeout(() => controle.abort(), 10000);
    try {
        const opcoes = { method: metodo, cache: "no-store", signal: controle.signal };
        if (dados !== undefined) {
            opcoes.headers = { "Content-Type": "application/json" };
            opcoes.body = JSON.stringify(dados);
        }
        const resposta = await fetch(caminho, opcoes);
        if (!resposta.ok) throw new Error("Falha na API: HTTP " + resposta.status);
        return await resposta.json();
    } finally {
        clearTimeout(limite);
    }
}

async function buscarDadosApi() {
    const [produtos, lotes, registros] = await Promise.all([
        requisitar("/produtos"), requisitar("/lotes"), requisitar("/movimentacoes")
    ]);
    if (!Array.isArray(produtos) || !Array.isArray(lotes) || !Array.isArray(registros)) {
        throw new Error("A API deve retornar arrays de produtos, lotes e movimentações.");
    }
    dadosMovimentacoes.produtos = produtos;
    dadosMovimentacoes.lotes = lotes;
    if (!registros.every(registroValido) || new Set(registros.map(item => item.id)).size !== registros.length) {
        throw new Error("Há registros inválidos no db.json. Confira a estrutura indicada no README.");
    }
    return registros;
}

async function carregarMovimentacoes() {
    if (ocupado) return;
    ocupado = true;
    atualizarControles();
    document.getElementById("status-api").textContent = "Carregando dados do servidor...";
    try {
        if (!["http:", "https:"].includes(window.location.protocol)) {
            throw new Error("Execute npm install e npm start na pasta do projeto; abra http://localhost:3000/movimentacoes.html.");
        }
        movimentacoes = await buscarDadosApi();
        apiDisponivel = true;
        document.getElementById("erro-armazenamento").hidden = true;
        document.getElementById("status-api").textContent = "Conectado ao JSON Server · Dados salvos em db.json";
        preencherProdutos();
        limparFormulario();
    } catch (erro) {
        apiDisponivel = false;
        mostrarErroApi("Não foi possível carregar os dados. Mantenha o JSON Server aberto com npm start e clique em Atualizar histórico. " + erro.message);
    } finally {
        ocupado = false;
        renderizarMovimentacoes();
        atualizarControles();
    }
}

function registroValido(registro) {
    if (!registro || typeof registro !== "object") return false;
    const produto = dadosMovimentacoes.produtos.find(item => item.id === registro.produto_id);
    const lote = dadosMovimentacoes.lotes.find(item => item.id === registro.lote && item.produto_id === registro.produto_id);
    return Number.isSafeInteger(registro.id) && registro.id > 0 && produto && lote
        && registro.produto === produto.nome
        && ["Entrada", "Saída"].includes(registro.tipo_movimentacao)
        && Number.isSafeInteger(registro.quantidade) && registro.quantidade > 0 && registro.quantidade <= 1000000
        && dataValida(registro.data_movimentacao);
}

// Todas as quantidades começam em zero. As entradas e saídas formam o saldo.
// Validar toda a sequência também protege a edição/exclusão de entradas antigas.
function validarSaldos(registros) {
    const saldos = new Map();
    const ordenados = [...registros].sort((a, b) => a.data_movimentacao.localeCompare(b.data_movimentacao) || a.id - b.id);
    for (const registro of ordenados) {
        const chave = registro.produto_id + ":" + registro.lote;
        const saldoAnterior = saldos.get(chave) || 0;
        const saldoNovo = saldoAnterior + (registro.tipo_movimentacao === "Entrada" ? registro.quantidade : -registro.quantidade);
        if (saldoNovo < 0) {
            return "Operação não permitida: a saída #" + registro.id + " de " + formatarData(registro.data_movimentacao)
                + " deixaria o lote " + registro.lote + " com saldo negativo. Há " + saldoAnterior + " unidade(s) disponível(is) antes dessa saída.";
        }
        saldos.set(chave, saldoNovo);
    }
    return "";
}

function preencherProdutos() {
    campoProduto.innerHTML = '<option value="">Selecione um produto</option>';
    dadosMovimentacoes.produtos.forEach(produto => {
        const opcao = document.createElement("option");
        opcao.value = produto.id;
        opcao.textContent = produto.nome;
        campoProduto.appendChild(opcao);
    });
}

function preencherLotes(loteSelecionado = "") {
    campoLote.innerHTML = "";
    const inicial = document.createElement("option");
    inicial.value = "";
    inicial.textContent = campoProduto.value ? "Selecione um lote" : "Selecione o produto primeiro";
    campoLote.appendChild(inicial);
    dadosMovimentacoes.lotes.filter(lote => lote.produto_id === Number(campoProduto.value)).forEach(lote => {
        const opcao = document.createElement("option");
        opcao.value = lote.id;
        opcao.textContent = lote.id;
        campoLote.appendChild(opcao);
    });
    campoLote.disabled = !campoProduto.value;
    campoLote.value = loteSelecionado;
    atualizarSaldo();
}

function atualizarSaldo() {
    const rotulo = document.getElementById("saldo-lote");
    if (!campoLote.value) {
        rotulo.textContent = "Selecione um lote para consultar o saldo.";
        return;
    }
    const saldo = movimentacoes.filter(item => item.produto_id === Number(campoProduto.value) && item.lote === campoLote.value)
        .reduce((total, item) => total + (item.tipo_movimentacao === "Entrada" ? item.quantidade : -item.quantidade), 0);
    rotulo.textContent = "Saldo atual do lote: " + saldo + " un. Saídas também são verificadas na data informada.";
}

function limparFormulario(limparMensagem = true) {
    idEmEdicao = null;
    formMov.reset();
    campoData.value = dataHoje();
    campoData.max = dataHoje();
    preencherLotes();
    document.getElementById("titulo-form").textContent = "Nova movimentação";
    document.getElementById("modo-edicao").hidden = true;
    document.getElementById("btn-salvar").textContent = "Registrar dados";
    document.getElementById("btn-limpar").textContent = "Limpar formulário";
    if (limparMensagem) mensagemMov.hidden = true;
    renderizarMovimentacoes();
}

function lerFormulario() {
    const produto = dadosMovimentacoes.produtos.find(item => item.id === Number(campoProduto.value));
    const lote = dadosMovimentacoes.lotes.find(item => item.id === campoLote.value && item.produto_id === produto?.id);
    const tipo = formMov.querySelector('input[name="tipo-mov"]:checked')?.value;
    const quantidade = Number(campoQuantidade.value);
    if (!produto || !lote || !["Entrada", "Saída"].includes(tipo)) {
        mostrarMensagem("Selecione um produto, um lote correspondente e o tipo de movimentação.", true);
        return null;
    }
    if (!Number.isSafeInteger(quantidade) || quantidade <= 0 || quantidade > 1000000) {
        mostrarMensagem("Informe uma quantidade inteira entre 1 e 1.000.000 de unidades.", true);
        return null;
    }
    if (!dataValida(campoData.value) || campoData.value > dataHoje()) {
        mostrarMensagem("Informe uma data válida, igual ou anterior a hoje.", true);
        return null;
    }
    return {
        id: idEmEdicao ?? Math.max(0, ...movimentacoes.map(item => item.id)) + 1,
        produto_id: produto.id,
        produto: produto.nome,
        tipo_movimentacao: tipo,
        quantidade,
        lote: lote.id,
        // Formato ISO facilita ordenar as datas. A tabela exibe dd/mm/aaaa.
        data_movimentacao: campoData.value
    };
}

async function registrarMovimentacao(evento) {
    evento.preventDefault();
    if (!apiDisponivel || ocupado || !formMov.reportValidity()) return;
    const registroAnterior = movimentacoes.find(item => item.id === idEmEdicao);
    const editando = idEmEdicao !== null;
    ocupado = true;
    atualizarControles();
    try {
        // Reconsulta antes de validar para usar o saldo mais recente do servidor.
        movimentacoes = await buscarDadosApi();
        if (editando && JSON.stringify(registroAnterior) !== JSON.stringify(movimentacoes.find(item => item.id === idEmEdicao))) {
            mostrarMensagem("Este registro mudou no servidor. Cancele a edição e selecione-o novamente.", true);
            return;
        }
        const registro = lerFormulario();
        if (!registro) return;
        const propostos = editando
            ? movimentacoes.map(item => item.id === idEmEdicao ? registro : item)
            : [...movimentacoes, registro];
        const erroSaldo = validarSaldos(propostos);
        if (erroSaldo) {
            mostrarMensagem(erroSaldo, true);
            return;
        }
        let salvo;
        if (editando) {
            salvo = await requisitar("/movimentacoes/" + registro.id, "PUT", registro);
            movimentacoes = movimentacoes.map(item => item.id === salvo.id ? salvo : item);
        } else {
            const dados = { ...registro };
            delete dados.id; // O JSON Server gera o identificador do novo registro.
            salvo = await requisitar("/movimentacoes", "POST", dados);
            movimentacoes.push(salvo);
        }
        buscaMov.value = "";
        filtroTipo.value = "";
        limparFormulario(false);
        mostrarMensagem("Movimentação #" + salvo.id + (editando ? " atualizada" : " registrada") + " com sucesso.");
    } catch (erro) {
        apiDisponivel = false;
        mostrarErroApi("Não foi possível confirmar a operação. Inicie ou confira o JSON Server e clique em Atualizar histórico antes de repetir. " + erro.message);
    } finally {
        ocupado = false;
        renderizarMovimentacoes();
        atualizarSaldo();
        atualizarControles();
    }
}

function editarMovimentacao(id) {
    const registro = movimentacoes.find(item => item.id === id);
    if (!registro || !apiDisponivel || ocupado) return;
    idEmEdicao = id;
    campoProduto.value = registro.produto_id;
    preencherLotes(registro.lote);
    formMov.querySelectorAll('input[name="tipo-mov"]').forEach(radio => radio.checked = radio.value === registro.tipo_movimentacao);
    campoQuantidade.value = registro.quantidade;
    campoData.value = registro.data_movimentacao;
    document.getElementById("titulo-form").textContent = "Editar movimentação";
    const modo = document.getElementById("modo-edicao");
    modo.textContent = "Editando registro #" + id;
    modo.hidden = false;
    document.getElementById("btn-salvar").textContent = "Salvar alterações";
    document.getElementById("btn-limpar").textContent = "Cancelar edição";
    mensagemMov.hidden = true;
    renderizarMovimentacoes();
    formMov.scrollIntoView({ behavior: "smooth", block: "center" });
    campoProduto.focus({ preventScroll: true });
}

async function excluirMovimentacao(id) {
    const registro = movimentacoes.find(item => item.id === id);
    if (!registro || !apiDisponivel || ocupado) return;
    if (!window.confirm("Excluir a movimentação #" + id + " de " + registro.produto + " (" + registro.lote + ")?")) return;
    ocupado = true;
    atualizarControles();
    try {
        movimentacoes = await buscarDadosApi();
        const atual = movimentacoes.find(item => item.id === id);
        if (JSON.stringify(registro) !== JSON.stringify(atual)) {
            mostrarMensagem("Este registro mudou no servidor. Confira o histórico antes de excluir novamente.", true);
            return;
        }
        const restantes = movimentacoes.filter(item => item.id !== id);
        const erroSaldo = validarSaldos(restantes);
        if (erroSaldo) {
            mostrarMensagem(erroSaldo, true);
            mensagemMov.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        await requisitar("/movimentacoes/" + id, "DELETE");
        movimentacoes = restantes;
        if (idEmEdicao === id) limparFormulario(false);
        mostrarMensagem("Movimentação #" + id + " excluída com sucesso.");
    } catch (erro) {
        apiDisponivel = false;
        mostrarErroApi("Não foi possível confirmar a exclusão. Confira o servidor e atualize o histórico antes de repetir. " + erro.message);
    } finally {
        ocupado = false;
        renderizarMovimentacoes();
        atualizarSaldo();
        atualizarControles();
    }
}

function criarCelula(texto) {
    const celula = document.createElement("td");
    celula.textContent = texto;
    return celula;
}

function renderizarMovimentacoes() {
    tabelaMov.innerHTML = "";
    const busca = normalizar(buscaMov.value);
    const registros = movimentacoes.filter(item => {
        const correspondeBusca = normalizar(item.produto + " " + item.lote).includes(busca);
        return correspondeBusca && (!filtroTipo.value || item.tipo_movimentacao === filtroTipo.value);
    }).sort((a, b) => b.data_movimentacao.localeCompare(a.data_movimentacao) || b.id - a.id);

    registros.forEach(registro => {
        const linha = document.createElement("tr");
        linha.dataset.id = registro.id;
        if (registro.id === idEmEdicao) linha.classList.add("em-edicao");
        linha.appendChild(criarCelula("#" + registro.id));
        const produto = criarCelula(registro.produto);
        const lote = document.createElement("small");
        lote.textContent = registro.lote;
        produto.appendChild(lote);
        linha.appendChild(produto);
        const tipo = document.createElement("td");
        const etiqueta = document.createElement("span");
        etiqueta.classList.add("tipo-badge");
        if (registro.tipo_movimentacao === "Saída") etiqueta.classList.add("saida");
        etiqueta.textContent = registro.tipo_movimentacao;
        tipo.appendChild(etiqueta);
        linha.appendChild(tipo);
        linha.appendChild(criarCelula(registro.quantidade));
        linha.appendChild(criarCelula(formatarData(registro.data_movimentacao)));
        const acoes = document.createElement("td");
        const botoes = document.createElement("div");
        botoes.classList.add("acoes-linha");
        const editar = document.createElement("button");
        editar.type = "button";
        editar.textContent = "Editar";
        editar.classList.add("atualizar");
        editar.setAttribute("aria-label", "Editar movimentação " + registro.id);
        editar.disabled = !apiDisponivel || ocupado;
        editar.addEventListener("click", () => editarMovimentacao(registro.id));
        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.textContent = "Excluir";
        excluir.classList.add("excluir");
        excluir.setAttribute("aria-label", "Excluir movimentação " + registro.id);
        excluir.disabled = !apiDisponivel || ocupado;
        excluir.addEventListener("click", () => excluirMovimentacao(registro.id));
        botoes.appendChild(editar);
        botoes.appendChild(excluir);
        acoes.appendChild(botoes);
        linha.appendChild(acoes);
        tabelaMov.appendChild(linha);
    });

    if (registros.length === 0) {
        const linha = document.createElement("tr");
        const celula = criarCelula(!apiDisponivel ? "Histórico indisponível. Consulte o aviso acima." : movimentacoes.length === 0
            ? "Nenhuma movimentação cadastrada. Registre uma entrada para começar."
            : "Nenhuma movimentação encontrada para os filtros informados.");
        celula.colSpan = 6;
        celula.classList.add("vazio");
        linha.appendChild(celula);
        tabelaMov.appendChild(linha);
    }
    document.getElementById("contagem-resultados").textContent = registros.length + " de " + movimentacoes.length + " registros";
    document.getElementById("total-registros").textContent = movimentacoes.length;
    document.getElementById("total-entradas").textContent = movimentacoes.filter(item => item.tipo_movimentacao === "Entrada").length;
    document.getElementById("total-saidas").textContent = movimentacoes.filter(item => item.tipo_movimentacao === "Saída").length;
}

formMov.addEventListener("submit", registrarMovimentacao);
campoProduto.addEventListener("change", () => preencherLotes());
campoLote.addEventListener("change", atualizarSaldo);
document.getElementById("btn-limpar").addEventListener("click", () => limparFormulario());
buscaMov.addEventListener("input", renderizarMovimentacoes);
filtroTipo.addEventListener("change", renderizarMovimentacoes);

document.getElementById("btn-recarregar").addEventListener("click", carregarMovimentacoes);
window.addEventListener("DOMContentLoaded", carregarMovimentacoes);
