import "dotenv/config";
import express, { request, response } from "express";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";

//ext Inline SQL Highlight

const PORT = process.env.PORT;
const app = express()

//Receber dados no formato JSON
app.use(express.json())

//CRIAR conexão com o banco de dados
const connection = mysql.createConnection({
    host: process.env.MySQL_host,
    user: process.env.MySQL_user,
    password: process.env.MySQL_password,
    database: process.env.MySQL_database,
    port: process.env.MySQL_port
});

//CONECTAR ao BANCO
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar MySQL:', err);
        return
    }
    console.log('MySQL conectado!');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

app.get("/livros", (request, response) => {
    const MySQL =   /*sql*/ `SELECT * FROM livros`
    connection.query(MySQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao buscar livros" })
            return
        }
        const livros = data
        response.status(200).json(livros)
    })
});

app.post("/livros", (request, response) => {
    const { titulo, autor, ano_publicacao, genero, preco } = request.body

    //validações
    if (!titulo) {
        response.status(400).json({ err: "O campo Título é obrigatório" });
        return;
    }
    if (!autor) {
        response.status(400).json({ err: "O campo Autor é obrigatório" });
        return;
    }
    if (!ano_publicacao) {
        response.status(400).json({ err: "O campo Ano de Publicação é obrigatório" });
        return;
    }
    if (!genero) {
        response.status(400).json({ err: "O campo Gênero é obrigatório" });
        return;
    }
    if (!preco) {
        response.status(400).json({ err: "O campo Preço é obrigatório" });
        return;
    }

    //verificar se o livro  não foi cadastrado
    const checkSQL = /*sql*/ `SELECT * FROM livros WHERE titulo = "${titulo}" AND autor = "${autor}" AND ano_publicacao = "${ano_publicacao}"`
    connection.query(checkSQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao buscar livro" })
            return;
        }
        if (data.length > 0) {
            response.status(400).json({ err: "Livro já cadastrado" });
        }
        //cadastrar o livro
        const id = uuidv4()
        const disponibilidade = 1
        const insertSQL = /*sql*/ `INSERT INTO livros (livro_id, titulo, autor, ano_publicacao, genero, preco, disponibilidade)
     VALUES ("${id}", "${titulo}", "${autor}", "${ano_publicacao}", "${genero}", "${preco}", "${disponibilidade}")
     `;
        connection.query(insertSQL, (err) => {
            if (err) {
                console.error(err);
                response.status(500).json({ err: "Erro ao cadastrar livro" })
                return
            }
            response.status(201).json({ message: "livro cadastrado" })
        })


    })
});

//Listar 1
app.get("/livros/:id", (request, response) => {
    const { id } = request.params
    const selectSQL = /*sql*/ `SELECT * FROM livros WHERE livro_id = "${id}"`

    connection.query(selectSQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao buscar livro" })
            return
        }
        if (data.length === 0) {
            response.status(404).json({ err: "Livro não encontrado" })
            return
        }

        const livro = data[0]
        response.status(200).json(livro);
    })
});

//Atualizar
app.put("/livros/:id", (request, response) => {
    const { id } = request.params
    const { titulo, autor, ano_publicacao, genero, preco, disponibilidade } = request.body

    if (!titulo) {
        response.status(400).json({ err: "O campo Título é obrigatório" });
        return;
    }
    if (!autor) {
        response.status(400).json({ err: "O campo Autor é obrigatório" });
        return;
    }
    if (!ano_publicacao) {
        response.status(400).json({ err: "O campo Ano de Publicação é obrigatório" });
        return;
    }
    if (!genero) {
        response.status(400).json({ err: "O campo Gênero é obrigatório" });
        return;
    }
    if (!preco) {
        response.status(400).json({ err: "O campo Preço é obrigatório" });
        return;
    }
    if (disponibilidade === undefined) {
        response.status(400).json({ err: "O campo disponibilidade é obrigatório" });
        return;
    }

    const selectSQL = /*sql*/ `SELECT * FROM livros WHERE livro_id = "${id}"`

    connection.query(selectSQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao buscar livro" })
            return
        }
        if (data.length === 0) {
            response.status(404).json({ err: "Livro não encontrado" })
            return
        }

        const updateSQL = /*sql*/ `UPDATE livros SET titulo = "${titulo}",
        autor = "${autor}", ano_publicacao = "${ano_publicacao}", genero = "${genero}", 
        preco = "${preco}", disponibilidade = "${disponibilidade}" WHERE livro_id = "${id}" 
        `
        connection.query(updateSQL, (err, info) => {
            if (err) {
                console.error(err);
                response.status(500).json({ err: "Erro ao atualizar livro" })
                return
            }
            console.log(info)
            response.status(200).json({ mensagem: "Livro atualizado." })
        })
    })

});

//Deletar
app.delete("/livros/:id", (request, response) => {
    const { id } = request.params

    const deleteSQL = /*sql*/ `DELETE FROM livros WHERE livro_id = "${id}"
   `
    connection.query(deleteSQL, (err, info) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao deletar livro" })
            return
        }
        if (info.affectedRows === 0) {
            response.status(404).json({ err: "Livro não encontrado" })
        }

        response.status(200).json({ mensagem: "Livro deletado." })
    })
});

/****************** ROTAS DE FUNCIONARIOS *********************/
/* tabela (id, nome, cargo, data_contratacao, salario, email, created_at, updated_at)
   1° Listar todos os funcionarios
   2° Cadastrar um funcionario (email é único)
   3° Listar um funcionário
   4° Atualizar um funcionário (não pode ter o email de outro func.)
   5° Deletar um funcionário
*/
app.get("/funcionarios", (request, response) => {
    //request, não existe
    const selectSQL = /*sql*/ `SELECT * FROM funcionarios`
    connection.query(selectSQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao listar funcionarios" })
            return
        }
        const funcionarios = data
        response.status(200).json(funcionarios)
    })
});
app.post("/funcionarios", (request, response) => {
    const { nome, email, cargo, data_contratacao, salario } = request.body
    if (!nome) {
        return response.status(400).json({ message: "O nome é obrigatório." })
    }
    if (!email) {
        return response.status(400).json({ message: "O email é obrigatório." })
    }
    if (!cargo) {
        return response.status(400).json({ message: "O cargo é obrigatório." })
    }
    if (!data_contratacao) {
        return response.status(400).json({ message: "A data de contratação é obrigatório." })
    }
    if (!salario) {
        return response.status(400).json({ message: "O salario é obrigatório." })
    }
    if (!email.includes("@")) {
        return response.status(400).json({ message: "Email faltando @." })
    }
    //1- Não existe funcionario com email igual 
    const sql = /*sql*/`SELECT * FROM funcionarios WHERE email = "${email}"`
    connection.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao cadastrar funcionário" })
            return
        }
        if (data.length > 0) {
            return response.status(409).json({ message: "Email já está em uso." })
        }

        const id = uuidv4()
        const insertSql = /*sql*/`INSERT INTO funcionarios (funcionario_id, nome, email, cargo, data_contratacao, salario)
        VALUES
        ("${id}", "${nome}", "${email}", "${cargo}", "${data_contratacao}", "${salario}")`
        connection.query(insertSql, (err, data) => {
            if (err) {
                console.error(err);
                response.status(500).json({ err: "Erro ao cadastrar funcionário." })
                return
            }
            response.status(201).json({ message: "Funcionário cadastrado com sucesso" })
        })
    })
});
app.put("/funcionarios/:id", (request, response) => {
    const { id } = request.params
    const { nome, email, cargo, data_contratacao, salario } = request.body

    if (!nome) {
        return response.status(400).json({ message: "O nome é obrigatório." })
    }
    if (!email) {
        return response.status(400).json({ message: "O email é obrigatório." })
    }
    if (!cargo) {
        return response.status(400).json({ message: "O cargo é obrigatório." })
    }
    if (!data_contratacao) {
        return response.status(400).json({ message: "A data de contratação é obrigatório." })
    }
    if (!salario) {
        return response.status(400).json({ message: "O salario é obrigatório." })
    }
    if (!email.includes("@")) {
        return response.status(400).json({ message: "Email faltando @." })
    }

    //1° verificar se funcionario existe
    const checkSql = /*sql*/` SELECT * FROM funcionarios WHERE funcionario_id = "${id}"`
    connection.query(checkSql, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao procurar funcionarios" })
            return
        }
        if (data.length === 0) {
            response.status(404).json({ err: "Funcionario não encontrado" })
        }
    })
    //2° se o email está disponivel
    const checkEmailSQL = /*sql*/`SELECT * FROM funcionarios WHERE email = "${email}" AND funcionario_id != "${id}"`
    connection.query(checkEmailSQL, (err, data) => {
        if (err) {
            console.error(err)
            response.status(500).json({ err: "Erro ao procurar funcionario" })
            return
        }
        if (data.length > 0) {
            response.status(409).json({ err: "Email já existe" });
        }
    })
    //3° atualizar email
    const updateSQL = /*sql*/ `UPDATE funcionarios SET nome = "${nome}", email = "${email}", cargo = "${cargo}", data_contratacao = "${data_contratacao}", salario = "${salario}"
    WHERE funcionario_id = "${id}"
    `
    connection.query(updateSQL, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao atualizar funcionário." })
            return
        }
        response.status(200).json({ message: "Funcionário atualizado com sucesso" })
    })
});
app.delete("/funcionarios/:id", (request, response) => {
    const id = request.params.id
    const sql = /*sql*/`DELETE FROM funcionarios WHERE funcionario_id = "${id}"`
    connection.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao deletar funcionário." })
            return
        }
        if (info.affectedRows) {
            response.status(404).json({ message: "Funcionário não encontrado" })
        }
        response.status(200).json({ message: "Funcionário deletado com sucesso" })
    })
});
app.get("/funcionarios/:id", (request, response) => {
    const id = request.params
    const sql = /*sql*/ `SELECT * FROM funcionarios WHERE funcionario_id = "${id}"
    `
    connection.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            response.status(500).json({ err: "Erro ao selecionar funcionário" });
            return
        }
        const funcionario = data[0]
        response.status(200).json(funcionario);
    })
});
