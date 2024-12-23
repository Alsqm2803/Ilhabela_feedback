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

  const tagData = {
    labels: tags.map((tag) => tag.label),
    datasets: [
      {
        label: 'Distribuição de Tags',
        data: tags.map(
          (tag) =>
            filteredComments.filter((comment) => comment.tag === tag.value).length
        ),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
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
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
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
      <h2>Dashboard de Comentários</h2>
      <p>Aqui você pode visualizar e filtrar os comentários.</p>

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

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th>Comentário</th>
            <th>Bairro</th>
            <th>Tag</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.map((comment) => (
            <tr key={comment._id}>
              <td>{comment.texto}</td>
              <td>{comment.bairro}</td>
              <td>{comment.tag}</td>
            </tr>
          ))}
          {filteredComments.length === 0 && (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>
                Nenhum comentário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-around' }}>
        <div style={{ width: '45%' }}>
          <h3>Distribuição por Tags</h3>
          <Pie data={tagData} options={tagOptions} />
        </div>
        <div style={{ width: '45%' }}>
          <h3>Distribuição por Bairros</h3>
          <Pie data={neighborhoodData} options={neighborhoodOptions} />
        </div>
      </div>

      <button onClick={handleBackToMap} style={{ marginTop: '20px' }}>
        Voltar para o Mapa
      </button>
    </div>
  );
};

export default Dashboard;
