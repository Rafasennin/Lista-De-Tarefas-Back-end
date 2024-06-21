
const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now },  
 });

const ContactModel = mongoose.model('user-contacts', contactSchema);

module.exports = ContactModel;





// Criando um schema
/*const userContact = new mongoModel({
    name: "Miguel",
    email: "rafasennin@hotmail.com",
    message: "Testando a conexão",
});*/


// Funções do CRUD

//Inserir dados
/*userContact.save().then(() => {
    console.log("Contato do usuário cadastardo com sucesso");
}).catch(err => {
        console.error("Erro ao salvar o artigo:", err);
});*/

//Puxa todos os artigos
/*Article.find({}).then(response=>{
    console.log(response)
  }).catch(error=>{
    console.log(error)
  })*/
  
  
  //Puxando com ID especifico
  /*Article.find({ 'title': 'Aula de Node', '_id':'664643600fe6bdb95d185089'}).then(response => {
      console.log(response)
  }).catch(error => {
      console.log(error)
  })*/
  
  //Busca por objetos aninhados
  /*Article.find({ 'resume.content': 'Aulas online', '_id': '664641abb6029c446f610720'}).then(response => {
      console.log(response)
  }).catch(error => {
      console.log(error)
  })*/
  
  //Buscar um unico artigo
  /*Article.findOne({ 'resume.content': 'Aulas online'}).then(response => {
      console.log(response)
  }).catch(error => {
      console.log(error)
  })*/
  
  //Deletar dados
  /*Article.findByIdAndDelete('664643600fe6bdb95d185089').then( () =>{
      console.log('Arquivo deletado com sucesso')
  }).catch(error =>{
      console.log(error)
  })*/
  
  
  //Update data
  /*Article.findByIdAndUpdate('6646431c227b8aabda2d3ef2', {title: 'Aula de Java'}).then(()=>{
      console.log("Atualizado com sucesso")
  }).catch(error=>{
      console.log(error)
  })*/