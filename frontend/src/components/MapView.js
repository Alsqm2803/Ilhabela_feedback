import './MapView.css'; 
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api';

const MapView = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    latitude: null,
    longitude: null,
    tag: '',
    text: ''
  });
  const [showForm, setShowForm] = useState(false);
  const markersRef = useRef([]); // Para armazenar referências aos marcadores

  const navigate = useNavigate();

  // Redirecionamento para a tela de comentários
  const handleCommentsPage = () => {
    navigate('/comments-location');
  };

  // Redirecionamento para a tela de dashboard de estatísticas
  const handleDashboardPage = () => {
    navigate('/dashboard');
  };

  useEffect(() => {
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-45.33, -23.82],
      zoom: 11
    });

    // Carrega os comentários iniciais
    fetchComments();

    // Adiciona um evento de clique no mapa para abrir o formulário de comentário
    mapRef.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      setNewComment({ latitude: lat, longitude: lng, tag: '', text: '' });
      setShowForm(true);
    });

    // Atualiza os comentários a cada 10 segundos
    const intervalId = setInterval(fetchComments, 10000);

    // Limpa o intervalo ao desmontar o componente
    return () => {
      clearInterval(intervalId);
      mapRef.current.remove();
    };
  }, []);

  // Função para buscar os comentários do backend
  const fetchComments = () => {
    api.get('/comments')
      .then(response => {
        console.log("Dados de comentários atualizados:", response.data);
        setComments(response.data);
      })
      .catch(error => console.error("Erro ao carregar comentários:", error));
  };

  useEffect(() => {
    // Remove marcadores antigos
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = []; // Limpa o array de marcadores

    // Adiciona novos marcadores com base nos comentários atualizados
    comments.forEach(comment => {
      if (
        comment.longitude !== undefined &&
        comment.latitude !== undefined &&
        !isNaN(comment.longitude) &&
        !isNaN(comment.latitude)
      ) {
        // Cria um marcador personalizado
        const el = document.createElement('div');
        el.className = 'pin-marker';

        // Cria e adiciona o marcador ao mapa
        const marker = new mapboxgl.Marker(el)
          .setLngLat([comment.longitude, comment.latitude])
          .setPopup(new mapboxgl.Popup().setHTML(`<strong>${comment.tag}</strong><p>${comment.text}</p>`))
          .addTo(mapRef.current);

        // Adiciona o marcador ao array de referências
        markersRef.current.push(marker);
      }
    });
  }, [comments]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/comments', {
        texto: newComment.text,
        tag: newComment.tag,
        localizacao: {
          latitude: newComment.latitude,
          longitude: newComment.longitude
        }
      });

      // Atualiza o estado de comments e verifica se o comentário foi adicionado
      setComments(prevComments => [...prevComments, response.data]);
      setShowForm(false);
      setNewComment({ latitude: null, longitude: null, tag: '', text: '' });
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("Comentário com o mesmo texto já existe.");
      } else {
        console.error("Erro ao criar comentário:", error);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Cabeçalho com botões de navegação */}
      <header className="moldura">
        <h1>&nbsp;&nbsp;Mapa de Ilhabela
          <button onClick={handleCommentsPage} className="btn-redirect1">Ver Comentários por Localização&nbsp;&nbsp;</button>
          <button onClick={handleDashboardPage} className="btn-redirect2">Dashboard de Estatísticas&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button></h1>
      </header>

      {/* Conteúdo principal: Sidebar e Mapa */}
      <div style={{ display: 'flex' }}>
        {/* Sidebar para exibir todos os comentários */}
        <div className="moldura-lateral" style={{ width: '300px', padding: '10px', overflowY: 'scroll' }}>
          <h3><strong>Comentários</strong></h3>
          <ul>
            {comments.map((comment, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>Assunto:</strong> {comment.tag} <br />
                <strong>Comentário:</strong> {comment.texto || comment.text}
              </li>
            ))}
          </ul>
        </div>

        {/* Mapa */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
      </div>

      {/* Formulário para novo comentário */}
      {showForm && (
        <div className="comment" style={{
          position: 'absolute', backgroundColor: 'white', padding: '10px', zIndex: 1
        }}>
          <h3>Novo Comentário</h3>
          <form onSubmit={handleFormSubmit}>
            <label>
              Tag:
              <select
                value={newComment.tag}
                onChange={(e) => setNewComment({ ...newComment, tag: e.target.value })}
                required
              >
                <option value="">Selecione</option>
                <option value="saude">Saúde</option>
                <option value="segurança">Segurança</option>
                <option value="ambiental">Ambiental</option>
                <option value="animais">Animais</option>
                <option value="outros">Outros</option>
              </select>
            </label>
            <br />
            <label>
              Comentário:
              <textarea
                value={newComment.text}
                onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                required
              />
            </label>
            <br />
            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MapView;
