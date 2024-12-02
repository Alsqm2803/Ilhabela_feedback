import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import api from '../api';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Enviando requisição para:", '/auth/forgot-password');
      console.log("Email enviado:", email);
  
      const response = await api.post('/auth/forgot-password', { email });
      console.log("Resposta recebida do backend:", response.data);
  
      setMessage(response.data.message); // Exibe mensagem de sucesso
      setError(''); // Limpa erros
    } catch (error) {
      console.log("Erro ao enviar requisição:", error);
      const errorMessage = error.response?.data?.error || 'Erro ao enviar solicitação. Tente novamente.';
      setError(errorMessage);
      setMessage(''); // Limpa mensagens de sucesso
    }
  };
  

  return (
    <div className="container-forgot-password">
      {/* Adiciona a seta de retorno */}
      <button className="btn-back" onClick={() => navigate('/login')}>
        ← Voltar para Login
      </button>
      <h2 className='textos'>Recuperar Senha</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-field">
          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">Enviar</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default ForgotPassword;