const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

function authRoutes(db) {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
      const hash = await bcrypt.hash(senha, 10);
      const newUser = { nome, email, senha: hash };

      const result = await db.collection('users').insertOne(newUser);
      res.status(201).json({ message: 'Usuário criado', userId: result.insertedId });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
      const user = await db.collection('users').findOne({ email });
      if (user && await bcrypt.compare(senha, user.senha)) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  });

  return router;
}

module.exports = authRoutes;
