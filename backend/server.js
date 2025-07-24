const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Importa o pacote CORS
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Habilita CORS para todas as requisições. Isso é CRUCIAL para evitar problemas de "Cross-Origin".
app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições

// Serve arquivos estáticos do frontend.
// Certifique-se de que o caminho relativo '../frontend' está correto.
// Se seu server.js está em 'projeto/backend' e seu frontend em 'projeto/frontend', este caminho está certo.
app.use(express.static(path.join(__dirname, '../frontend')));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('./escola.db', (err) => {
    if (err) {
        console.error('Erro ao conectar com o banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
    }
});

// Criar tabelas se não existirem
db.serialize(() => {
    // Tabela de turmas
    db.run(`CREATE TABLE IF NOT EXISTS turmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        serie TEXT NOT NULL,
        professor TEXT,
        ano INTEGER NOT NULL,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de professores
    db.run(`CREATE TABLE IF NOT EXISTS professores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        genero TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        rg TEXT NOT NULL,
        endereco_rua TEXT NOT NULL,
        endereco_numero TEXT NOT NULL,
        endereco_bairro TEXT NOT NULL,
        endereco_cidade TEXT NOT NULL,
        endereco_estado TEXT NOT NULL,
        endereco_cep TEXT NOT NULL,
        email_institucional TEXT UNIQUE NOT NULL,
        telefone TEXT NOT NULL,
        disciplinas TEXT NOT NULL,
        formacao_academica TEXT NOT NULL,
        data_admissao DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'Ativo',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de alunos
    db.run(`CREATE TABLE IF NOT EXISTS alunos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome_completo TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        genero TEXT NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        rg TEXT,
        endereco_rua TEXT NOT NULL,
        endereco_numero TEXT NOT NULL,
        endereco_bairro TEXT NOT NULL,
        endereco_cidade TEXT NOT NULL,
        endereco_estado TEXT NOT NULL,
        endereco_cep TEXT NOT NULL,
        nome_responsavel TEXT NOT NULL,
        telefone_responsavel TEXT NOT NULL,
        email_responsavel TEXT NOT NULL,
        turma_id INTEGER,
        ano_ingresso INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Ativo',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (turma_id) REFERENCES turmas (id)
    )`);
});

// Rota principal - servir o HTML (se você acessar http://localhost:3000/)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ===== ROTAS PARA TURMAS =====

// Listar todas as turmas
app.get('/api/turmas', (req, res) => {
    db.all('SELECT * FROM turmas ORDER BY serie, nome', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obter uma turma específica
app.get('/api/turmas/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM turmas WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Turma não encontrada' });
        }
    });
});

// Cadastrar nova turma
app.post('/api/turmas', (req, res) => {
    const { nome, serie, ano, professor} = req.body;
    
    if (!nome || !serie || !ano) {
        res.status(400).json({ error: 'Nome, série e ano são obrigatórios' });
        return;
    }

    db.run('INSERT INTO turmas (nome, serie, ano, professor) VALUES (?, ?, ?, ?)',
        [nome, serie, ano, professor], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Nome da turma já existe' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({ id: this.lastID, message: 'Turma cadastrada com sucesso' });
    });
});

// Atualizar turma
app.put('/api/turmas/:id', (req, res) => {
    const id = req.params.id;
    const { nome, serie, ano, professor} = req.body;
    
    if (!nome || !serie || !ano) {
        res.status(400).json({ error: 'Nome, série e ano são obrigatórios' });
        return;
    }

    db.run('UPDATE turmas SET nome = ?, serie = ?, ano = ? , professor = ? WHERE id = ?',
        [nome, serie, ano, professor, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'Nome da turma já existe' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Turma não encontrada' });
        } else {
            res.json({ message: 'Turma atualizada com sucesso' });
        }
    });
});

// Excluir turma
app.delete('/api/turmas/:id', (req, res) => {
    const id = req.params.id;
    
    // Verificar se há alunos na turma
    db.get('SELECT COUNT(*) as count FROM alunos WHERE turma_id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        if (row.count > 0) {
            res.status(400).json({ error: 'Não é possível excluir turma com alunos cadastrados' });
            return;
        }
        
        db.run('DELETE FROM turmas WHERE id = ?', [id], function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Turma não encontrada' });
            } else {
                res.json({ message: 'Turma excluída com sucesso' });
            }
        });
    });
});

// ===== ROTAS PARA PROFESSORES =====

// Listar todos os professores
app.get('/api/professores', (req, res) => {
    db.all('SELECT * FROM professores ORDER BY nome_completo', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Buscar professores por nome
app.get('/api/professores/buscar/:termo', (req, res) => {
    const termo = req.params.termo;
    db.all('SELECT * FROM professores WHERE nome_completo LIKE ? ORDER BY nome_completo', [`%${termo}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obter um professor específico
app.get('/api/professores/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM professores WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Professor não encontrado' });
        }
    });
});

// Cadastrar novo professor
app.post('/api/professores', (req, res) => {
    const { 
        nome_completo, data_nascimento, genero, cpf, rg, 
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        email_institucional, telefone, disciplinas, formacao_academica, data_admissao, status 
    } = req.body;
    
    if (!nome_completo || !data_nascimento || !genero || !cpf || !rg || 
        !endereco_rua || !endereco_numero || !endereco_bairro || !endereco_cidade || !endereco_estado || !endereco_cep ||
        !email_institucional || !telefone || !disciplinas || !formacao_academica || !data_admissao) {
        res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        return;
    }

    db.run(`INSERT INTO professores (
        nome_completo, data_nascimento, genero, cpf, rg, 
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        email_institucional, telefone, disciplinas, formacao_academica, data_admissao, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome_completo, data_nascimento, genero, cpf, rg, 
         endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
         email_institucional, telefone, disciplinas, formacao_academica, data_admissao, status || 'Ativo'], 
        function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('cpf')) {
                    res.status(400).json({ error: 'CPF já cadastrado' });
                } else if (err.message.includes('email_institucional')) {
                    res.status(400).json({ error: 'Email institucional já cadastrado' });
                }
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({ id: this.lastID, message: 'Professor cadastrado com sucesso' });
    });
});

// Atualizar professor
app.put('/api/professores/:id', (req, res) => {
    const id = req.params.id;
    const { 
        nome_completo, data_nascimento, genero, cpf, rg, 
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        email_institucional, telefone, disciplinas, formacao_academica, data_admissao, status 
    } = req.body;
    
    if (!nome_completo || !data_nascimento || !genero || !cpf || !rg || 
        !endereco_rua || !endereco_numero || !endereco_bairro || !endereco_cidade || !endereco_estado || !endereco_cep ||
        !email_institucional || !telefone || !disciplinas || !formacao_academica || !data_admissao) {
        res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        return;
    }

    db.run(`UPDATE professores SET 
        nome_completo = ?, data_nascimento = ?, genero = ?, cpf = ?, rg = ?, 
        endereco_rua = ?, endereco_numero = ?, endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?, endereco_cep = ?,
        email_institucional = ?, telefone = ?, disciplinas = ?, formacao_academica = ?, data_admissao = ?, status = ?
        WHERE id = ?`,
        [nome_completo, data_nascimento, genero, cpf, rg, 
         endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
         email_institucional, telefone, disciplinas, formacao_academica, data_admissao, status || 'Ativo', id], 
        function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('cpf')) {
                    res.status(400).json({ error: 'CPF já cadastrado' });
                } else if (err.message.includes('email_institucional')) {
                    res.status(400).json({ error: 'Email institucional já cadastrado' });
                }
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Professor não encontrado' });
        } else {
            res.json({ message: 'Professor atualizado com sucesso' });
        }
    });
});

// Excluir professor
app.delete('/api/professores/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM professores WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Professor não encontrado' });
        } else {
            res.json({ message: 'Professor excluído com sucesso' });
        }
    });
});

// ===== ROTAS PARA ALUNOS =====

// Listar todos os alunos
app.get('/api/alunos', (req, res) => {
    db.all(`SELECT a.*, t.nome as turma_nome, t.serie as turma_serie 
            FROM alunos a 
            LEFT JOIN turmas t ON a.turma_id = t.id 
            ORDER BY a.nome_completo`, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Listar alunos por turma
app.get('/api/alunos/turma/:turmaId', (req, res) => {
    const turmaId = req.params.turmaId;
    db.all(`SELECT a.*, t.nome as turma_nome, t.serie as turma_serie 
            FROM alunos a 
            LEFT JOIN turmas t ON a.turma_id = t.id 
            WHERE a.turma_id = ?
            ORDER BY a.nome_completo`, [turmaId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Buscar alunos por nome
app.get('/api/alunos/buscar/:termo', (req, res) => {
    const termo = req.params.termo;
    db.all(`SELECT a.*, t.nome as turma_nome, t.serie as turma_serie 
            FROM alunos a 
            LEFT JOIN turmas t ON a.turma_id = t.id 
            WHERE a.nome_completo LIKE ? 
            ORDER BY a.nome_completo`, [`%${termo}%`], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Obter um aluno específico
app.get('/api/alunos/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT a.*, t.nome as turma_nome, t.serie as turma_serie 
            FROM alunos a 
            LEFT JOIN turmas t ON a.turma_id = t.id 
            WHERE a.id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Aluno não encontrado' });
        }
    });
});

// Cadastrar novo aluno
app.post('/api/alunos', (req, res) => {
    const { 
        nome_completo, data_nascimento, genero, cpf, rg,
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        nome_responsavel, telefone_responsavel, email_responsavel, turma_id, ano_ingresso, status 
    } = req.body;
    
    if (!nome_completo || !data_nascimento || !genero || !cpf || 
        !endereco_rua || !endereco_numero || !endereco_bairro || !endereco_cidade || !endereco_estado || !endereco_cep ||
        !nome_responsavel || !telefone_responsavel || !email_responsavel || !ano_ingresso) {
        res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        return;
    }

    db.run(`INSERT INTO alunos (
        nome_completo, data_nascimento, genero, cpf, rg,
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        nome_responsavel, telefone_responsavel, email_responsavel, turma_id, ano_ingresso, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome_completo, data_nascimento, genero, cpf, rg,
         endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
         nome_responsavel, telefone_responsavel, email_responsavel, turma_id, ano_ingresso, status || 'Ativo'], 
        function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'CPF já cadastrado' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        res.json({ id: this.lastID, message: 'Aluno cadastrado com sucesso' });
    });
});

// Atualizar aluno
app.put('/api/alunos/:id', (req, res) => {
    const id = req.params.id;
    const { 
        nome_completo, data_nascimento, genero, cpf, rg,
        endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
        nome_responsavel, telefone_responsavel, email_responsavel, turma_id, ano_ingresso, status 
    } = req.body;
    
    if (!nome_completo || !data_nascimento || !genero || !cpf || 
        !endereco_rua || !endereco_numero || !endereco_bairro || !endereco_cidade || !endereco_estado || !endereco_cep ||
        !nome_responsavel || !telefone_responsavel || !email_responsavel || !ano_ingresso) {
        res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        return;
    }

    db.run(`UPDATE alunos SET 
        nome_completo = ?, data_nascimento = ?, genero = ?, cpf = ?, rg = ?,
        endereco_rua = ?, endereco_numero = ?, endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?, endereco_cep = ?,
        nome_responsavel = ?, telefone_responsavel = ?, email_responsavel = ?, turma_id = ?, ano_ingresso = ?, status = ?
        WHERE id = ?`,
        [nome_completo, data_nascimento, genero, cpf, rg,
         endereco_rua, endereco_numero, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
         nome_responsavel, telefone_responsavel, email_responsavel, turma_id, ano_ingresso, status || 'Ativo', id], 
        function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(400).json({ error: 'CPF já cadastrado' });
            } else {
                res.status(500).json({ error: err.message });
            }
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Aluno não encontrado' });
        } else {
            res.json({ message: 'Aluno atualizado com sucesso' });
        }
    });
});

// Excluir aluno
app.delete('/api/alunos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM alunos WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(404).json({ error: 'Aluno não encontrado' });
        } else {
            res.json({ message: 'Aluno excluído com sucesso' });
        }
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => { // O '0.0.0.0' permite que o servidor seja acessível externamente se necessário, mas 'localhost' é mais comum para desenvolvimento local.
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Fechar conexão com o banco ao encerrar o servidor
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});