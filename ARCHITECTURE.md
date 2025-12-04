# KS Chatbot – Explication rapide

## Technologies

- Next.js + React pour le frontend
- Supabase pour :
  - l’authentification (signup / login)
  - la table `messages` pour stocker les messages des utilisateurs
- Google Gemini comme LLM (appelé depuis une route API)

## Pages principales

- `/signup` : page pour créer un compte (email + mot de passe)
- `/login` : page pour se connecter
- `/chat` : interface du chatbot (protégée, accessible seulement si l’utilisateur est connecté)

## Fonctionnement du chat

1. L’utilisateur tape un message dans `/chat` et clique sur **Envoyer**.
2. Le message est ajouté à la liste des messages (côté React).
3. Le frontend envoie l’historique des messages à l’API :
   - route `POST /api/chat`
4. La route `/api/chat` appelle le modèle Gemini et renvoie une réponse texte.
5. La réponse est affichée à gauche (bulle grise).  
6. Les messages utilisateur sont enregistrés dans la table `messages` de Supabase.

## Métrique tokens

Après chaque réponse, j’affiche une estimation :

- du nombre de tokens de la réponse,
- des tokens par seconde (tokens/s) pendant la génération.

C’est une métrique technique utile pour voir le débit du modèle,  
mais ce n’est pas une bonne métrique unique pour juger les performances réelles de l’application (latence, qualité des réponses, satisfaction utilisateur, etc.).
