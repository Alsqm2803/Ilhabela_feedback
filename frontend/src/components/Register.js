// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';
import './Login.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Register({ setIsLoggedIn }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { nome, email, senha });
      const response = await api.post('/auth/login', { email, senha });

      setAuthToken(response.data.token);
      setIsLoggedIn(true);

      alert('Registro e login bem-sucedidos!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Erro ao registrar. Tente novamente mais tarde.";
      alert(errorMessage);
    }
  };

  return (
    <div className="container-login">
      <div className="login-content">
        <div className="first-column">
          <h2 className="title-primary">Bem-vindo!</h2>
          <p className="description-primary">Já possui uma conta? Faça login abaixo.</p>
          <button onClick={() => navigate('/login')} className="btn-redirect">Ir para Login</button>
        </div>

        <div className="second-column">
          <h2 className="title-second">Crie sua conta</h2>
          <form onSubmit={handleSubmit} className="form-login">
            <div className="input-field">
              <FontAwesomeIcon icon={faUser} className="input-icon" />
              <input
                type="nome"
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-field">
              <FontAwesomeIcon icon={faLock} className="input-icon" />
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-login">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
