
import { jwtDecode } from "jwt-decode";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../api';
import './Login.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, senha });
      const token = response.data.token;

      // Decodifica o token para obter o tempo de expiração
      const decodedToken = jwtDecode(token);
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', decodedToken.exp * 1000); // Salva a expiração do token no localStorage

      setAuthToken(token); // Configura o token para futuras requisições
      setIsLoggedIn(true); // Atualiza o estado global de autenticação

      navigate('/'); // Redireciona para a página principal
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      alert(errorMessage);
    }
  };

  return (
    <div className="container-login">
      <div className="login-content">
        <div className="first-column">
          <h2 className="title-primary">Bem-vindo de volta!<br /></h2>
          <p className="cadastro">Não tem uma conta ainda? Faça o cadastro abaixo<br /><br /></p>
          <button onClick={() => navigate('/register')} className="btn-redirect">Cadastrar</button>
        </div>

        <div className="second-column">
          <h2 className="title-second">Entre na sua conta</h2>
          <form onSubmit={handleSubmit} className="form-login">
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
            <button type="submit" className="btn-login">Entrar</button>
          </form>
          <a 
            className="forgot-password" 
            href="#"
            onClick={() => navigate('/forgot-password')} // Redireciona para recuperação de senha
          >
            Esqueceu a senha?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
