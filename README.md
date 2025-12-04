# KS Chatbot – Case Study

Chatbot web réalisé avec Next.js, Supabase et l’API Gemini.

## Fonctionnalités

- Authentification email + mot de passe (Supabase)
- Pages `/signup`, `/login`, `/chat`
- Page de chat protégée (accessible seulement si l’utilisateur est connecté)
- Interface de chat responsive, design sombre
- Sauvegarde des messages utilisateurs dans la table `messages` (Supabase)
- Intégration d’un LLM via une route API `/api/chat`
- Affichage d’une estimation du nombre de tokens et des tokens/s
- Gestion d’erreurs côté LLM avec message explicite dans l’interface

## Démarrage en local

```bash
npm install
npm run dev
