# Inteliagent Webapp

Painel React 19 e Material UI 9, com Vite 8, autenticação real, navegação responsiva, planejamento, visitas, aprovações e chat privado.

```powershell
npm ci
npm run dev
npm run build
```

Use Node LTS 26. As URLs e a chave opcional de mapas estão em `.env.example`. Não coloque senhas ou segredos JWT em variáveis `VITE_*`, que são públicas no bundle. Tokens de acesso ficam em memória; recarregar a página exige novo login. São necessários os serviços auth, main-server e chat.

O tema está em `src/theme.js`; o adaptador HTTP e o estado de sessão ficam em `src/services/`. Páginas são carregadas por rota. Os testes de navegador e o ambiente completo estão no workspace pai.


## CI/CD e produção

O workflow `.github/workflows/ci.yml` valida pushes e pull requests. Consulte a [infraestrutura e operação](https://github.com/Rian6/inteliagent-infra). Configure variáveis a partir de `.env.example`; segredos ficam em arquivos privados no servidor e GitHub Secrets. Não publique tokens, senhas ou arquivos de assinatura.
