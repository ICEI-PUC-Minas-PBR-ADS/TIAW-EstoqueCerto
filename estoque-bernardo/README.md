# EstoqueCerto — Movimentações de estoque

**Aluno:** Bernardo Almeida Andrade  
**Matrícula:** 931797  
**Entrega:** Sprint 1 individual — requisitos 7 e 8 do planejamento.

Cadastro, edição, exclusão e visualização de movimentações de estoque com HTML, CSS e JavaScript puro. O JSON Server serve o site e a API REST e grava os registros permanentemente no arquivo `db.json`.

## Executar

É necessário ter Node.js com npm instalado no computador.

1. Extraia o ZIP e abra a pasta `estoque-bernardo` no Visual Studio Code.
2. No terminal dessa pasta (onde está `package.json`), execute:

```bash
npm install
npm start
```

3. Mantenha o terminal aberto e acesse:

**http://localhost:3000/movimentacoes.html**

A página original está em **http://localhost:3000/index.html**. No menu dela, clique em **Movimentações**.

Não abra o HTML por duplo clique e não use Live Server para esta entrega. O comando `npm start` usa o próprio JSON Server como servidor Web e API, na porta 3000. A instalação precisa de internet; depois de instalar as dependências, a aplicação funciona localmente.

Se o PowerShell bloquear `npm.ps1`, use `npm.cmd install` e `npm.cmd start`, ou abra o terminal Prompt de Comando. Se a porta 3000 estiver ocupada, encerre o outro servidor antes de iniciar este.

## Escopo individual

- Formulário com produto, lote associado, tipo Entrada/Saída, quantidade e data.
- Cadastro com `POST /movimentacoes`.
- Leitura com `GET /movimentacoes` e apresentação dinâmica em tabela.
- Edição pelo formulário com `PUT /movimentacoes/:id`.
- Exclusão após confirmação com `DELETE /movimentacoes/:id`.
- Busca por produto/lote e filtro por tipo, combinados.
- Histórico ordenado da data mais recente para a mais antiga.
- Resumo do número de registros de entrada e saída.
- Limpeza do formulário e cancelamento de edição.
- Validação de campos obrigatórios, quantidade inteira positiva, data não futura e saldo por lote.
- Carregamento, confirmação de sucesso, bloqueio de cliques durante requisições e mensagens de falha da API.
- Atualização da tabela e dos indicadores sem recarregar a página após cada operação.

Eventos utilizados: `DOMContentLoaded`, `submit`, `click`, `input` e `change`. O JavaScript usa `fetch`, `async/await`, criação de elementos DOM e `textContent` na tabela.

## Dados iniciais e regras de saldo

O `db.json` contém 3 produtos, 4 lotes e 4 movimentações de demonstração. Esses dados são lidos da API; não são uma base declarada no JavaScript nem em localStorage.

- Farinha de Trigo 1kg / LOTE-9982: entrada de 50 e saída de 10; saldo 40.
- Farinha de Trigo 1kg / LOTE-9983: sem movimentações; saldo 0.
- Arroz Branco 5kg / LOTE-2040: entrada de 30; saldo 30.
- Açúcar Cristal 1kg / LOTE-3050: entrada de 40; saldo 40.

Cada lote começa com saldo zero, e o saldo é calculado pelas movimentações. A sequência é validada por data crescente e, para registros do mesmo dia, por ID crescente. Uma saída não pode ocorrer antes da entrada que fornece seu saldo. Alterar ou excluir uma entrada também é bloqueado se isso deixar uma saída posterior sem saldo. Quantidades são medidas em unidades inteiras, entre 1 e 1.000.000.

Os dados não são recriados ao recarregar ou reiniciar. Excluir registros altera o próprio `db.json`. Se precisar voltar à base original para repetir os testes, encerre o servidor e restaure somente o `db.json` do ZIP original, sabendo que isso descarta as alterações de teste.

## Estrutura

```text
estoque-bernardo/
  package.json
  package-lock.json
  db.json
  README.md
  ORIENTACAO_DE_AVALIACAO.docx
  capturas/
  public/
    index.html
    estilo.css
    script.js
    movimentacoes.html
    movimentacoes.css
    movimentacoes.js
```

`node_modules` não está no ZIP; ele é criado por `npm install`.

## Estrutura da movimentação

```json
{
  "id": 1,
  "produto_id": 1,
  "produto": "Farinha de Trigo 1kg",
  "tipo_movimentacao": "Entrada",
  "quantidade": 50,
  "lote": "LOTE-9982",
  "data_movimentacao": "2026-09-19"
}
```

O JSON Server gera o ID ao cadastrar. A data é salva como `aaaa-mm-dd` para ordenação e exibida como `dd/mm/aaaa` na tabela. `produto_id` relaciona o registro a `/produtos`; o lote pertence ao mesmo produto via `produto_id` em `/lotes`.

| Método | Rota | Uso |
| --- | --- | --- |
| GET | `/produtos` | Preencher a seleção de produtos |
| GET | `/lotes` | Preencher os lotes do produto escolhido |
| GET | `/movimentacoes` | Carregar o histórico e calcular saldos |
| POST | `/movimentacoes` | Incluir movimentação |
| PUT | `/movimentacoes/:id` | Atualizar movimentação |
| DELETE | `/movimentacoes/:id` | Excluir movimentação |

## Integração com o grupo

O visual veio da base `Estoque.zip`. O `estilo.css` e o `script.js` originais foram preservados; o `index.html` recebeu apenas o link para a nova tela. Os arquivos foram organizados em `public` para serem servidos pelo JSON Server.

A tela original de lotes e o login são protótipos fornecidos pelo grupo. Eles não foram implementados nesta entrega individual e ainda não compartilham os dados da API. A avaliação da parte de Bernardo deve começar por `/movimentacoes.html`. O login original não autentica usuários.

Na integração, o grupo deve manter as coleções `produtos`, `lotes` e `movimentacoes` no mesmo `db.json`, com IDs e relacionamentos compatíveis. A tela de movimentações consulta os produtos/lotes por GET; ela não assume o cadastro dessas entidades, que pertence a outros membros. Não sobrescreva o `db.json` compartilhado do grupo: incorpore as coleções necessárias e preserve os dados já existentes.

As validações de saldo são realizadas pelo JavaScript da interface. O JSON Server é uma API de prototipação, sem autenticação ou transações: chamadas diretas à API podem ignorar as validações, e operações simultâneas não têm garantia de consistência transacional. O escopo desta entrega é a avaliação local individual.

## Testes realizados

Testado em navegador Chromium com JSON Server 0.17.4: leitura, inclusão, edição, exclusão, cancelamento da exclusão, filtros combinados, rejeição de quantidade inválida/data futura, proteção contra saldo negativo, preservação dos dados ao atualizar e reiniciar o servidor, falha/recuperação da API, navegação e largura de tela de 390 px. O documento de orientação detalha os cenários para repetir a avaliação.
