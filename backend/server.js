require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');

const app = express();
app.use(express.json());
app.use(cors());

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true
});

let db;
async function connectMongoDB() {
  try {
    await client.connect();
    db = client.db('ilhabela_feedback'); 
    console.log('Conectado ao MongoDB usando MongoClient!');

  
    app.use('/auth', authRoutes(db));
    app.use('/comments', commentRoutes(db));

  } catch (error) {
    console.error('Erro de conexão com o MongoDB:', error);
  }
}

connectMongoDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));