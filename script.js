// ---------- Alerta de vencimento ----------
// "dias" = quantos dias faltam para vencer (negativo = já venceu)
const produtos = [
  { nome: "Leite integral 1L", dias: -3 },
  { nome: "Iogurte natural", dias: 2 },
  { nome: "Pão de forma", dias: 4 },
  { nome: "Queijo mussarela", dias: 20 }
];

const lista = [];

for (let i = 0; i < produtos.length; i++) {
  if (produtos[i].dias < 0) {
    lista.push(produtos[i].nome + " (já venceu)");
  } else if (produtos[i].dias <= 7) {
    lista.push(produtos[i].nome + " (vence em " + produtos[i].dias + " dias)");
  }
}

document.getElementById("listaVencimento").textContent = lista.join(", ");


// ---------- Meta de doações ----------
const meta = 200;
const doado = 124;
const porcentagem = Math.round((doado / meta) * 100);

document.getElementById("textoDoacao").textContent =
  doado + " kg de " + meta + " kg (" + porcentagem + "%)";
document.getElementById("barraDoacao").style.width = porcentagem + "%";


// ---------- Dicas de consumo consciente ----------
const dicas = [
  "Antes de comprar, pergunte: eu realmente preciso disso agora?",
  "Produtos perto do vencimento ainda estão bons? Que tal doá-los?",
  "Compre só o necessário. Estoque bem planejado gera menos desperdício.",
  "O que vence primeiro sai primeiro: organize o estoque pela validade."
];

let posicao = 0;
document.getElementById("textoDica").textContent = dicas[posicao];

function outraDica() {
  posicao = posicao + 1;
  if (posicao == dicas.length) {
    posicao = 0;
  }
  document.getElementById("textoDica").textContent = dicas[posicao];
}


// ---------- Planos ----------
function trocarPeriodo() {
  let precos = [29, 79, 149];

  if (document.getElementById("periodo").value == "anual") {
    precos = [23, 63, 119];
  }

  for (let i = 0; i < 3; i++) {
    document.getElementById("preco" + (i + 1)).textContent = precos[i];
  }
}

function escolher(nome) {
  document.getElementById("mensagemPlano").textContent =
    "Você escolheu o plano " + nome + ". Obrigado pela confiança!";
}