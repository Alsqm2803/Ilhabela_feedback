// src/components/Dashboard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleBackToMap = () => {
    navigate('/');
  };

  return (
    <div>
      <h2>Dashboard de Estatísticas</h2>
      <p>Aqui você pode ver as estatísticas dos comentários, como tags mais comuns e contagem por bairro.</p>
      {/* Adicione a lógica para exibir as estatísticas aqui */}

      <button onClick={handleBackToMap}>Voltar para o Mapa</button>
    </div>
  );
};

export default Dashboard;
