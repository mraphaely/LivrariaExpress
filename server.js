import "dotenv/config";
import express from "express";
import mysql from "mysql2";
import { v4 as uuidv4 } from "uuid";

const PORT = 3333
const app = express()

//Receber dados no formato JSON
app.use(express.json())

//CRIAR conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Sen@iDev77!.',
    database: 'livraria3F',
    port: 3306
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
        if(data.length > 0){
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
    response.status(201).json({message: "livro cadastrado"})
     })

    
})
});

