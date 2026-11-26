function mostrarToast(mensagem, bgClass) {
    const toastEl = document.getElementById("liveToast");
    const toastMessage = document.getElementById("toast-message");

    if (!toastEl || !toastMessage) {
        console.log(mensagem);
        return;
    }

    toastMessage.textContent = mensagem;
    toastEl.classList.remove("bg-success", "bg-danger");
    toastEl.classList.add(bgClass);

    if (typeof bootstrap !== "undefined") {
        bootstrap.Toast.getOrCreateInstance(toastEl).show();
    }
}

// ---------------------------- CARRINHO ----------------------------
const CHAVE_CARRINHO = "carrinho";

function ler_carrinho() {
    try {
        const itens = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
        if (!Array.isArray(itens)) return [];
        return itens.filter(item =>
            item &&
            Number(item.id) > 0 &&
            Number(item.quantidade) > 0 &&
            Number(item.preco) >= 0
        );
    } catch (erro) {
        return [];
    }
}

function salvar_carrinho(itens) {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
    atualizar_contador_carrinho();
    return itens;
}

function limite_estoque(produto) {
    const estoque = Number(produto && (produto.quantidade ?? produto.estoque));
    return Number.isFinite(estoque) && estoque >= 0 ? estoque : Infinity;
}

function adicionar_ao_carrinho(produto, quantidade = 1) {
    if (!produto || !produto.id) return;

    const itens = ler_carrinho();
    const qtd = Number(quantidade) > 0 ? Math.floor(Number(quantidade)) : 1;
    const estoque = limite_estoque(produto);
    const existente = itens.find(item => Number(item.id) === Number(produto.id));

    if (existente) {
        const novaQuantidade = existente.quantidade + qtd;
        if (novaQuantidade > estoque) {
            mostrarToast("Só há " + estoque + " unidade(s) disponível(is).", "bg-danger");
            return;
        }
        existente.quantidade = novaQuantidade;
        existente.preco = Number(produto.preco);
        existente.nome = produto.nome;
        existente.caminho_img = produto.caminho_img;
        existente.estoque = estoque === Infinity ? undefined : estoque;
    } else {
        if (qtd > estoque) {
            mostrarToast("Só há " + estoque + " unidade(s) disponível(is).", "bg-danger");
            return;
        }
        itens.push({
            id: Number(produto.id),
            nome: produto.nome,
            preco: Number(produto.preco),
            quantidade: qtd,
            caminho_img: produto.caminho_img || "",
            estoque: estoque === Infinity ? undefined : estoque
        });
    }

    salvar_carrinho(itens);
    mostrarToast(produto.nome + " adicionado ao carrinho.", "bg-success");
}

function definir_quantidade(id, quantidade) {
    const itens = ler_carrinho();
    const item = itens.find(item => Number(item.id) === Number(id));
    if (!item) return;

    let novaQuantidade = Math.floor(Number(quantidade));
    if (!Number.isFinite(novaQuantidade) || novaQuantidade <= 0) {
        return remover_do_carrinho(id);
    }
    if (Number.isFinite(Number(item.estoque))) {
        novaQuantidade = Math.min(novaQuantidade, Number(item.estoque));
    }
    item.quantidade = novaQuantidade;
    salvar_carrinho(itens);
}

function alterar_quantidade(id, delta) {
    const item = ler_carrinho().find(item => Number(item.id) === Number(id));
    if (item) definir_quantidade(id, item.quantidade + Number(delta));
}

function remover_do_carrinho(id) {
    salvar_carrinho(ler_carrinho().filter(item => Number(item.id) !== Number(id)));
}

function limpar_carrinho() {
    salvar_carrinho([]);
}

function total_carrinho() {
    return ler_carrinho().reduce(
        (total, item) => total + Number(item.preco) * Number(item.quantidade),
        0
    );
}

function quantidade_carrinho() {
    return ler_carrinho().reduce((total, item) => total + Number(item.quantidade), 0);
}

function atualizar_contador_carrinho() {
    const contador = document.getElementById("cart-count");
    if (!contador) return;
    const quantidade = quantidade_carrinho();
    contador.textContent = quantidade;
    contador.hidden = quantidade === 0;
}

function formatar_moeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------------------------- NAVBAR ----------------------------
function atualizar_navbar() {
    const nome = localStorage.getItem("nome_cliente");
    const token = localStorage.getItem("token");
    const nav_login = document.getElementById("nav-login");
    const btn_user_info = document.getElementById("user-info");

    if (token && nome) {
        if (nav_login) nav_login.style.display = "none";
        if (btn_user_info) {
            btn_user_info.style.display = "inline-block";
            btn_user_info.textContent = "Olá, " + nome.split(" ")[0];
        }
    } else {
        if (nav_login) nav_login.style.display = "";
        if (btn_user_info) btn_user_info.style.display = "none";
    }

    atualizar_contador_carrinho();
}

function logout() {
    localStorage.removeItem("nome_cliente");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", atualizar_navbar);
window.addEventListener("storage", atualizar_navbar);
