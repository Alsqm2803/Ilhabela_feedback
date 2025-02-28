const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ObjectId } = require('mongodb');
require('dotenv').config();

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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Credenciais inválidas' });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  });

  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    console.log('Início da recuperação de senha para:', email);

    try {
      const user = await db.collection('users').findOne({ email });
      console.log('Usuário encontrado:', user ? 'Sim' : 'Não');

      if (!user) {
        console.warn('Tentativa de recuperação para email inexistente:', email);
        return res.status(404).json({ error: 'Email não encontrado' });
      }

      const newPassword = crypto.randomBytes(6).toString('hex'); 
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      console.log(newPassword);
      console.log('Nova senha gerada (hashado):', hashedPassword);

      await db.collection('users').updateOne(
        { email },
        { $set: { senha: hashedPassword } }
      );
      console.log('Senha atualizada no banco para o email:', email);

      const updatedUser = await db.collection('users').findOne({ email });
      console.log('Documento atualizado no banco:', updatedUser);

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10), 
        secure: process.env.SMTP_PORT === '465', 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Recuperação de Senha" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperação de Senha',
        text: `Olá,\n\nSua nova senha é: ${newPassword}\n\nAtenciosamente,\nEquipe de Suporte`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso para:', email);

      res.json({ message: 'Uma nova senha foi enviada para seu email. Por favor olhe o lixo eletrônico também.' });
    } catch (error) {
      console.error('Erro ao recuperar senha:', error);
      res.status(500).json({ error: 'Erro ao recuperar senha. Tente novamente mais tarde.' });
    }
  });

  return router;
}

module.exports = authRoutes;
