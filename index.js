// npm init
// npm i dotenv express mysql2 bcrypt jsonwebtoken cors

const dotenv = require("dotenv")
dotenv.config()

const express = require("express")
const fs = require("fs")
const path = require("path")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const db = require("./db")

const app = express()
const port = process.env.API_PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "senha_muit0_forte_2h13u12h3i1uuhia"
const PASTA_IMAGENS = path.join(__dirname, "img")

// Limite maior para receber imagens em base64
app.use(express.json({ limit: "10mb" }))
app.use(cors())

// AV3 - imagens dos produtos ficam no servidor, em /img
fs.mkdirSync(PASTA_IMAGENS, { recursive: true })
app.use("/img", express.static(PASTA_IMAGENS))

const EXTENSOES_IMAGEM = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp"
}

function erroComStatus(status, mensagem) {
    const erro = new Error(mensagem)
    erro.status = status
    return erro
}

function autenticar(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            erro: "Token não enviado. Use Authorization: Bearer <token>"
        })
    }

    jwt.verify(token, JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.status(403).json({ erro: "Token inválido ou expirado" })
        }
        req.usuario = usuario
        next()
    })
}

// ------------------------------------------------------------------
// AV1 - CADASTRO DE CLIENTE
// ------------------------------------------------------------------
app.post("/cliente", async (req, res) => {
    try {
        const { nome, cpf, celular, email, senha } = req.body

        if (!nome || !cpf || !celular || !email || !senha) {
            throw erroComStatus(400, "Preencha nome, cpf, celular, email e senha")
        }

        const senhaCript = bcrypt.hashSync(senha, 10)

        const resultado = await db.pool.query(
            `INSERT INTO cliente (nome, cpf, celular, email, senha)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, cpf, celular, email, senhaCript]
        )

        res.status(201).json({
            msg: "Cliente cadastrado, ID = " + resultado[0].insertId,
            id: resultado[0].insertId
        })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado" })
        }
        res.status(error.status || 500).json({ erro: error.message })
    }
})

// ------------------------------------------------------------------
// AV1 - LOGIN DO CLIENTE
// ------------------------------------------------------------------
app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body

        if (!email || !senha) {
            throw erroComStatus(400, "Informe e-mail e senha")
        }

        const resultado = await db.pool.query(
            "SELECT id, nome, email, senha FROM cliente WHERE email = ?",
            [email]
        )
        const dados_bd = resultado[0][0]

        if (!dados_bd) {
            return res.status(401).json({ msg: "Email não cadastrado!" })
        }

        const senha_valida = await bcrypt.compare(senha, dados_bd.senha)

        if (!senha_valida) {
            return res.status(401).json({ msg: "Credenciais inválidas!" })
        }

        const payload = {
            id: dados_bd.id,
            email: dados_bd.email
        }

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })

        return res.status(200).json({
            id: dados_bd.id,
            nome: dados_bd.nome,
            token
        })
    } catch (error) {
        res.status(error.status || 500).json({ erro: error.message })
    }
})

// CONSULTAR TODOS OS CLIENTES
app.get("/cliente", async (req, res) => {
    try {
        const resultado = await db.pool.query(
            "SELECT id, nome, cpf, celular, email FROM cliente"
        )
        res.status(200).json(resultado[0])
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// ------------------------------------------------------------------
// AV1 - ACESSO AO PERFIL DO CLIENTE (rota protegida por token)
// ------------------------------------------------------------------
app.get("/cliente/perfil", autenticar, async (req, res) => {
    try {
        const resultado = await db.pool.query(
            "SELECT id, nome, cpf, celular, email FROM cliente WHERE id = ?",
            [req.usuario.id]
        )

        if (resultado[0].length === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json(resultado[0][0])
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// ALTERAR O PRÓPRIO PERFIL (senha é opcional)
app.put("/cliente/perfil", autenticar, async (req, res) => {
    try {
        const { nome, cpf, celular, email, senha } = req.body
        const atual = await db.pool.query(
            "SELECT nome, cpf, celular, email, senha FROM cliente WHERE id = ?",
            [req.usuario.id]
        )

        if (atual[0].length === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        const clienteAtual = atual[0][0]
        const senhaFinal = senha ? bcrypt.hashSync(senha, 10) : clienteAtual.senha

        await db.pool.query(
            `UPDATE cliente
             SET nome = ?, cpf = ?, celular = ?, email = ?, senha = ?
             WHERE id = ?`,
            [
                nome || clienteAtual.nome,
                cpf || clienteAtual.cpf,
                celular || clienteAtual.celular,
                email || clienteAtual.email,
                senhaFinal,
                req.usuario.id
            ]
        )

        res.status(200).json({ mensagem: "Perfil alterado com sucesso" })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado" })
        }
        res.status(error.status || 500).json({ erro: error.message })
    }
})

// ALTERAR CLIENTE (rota administrativa, mantida do código original)
app.put("/cliente/:id", async (req, res) => {
    try {
        const id = req.params.id
        const cliente = req.body

        const senhaCript = cliente.senha ? bcrypt.hashSync(cliente.senha, 10) : undefined

        const resultado = await db.pool.query(
            `UPDATE cliente
             SET nome = ?, cpf = ?, celular = ?, email = ?,
                 senha = COALESCE(?, senha)
             WHERE id = ?`,
            [
                cliente.nome,
                cliente.cpf,
                cliente.celular,
                cliente.email,
                senhaCript,
                id
            ]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json({ mensagem: "Cliente alterado com sucesso" })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ erro: "CPF ou e-mail já cadastrado" })
        }
        res.status(500).json({ erro: error.message })
    }
})

// EXCLUIR CLIENTE
app.delete("/cliente/:id", async (req, res) => {
    try {
        const resultado = await db.pool.query(
            "DELETE FROM cliente WHERE id = ?",
            [req.params.id]
        )

        if (resultado[0].affectedRows === 0) {
            return res.status(404).json({ mensagem: "Cliente não encontrado" })
        }

        res.status(200).json({ mensagem: "Cliente excluído com sucesso" })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// ------------------------------------------------------------------
// AV2 - CONSULTA DE PRODUTOS COM FILTRO
// ------------------------------------------------------------------
const COLUNAS_PRODUTO = `id, nome, descricao, categoria, preco,
                         caminho_img, quantidade_img AS quantidade`

app.get("/produto", async (req, res) => {
    try {
        let sql = `SELECT ${COLUNAS_PRODUTO} FROM produto WHERE 1=1`
        const params = []

        const {
            busca,
            ordenacao,
            categoria,
            preco_min,
            preco_max,
            pagina
        } = req.query

        if (busca) {
            sql += " AND nome LIKE ?"
            params.push(`%${busca}%`)
        }

        if (categoria) {
            sql += " AND categoria = ?"
            params.push(categoria)
        }

        if (preco_min) {
            sql += " AND preco >= ?"
            params.push(preco_min)
        }

        if (preco_max) {
            sql += " AND preco <= ?"
            params.push(preco_max)
        }

        const ordem = String(ordenacao || "").toLowerCase()
        if (["maior preco", "maior_preco", "desc"].includes(ordem)) {
            sql += " ORDER BY preco DESC"
        } else if (["menor preco", "menor_preco", "asc"].includes(ordem)) {
            sql += " ORDER BY preco ASC"
        } else {
            sql += " ORDER BY id ASC"
        }

        const limite = 10
        let paginaAtual = parseInt(pagina)
        if (isNaN(paginaAtual) || paginaAtual < 1) {
            paginaAtual = 1
        }

        sql += " LIMIT ? OFFSET ?"
        params.push(limite, (paginaAtual - 1) * limite)

        const resultado = await db.pool.query(sql, params)
        res.status(200).json(resultado[0])
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// AV3 - imagem do produto direto do banco (redireciona para o placeholder se não houver)
app.get("/produto/:id/imagem", async (req, res) => {
    try {
        const resultado = await db.pool.query(
            "SELECT caminho_img FROM produto WHERE id = ?",
            [req.params.id]
        )

        if (resultado[0].length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        const caminho = resultado[0][0].caminho_img
        if (!caminho) {
            return res.redirect("/img/sem-imagem.svg")
        }

        const arquivo = path.join(PASTA_IMAGENS, path.basename(caminho))
        if (!fs.existsSync(arquivo)) {
            return res.redirect("/img/sem-imagem.svg")
        }

        res.sendFile(arquivo)
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// AV3 - salvar imagem do produto no servidor (base64 no corpo da requisição)
// Body: { "imagem": "data:image/png;base64,iVBORw0KGgo..." }
app.post("/produto/:id/imagem", async (req, res) => {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id <= 0) {
            throw erroComStatus(400, "ID de produto inválido")
        }

        const produto = await db.pool.query(
            "SELECT caminho_img FROM produto WHERE id = ?",
            [id]
        )
        if (produto[0].length === 0) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        const match = /^data:(image\/(png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(
            String(req.body.imagem || "").trim()
        )
        if (!match) {
            throw erroComStatus(400, "Envie uma imagem PNG, JPG ou WEBP em base64")
        }

        const extensao = EXTENSOES_IMAGEM[match[1]]
        const nomeArquivo = `produto-${id}.${extensao}`
        const caminho_img = `img/${nomeArquivo}`

        await fs.promises.writeFile(
            path.join(PASTA_IMAGENS, nomeArquivo),
            Buffer.from(match[3], "base64")
        )

        const anterior = produto[0][0].caminho_img
        if (anterior && anterior !== caminho_img && path.basename(anterior).startsWith(`produto-${id}.`)) {
            await fs.promises.unlink(path.join(PASTA_IMAGENS, path.basename(anterior))).catch(() => {})
        }

        await db.pool.query(
            "UPDATE produto SET caminho_img = ? WHERE id = ?",
            [caminho_img, id]
        )

        res.status(200).json({
            msg: "Imagem salva no servidor",
            caminho_img
        })
    } catch (error) {
        res.status(error.status || 500).json({ erro: error.message })
    }
})

app.get("/produto/:id", async (req, res) => {
    try {
        const resultado = await db.pool.query(
            `SELECT ${COLUNAS_PRODUTO} FROM produto WHERE id = ?`,
            [req.params.id]
        )
        const produto = resultado[0][0]

        if (!produto) {
            return res.status(404).json({ erro: "Produto não encontrado" })
        }

        res.status(200).json(produto)
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// ------------------------------------------------------------------
// AV3 - ROTA PARA CADASTRAR COMPRA NO BANCO DE DADOS
// Body: { "itens": [{ "id": 1, "quantidade": 2 }], "forma_pagamento": "Pix" }
// ------------------------------------------------------------------
app.post("/compra", autenticar, async (req, res) => {
    const connection = await db.pool.getConnection()

    try {
        const { itens, forma_pagamento } = req.body

        if (!Array.isArray(itens) || itens.length === 0) {
            throw erroComStatus(400, "A compra precisa ter pelo menos um item")
        }
        if (!forma_pagamento || !String(forma_pagamento).trim()) {
            throw erroComStatus(400, "Informe a forma de pagamento")
        }

        // Junta itens repetidos e valida quantidades
        const quantidades = new Map()
        for (const item of itens) {
            const id = Number(item.id ?? item.id_produto)
            const quantidade = Number(item.quantidade)
            if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(quantidade) || quantidade <= 0) {
                throw erroComStatus(400, "Itens da compra inválidos")
            }
            quantidades.set(id, (quantidades.get(id) || 0) + quantidade)
        }

        const ids = Array.from(quantidades.keys())
        const placeholders = ids.map(() => "?").join(", ")

        await connection.beginTransaction()

        // FOR UPDATE trava os produtos enquanto a compra é gravada
        const [produtos] = await connection.query(
            `SELECT id, preco, quantidade_img FROM produto
             WHERE id IN (${placeholders}) FOR UPDATE`,
            ids
        )
        const produtosPorId = new Map(produtos.map(p => [p.id, p]))

        for (const [id, quantidade] of quantidades) {
            const produto = produtosPorId.get(id)
            if (!produto) {
                throw erroComStatus(404, `Produto ${id} não encontrado`)
            }
            if (produto.quantidade_img < quantidade) {
                throw erroComStatus(
                    400,
                    `Estoque insuficiente para "${produto.nome || "produto " + id}"`
                )
            }
        }

        let valorTotal = 0
        for (const [id, quantidade] of quantidades) {
            valorTotal += Number(produtosPorId.get(id).preco) * quantidade
        }
        valorTotal = Math.round(valorTotal * 100) / 100

        const [resultadoCompra] = await connection.query(
            `INSERT INTO compra (id_cliente, data, forma_pagamento, valor_total)
             VALUES (?, CURDATE(), ?, ?)`,
            [req.usuario.id, String(forma_pagamento).trim().slice(0, 50), valorTotal]
        )
        const idCompra = resultadoCompra.insertId

        for (const [id, quantidade] of quantidades) {
            const valorUnitario = Number(produtosPorId.get(id).preco)

            await connection.query(
                `INSERT INTO produtocompra
                    (id_compra, id_produto, quantidade, valor_unitario)
                 VALUES (?, ?, ?, ?)`,
                [idCompra, id, quantidade, valorUnitario]
            )

            await connection.query(
                "UPDATE produto SET quantidade_img = quantidade_img - ? WHERE id = ?",
                [quantidade, id]
            )
        }

        await connection.commit()

        res.status(201).json({
            msg: "Compra cadastrada com sucesso",
            id: idCompra,
            valor_total: valorTotal
        })
    } catch (error) {
        await connection.rollback()
        res.status(error.status || 500).json({ erro: error.message })
    } finally {
        connection.release()
    }
})

// ------------------------------------------------------------------
// AV3 - ROTA PARA CONSULTAR AS COMPRAS DO USUÁRIO LOGADO
// ------------------------------------------------------------------
app.get("/compra", autenticar, async (req, res) => {
    try {
        const [compras] = await db.pool.query(
            `SELECT id, data, forma_pagamento, valor_total
             FROM compra
             WHERE id_cliente = ?
             ORDER BY id DESC`,
            [req.usuario.id]
        )

        if (compras.length === 0) {
            return res.status(200).json([])
        }

        const ids = compras.map(c => c.id)
        const [itens] = await db.pool.query(
            `SELECT pc.id_compra, pc.id_produto, p.nome,
                    pc.quantidade, pc.valor_unitario, p.caminho_img
             FROM produtocompra pc
             JOIN produto p ON p.id = pc.id_produto
             WHERE pc.id_compra IN (${ids.map(() => "?").join(", ")})
             ORDER BY pc.id_compra DESC, pc.id_produto`,
            ids
        )

        const itensPorCompra = new Map()
        for (const item of itens) {
            if (!itensPorCompra.has(item.id_compra)) {
                itensPorCompra.set(item.id_compra, [])
            }
            itensPorCompra.get(item.id_compra).push(item)
        }

        res.status(200).json(
            compras.map(compra => ({
                ...compra,
                itens: itensPorCompra.get(compra.id) || []
            }))
        )
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

// Detalhes de uma compra (só do usuário logado)
app.get("/compra/:id", autenticar, async (req, res) => {
    try {
        const [compras] = await db.pool.query(
            `SELECT id, data, forma_pagamento, valor_total
             FROM compra
             WHERE id = ? AND id_cliente = ?`,
            [req.params.id, req.usuario.id]
        )

        if (compras.length === 0) {
            return res.status(404).json({ erro: "Compra não encontrada" })
        }

        const [itens] = await db.pool.query(
            `SELECT pc.id_produto, p.nome, pc.quantidade, pc.valor_unitario
             FROM produtocompra pc
             JOIN produto p ON p.id = pc.id_produto
             WHERE pc.id_compra = ?`,
            [req.params.id]
        )

        res.status(200).json({ ...compras[0], itens })
    } catch (error) {
        res.status(500).json({ erro: error.message })
    }
})

app.listen(port, () => {
    console.log("API rodando na porta " + port)
})
