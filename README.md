# ⚡ Sistema Elétrica Pesada - Relatórios de Manutenção em Nuvem

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

Aplicação web moderna, responsiva e focada em produtividade para eletricistas e mecânicos de maquinário pesado (caminhões e tratores). Desenvolvida para substituir os tradicionais cadernos de anotações por um sistema em nuvem seguro, rápido e acessível direto do celular na oficina.

## ✨ Funcionalidades

* **Autenticação Segura:** Sistema de Login e Registro protegidos pelo Supabase Auth.
* **Gestão de Relatórios (CRUD):** Criação, leitura, edição e exclusão de relatórios de manutenção contendo placa, serviço realizado, peças utilizadas e notas.
* **Ações em Lote (Bulk Actions):** Seleção de múltiplos relatórios simultâneos para Exclusão ou Geração de PDF.
* **Exportação Profissional para PDF:** Gera automaticamente uma "Ordem de Serviço" formatada e pronta para assinatura usando a biblioteca `jsPDF`.
* **Filtros em Tempo Real:** Pesquisa inteligente por Placa/Prefixo e filtro exato por Data, rodando nativamente no navegador (Zero-latency).
* **Segurança de Dados (RLS):** Banco de dados blindado (Row Level Security), garantindo que cada usuário acesse apenas os seus próprios registros.
* **Design Acessível (WCAG AAA):** Alternância nativa entre Tema Escuro e Claro (Dark/Light Mode) com alto contraste para leitura sob o sol.
* **UI/UX Polida:** Modais de confirmação customizados (substituindo `alerts` nativos) e design mobile-first livre de *layout shifts*.

## 🛠️ Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3 (Variáveis para Temas), Vanilla JavaScript (ES6+).
* **Backend / BaaS:** [Supabase](https://supabase.com/) (PostgreSQL + Autenticação).
* **Ícones:** [Lucide Icons](https://lucide.dev/) (Carregados via CDN).
* **Geração de PDF:** [jsPDF](https://parall.ax/products/jspdf).
* **Hospedagem Recomendada:** [Vercel](https://vercel.com/).

## 📁 Estrutura do Projeto

```text
/
├── index.html       # Tela principal (Formulário, Histórico e Bulk Actions)
├── login.html       # Tela de autenticação (Login/Registro)
├── style.css        # Estilos globais, variáveis de tema e responsividade
├── script.js        # Lógica da aplicação principal, PDF, Filtros e CRUD
├── login.js         # Lógica isolada de Autenticação Supabase
└── README.md        # Documentação do projeto
```
## 🚀 Como Rodar o Projeto Localmente
Clone o repositório ou baixe os arquivos.

Certifique-se de que todos os arquivos estão na mesma pasta.

Utilize a extensão Live Server no VS Code (ou servidor local equivalente) para abrir o arquivo login.html ou index.html.

Configuração do Supabase (Obrigatório)
Para que o sistema funcione, você precisa criar um projeto gratuito no Supabase e configurar o banco de dados.

### 1. Configurando as Chaves:
No Supabase, vá em Project Settings > API. Copie a Project URL e a anon public key e cole-as no topo dos arquivos script.js e login.js:

Desenvolvido com foco na eficiência do trabalho de campo pesado.