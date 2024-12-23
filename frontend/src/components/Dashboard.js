import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Select from 'react-select';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [tags, setTags] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
    }
  };

  const extractFilters = (comments) => {
    const uniqueTags = [...new Set(comments.map((c) => c.tag))];
    const uniqueNeighborhoods = [...new Set(comments.map((c) => c.bairro))];
    setTags(uniqueTags.map((tag) => ({ label: tag, value: tag })));
    setNeighborhoods(uniqueNeighborhoods.map((bairro) => ({ label: bairro, value: bairro })));
  };

  const filteredComments = comments.filter((comment) => {
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => tag.value === comment.tag);
    const neighborhoodMatch =
      selectedNeighborhoods.length === 0 ||
      selectedNeighborhoods.some((bairro) => bairro.value === comment.bairro);
    return tagMatch && neighborhoodMatch;
  });

  // Paleta de cores personalizada (floresta e mar)
  const customColors = ['#2E8B57', '#4682B4', '#66CDAA', '#20B2AA', '#5F9EA0'];
  const customHoverColors = ['#3CB371', '#5F9EA0', '#76EEC6', '#48D1CC', '#7FFFD4'];

  const tagData = {
    labels: tags.map((tag) => tag.label),
    datasets: [
      {
        label: 'Distribuição de Tags',
        data: tags.map(
          (tag) =>
            filteredComments.filter((comment) => comment.tag === tag.value).length
        ),
        backgroundColor: customColors,
        hoverBackgroundColor: customHoverColors,
      },
    ],
  };

  const tagOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const currentValue = dataset.data[context.dataIndex];
            const total = dataset.data.reduce((acc, value) => acc + value, 0);
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${context.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  const neighborhoodData = {
    labels: neighborhoods.map((bairro) => bairro.label),
    datasets: [
      {
        label: 'Distribuição de Bairros',
        data: neighborhoods.map(
          (bairro) =>
            filteredComments.filter((comment) => comment.bairro === bairro.value).length
        ),
        backgroundColor: customColors,
        hoverBackgroundColor: customHoverColors,
      },
    ],
  };

  const neighborhoodOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const currentValue = dataset.data[context.dataIndex];
            const total = dataset.data.reduce((acc, value) => acc + value, 0);
            const percentage = ((currentValue / total) * 100).toFixed(2);
            return `${context.label}: ${currentValue} (${percentage}%)`;
          },
        },
      },
    },
  };

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    extractFilters(comments);
  }, [comments]);

  const handleBackToMap = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Dashboard de Comentários</h2>
      <p style={{ textAlign: 'center' }}>Aqui você pode visualizar e filtrar os comentários.</p>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <label>Filtrar por Tags:</label>
          <Select
            options={tags}
            isMulti
            value={selectedTags}
            onChange={(selected) => setSelectedTags(selected || [])}
            placeholder="Selecione as tags..."
          />
        </div>
        <div style={{ flex: 1 }}>
          <label>Filtrar por Bairros:</label>
          <Select
            options={neighborhoods}
            isMulti
            value={selectedNeighborhoods}
            onChange={(selected) => setSelectedNeighborhoods(selected || [])}
            placeholder="Selecione os bairros..."
          />
        </div>
      </div>

      {/* Tabela */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#2E8B57', color: '#FFF' }}>
            <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Comentário</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Bairro</th>
            <th style={{ padding: '10px', borderBottom: '2px solid #ddd' }}>Tag</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.map((comment) => (
            <tr key={comment._id} style={{ backgroundColor: '#f9f9f9' }}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {comment.texto}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {comment.bairro}
              </td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                {comment.tag}
              </td>
            </tr>
          ))}
          {filteredComments.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Nenhum comentário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Gráficos */}
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around' }}>
        <div style={{ width: '300px', height: '300px' }}>
          <h3 style={{ textAlign: 'center' }}>Distribuição por Tags</h3>
          <Pie data={tagData} options={tagOptions} />
        </div>
        <div style={{ width: '300px', height: '300px' }}>
          <h3 style={{ textAlign: 'center' }}>Distribuição por Bairros</h3>
          <Pie data={neighborhoodData} options={neighborhoodOptions} />
        </div>
      </div>
      <button className="btn-logout" onClick={handleBackToMap}>
        Voltar para o Mapa
      </button>

    </div>
  );
};

export default Dashboard;
