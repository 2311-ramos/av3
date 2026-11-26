// URL base da API (arquivo carregado como <script> comum, sem export/import)
const LINK_API = "http://localhost:3000";

function headers_autenticados() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: "Bearer " + token } : {};
}

async function api_fetch(rota, opcoes = {}) {
    const resposta = await fetch(LINK_API + rota, opcoes);

    let json = null;
    try {
        json = await resposta.json();
    } catch (_) {
        // Algumas respostas podem vir sem corpo JSON
    }

    if (!resposta.ok) {
        const erro = new Error(
            (json && (json.erro || json.msg)) || "Erro " + resposta.status
        );
        erro.status = resposta.status;
        throw erro;
    }

    return json;
}

async function buscar_produtos(queryParams) {
    return await api_fetch("/produto?" + queryParams.toString());
}

async function buscar_produto(id) {
    return await api_fetch("/produto/" + encodeURIComponent(id));
}

async function perfil_cliente() {
    return await api_fetch("/cliente/perfil", { headers: headers_autenticados() });
}

async function salvar_perfil(dados) {
    return await api_fetch("/cliente/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers_autenticados() },
        body: JSON.stringify(dados)
    });
}

async function buscar_compras() {
    return await api_fetch("/compra", { headers: headers_autenticados() });
}

async function cadastrar_compra(dados) {
    return await api_fetch("/compra", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers_autenticados() },
        body: JSON.stringify(dados)
    });
}

function acesso_negado(erro) {
    return erro.status === 401 || erro.status === 403;
}
