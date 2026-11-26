const form_perfil = document.getElementById("form_perfil");
const btn_salvar_perfil = document.getElementById("btn-salvar-perfil");
const historico_compras = document.getElementById("historico-compras");

function exigir_login() {
    if (!localStorage.getItem("token")) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function aviso(texto) {
    const paragrafo = document.createElement("p");
    paragrafo.className = "aviso";
    paragrafo.textContent = texto;
    return paragrafo;
}

function data_formatada(valor) {
    const data = new Date(String(valor || "").slice(0, 10) + "T00:00:00");
    return Number.isNaN(data.getTime()) ? valor : data.toLocaleDateString("pt-BR");
}

async function carregar_perfil() {
    if (!exigir_login()) return;

    try {
        const cliente = await perfil_cliente();
        document.getElementById("perfil-nome").value = cliente.nome || "";
        document.getElementById("perfil-cpf").value = cliente.cpf || "";
        document.getElementById("perfil-celular").value = cliente.celular || "";
        document.getElementById("perfil-email").value = cliente.email || "";
    } catch (erro) {
        if (acesso_negado(erro)) {
            localStorage.removeItem("token");
            localStorage.removeItem("nome_cliente");
            window.location.href = "login.html";
            return;
        }
        mostrarToast("Não foi possível carregar seu perfil: " + erro.message, "bg-danger");
    }
}

function criar_card_compra(compra) {
    const artigo = document.createElement("article");
    artigo.className = "compra";

    const cabecalho = document.createElement("header");
    const numero = document.createElement("strong");
    numero.textContent = "Pedido #" + compra.id + " · " + data_formatada(compra.data);
    const pagamento = document.createElement("span");
    pagamento.textContent = compra.forma_pagamento;
    cabecalho.append(numero, pagamento);

    const lista = document.createElement("ul");
    compra.itens.forEach(item => {
        const linha = document.createElement("li");
        const nome = document.createElement("span");
        nome.textContent = item.quantidade + "x " + item.nome;
        const valor = document.createElement("span");
        valor.textContent = formatar_moeda(Number(item.valor_unitario) * Number(item.quantidade));
        linha.append(nome, valor);
        lista.appendChild(linha);
    });

    const total = document.createElement("div");
    total.className = "total-compra";
    total.textContent = "Total: " + formatar_moeda(compra.valor_total);

    artigo.append(cabecalho, lista, total);
    return artigo;
}

async function carregar_compras() {
    historico_compras.replaceChildren();
    if (!exigir_login()) return;

    try {
        const compras = await buscar_compras();
        if (compras.length === 0) {
            historico_compras.appendChild(aviso("Você ainda não realizou compras."));
            return;
        }
        compras.forEach(compra => historico_compras.appendChild(criar_card_compra(compra)));
    } catch (erro) {
        if (acesso_negado(erro)) {
            localStorage.removeItem("token");
            localStorage.removeItem("nome_cliente");
            window.location.href = "login.html";
            return;
        }
        historico_compras.appendChild(aviso("Não foi possível carregar suas compras: " + erro.message));
    }
}

form_perfil.addEventListener("submit", async (event) => {
    event.preventDefault();
    btn_salvar_perfil.disabled = true;
    btn_salvar_perfil.value = "Salvando...";

    const dados = {
        nome: document.getElementById("perfil-nome").value,
        cpf: document.getElementById("perfil-cpf").value,
        celular: document.getElementById("perfil-celular").value,
        email: document.getElementById("perfil-email").value,
        senha: document.getElementById("perfil-senha").value || undefined
    };

    try {
        await salvar_perfil(dados);
        document.getElementById("perfil-senha").value = "";
        localStorage.setItem("nome_cliente", dados.nome);
        mostrarToast("Perfil atualizado com sucesso.", "bg-success");
        await carregar_perfil();
        atualizar_navbar();
    } catch (erro) {
        if (acesso_negado(erro)) {
            localStorage.removeItem("token");
            localStorage.removeItem("nome_cliente");
            window.location.href = "login.html";
            return;
        }
        mostrarToast("Não foi possível salvar: " + erro.message, "bg-danger");
    } finally {
        btn_salvar_perfil.disabled = false;
        btn_salvar_perfil.value = "Salvar alterações";
    }
});

carregar_perfil();
carregar_compras();
