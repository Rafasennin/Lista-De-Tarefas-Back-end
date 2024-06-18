const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // carregue os valores do .env
    pass: process.env.EMAIL_PASS // carregue os valores do .env
  }
});

async function sendMail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Back-end Node" <${process.env.EMAIL_USER}>`, // endereço do remetente
      to: to, // lista de destinatários
      subject: subject, // linha de assunto
      text: text, // corpo do texto simples
      html: html, // corpo do HTML
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}

module.exports = sendMail;
