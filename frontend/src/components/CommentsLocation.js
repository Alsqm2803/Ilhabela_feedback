// src/components/CommentsLocation.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CommentsLocation = () => {
  const navigate = useNavigate();
  const [commentsWithAddress, setCommentsWithAddress] = useState([]);

  // Função para redirecionar de volta para o mapa
  const handleBackToMap = () => {
    navigate('/');
  };

  // Função para buscar comentários e converter coordenadas em endereços detalhados
  const fetchCommentsWithAddresses = async () => {
    try {
      const response = await api.get('/comments');
      const comments = response.data;

      // Para cada comentário, obtém o endereço com a função `getAddressFromCoordinates`
      const commentsWithAddressPromises = comments.map(async (comment) => {
        const address = await getAddressFromCoordinates(comment.latitude, comment.longitude);
        return {
          ...comment,
          address: address || 'Endereço não encontrado'
        };
      });

      const results = await Promise.all(commentsWithAddressPromises);
      setCommentsWithAddress(results);
    } catch (error) {
      console.error("Erro ao buscar e converter comentários:", error);
    }
  };

  // Função para obter um endereço detalhado usando Nominatim (OpenStreetMap)
  const getAddressFromCoordinates = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.address) {

        // Extrai o bairro ou subúrbio, e outros componentes detalhados do endereço
        const street = data.address.town || ''; // Rua
        const neighborhood = data.address.village || data.address.suburb || ''; // Bairro ou subúrbio
        const city = data.address.city || data.address.town || ''; // Cidade
        const state = data.address.state || ''; // Estado
        const postcode = data.address.postcode || ''; // Código postal
        document.write(data.address.state)
        // Constrói o endereço completo, garantindo que o bairro seja destacado
        return `${street ? street + ', ' : ''}${neighborhood ? 'Bairro: ' + neighborhood + ', ' : ''}${city ? city + ', ' : ''}${state ? state + ', ' : ''}${postcode ? 'CEP: ' + postcode : ''}`.trim();
      }
      return null;
    } catch (error) {
      console.error("Erro ao converter coordenadas para endereço com Nominatim:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchCommentsWithAddresses(); // Busca e converte os comentários ao carregar o componente
  }, []);

  return (
    <div>
      <h2>Comentários e Localizações</h2>
      <p>Aqui você pode ver os comentários com suas localizações convertidas para endereços.</p>
      <button onClick={handleBackToMap}>Voltar para o Mapa</button>

      <ul style={{ marginTop: '20px' }}>
        {commentsWithAddress.map((comment, index) => (
          <li key={index} style={{ marginBottom: '15px' }}>
            <strong>Tag:</strong> {comment.tag} <br />
            <strong>Comentário:</strong> {comment.texto || comment.text} <br />
            <strong>Endereço:</strong> {comment.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentsLocation;
