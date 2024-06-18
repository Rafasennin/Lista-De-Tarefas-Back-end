
# Lista de Tarefas - Backend

## Descrição do Projeto

Este é o backend de um aplicativo de lista de tarefas onde os usuários podem adicionar tarefas que serão permanentes. Próximo ao compromisso, será enviado um e-mail de lembrete ao usuário, após o cadastro.

## Tecnologias Utilizadas

- **Node.js**: Plataforma de desenvolvimento para criar aplicações de servidor em JavaScript.
- **Express.js**: Framework para Node.js que facilita a criação de APIs RESTful.
- **MongoDB**: Banco de dados NoSQL utilizado para armazenar as tarefas.
- **Mongoose**: Biblioteca de modelagem de dados para MongoDB e Node.js.
- **Nodemailer**: Biblioteca para envio de e-mails com Node.js.
- **Axios**: Cliente HTTP utilizado para fazer requisições HTTP.
- **Dotenv**: Módulo que carrega variáveis de ambiente de um arquivo `.env` para `process.env`.

## Instalação

1. Clone este repositório:

   ```bash
   git clone https://github.com/Rafasennin/Lista-De-Tarefas-Back-end.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd Lista-De-Tarefas-Back-end
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Crie um arquivo `.env` na raiz do projeto e configure as seguintes variáveis de ambiente:

   ```env
   MONGO_URI=<sua-string-de-conexão-mongodb>
   PORT=<porta-na-qual-a-aplicação-vai-rodar>
   EMAIL_USER=<seu-email>
   EMAIL_PASS=<sua-senha-de-email>
   ```

## Uso

1. Inicie o servidor:

   ```bash
   npm start
   ```

2. A API estará disponível em `http://localhost:<porta>`.

## Endpoints da API

### Criar uma nova tarefa

- **URL**: `/tasks`
- **Método**: `POST`
- **Descrição**: Adiciona uma nova tarefa.
- **Body**:

  ```json
  {
    "author": "Nome do Autor",
    "name": "Titulo da Tarefa",
    "content": "Conteúdo da Tarefa"
  }
  ```

### Obter todas as tarefas

- **URL**: `/tasks`
- **Método**: `GET`
- **Descrição**: Retorna uma lista de todas as tarefas.

### Excluir uma tarefa

- **URL**: `/tasks/:id`
- **Método**: `DELETE`
- **Descrição**: Exclui uma tarefa pelo ID.

## Envio de E-mails

A funcionalidade de envio de e-mails é implementada utilizando o `Nodemailer`. Quando uma tarefa é adicionada, um e-mail de lembrete será enviado próximo ao compromisso.

## Contribuição

1. Faça um fork deste repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/sua-feature`).
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`).
4. Faça push para a branch (`git push origin feature/sua-feature`).
5. Crie um novo Pull Request.

## Licença

Este projeto está licenciado pelo autor Rafael Santos.

