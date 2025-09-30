const admin = require("firebase-admin");
// const fs = require("fs");
// const path = require("path");

// Inicializa Firebase

if (!admin.apps.length) {
  // let credentials;
  // if (process.env.FIREBASE_CREDENTIALS) {
  // let credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS.replace(/\\n/g, '\n'));
  // } else {
  // const credentialsPath = path.resolve(__dirname, "walmart-calculator-firebase.json");

    // Ler o arquivo JSON
  // const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  // const credentialsPath = path.join(__dirname, "walmart-calculator-firebase.json");

  //   // Ler o arquivo JSON e converter para objeto
  // const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
  // let credentials = JSON.parse(fs.readFileSync("./walmart-calculator-firebase.json", "utf-8"));
  // }
  const credentials = JSON.parse(
    process.env.FIREBASE_CREDENTIALS.replace(/\\\\n/g, '\n') // Substitui '\\n' pelo real '\n'
  );
  
  
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

const db = admin.firestore();
const colecaoListas = db.collection("listas");

exports.handler = async (event) => {
  const { httpMethod } = event;

  switch (httpMethod) {
    case "GET":
      return listarItens(event);

    case "POST":
      return adicionarItem(event);

    case "DELETE":
      return deletarItemOuLista(event);

    default:
      return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido" }) };
  }
};

// 📌 Listar itens da lista
const listarItens = async (event) => {
  const { chave, senha } = event.queryStringParameters;
  if (!chave || !senha) return { statusCode: 400, body: JSON.stringify({ error: "Chave e senha são obrigatórios" }) };

  const doc = await colecaoListas.doc(chave).get();
  if (!doc.exists || doc.data().senha !== senha) {
    return { statusCode: 403, body: JSON.stringify({ error: "Acesso negado ou lista inexistente" }) };
  }

  return { statusCode: 200, body: JSON.stringify(doc.data().itens || []) };
};

// 📌 Adicionar item à lista
const adicionarItem = async (event) => {
  const { chave, senha, item } = JSON.parse(event.body);
  if (!chave || !senha || !item) return { statusCode: 400, body: JSON.stringify({ error: "Chave, senha e item são obrigatórios" }) };

  const docRef = colecaoListas.doc(chave);
  const doc = await docRef.get();

  let lista = { senha, itens: [] };
  if (doc.exists) {
    if (doc.data().senha !== senha) return { statusCode: 403, body: JSON.stringify({ error: "Senha incorreta" }) };
    lista = doc.data();
  }

  lista.itens.push(item);
  await docRef.set(lista);

  return { statusCode: 201, body: JSON.stringify({ message: "Item adicionado com sucesso", item }) };
};

// 📌 Deletar um item ou limpar a lista inteira
const deletarItemOuLista = async (event) => {
  const { chave, senha, itemIndex } = JSON.parse(event.body);
  if (!chave || !senha) return { statusCode: 400, body: JSON.stringify({ error: "Chave e senha são obrigatórios" }) };

  const docRef = colecaoListas.doc(chave);
  const doc = await docRef.get();

  if (!doc.exists || doc.data().senha !== senha) {
    return { statusCode: 403, body: JSON.stringify({ error: "Acesso negado" }) };
  }

  let lista = doc.data();

  if (itemIndex === undefined) {
    lista.itens = []; // Limpa a lista inteira
  } else {
    if (itemIndex < 0 || itemIndex >= lista.itens.length) {
      return { statusCode: 400, body: JSON.stringify({ error: "Índice inválido" }) };
    }
    lista.itens.splice(itemIndex, 1); // Remove o item específico
  }

  await docRef.set(lista);
  return { statusCode: 200, body: JSON.stringify({ message: "Operação realizada com sucesso" }) };
};