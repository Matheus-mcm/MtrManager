# 🌐 MTR MANAGER

Portal projetado para extrair, de forma automática, todas as informações sobre os Manifestos de Transporte de Resíduos, com o intuito de facilitar a geração de Planos de Gerenciamento de Resíduos Sólidos.

## 📑 Sumário

Visão Geral

Arquitetura

Tecnologias Utilizadas

Requisitos

Como Rodar o Projeto

Variáveis de Ambiente

Estrutura do Projeto

Documentação

Testes

Roadmap

Contribuição

Autores

Licença

## 📘 Visão Geral

O Portal de Gerenciamento de Manifestos de Transporte de Resíduos (MTR) foi desenvolvido para dar suporte ao processo de geração dos Planos de Gerenciamento de Resíduos Sólidos. Atualmente, a equipe precisa acessar o portal do SINIR, navegar manualmente entre diversas páginas e realizar os downloads um a um, tornando a atividade lenta, repetitiva e suscetível a erros.

O novo portal centraliza todo o processo em uma interface única, automatizando a coleta dos arquivos, o processamento dos dados e a disponibilização das informações de forma padronizada, intuitiva e assertiva. Com isso, o projeto reduz significativamente o tempo dedicado à atividade, elimina falhas humanas e aumenta a produtividade da equipe.

## 🏛 Arquitetura

A solução é composta por três camadas principais:

### 1) Backend (.NET 10)
Responsável por:
- Gerenciar regras de negócio  
- Orquestrar a automação  
- Processar os arquivos obtidos  
- Expor endpoints e serviços internos  

Organizado nas seguintes camadas:
- **Controllers** — Expõe endpoints para interface do portal
- **Entities** — Entidades de dados  
- **Services** — Controla todo o processamento de dados, tratativas e comunicação com a automação  

---

### 2) Módulo de Automação (Playwright)
- Realiza navegação no portal do SINIR  
- Efetua login e navegação automática  
- Executa downloads dos manifestos  
- Entrega os arquivos ao backend para processamento  

Integrado ao backend por meio de serviços injetados e executores específicos.

---

### 3) Interface Web
Aplicação web simples (HTML/CSS/JS) utilizada pelo usuário para:
- Acionar o processo de automação  
- Exibir as informações dos manifestos
- Gerenciar cadastros das empresas

---

### Fluxo Geral
1. Usuário aciona o processo via portal  
2. Backend dispara o módulo de automação  
3. Playwright acessa o site do SINIR  
4. Arquivos são baixados e enviados ao backend  
5. Backend processa e padroniza os dados  
6. Portal exibe os dados ao usuário

## 🧰 Tecnologias Utilizadas

Lista de tecnologias principais:

.NET 10

ASP.NET Core Web API

## 📦 Requisitos

- Windows 11

## ▶️ Como Rodar o Projeto

🔹 Localmente

Clonar o repositório:

git clone https://github.com/user/projeto.git


Restaurar dependências:

dotnet restore


Rodar o projeto:

dotnet run --project src/Api

## 📁 Estrutura do Projeto


## 📚 Documentação


## 🗺 Roadmap


## 👤 Autores

Matheus Cardoso — Desenvolvedor

## 📄 Licença
