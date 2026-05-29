# 🏆 Álbum Panini — Copa do Mundo 2026

Aplicativo web para gerenciar um álbum de figurinhas da Copa 2026 compartilhado entre dois usuários, com sincronização em tempo real via Firebase.

## ✨ Funcionalidades

- **Login com e-mail/senha** (Firebase Auth)
- **Álbum compartilhado** entre dois usuários em tempo real
- **3 estados por figurinha**: ❌ Falta | ✅ Tenho | 🔁 Repetida
- **Filtros**: por estado, grupo, país e busca por nome/número
- **Barra de progresso** com estatísticas do álbum
- **Central de Trocas**: troque repetidas por faltantes com 1 clique
- **Histórico de trocas** com data e detalhes
- **Sincronização em tempo real** com Firestore `onSnapshot`
- **Design dark premium** responsivo (mobile + desktop)

## 🚀 Instalação

### 1. Clone e instale dependências

```bash
cd myalbum-frontend
npm install
```

### 2. Configure o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Habilite **Authentication** → E-mail/Senha
4. Crie um banco **Firestore** (modo produção ou teste)
5. Registre um app Web e copie as credenciais
6. Crie dois usuários em Authentication → Users

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Preencha o `.env` com suas credenciais Firebase:

```env
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### 4. Regras do Firestore

No console Firebase → Firestore → Regras:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albuns/{albumId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Rode o projeto

```bash
npm start
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 👥 Como dois usuários testam simultaneamente

1. Abra o app em duas abas (ou dois navegadores)
2. Faça login com cada um dos dois e-mails cadastrados
3. Qualquer alteração em uma aba aparece automaticamente na outra em tempo real

## 📁 Estrutura do Projeto

```
src/
├── firebase/       # Configuração Firebase
├── types/          # Tipos TypeScript
├── data/           # Dados das figurinhas (Copa 2026)
├── store/          # Zustand store + Firestore sync
├── contexts/       # AuthContext
├── components/     # CardFigurinha, Navbar, BarraProgresso, RotaProtegida
└── pages/          # Login, Album, Trocas, Historico
```
