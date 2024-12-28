import * as React from 'react';
import { TextField, Select, MenuItem, Button, Box, InputLabel } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SERVIDOR_MAIN } from '../../../tools/config';

export default function Formulario() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [nomeRegiao, setNomeRegiao] = React.useState('');
    const [agente, setAgente] = React.useState('');
    const [dataVisita, setDataVisita] = React.useState('');
    const [situacao, setSituacao] = React.useState('');
    const [categoria, setCategoria] = React.useState('');

    useEffect(() => {
        if (uuid && uuid != '0') {
            const buscarDados = async () => {
                try {
                    const resposta = await fetch(`${SERVIDOR_MAIN}/api/find-by-uuid/${uuid}`);
                    if (resposta.ok) {
                        const dados = await resposta.json();
                        console.log(dados)
                        setNomeRegiao(dados.descricao || '');
                        setAgente(dados.agente || '');
                        setDataVisita(dados.dataVisita || '');
                        setSituacao(dados.situacao || '');
                        setCategoria(dados.categoria || '');
                    }
                } catch (erro) {
                    console.error('Erro na requisição:', erro);
                    alert('Erro ao tentar carregar os dados.');
                }
            };

            buscarDados();
        }
    }, [uuid]);

    const salvarDados = async () => {
        const dadosFormulario = {
            uuid,
            nomeRegiao,
            agente,
            dataVisita,
            situacao,
            categoria,
        };

        try {
            const resposta = await fetch(`${SERVIDOR_MAIN}/api/planejamento/salvar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosFormulario),
            });
            const resultado = await resposta.json();
            if (resposta.status === 200) {
                console.log('Dados salvos com sucesso:', resultado);
                alert('Dados salvos com sucesso!');
                navigate(`/planejamento/cadastrar/${resultado.uuid}`);
            } else {
                console.error('Erro ao salvar os dados:', resposta.statusText);
                alert('Erro ao salvar os dados.');
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Erro ao tentar salvar os dados.');
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        salvarDados();
    };

    return (
        <div style={{
            width: '90vw',
            padding: '20px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginTop: '10px',
        }}>
            <Button
                variant="contained"
                color="primary"
                sx={{
                    position: 'absolute',
                    top: '0px',
                    right: '20px',
                    backgroundColor: '#A9007A',
                    '&:hover': {
                        backgroundColor: '#800053',
                    },
                }}
                onClick={handleSubmit}
            >
                Salvar
            </Button>
            <h2>Geral</h2>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                    <div style={{ flex: 1, marginTop: 23 }}>
                        <TextField
                            label="Nome da Região"
                            variant="outlined"
                            value={nomeRegiao}
                            onChange={(e) => setNomeRegiao(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    color: '#A9007A',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#800053',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                },
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <InputLabel id="agente-label" sx={{ color: '#A9007A' }}>Agente</InputLabel>
                        <Select
                            labelId="agente-label"
                            value={agente}
                            onChange={(e) => setAgente(e.target.value)}
                            fullWidth
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#800053',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">Selecione o Agente</MenuItem>
                            <MenuItem value="Agente 1">Agente 1</MenuItem>
                            <MenuItem value="Agente 2">Agente 2</MenuItem>
                            <MenuItem value="Agente 3">Agente 3</MenuItem>
                        </Select>
                    </div>
                    <div style={{ flex: 1, marginTop: 23 }}>
                        <TextField
                            label="Visita"
                            type="date"
                            variant="outlined"
                            value={dataVisita}
                            onChange={(e) => setDataVisita(e.target.value)}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            fullWidth
                            sx={{
                                '& .MuiInputLabel-root': {
                                    color: '#A9007A',
                                },
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#800053',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                        <InputLabel id="situacao-label" sx={{ color: '#A9007A' }}>Situação</InputLabel>
                        <Select
                            labelId="situacao-label"
                            value={situacao}
                            onChange={(e) => setSituacao(e.target.value)}
                            fullWidth
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#800053',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">Selecione a Situação</MenuItem>
                            <MenuItem value="Ativa">Ativa</MenuItem>
                            <MenuItem value="Inativa">Inativa</MenuItem>
                            <MenuItem value="Pendente">Pendente</MenuItem>
                        </Select>
                    </div>

                    <div style={{ flex: 1 }}>
                        <InputLabel id="categoria-label" sx={{ color: '#A9007A' }}>Categoria</InputLabel>
                        <Select
                            labelId="categoria-label"
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            fullWidth
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#800053',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#A9007A',
                                    },
                                },
                            }}
                        >
                            <MenuItem value="">Selecione a Categoria</MenuItem>
                            <MenuItem value="Categoria 1">Categoria 1</MenuItem>
                            <MenuItem value="Categoria 2">Categoria 2</MenuItem>
                            <MenuItem value="Categoria 3">Categoria 3</MenuItem>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
