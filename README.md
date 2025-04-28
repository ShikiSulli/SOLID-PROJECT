# Solid Project 🚀

Solid Project est une application simple et intuitive développée avec **Node.js** et **SolidServer**. Cette application permet de gérer des **PODS**, de consulter des données, et d'effectuer des requêtes **SPARQL** pour interagir avec le serveur **SOLID**.

⚠️ Pour obtenir les données de l'application il faut scroll tout en bas ⚠️

---

## **Fonctionnalités principales 🌟**

- **Création de PODs** : Les utilisateurs peuvent facilement créer leurs propres PODs (Personal Online Data Stores).
- **Consultation de données** : Accédez aux données stockées dans les PODs de manière fluide.
- **Requêtes SPARQL** : Effectuez des requêtes SPARQL pour accéder aux données et interagir avec le serveur SOLID.

---

## **Technologies utilisées 🛠**

- **Backend** :
  - [Node.js](https://nodejs.org/) : Runtime JavaScript puissant et extensible.
  - [SolidServer](https://solidproject.org/) : Serveur pour gérer des PODs et implémenter les normes Solid.
  - **SPARQL** : Langage de requête pour manipuler les données RDF.

- **Frontend** :
  - Framework et outils modernes pour créer une interface utilisateur intuitive.

---

## **Installation et utilisation 🚀**

### **Prérequis**
1. **Node.js** (version 16 ou supérieure recommandée).
2. **npm** ou **yarn** pour la gestion des dépendances.
3. Une instance de **SolidServer** configurée.

Assurez-vous que Node.js est bien installé sur votre machine avec ces commandes :

```bash
node -v
npm -v
 ```
---

### **Étapes d'installation**

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/ShikiSulli/SOLID-PROJECT.git
   cd solid-project
   ```
---
2. Installer les dépendances 
Dans le répertoire principal du projet, exécutez :

 ```bash
npm install
 ```
---
3. Démarrer le serveur
Démarrez le serveur avec cette commande :

 ```bash
node app.js
 ```
---
4. Démarrer le client
Démarrez le client avec cette commande :

 ```bash
npm run dev
 ```
---
5. Exemple de requêtes SPARQL

```bash
SELECT ?predicate ?object
WHERE {
  <http://localhost:3000/hetic/profile/card#me> ?predicate ?object .
}
 ```
---

## **✨Remerciements**
🎉 Profitez de l'application, et merci de votre intérêt pour ce projet ! 🚀



-EThan Launay
-Benjamin Bandasavanh
-Arsène Dobrovolskyy

   


