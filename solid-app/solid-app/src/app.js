import {
  addStringNoLocale,
  createSolidDataset,
  createThing,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  saveSolidDatasetAt,
  setThing
} from "@inrupt/solid-client";
import {
  getDefaultSession,
  handleIncomingRedirect,
  login
} from "@inrupt/solid-client-authn-browser";

// Gérer la redirection après connexion
async function handleRedirect() {
  await handleIncomingRedirect();
  const session = getDefaultSession();

  if (session.info.isLoggedIn) {
    document.getElementById("output").innerText = `Connecté en tant que : ${session.info.webId}`;
    console.log("WebID :", session.info.webId);
  }
}

// Fonction de connexion
async function loginSolid() {
  const issuer = document.getElementById("oidcIssuer").value || "http://localhost:3000";
  try {
    await login({
      oidcIssuer: issuer,
      redirectUrl: window.location.href,
      clientName: "Solid Profile Manager",
      // Ajout de paramètres de session
      restorePreviousSession: true,
      tokenType: "DPoP"
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    document.getElementById("output").innerText = "Erreur de connexion : " + error.message;
  }
}

// Fonction pour créer/mettre à jour des données dans le profil
async function createSolidData() {
  const session = getDefaultSession();

  // Vérification détaillée de la session
  if (!session.info.isLoggedIn) {
    document.getElementById("output").innerText = "Session expirée. Reconnectez-vous.";
    return;
  }

  // Vérification du token de session
  if (!session.info.webId) {
    await loginSolid(); // Reconnexion automatique
    return;
  }

  const title = document.getElementById("dataTitle").value;
  const content = document.getElementById("dataContent").value;

  const profileUrl = "http://localhost:3000/hetic/profile/card";
  let dataset;

  try {
    // Tentative de récupération du dataset avec gestion d'erreur améliorée
    try {
      dataset = await getSolidDataset(profileUrl, {
        fetch: session.fetch,
        // Ajout d'un timeout pour éviter les blocages
        timeout: 5000
      });
    } catch (error) {
      if (error.statusCode === 404) {
        console.log("Dataset non trouvé, création d'un nouveau dataset");
        dataset = createSolidDataset();
      } else if (error.statusCode === 401) {
        document.getElementById("output").innerText = "Session expirée. Veuillez vous reconnecter.";
        await loginSolid();
        return;
      } else {
        throw error;
      }
    }

    let profileThing = createThing({ url: `${profileUrl}#me` });

    // Ajout des données
    profileThing = addStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/name", title);
    profileThing = addStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/description", content);

    const updatedDataset = setThing(dataset, profileThing);

    // Sauvegarde avec gestion d'erreur améliorée
    try {
      await saveSolidDatasetAt(profileUrl, updatedDataset, {
        fetch: session.fetch,
        // Ajout d'un timeout pour éviter les blocages
        timeout: 5000
      });
      document.getElementById("output").innerText = "Données créées avec succès dans le profil.";
    } catch (error) {
      if (error.statusCode === 401) {
        document.getElementById("output").innerText = "Session expirée pendant la sauvegarde. Veuillez vous reconnecter.";
        await loginSolid();
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Erreur lors de la création des données :", error);
    document.getElementById("output").innerText = `Erreur : ${error.message}\nVeuillez vous reconnecter.`;
  }
}


// Fonction pour lire les données du profil
async function readData() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const profileUrl = "http://localhost:3000/hetic/profile/card";
    const dataset = await getSolidDataset(profileUrl, { fetch: session.fetch });
    const profileThing = getThing(dataset, `${profileUrl}#me`);

    if (profileThing) {
      const name = getStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/name");
      const description = getStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/description");

      document.getElementById("output").innerText =
        `Données du profil :\nNom : ${name || 'Non défini'}\nDescription : ${description || 'Non défini'}`;
    } else {
      document.getElementById("output").innerText = "Aucun profil trouvé";
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des données :", error);
    document.getElementById("output").innerText = "Erreur lors de la lecture : " + error.message;
  }
}

// Fonction pour écrire des données dans le Pod
async function writeDataToPod() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const profileUrl = "http://localhost:3000/hetic/profile/card";
    let dataset;

    try {
      dataset = await getSolidDataset(profileUrl, { fetch: session.fetch });
    } catch (error) {
      if (error.statusCode === 404) {
        dataset = createSolidDataset();
      } else {
        throw error;
      }
    }

    let thing = createThing({ url: `${profileUrl}#me` });
    thing = addStringNoLocale(thing, "http://xmlns.com/foaf/0.1/name", "Nouveau nom");
    thing = addStringNoLocale(thing, "http://xmlns.com/foaf/0.1/description", "Nouvelle description");

    const updatedDataset = setThing(dataset, thing);
    await saveSolidDatasetAt(profileUrl, updatedDataset, { fetch: session.fetch });

    document.getElementById("output").innerText = "Données ajoutées avec succès dans le Pod !";
  } catch (error) {
    console.error("Erreur lors de l'écriture des données :", error);
    document.getElementById("output").innerText = "Erreur : " + error.message;
  }
}

// Initialisation
handleRedirect();

// ---------------- Query SPARQL ----------------
import { QueryEngine } from '@comunica/query-sparql';

async function querySparql() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const profileUrl = "http://localhost:3000/hetic/profile/card";
    const query = document.getElementById("sparqlQuery").value;

    if (!query) {
      throw new Error("Veuillez entrer une requête SPARQL");
    }

    const myEngine = new QueryEngine();

    // Exécute la requête SPARQL
    const bindingsStream = await myEngine.queryBindings(query, {
      sources: [profileUrl],
      fetch: session.fetch
    });

    // Collecte tous les résultats
    const bindings = await bindingsStream.toArray();

    // Convertit les résultats en format plus facile à manipuler
    const results = bindings.map(binding => {
      const result = {};
      binding.forEach((value, key) => {
        result[key] = value.value;
      });
      return result;
    });

    // Affiche les résultats
    document.getElementById("output").innerHTML = formatSparqlResults(results);

  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête SPARQL:", error);
    document.getElementById("output").innerText =
      "Erreur lors de l'exécution de la requête SPARQL: " + error.message;
  }
}

// Fonction pour formater les résultats SPARQL
function formatSparqlResults(results) {
  if (!results || !results.length) {
    return "Aucun résultat trouvé";
  }

  let html = '<table border="1" style="border-collapse: collapse; margin-top: 10px;">';

  // En-têtes de colonnes
  html += '<tr>';
  Object.keys(results[0]).forEach(key => {
    html += `<th style="padding: 8px;">${key}</th>`;
  });
  html += '</tr>';

  // Données
  results.forEach(row => {
    html += '<tr>';
    Object.values(row).forEach(value => {
      html += `<td style="padding: 8px;">${value}</td>`;
    });
    html += '</tr>';
  });

  html += '</table>';
  return html;
}

// Export de la fonction
window.querySparql = querySparql;
// Export des fonctions pour l'utilisation dans le HTML
window.loginSolid = loginSolid;
window.createSolidData = createSolidData;
window.readData = readData;
window.writeDataToPod = writeDataToPod;