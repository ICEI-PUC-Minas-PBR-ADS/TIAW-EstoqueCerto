const API_URL =
    "http://localhost:3000/fornecedores";
const form =
    document.getElementById(
        "formFornecedor"
    );


const idInput =
    document.getElementById(
        "id"
    );


const nomeInput =
    document.getElementById(
        "nome"
    );


const telefoneInput =
    document.getElementById(
        "telefone"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const tabela =
    document.getElementById(
        "tabelaFornecedores"
    );


const mensagem =
    document.getElementById(
        "mensagem"
    );


const btnAtualizar =
    document.getElementById(
        "btnAtualizar"
    );


const btnLimpar =
    document.getElementById(
        "btnLimpar"
    );
let fornecedores = [];

let idSelecionado = null;
async function carregarFornecedores() {

    try {

        const resposta =
            await fetch(API_URL);


        if (!resposta.ok) {

            throw new Error(
                "Erro ao acessar a API."
            );

        }


        fornecedores =
            await resposta.json();


        mostrarFornecedores();


    } catch (erro) {

        console.error(erro);


        tabela.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="carregando"
                >

                    Erro ao conectar ao JSONServer.

                    <br><br>

                    Verifique se o JSONServer
                    está rodando na porta 3000.

                </td>

            </tr>

        `;

    }

}
function mostrarFornecedores() {

    if (fornecedores.length === 0) {

        tabela.innerHTML = `

            <tr>

                <td
                    colspan="5"
                    class="carregando"
                >

                    Nenhum fornecedor cadastrado.

                </td>

            </tr>

        `;

        return;

    }
    tabela.innerHTML =
        fornecedores
            .map(
                (fornecedor) => {

                    return `

                        <tr>

                            <td>
                                ${fornecedor.id}
                            </td>


                            <td>
                                ${escaparHTML(
                                    fornecedor.nome
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    fornecedor.telefone
                                )}
                            </td>


                            <td>
                                ${escaparHTML(
                                    fornecedor.email
                                )}
                            </td>


                            <td>

                                <button
                                    class="btn-alterar"
                                    onclick="selecionarFornecedor(${fornecedor.id})"
                                >

                                    Alterar

                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}
function escaparHTML(valor) {

    return String(valor)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}

form.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();



        const id =
            Number(idInput.value);


        const nome =
            nomeInput.value.trim();


        const telefone =
            telefoneInput.value.trim();


        const email =
            emailInput.value.trim();
        if (!id || id < 1) {

            mostrarMensagem(
                "Digite um ID válido."
            );

            idInput.focus();

            return;

        }
        const idExiste =
            fornecedores.some(
                (fornecedor) =>
                    Number(fornecedor.id) === id
            );


        if (idExiste) {

            mostrarMensagem(
                "Já existe um fornecedor com esse ID."
            );

            idInput.focus();

            return;

        }
        const novoFornecedor = {

            id: id,

            nome: nome,

            telefone: telefone,

            email: email

        };



        try {


            const resposta =
                await fetch(
                    API_URL,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                novoFornecedor
                            )

                    }
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao cadastrar fornecedor."
                );

            }


            mostrarMensagem(
                "Fornecedor cadastrado com sucesso!"
            );


            limparFormulario();


            await carregarFornecedores();


        } catch (erro) {

            console.error(erro);


            mostrarMensagem(
                "Erro ao cadastrar fornecedor."
            );

        }

    }
);
function selecionarFornecedor(id) {


    const fornecedor =
        fornecedores.find(
            (item) =>
                Number(item.id) === Number(id)
        );


    if (!fornecedor) {

        return;

    }

    idSelecionado =
        fornecedor.id;
    idInput.value =
        fornecedor.id;


    nomeInput.value =
        fornecedor.nome;


    telefoneInput.value =
        fornecedor.telefone;


    emailInput.value =
        fornecedor.email;

    idInput.disabled = true;

    mostrarMensagem(
        "Fornecedor selecionado para alteração."
    );
    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}
btnAtualizar.addEventListener(
    "click",
    async function () {

        if (idSelecionado === null) {

            mostrarMensagem(
                "Selecione um fornecedor na tabela para alterar."
            );

            return;

        }

        const nome =
            nomeInput.value.trim();


        const telefone =
            telefoneInput.value.trim();


        const email =
            emailInput.value.trim();

        if (
            nome === "" ||
            telefone === "" ||
            email === ""
        ) {

            mostrarMensagem(
                "Preencha todos os campos."
            );

            return;

        }

        const fornecedorAtualizado = {

            id:
                idSelecionado,

            nome:
                nome,

            telefone:
                telefone,

            email:
                email

        };



        try {


            const resposta =
                await fetch(
                    `${API_URL}/${idSelecionado}`,
                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                fornecedorAtualizado
                            )

                    }
                );


            if (!resposta.ok) {

                throw new Error(
                    "Erro ao atualizar."
                );

            }
            mostrarMensagem(
                "Fornecedor atualizado com sucesso!"
            );
            limparFormulario();


            await carregarFornecedores();


        } catch (erro) {

            console.error(erro);


            mostrarMensagem(
                "Erro ao atualizar fornecedor."
            );

        }

    }
);
btnLimpar.addEventListener(
    "click",
    limparFormulario
);



function limparFormulario() {


    form.reset();


    idSelecionado =
        null;


    idInput.disabled =
        false;


    idInput.focus();

}

function mostrarMensagem(texto) {


    mensagem.textContent =
        texto;


    setTimeout(
        function () {

            mensagem.textContent =
                "";

        },
        3000
    );

}
carregarFornecedores();