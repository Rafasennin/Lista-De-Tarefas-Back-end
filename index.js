require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const ContatoModel = require("./models/mongoModel");
const TaskModel = require("./models/mongoTaskModel");
const UserModel = require('./models/mongoSingUpModel');
const sendMail = require("./nodeMailer");
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secretKey = process.env.SECRETKEY;
fs = require('fs');
const { CronJob } = require('cron');




// Middleware para analisar corpos de solicitação no express
app.use(bodyParser.json());
app.use(cors());

// Conectar ao MongoDB
const mongoUrl = process.env.MONGO_CONECTION;

//Conexão com o mongo
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Conexão estabelecida com sucesso com o MongoDB");
  })
  .catch(error => {
    console.error("Erro ao conectar com o MongoDB:", error);
  });

//******************Rotas para contatos**********************
// Rota para listar todos os contatos
app.get("/contatos", async (req, res) => {
  try {
    console.log("GET /contatos called");
    const contatos = await ContatoModel.find();
    res.json(contatos);
  } catch (error) {
    console.error("Erro ao listar contatos:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para adicionar um novo contato
app.post("/contatos", async (req, res) => {
  const novoContato = new ContatoModel({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  });

  try {
    await novoContato.save();

    // Enviar email após salvar o contato
    try {
      const infoEmail = await sendMail(
        "rafasennin@hotmail.com",
        "Novo usuário cadastrado",
        `Olá ${novoContato.name}, bem-vindo!`,
        `<p>O usuário ${novoContato.name}, enviou uma mensagem!</p>
          <b>Email:</b> <p>${novoContato.email}</p>
          <b>Mensagem:</b> <p>${novoContato.message}</p>
          `
      );
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
    }

    res.status(201).json("contatoSalvo");
  } catch (error) {
    console.error("Erro ao salvar contato:", error);
    res.status(400).json({ message: error.message });
  }
});

// Rota para buscar um contato pelo ID
app.get("/contatos/:id", async (req, res) => {
  console.log("GET /contatos/:id called with id:", req.params.id);
  try {
    const contato = await ContatoModel.findById(req.params.id);
    if (contato === null) {
      console.log("Contato não encontrado com o id:", req.params.id);
      return res.status(404).json({ message: "Contato não encontrado" });
    }
    res.json(contato);
  } catch (error) {
    console.error("Erro ao buscar contato:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para deletar um contato pelo ID
app.delete("/contatos/:id", async (req, res) => {
  console.log("DELETE /contatos/:id called with id:", req.params.id);
  try {
    const contato = await ContatoModel.findById(req.params.id);
    if (!contato) {
      console.log("Contato não encontrado com o id:", req.params.id);
      return res.status(404).json({ message: "Contato não encontrado" });
    }
    await ContatoModel.deleteOne({ _id: req.params.id }); // Remover o contato do banco de dados
    console.log("Contato deletado com sucesso com o id:", req.params.id);
    res.json({ message: "Contato deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar contato:", error);
    res.status(500).json({ message: error.message });
  }
});


//******************Rotas para tasks**********************

// Função para atualizar o arquivo vercel.json com os novos cron jobs
function updateVercelCron(newCronJobs) {
  try {
    const vercelConfigPath = './vercel.json';
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));

    // Atualiza a seção de cron com os novos cron jobs
    vercelConfig.crons = newCronJobs;

    // Salva de volta no arquivo
    fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2));

    console.log('Vercel cron jobs atualizados com sucesso.');
  } catch (error) {
    console.error('Erro ao atualizar Vercel cron jobs:', error);
  }
}

// Função para gerar expressão cron com base no lembrete
function generateCronExpression(reminderDate, reminderHour) {
  const reminderDateTime = new Date(reminderDate + 'T' + reminderHour + ':00');
  const minute = reminderDateTime.getMinutes();
  const hour = reminderDateTime.getHours();
  const dayOfMonth = reminderDateTime.getDate();
  const month = reminderDateTime.getMonth() + 1; // getMonth retorna de 0 a 11
  const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`;
  return cronExpression;
}

// Função para agendar o envio de e-mail de lembrete
async function scheduleEmailReminder(newTask) {
  try {
    const cronExpression = generateCronExpression(newTask.reminderDate, newTask.reminderHour);

    new CronJob(cronExpression, async () => {
      try {
        const user = await UserModel.findById(newTask.userId);
        if (user) {
          await sendMail(
            user.email,
            "Lembrete de Tarefa",
            `Olá ${newTask.author}, você tem um lembrete de tarefa.`,
            `
              <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                <h1 style="color: #007bff;">Lembrete de Tarefa!</h1>
                <p>Detalhes da tarefa:</p>
                <ul>
                  <li><strong>Nome da Tarefa:</strong> ${newTask.title}</li>
                  <li><strong>Data do Lembrete:</strong> ${newTask.reminderDate}</li>
                  <li><strong>Hora do Lembrete:</strong> ${newTask.reminderHour}</li>
                </ul>
                <p><strong>Descrição da Tarefa:</strong></p>
                <p>${newTask.text}</p>
                <hr>
                <p style="font-size: 0.9em; color: #555;">Este é um email automático, por favor, não responda.</p>
              </div>
            `
          );
          console.log("Email de lembrete enviado com sucesso");
        }
      } catch (emailError) {
        console.error("Erro ao enviar email de lembrete:", emailError);
      }
    }, null, true, 'America/Sao_Paulo'); // Especifique a zona de tempo se necessário

    console.log(`Tarefa ${newTask.title} agendada com sucesso com a expressão cron: ${cronExpression}`);
  } catch (error) {
    console.error("Erro ao agendar email de lembrete:", error);
  }
}


app.post("/tasks", async (req, res) => {
  const { author, title, date, text, reminderDate, reminderHour, userId } = req.body;
  
  if (!author || !title || !text || !reminderDate || !reminderHour || !userId) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }

  const newTask = new TaskModel({
    author,
    title,
    date,
    text,
    reminderDate,
    reminderHour,
    userId
  });

  try {
    await newTask.save();

    // Agendar envio de email no dia e hora do lembrete
    await scheduleEmailReminder(newTask);

    // Obter os cron jobs atuais do vercel.json
    const vercelConfigPath = './vercel.json';
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
    const currentCronJobs = vercelConfig.cron || [];

    // Gerar novo cron job para esta tarefa
    const cronExpression = generateCronExpression(newTask.reminderDate, newTask.reminderHour);
    const newCronJob = {
      path: "./api/cron.js", 
      schedule: cronExpression,
    };

    // Adicionar o novo cron job aos cron jobs existentes
    currentCronJobs.push(newCronJob);

    // Atualizar o vercel.json com os novos cron jobs
    updateVercelCron(currentCronJobs);

    res.status(201).json("taskSaved");
  } catch (error) {
    console.error("Erro ao salvar tarefa:", error);
    res.status(400).json({ message: error.message });
  }
});


// Rota para editar uma tarefa pelo ID
app.put("/tasks/:id", async (req, res) => {
  console.log("PUT /tasks/:id called with id:", req.params.id);
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedTask === null) {
      console.log("Tarefa não encontrada com o id:", req.params.id);
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }
    res.json(updatedTask);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(400).json({ message: error.message });
  }
});

// Rota para deletar uma tarefa pelo ID
app.delete("/tasks/:id", async (req, res) => {
  console.log("DELETE /tasks/:id called with id:", req.params.id);
  try {
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      console.log("Tarefa não encontrada com o id:", req.params.id);
      return res.status(404).json({ message: "Tarefa não encontrada" });
    }
    await TaskModel.deleteOne({ _id: req.params.id }); // Remover a tarefa do banco de dados
    console.log("Tarefa deletada com sucesso com o id:", req.params.id);
    res.json({ message: "Tarefa deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).json({ message: error.message });
  }
});

// Rota para listar todas as tarefas de um usuário específico
app.get("/tasks", async (req, res) => {
  try {
    const userId = req.query.userId;
    // Verifique se userId foi fornecido
    if (!userId) {
      return res.status(400).json({ message: "userId é necessário" });
    }

    // Filtrar tarefas pelo userId usando Mongoose
    const tasks = await TaskModel.find({ userId: userId });

    res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    res.status(500).json({ message: error.message });
  }
});


//***************Adicionar um novo usuario************
app.post("/users", async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    // Verificar se o email já está em uso
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email já está em uso.' });
    }

    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      userName,
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json("userSaved");

    // Enviar email após salvar o usuário
    try {
      console.log("Enviando email de confirmação...");
      const infoEmail = await sendMail(
        email,
        "Novo usuário cadastrado",
        `Olá ${newUser.userName}, bem-vindo ao nosso App!`,
        `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
              <h1 style="color: #007bff;">Novo usuário cadastrado!</h1>
              <p>Detalhes do usuário:</p>
              <ul>
                <li><strong>Nome do Usuário:</strong> ${newUser.userName}</li>
                <li><strong>Email:</strong> ${newUser.email}</li>
              </ul>
              <hr>
              <p style="font-size: 0.9em; color: #555;">Este é um email automático, por favor, não responda.</p>
            </div>
          `
      );
      console.log("Email enviado com sucesso:", infoEmail);
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
    }
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    res.status(400).json({ message: error.message });
  }
});
// Rota para buscar todos os usuários cadastrados
app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();

    // Verifica se encontrou usuários
    if (!users) {
      return res.status(404).json({ message: "Nenhum usuário encontrado" });
    }

    // Retorna os usuários encontrados
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

// Rota para deletar um usuário pelo ID
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserModel.findByIdAndDelete(id);

    // Verifica se o usuário foi encontrado e deletado
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Retorna uma mensagem de sucesso
    res.status(200).json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ message: "Erro ao deletar usuário" });
  }
});


// Rota para login de usuário
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Senha inválida" });
    }

    // Gera o token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, secretKey, { expiresIn: '1h' });

    // Retorna os dados do usuário junto com o token
    res.status(200).json({ message: "Login bem-sucedido", token, user: { userName: user.userName, _id: user._id } });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).json({ message: "Erro ao fazer login" });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});




