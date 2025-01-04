import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, Filler } from 'chart.js';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { SERVIDOR_MAIN } from '../../tools/config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement, Filler);

function Home() {
  const [visitasPorDia, setVisitasPorDia] = useState([]);
  const [visitasPorRegiao, setVisitasPorRegiao] = useState([]);
  const [ultimasVisitas, setUltimasVisitas] = useState([]);

  useEffect(() => {
    // Carrega os dados do backend
    async function fetchData() {
      try {
        const [visitasDiaRes, visitasRegiaoRes, ultimasVisitasRes] = await Promise.all([
          axios.get(SERVIDOR_MAIN+'/api/visitas-por-dia', {
            headers: { 'Access-Control-Allow-Origin': '*' },
          }),
          axios.get(SERVIDOR_MAIN+'/api/visitas-por-regiao', {
            headers: { 'Access-Control-Allow-Origin': '*' },
          }),
          axios.get(SERVIDOR_MAIN+'/api/ultimas-visitas', {
            headers: { 'Access-Control-Allow-Origin': '*' },
          }),
        ]);
    
        setVisitasPorDia(visitasDiaRes.data);
        setVisitasPorRegiao(visitasRegiaoRes.data);
        setUltimasVisitas(ultimasVisitasRes.data);
        console.log(visitasRegiaoRes)
      } catch (error) {
        console.error('Erro ao carregar dados do backend:', error);
      }
    }    

    fetchData();
  }, []);

  // Prepara os dados para os gráficos
  const barData = {
    labels: visitasPorRegiao.map((item) => item.regiao),
    datasets: [
      {
        label: 'Visitas por Bairro',
        data: visitasPorRegiao.map((item) => item.quantidade),
        backgroundColor: '#A9007A',
        borderColor: '#A9007A',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: visitasPorDia.map((item) => item.data),
    datasets: [
      {
        label: 'Visitas por Dia',
        data: visitasPorDia.map((item) => item.quantidade),
        fill: false,
        borderColor: '#A9007A',
        backgroundColor: '#A9007A',
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Home</h1>
      <div style={{ alignSelf: 'center', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <h3>Últimas Visitas Modificadas</h3>
        <TableContainer component={Paper} style={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Região</strong></TableCell>
                <TableCell><strong>Data</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ultimasVisitas.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>{visit.id}</TableCell>
                  <TableCell>{visit.regiao}</TableCell>
                  <TableCell>{visit.data}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ width: '100%', flexDirection: 'row', display: 'flex' }}>
          <div style={styles.chartBox}>
            <h3>Visitas por Região</h3>
            <Bar data={barData} options={{ responsive: true, plugins: { title: { display: true, text: 'Visitas por Região' } } }} />
          </div>
          <div style={styles.chartBox}>
            <h3>Visitas por Dia</h3>
            <Line data={lineData} options={{ responsive: true, plugins: { title: { display: true, text: 'Visitas por Dia' } } }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', width: '90vw', margin: '0 auto', padding: '20px' },
  title: { fontSize: '2.5rem', marginBottom: '30px', color: '#333' },
  chartBox: { width: '100%', margin: '20px', backgroundColor: '#fff', borderRadius: '5px' },
  tableContainer: { marginBottom: '30px', width: '100%' },
};

export default Home;
