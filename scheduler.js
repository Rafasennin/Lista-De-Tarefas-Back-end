const cron = require('node-cron');
const TaskModel = require("./models/mongoTaskModel");
const UserModel = require('./models/mongoSingUpModel');
const sendMail = require("./nodeMailer");

async function scheduleTasks() {
  const tasks = await TaskModel.find({});

  tasks.forEach(task => {
    const reminderDateTime = new Date(task.reminderDate + 'T' + task.reminderHour + ':00');
    const minute = reminderDateTime.getMinutes();
    const hour = reminderDateTime.getHours();
    const dayOfMonth = reminderDateTime.getDate();
    const month = reminderDateTime.getMonth() + 1; // getMonth retorna de 0 a 11
    const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} *`;

    cron.schedule(cronExpression, async () => {
      try {
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
      } catch (emailError) {
        console.error("Erro ao enviar email de lembrete:", emailError);
      }
    });
  });
}

module.exports = scheduleTasks;
