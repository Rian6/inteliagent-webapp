import * as React from 'react';
import { TextField, Select, MenuItem, Button, Box, InputLabel } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SERVIDOR_MAIN } from '../../../tools/config';

export default function Formulario() {
    const { uuid } = useParams();
    const navigate = useNavigate();

    const [nomeRegiao, setNomeRegiao] = React.useState('');
    const [zona, setNomeZona] = React.useState('');
    const [situacao, setSituacao] = React.useState('0');

    useEffect(() => {
        if (uuid && uuid != '0') {
            const buscarDados = async () => {
                try {
                    const resposta = await fetch(`${SERVIDOR_MAIN}/api/find-by-uuid/${uuid}`);
                    if (resposta.ok) {
                        const dados = await resposta.json();
                        setNomeRegiao(dados.descricao || '');
                        setNomeZona(dados.zona || '');
                        setSituacao(dados.situacao || '');
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
            zona,
            situacao,
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
                    <div style={{ flex: 1, marginTop: 23 }}>
                        <TextField
                            label="Nome da Zona"
                            variant="outlined"
                            value={zona}
                            onChange={(e) => setNomeZona(e.target.value)}
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

                    <div style={{ display: 'flex', gap: '20px', width: '30%' }}>
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
                                <MenuItem value="0">Selecione a Situação</MenuItem>
                                <MenuItem value="1">Concluido</MenuItem>
                                <MenuItem value="2">Pendente</MenuItem>
                                <MenuItem value="3">Executando</MenuItem>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
