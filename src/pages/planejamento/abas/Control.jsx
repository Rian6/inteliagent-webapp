import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Geral from './Geral'
import Visitas from './Visitas';
import { useParams } from 'react-router-dom';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const { uuid } = useParams();

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
            <h1 style={styles.title}>Planejamento</h1>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Geral" {...a11yProps(0)} />
          {uuid && uuid != 0 ? <Tab label="Visitas" {...a11yProps(1)} /> : null}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <Geral/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Visitas/>
      </CustomTabPanel>
    </Box>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '90vw', // O container agora ocupa 100% da largura disponível
    margin: '0 auto', // Centraliza o conteúdo
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#333',
  },
}