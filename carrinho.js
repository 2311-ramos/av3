const itens_carrinho = document.getElementById("itens-carrinho");
const total_carrinho_el = document.getElementById("total-carrinho");
const forma_pagamento = document.getElementById("forma_pagamento");
const btn_finalizar = document.getElementById("btn-finalizar");
const btn_esvaziar = document.getElementById("btn-esvaziar");
const historico_compras = document.getElementById("historico-compras");

function imagem_do_item(item) {
    const imagem = document.createElement("img");
    imagem.src = item.caminho_img
        ? LINK_API + "/" + item.caminho_img.replace(/^\//, "")
        : LINK_API + "/img/sem-imagem.svg";
    imagem.alt = item.nome;
    imagem.onerror = () => {
        imagem.onerror = null;
        imagem.src = LINK_API + "/img/sem-imagem.svg";
    };
    return imagem;
}

function criar_item_carrinho(item) {
    const artigo = document.createElement("article");
    artigo.className = "item-carrinho";

    const info = document.createElement("div");
    const titulo = document.createElement("h2");
    titulo.textContent = item.nome;
    const precoUnitario = document.createElement("p");
    precoUnitario.className = "preco-item";
    precoUnitario.textContent = formatar_moeda(item.preco) + " cada";
    info.append(titulo, precoUnitario);

    const subtotal = document.createElement("strong");
    subtotal.textContent = formatar_moeda(Number(item.preco) * Number(item.quantidade));

    const contador = document.createElement("div");
    contador.className = "contador-quantidade";
    const btn_menos = document.createElement("button");
    btn_menos.type = "button";
    btn_menos.textContent = "−";
    btn_menos.setAttribute("aria-label", "Diminuir quantidade");
    btn_menos.addEventListener("click", () => {
        alterar_quantidade(item.id, -1);
        renderizar_carrinho();
    });
    const quantidade = document.createElement("span");
    quantidade.textContent = item.quantidade;
    const btn_mais = document.createElement("button");
    btn_mais.type = "button";
    btn_mais.textContent = "+";
    btn_mais.setAttribute("aria-label", "Aumentar quantidade");
    if (Number.isFinite(Number(item.estoque)) && item.quantidade >= Number(item.estoque)) {
        btn_mais.disabled = true;
    }
    btn_mais.addEventListener("click", () => {
        alterar_quantidade(item.id, 1);
        renderizar_carrinho();
    });
    contador.append(btn_menos, quantidade, btn_mais);

    const btn_remover = document.createElement("button");
    btn_remover.type = "button";
    btn_remover.className = "btn-secundario";
    btn_remover.textContent = "Remover";
    btn_remover.addEventListener("click", () => {
        remover_do_carrinho(item.id);
        renderizar_carrinho();
    });

    artigo.append(imagem_do_item(item), info, subtotal, contador, btn_remover);
    return artigo;
}

function aviso(texto) {
    const paragrafo = document.createElement("p");
    paragrafo.className = "aviso";
    paragrafo.textContent = texto;
    return paragrafo;
}

function renderizar_carrinho() {
    const itens = ler_carrinho();
    itens_carrinho.replaceChildren();

    if (itens.length === 0) {
        itens_carrinho.appendChild(aviso("Seu carrinho está vazio. Volte aos produtos para adicionar itens."));
    } else {
        itens.forEach(item => itens_carrinho.appendChild(criar_item_carrinho(item)));
    }

    total_carrinho_el.textContent = formatar_moeda(total_carrinho());
    btn_finalizar.disabled = itens.length === 0;
    btn_esvaziar.disabled = itens.length === 0;
}

function data_formatada(valor) {
    const parte = String(valor || "").slice(0, 10);
    const data = new Date(parte + "T00:00:00");
    return Number.isNaN(data.getTime()) ? parte : data.toLocaleDateString("pt-BR");
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

    if (!localStorage.getItem("token")) {
        historico_compras.appendChild(aviso("Entre na sua conta para ver suas compras."));
        return;
    }

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

btn_finalizar.addEventListener("click", async () => {
    const itens = ler_carrinho();

    if (itens.length === 0) return;

    if (!localStorage.getItem("token")) {
        mostrarToast("Entre na sua conta para finalizar a compra.", "bg-danger");
        window.location.href = "login.html";
        return;
    }

    btn_finalizar.disabled = true;
    btn_finalizar.textContent = "Salvando...";

    try {
        const resultado = await cadastrar_compra({
            itens: itens.map(item => ({ id: item.id, quantidade: item.quantidade })),
            forma_pagamento: forma_pagamento.value
        });
        limpar_carrinho();
        renderizar_carrinho();
        mostrarToast("Compra #" + resultado.id + " cadastrada com sucesso!", "bg-success");
        await carregar_compras();
    } catch (erro) {
        if (acesso_negado(erro)) {
            localStorage.removeItem("token");
            localStorage.removeItem("nome_cliente");
            window.location.href = "login.html";
            return;
        }
        mostrarToast("Não foi possível finalizar a compra: " + erro.message, "bg-danger");
    } finally {
        btn_finalizar.textContent = "Finalizar compra";
        btn_finalizar.disabled = ler_carrinho().length === 0;
    }
});

btn_esvaziar.addEventListener("click", () => {
    limpar_carrinho();
    renderizar_carrinho();
    mostrarToast("Carrinho esvaziado.", "bg-success");
});

renderizar_carrinho();
carregar_compras();
