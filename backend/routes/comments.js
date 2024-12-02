const express = require('express');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

function commentRoutes(db) {
  const router = express.Router();

  // Rota para criar um novo comentário
  router.post('/', async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const { texto, tag, localizacao, bairro } = req.body;

      // Verifica se já existe um comentário com o mesmo texto
      const duplicate = await db.collection('comments').findOne({ texto });

      if (duplicate) {
        return res.status(409).json({ error: "Comentário com o mesmo texto já existe." });
      }

      const newComment = {
        usuarioId: new ObjectId(decoded.id),
        texto,
        tag,
        bairro,
        latitude: localizacao.latitude,
        longitude: localizacao.longitude,
        data: new Date(),
      };

      const result = await db.collection('comments').insertOne(newComment);
      console.log('Comentário inserido com sucesso:', result.ops[0]); // Log para validação
      res.status(201).json(result.ops[0]);
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      res.status(500).json({ error: 'Erro ao criar comentário' });
    }
  });

  // Rota para buscar comentários agrupados por bairro
  router.get('/comments-by-bairro', async (req, res) => {
    console.log("Rota /comments-by-bairro chamada.");
  
    try {
      const commentsByBairro = await db.collection('comments').aggregate([
        {
          $group: {
            _id: "$bairro",
            count: { $sum: 1 },
            comments: { $push: "$$ROOT" }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();
  
      console.log("Dados agregados por bairro:", commentsByBairro);
      res.status(200).json(commentsByBairro);
    } catch (error) {
      console.error("Erro ao buscar comentários por bairro:", error);
      res.status(500).json({ error: "Erro ao buscar comentários por bairro." });
    }
  });

  // Rota para obter todos os comentários
  router.get('/', async (req, res) => {
    try {
      const comments = await db.collection('comments').find().toArray();
      console.log('Todos os comentários recuperados:', comments); // Log para validação
      res.json(comments);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      res.status(500).json({ error: 'Erro ao buscar comentários' });
    }
  });

  return router;
}

module.exports = commentRoutes;
