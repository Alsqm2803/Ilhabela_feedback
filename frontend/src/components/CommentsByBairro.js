// src/components/CommentsByBairro.js
import React, { useState, useEffect } from 'react';
import { getCommentsByBairro } from '../api';

const CommentsByBairro = () => {
  const [commentsByBairro, setCommentsByBairro] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getCommentsByBairro();
        console.log('Dados retornados pela API:', response.data); // Verifique os dados no console
        setCommentsByBairro(response.data);
      } catch (error) {
        console.error('Erro ao buscar comentários por bairro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  if (loading) return <p>Carregando...</p>;

  if (!commentsByBairro || commentsByBairro.length === 0) {
    return <p>Nenhum comentário encontrado por bairro.</p>;
  }

  return (
    <div>
      <h2>Comentários por Bairro</h2>
      <ul>
        {commentsByBairro.map((bairro) => (
          <li key={bairro._id}>
            <strong>{bairro._id}</strong>: {bairro.count} comentários
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsByBairro;
