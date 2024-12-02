import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CommentsLocation = () => {
  const navigate = useNavigate();
  const [commentsByBairro, setCommentsByBairro] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para redirecionar de volta para o mapa
  const handleBackToMap = () => {
    navigate('/');
  };

  // Função para buscar comentários agrupados por bairro
  const fetchCommentsByBairro = async () => {
    try {
      const response = await api.get('/comments-by-bairro');
      console.log("Resposta da API /comments-by-bairro:", response);

      if (response.status === 200) {
        setCommentsByBairro(response.data);
      } else {
        console.error("Erro inesperado:", response.status);
      }

      // Aguarda 2 segundos antes de parar o carregamento
      setTimeout(() => {
        setLoading(false);
      }, 200);
    } catch (error) {
      console.error("Erro ao buscar comentários por bairro:", error);
      setLoading(false); // Para o carregamento mesmo em caso de erro
    }
  };

  useEffect(() => {
    fetchCommentsByBairro(); // Busca os comentários agrupados ao carregar o componente
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Comentários por Bairro</h2>
      <button onClick={handleBackToMap} style={{ marginBottom: '20px' }}>Voltar para o Mapa</button>

      {/* Exibição condicional com base no estado loading */}
      {loading ? (
        <p>Carregando comentários...</p>
      ) : commentsByBairro.length === 0 ? (
        <p>Nenhum comentário encontrado.</p>
      ) : (
        <div>
          {commentsByBairro.map((bairroData, index) => (
            <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>Bairro: {bairroData._id || 'Não informado'}</h3>
              <p>Total de comentários: {bairroData.count}</p>
              <ul>
                {bairroData.comments.map((comment, commentIndex) => (
                  <li key={commentIndex} style={{ marginBottom: '10px' }}>
                    <strong>Tag:</strong> {comment.tag} <br />
                    <strong>Comentário:</strong> {comment.texto || comment.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsLocation;
