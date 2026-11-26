-- TABELA CLIENTE

CREATE TABLE cliente
(
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(50) NOT NULL,
cpf CHAR(14) NOT NULL UNIQUE,
celular CHAR(14) NOT NULL,
email VARCHAR(50) NOT NULL UNIQUE,
senha VARCHAR(512) NOT NULL
);

DROP TABLE cliente;

INSERT INTO cliente (
    nome, cpf, celular, email, senha
) VALUES
    ('Mariana Albuquerque', '324.891.056-12', '(42)99812-3401', 'mariana.albuquerque@gmail.com', 'M@ri_Alb2026!'),
    ('Lucas Ferraz', '619.402.783-45', '(11)98765-4321', 'lucas.ferraz@outlook.com', 'Lferraz#987'),
    ('Camila Vasconcelos', '845.120.394-78', '(21)99654-1289', 'camila.vasc@yahoo.com', 'C@miVasc$44'),
    ('Rafael Moreira', '192.734.650-09', '(31)99123-4567', 'rafa.moreira@hotmail.com', 'RafaM_2026*'),
    ('Beatriz Nogueira', '508.961.247-33', '(41)99543-2109', 'beatriz.nogueira@gmail.com', 'BiaNog!753'),
    ('Gabriel Tavares', '731.485.920-61', '(51)98432-1098', 'gabriel.tavares@outlook.com', 'GabiTav@159'),
    ('Juliana Pacheco', '460.219.835-84', '(61)99321-0987', 'ju.pacheco@gmail.com', 'JuPach#852'),
    ('Matheus Siqueira', '953.670.148-27', '(71)98210-9876', 'matheus.siqueira@yahoo.com', 'MathSiq$369'),
    ('Fernanda Bastos', '287.543.916-50', '(81)99789-6543', 'fernanda.bastos@hotmail.com', 'FerBastos!147'),
    ('Gustavo Peixoto', '674.398.201-96', '(85)98678-5432', 'gustavo.peixoto@gmail.com', 'GusPeix@258'),
    ('Patrícia Rezende', '812.054.769-18', '(48)99456-7890', 'patricia.rezende@outlook.com', 'PatyRez#951');



SELECT email, senha FROM cliente;


SELECT email, senha FROM cliente WHERE email = "thiago.mendes@outlook.com";


SELECT * FROM cliente


SELECT * FROM cliente WHERE id <= 10 AND LENGTH(senha) > 20;


DELETE FROM cliente WHERE id = 11;


UPDATE cliente SET nome = "Guilherme Godoy", email = "cesarnoooooo67@gmail.com" WHERE id = 1;

-- TABELA ENDERECO

CREATE TABLE endereco
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    idCliente INT NOT NULL,
    numero INT NOT NULL,
    rua VARCHAR(100) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL,

    FOREIGN KEY (idcliente) REFERENCES cliente(id)
);

-- TABELA PRODUTO

CREATE TABLE produto
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    caminho_img VARCHAR(255),
    quantidade_img INT NOT NULL
);

INSERT INTO produto
(nome, descricao, categoria, preco, caminho_img, quantidade_img)
VALUES
('Plano Mensal de Boxe', 'Aulas de boxe em turma, 3 vezes por semana, para todos os níveis.', 'Planos e Aulas', 120.00, 'img/plano_mensal.png', 30),
('Plano Trimestral de Boxe', 'Três meses de aulas em turma com desconto em relação ao plano mensal.', 'Planos e Aulas', 330.00, 'img/plano_trimestral.png', 30),
('Aula Experimental', 'Uma aula para conhecer a academia e o treino, sem compromisso.', 'Planos e Aulas', 30.00, 'img/aula_experimental.png', 20),
('Luva de Boxe 10oz', 'Luva de treino leve em couro sintético, com fecho em velcro.', 'Luvas', 169.90, 'img/luva_10oz.png', 12),
('Luva de Boxe 12oz', 'Luva de treino com espuma de alta densidade e acabamento reforçado.', 'Luvas', 189.90, 'img/luva_12oz.png', 15),
('Luva de Boxe 14oz', 'Luva para treino com sparring, boa absorção de impacto e punho firme.', 'Luvas', 199.90, 'img/luva_14oz.png', 12),
('Luva de Boxe 16oz', 'Luva para sparring e treino pesado, com proteção extra para mãos e pulsos.', 'Luvas', 209.90, 'img/luva_16oz.png', 10),
('Luva de Saco de Pancada', 'Luva curta e leve, ideal para treinar no saco e nas manoplas.', 'Luvas', 79.90, 'img/luva_saco.png', 20),
('Protetor Bucal', 'Protetor bucal moldável, acompanha estojo para guardar.', 'Proteção', 39.90, 'img/protetor_bucal.png', 40),
('Capacete de Treino', 'Capacete com proteção para testa, laterais e queixo, com ajuste regulável.', 'Proteção', 229.90, 'img/capacete.png', 6),
('Protetor Genital', 'Protetor em copo rígido com acabamento macio e cinta elástica.', 'Proteção', 79.90, 'img/protetor_genital.png', 14),
('Caneleira de Treino', 'Par de caneleiras acolchoadas com fecho ajustável.', 'Proteção', 99.90, 'img/caneleira.png', 10),
('Protetor de Tornozelo', 'Par de tornozeleiras elásticas para dar firmeza durante o treino.', 'Proteção', 54.90, 'img/tornozeleira.png', 18),
('Bandagem Elástica 4m', 'Par de bandagens para proteger mãos e pulsos antes de colocar as luvas.', 'Bandagens e Cordas', 24.90, 'img/bandagem_4m.png', 50),
('Luva Interna de Gel', 'Luva interna com gel, usada sob as luvas de boxe para mais conforto.', 'Bandagens e Cordas', 39.90, 'img/luva_interna.png', 25),
('Corda de Pular com Rolamento', 'Corda ajustável com rolamento, ideal para aquecimento e condicionamento.', 'Bandagens e Cordas', 34.90, 'img/corda_pular.png', 30),
('Camiseta Ramos Academia de Boxe', 'Camiseta de algodão com a logo da academia estampada.', 'Vestuário', 59.90, 'img/camiseta_ramos.png', 30),
('Regata Dry Fit', 'Regata de tecido respirável que seca rápido, ótima para treinos intensos.', 'Vestuário', 49.90, 'img/regata_dry.png', 22),
('Short de Boxe', 'Short leve e resistente, com elástico na cintura e corte que não limita os movimentos.', 'Vestuário', 89.90, 'img/short_boxe.png', 18),
('Moletom Ramos Academia de Boxe', 'Moletom com capuz e a logo da academia bordada no peito.', 'Vestuário', 179.90, 'img/moletom_ramos.png', 10),
('Saco de Pancada 1,20 m', 'Saco de pancada em lona, recheado, com correntes para fixação no teto.', 'Sacos de Pancada', 349.90, 'img/saco_120.png', 5),
('Saco de Pancada 1,50 m', 'Saco de pancada profissional em lona reforçada, para socos e chutes.', 'Sacos de Pancada', 449.90, 'img/saco_150.png', 4),
('Pera de Boxe', 'Bola de velocidade com suporte de fixação, para treinar ritmo e reflexo.', 'Sacos de Pancada', 129.90, 'img/pera_boxe.png', 8),
('Whey Protein 900g', 'Suplemento de proteína para consumir após o treino.', 'Suplementos', 139.90, 'img/whey_900g.png', 20),
('Creatina 300g', 'Creatina monohidratada em pó, pote de 300g.', 'Suplementos', 99.90, 'img/creatina_300g.png', 16),
('BCAA 120 Cápsulas', 'Suplemento de aminoácidos em cápsulas, pote com 120 unidades.', 'Suplementos', 69.90, 'img/bcaa_120.png', 18),
('Pré-Treino 300g', 'Suplemento em pó para consumir antes do treino, pote de 300g.', 'Suplementos', 89.90, 'img/pre_treino.png', 14),
('Garrafa Squeeze 700ml', 'Garrafa de plástico resistente, com bico retrátil, para levar ao treino.', 'Acessórios', 29.90, 'img/garrafa_squeeze.png', 35),
('Bolsa Esportiva Ramos', 'Bolsa com compartimento para luvas e calçados, com a logo da academia.', 'Acessórios', 119.90, 'img/bolsa_ramos.png', 9),
('Toalha de Treino Ramos', 'Toalha de microfibra leve, que seca rápido, com a logo da academia.', 'Acessórios', 34.90, 'img/toalha_ramos.png', 25);


-- TABELA COMPRA (AV3)

CREATE TABLE compra
(
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    data DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (id_cliente) REFERENCES cliente(id)
);

-- TABELA PRODUTO COMPRA (itens de cada compra)

CREATE TABLE produtocompra
(
    id_compra INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id_compra, id_produto),

    FOREIGN KEY (id_compra) REFERENCES compra(id),
    FOREIGN KEY (id_produto) REFERENCES produto(id)
);