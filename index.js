require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const ContatoModel = require("./models/mongoModel");
const TaskModel = require("./models/mongoTaskModel");
const UserModel = require('./models/mongoSingUpModel');
const sendMail = require("./nodeMailer");
const cron = require('node-cron');

const app = express();

// Middleware para analisar corpos de solicitação no express
app.use(bodyParser.json());
app.use(cors());

// Conectar ao MongoDB
const mongoUrl = process.env.MONGO_CONECTION;

//teste
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
// Rota para adicionar uma nova tarefa
/*app.post("/tasks", async (req, res) => {
  const newTask = new TaskModel({
    author: req.body.author,
    title: req.body.title,
    date: req.body.date,
    text: req.body.text,
    reminderDate: req.body.reminderDate,
    reminderHour: req.body.reminderHour,
    userId: req.body.userId
  });

  try {
    await newTask.save();

    // Agendar envio de email no dia e hora do lembrete
    const reminderDateTime = new Date(newTask.reminderDate + 'T' + newTask.reminderHour + ':00');
    const cronTime = `${reminderDateTime.getMinutes()} ${reminderDateTime.getHours()} 
                      ${reminderDateTime.getDate()} ${reminderDateTime.getMonth() + 1} *`;
                      
   cron.schedule(cronTime, async () => {
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
    }, {
      scheduled: true,
      timezone: "America/Sao_Paulo"  // Ajuste o fuso horário conforme necessário
    });

    res.status(201).json("taskSaved");
  } catch (error) {
    console.error("Erro ao salvar tarefa:", error);
    res.status(400).json({ message: error.message });
  }
});*/

// Rota para adicionar uma nova tarefa
app.post("/tasks", async (req, res) => {
  const newTask = new TaskModel({
    author: req.body.author,
    title: req.body.title,
    date: req.body.date,
    text: req.body.text,
    reminderDate: req.body.reminderDate,
    reminderHour: req.body.reminderHour,
    userId: req.body.userId
  });

  try {
    await newTask.save();

    // Enviar email imediatamente após salvar a tarefa
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
  const newUser = new UserModel({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password
  });

  try {
    await newUser.save();
    res.status(201).json("userSaved");

    // Enviar email após salvar o usuário
    try {
      console.log("Enviando email de confirmação...");
      const infoEmail = await sendMail(
        "rafasennin@hotmail.com",
        "Novo usuário cadastrado",
        `Olá ${newUser.userName}, bem-vindo ao nosso App!`,
        `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <h1 style="color: #007bff;">Novo usuário cadastrado!</h1>
            <p>Detalhes do usuário:</p>
            <ul>
              <li><strong>Nome do Usuário:</strong> ${newUser.userName}</li>
              <li><strong>Email:</strong> ${newUser.email}</li>
              <li><strong>Senha:</strong> ${newUser.password}</li>
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




// Iniciar o servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
