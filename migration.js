const bcrypt = require("bcrypt")
const db = require("./db")

// Senha usada pelos clientes de exemplo (teste de login no AV1)
const SENHA_INICIAL = "senha123"
const senhaHash = bcrypt.hashSync(SENHA_INICIAL, 10)

// Ordem importante: primeiro apaga quem tem chave estrangeira
const LIMPAR_TABELAS = `
DROP TABLE IF EXISTS produtocompra;
DROP TABLE IF EXISTS compra;
DROP TABLE IF EXISTS produto;
DROP TABLE IF EXISTS cliente;`

const ESTRUTURA_CLIENTE = `
CREATE TABLE cliente (
  id int NOT NULL AUTO_INCREMENT,
  nome varchar(50) NOT NULL,
  cpf char(14) NOT NULL,
  celular char(14) NOT NULL,
  email varchar(50) NOT NULL,
  senha varchar(512) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY cpf (cpf),
  UNIQUE KEY email (email)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;`

const DADOS_CLIENTE = `
INSERT INTO cliente (nome, cpf, celular, email, senha) VALUES
 ('guilherme godoy','111.222.333-44','(41)98888-1111','guilherme.godoy@email.com','${senhaHash}'),
 ('pedro nathan','222.333.444-55','(42)97777-2222','pedro.nathan@email.com','${senhaHash}'),
 ('antonio wesley','333.444.555-66','(43)96666-3333','antonio.wesley@email.com','${senhaHash}'),
 ('kayke','444.555.666-77','(44)95555-4444','kayke.ramos@email.com','${senhaHash}'),
 ('Ana liva','555.666.777-88','(45)94444-5555','ana.livia@email.com','${senhaHash}'),
 ('Pedro','777.888.999-00','(46)93333-6666','pedro.rocha@email.com','${senhaHash}'),
 ('Beatriz','888.999.000-11','(47)92222-7777','beatriz.soares@email.com','${senhaHash}'),
 ('Gabriel','999.000.111-22','(48)91111-8888','gabriel.lima@email.com','${senhaHash}'),
 ('Larissa','123.456.789-10','(49)90000-9999','larissa.souza@email.com','${senhaHash}'),
 ('Ianzeen','11.322.322-44','(43)98888-1111','ianzeen.isadora@email.com','${senhaHash}');`

const ESTRUTURA_PRODUTO = `
CREATE TABLE produto (
   id int NOT NULL AUTO_INCREMENT,
   nome varchar(100) NOT NULL,
   descricao varchar(255) NOT NULL,
   categoria varchar(50) NOT NULL,
   preco decimal(10,2) NOT NULL,
   caminho_img varchar(255) DEFAULT NULL,
   quantidade_img int NOT NULL,
   PRIMARY KEY (id)
 ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;`

// Catálogo da Ramos Academia de Boxe (mesmo do cliente.sql e do filtro do index.html)
const DADOS_PRODUTO = `
INSERT INTO produto (nome, descricao, categoria, preco, caminho_img, quantidade_img) VALUES
 ('Plano Mensal de Boxe','Aulas de boxe em turma, 3 vezes por semana, para todos os níveis.','Planos e Aulas',120.00,'img/plano_mensal.png',30),
 ('Plano Trimestral de Boxe','Três meses de aulas em turma com desconto em relação ao plano mensal.','Planos e Aulas',330.00,'img/plano_trimestral.png',30),
 ('Aula Experimental','Uma aula para conhecer a academia e o treino, sem compromisso.','Planos e Aulas',30.00,'img/aula_experimental.png',20),
 ('Luva de Boxe 10oz','Luva de treino leve em couro sintético, com fecho em velcro.','Luvas',169.90,'img/luva_10oz.png',12),
 ('Luva de Boxe 12oz','Luva de treino com espuma de alta densidade e acabamento reforçado.','Luvas',189.90,'img/luva_12oz.png',15),
 ('Luva de Boxe 14oz','Luva para treino com sparring, boa absorção de impacto e punho firme.','Luvas',199.90,'img/luva_14oz.png',12),
 ('Luva de Boxe 16oz','Luva para sparring e treino pesado, com proteção extra para mãos e pulsos.','Luvas',209.90,'img/luva_16oz.png',10),
 ('Luva de Saco de Pancada','Luva curta e leve, ideal para treinar no saco e nas manoplas.','Luvas',79.90,'img/luva_saco.png',20),
 ('Protetor Bucal','Protetor bucal moldável, acompanha estojo para guardar.','Proteção',39.90,'img/protetor_bucal.png',40),
 ('Capacete de Treino','Capacete com proteção para testa, laterais e queixo, com ajuste regulável.','Proteção',229.90,'img/capacete.png',6),
 ('Protetor Genital','Protetor em copo rígido com acabamento macio e cinta elástica.','Proteção',79.90,'img/protetor_genital.png',14),
 ('Caneleira de Treino','Par de caneleiras acolchoadas com fecho ajustável.','Proteção',99.90,'img/caneleira.png',10),
 ('Protetor de Tornozelo','Par de tornozeleiras elásticas para dar firmeza durante o treino.','Proteção',54.90,'img/tornozeleira.png',18),
 ('Bandagem Elástica 4m','Par de bandagens para proteger mãos e pulsos antes de colocar as luvas.','Bandagens e Cordas',24.90,'img/bandagem_4m.png',50),
 ('Luva Interna de Gel','Luva interna com gel, usada sob as luvas de boxe para mais conforto.','Bandagens e Cordas',39.90,'img/luva_interna.png',25),
 ('Corda de Pular com Rolamento','Corda ajustável com rolamento, ideal para aquecimento e condicionamento.','Bandagens e Cordas',34.90,'img/corda_pular.png',30),
 ('Camiseta Ramos Academia de Boxe','Camiseta de algodão com a logo da academia estampada.','Vestuário',59.90,'img/camiseta_ramos.png',30),
 ('Regata Dry Fit','Regata de tecido respirável que seca rápido, ótima para treinos intensos.','Vestuário',49.90,'img/regata_dry.png',22),
 ('Short de Boxe','Short leve e resistente, com elástico na cintura e corte que não limita os movimentos.','Vestuário',89.90,'img/short_boxe.png',18),
 ('Moletom Ramos Academia de Boxe','Moletom com capuz e a logo da academia bordada no peito.','Vestuário',179.90,'img/moletom_ramos.png',10),
 ('Saco de Pancada 1,20 m','Saco de pancada em lona, recheado, com correntes para fixação no teto.','Sacos de Pancada',349.90,'img/saco_120.png',5),
 ('Saco de Pancada 1,50 m','Saco de pancada profissional em lona reforçada, para socos e chutes.','Sacos de Pancada',449.90,'img/saco_150.png',4),
 ('Pera de Boxe','Bola de velocidade com suporte de fixação, para treinar ritmo e reflexo.','Sacos de Pancada',129.90,'img/pera_boxe.png',8),
 ('Whey Protein 900g','Suplemento de proteína para consumir após o treino.','Suplementos',139.90,'img/whey_900g.png',20),
 ('Creatina 300g','Creatina monohidratada em pó, pote de 300g.','Suplementos',99.90,'img/creatina_300g.png',16),
 ('BCAA 120 Cápsulas','Suplemento de aminoácidos em cápsulas, pote com 120 unidades.','Suplementos',69.90,'img/bcaa_120.png',18),
 ('Pré-Treino 300g','Suplemento em pó para consumir antes do treino, pote de 300g.','Suplementos',89.90,'img/pre_treino.png',14),
 ('Garrafa Squeeze 700ml','Garrafa de plástico resistente, com bico retrátil, para levar ao treino.','Acessórios',29.90,'img/garrafa_squeeze.png',35),
 ('Bolsa Esportiva Ramos','Bolsa com compartimento para luvas e calçados, com a logo da academia.','Acessórios',119.90,'img/bolsa_ramos.png',9),
 ('Toalha de Treino Ramos','Toalha de microfibra leve, que seca rápido, com a logo da academia.','Acessórios',34.90,'img/toalha_ramos.png',25);`

// AV3 - tabelas de compra e de itens da compra
const ESTRUTURA_COMPRA = `
CREATE TABLE compra (
  id int NOT NULL AUTO_INCREMENT,
  id_cliente int NOT NULL,
  data date NOT NULL,
  forma_pagamento varchar(50) NOT NULL,
  valor_total decimal(10,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_compra_cliente (id_cliente),
  CONSTRAINT fk_compra_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

const ESTRUTURA_PRODUTOCOMPRA = `
CREATE TABLE produtocompra (
  id_compra int NOT NULL,
  id_produto int NOT NULL,
  quantidade int NOT NULL,
  valor_unitario decimal(10,2) NOT NULL,
  PRIMARY KEY (id_compra, id_produto),
  CONSTRAINT fk_pc_compra FOREIGN KEY (id_compra) REFERENCES compra(id),
  CONSTRAINT fk_pc_produto FOREIGN KEY (id_produto) REFERENCES produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`

async function criar_tabelas() {
    const connection = await db.pool.getConnection()

    try {
        await connection.beginTransaction()

        console.log("Apagando tabelas antigas...")
        await connection.query(LIMPAR_TABELAS)

        console.log("Criando tabela 'cliente'...")
        await connection.query(ESTRUTURA_CLIENTE)
        await connection.query(DADOS_CLIENTE)

        console.log("Criando tabela 'produto'...")
        await connection.query(ESTRUTURA_PRODUTO)
        await connection.query(DADOS_PRODUTO)

        console.log("Criando tabelas 'compra' e 'produtocompra'...")
        await connection.query(ESTRUTURA_COMPRA)
        await connection.query(ESTRUTURA_PRODUTOCOMPRA)

        await connection.commit()
        console.log("Migration executada com sucesso!")
        console.log("Login de teste: qualquer e-mail do seed com senha '" + SENHA_INICIAL + "'")
        process.exit(0)
    } catch (error) {
        await connection.rollback()
        console.log(error)
        process.exit(1)
    } finally {
        connection.release()
    }
}

criar_tabelas()
