let lotes = [];
let selecionado = -1;



function cadastrar() {

    let id = document.getElementById("idLote").value;
    let produto = document.getElementById("produto").value;
    let quantidade = document.getElementById("quantidade").value;
    let validade = document.getElementById("validade").value;

    if (id == "" || produto == "" || quantidade == "" || validade == "") {
        alert("Preencha todos os campos!");
        return;
    }

    let lote = {
        id: id,
        produto: produto,
        quantidade: quantidade,
        validade: validade
    };

    lotes.push(lote);

    mostrarLotes();
    limpar();
}



function mostrarLotes() {

    let tabela = document.getElementById("tabelaLotes");

    tabela.innerHTML = "";

    for (let i = 0; i < lotes.length; i++) {

        tabela.innerHTML += `
            <tr>
                <td>${lotes[i].id}</td>
                <td>${lotes[i].produto}</td>
                <td>${lotes[i].quantidade}</td>
                <td>${lotes[i].validade}</td>

                <td>
                    <button class="selecionar"
                    onclick="selecionar(${i})">
                        Selecionar
                    </button>
                </td>
            </tr>
        `;
    }
}



function selecionar(i) {

    selecionado = i;

    document.getElementById("idLote").value =
        lotes[i].id;

    document.getElementById("produto").value =
        lotes[i].produto;

    document.getElementById("quantidade").value =
        lotes[i].quantidade;

    document.getElementById("validade").value =
        lotes[i].validade;
}



function atualizar() {

    if (selecionado == -1) {
        alert("Selecione um lote!");
        return;
    }

    lotes[selecionado].id =
        document.getElementById("idLote").value;

    lotes[selecionado].produto =
        document.getElementById("produto").value;

    lotes[selecionado].quantidade =
        document.getElementById("quantidade").value;

    lotes[selecionado].validade =
        document.getElementById("validade").value;

    mostrarLotes();
    limpar();
}



function excluir() {

    if (selecionado == -1) {
        alert("Selecione um lote!");
        return;
    }

    lotes.splice(selecionado, 1);

    mostrarLotes();
    limpar();
}



function limpar() {

    document.getElementById("idLote").value = "";
    document.getElementById("produto").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("validade").value = "";

    selecionado = -1;
}