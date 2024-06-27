const TaskModel = require("../models/mongoTaskModel");
const UserModel = require('../models/mongoSingUpModel');
const sendMail = require("../nodeMailer");

async function handler(req, res) {
    try {
        // Lógica para buscar tarefas agendadas no momento atual
        const currentDateTime = new Date();
        const tasks = await TaskModel.find({
            reminderDate: { $lte: currentDateTime.toISOString().split('T')[0] },
            reminderHour: currentDateTime.getHours() + ':' + currentDateTime.getMinutes(),
        });

        // Enviar e-mail para cada tarefa encontrada
        for (const task of tasks) {
            const user = await UserModel.findById(task.userId);
            if (user) {
                await sendMail(
                    user.email,
                    "Lembrete de Tarefa",
                    `Olá ${task.author}, você tem um lembrete de tarefa.`,
                    `
            <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
              <h1 style="color: #007bff;">Lembrete de Tarefa!</h1>
              <p>Detalhes da tarefa:</p>
              <ul>
                <li><strong>Nome da Tarefa:</strong> ${task.title}</li>
                <li><strong>Data do Lembrete:</strong> ${task.reminderDate}</li>
                <li><strong>Hora do Lembrete:</strong> ${task.reminderHour}</li>
              </ul>
              <p><strong>Descrição da Tarefa:</strong></p>
              <p>${task.text}</p>
              <hr>
              <p style="font-size: 0.9em; color: #555;">Este é um email automático, por favor, não responda.</p>
            </div>
          `
                );
                console.log("Email de lembrete enviado com sucesso");
            }
        }

        res.status(200).json({ message: "E-mails de lembrete enviados com sucesso." });
    } catch (error) {
        console.error("Erro ao processar cron job:", error);
        res.status(500).json({ message: "Erro ao processar cron job." });
    }
}

module.exports = handler;
