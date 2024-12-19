import {
  login,
  handleIncomingRedirect,
  getDefaultSession,
} from "@inrupt/solid-client-authn-browser";
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  createSolidDataset,
  saveSolidDatasetAt,
  createThing,
  setThing,
  addStringNoLocale,
  getSourceUrl,
  overwriteFile,
} from "@inrupt/solid-client";
import rdf from "rdf-store-stream";
import { SparqlParser, SparqlQueryExecutor } from "sparqljs";

// Gérer la redirection
async function handleRedirect() {
  await handleIncomingRedirect();
  const session = getDefaultSession();

  if (session.info.isLoggedIn) {
    document.getElementById(
      "output"
    ).innerText = `Connecté en tant que : ${session.info.webId}`;
    console.log("WebID :", session.info.webId);
  } else {
    console.log("Non connecté. Redirection en cours...");
  }
}

async function loginSolid() {
  try {
    await login({
      oidcIssuer: "http://localhost:3000",
      redirectUrl: window.location.href,
      clientName: "Solid Local App",
    });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
  }
}

async function createSolidData() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Vous devez être connecté pour créer des données.");
    return;
  }

  const title = document.getElementById("dataTitle").value;
  const content = document.getElementById("dataContent").value;

  const datasetUrl = `${session.info.webId}/public/example`;
  let dataset;

  try {
    // Tente de récupérer le dataset existant
    dataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });
  } catch (error) {
    if (error.statusCode === 404) {
      // Si le dataset n'existe pas, crée un nouveau dataset
      dataset = createSolidDataset();
    } else {
      console.error("Erreur lors de la récupération du dataset :", error);
      document.getElementById("output").innerText =
        "Erreur lors de la récupération du dataset.";
      return;
    }
  }

  let thing = createThing({ name: "example" });
  thing = addStringNoLocale(thing, "http://schema.org/name", title);
  thing = addStringNoLocale(thing, "http://schema.org/text", content);
  const updatedDataset = setThing(dataset, thing);

  try {
    await saveSolidDatasetAt(datasetUrl, updatedDataset, {
      fetch: session.fetch,
    });
    document.getElementById("output").innerText = "Données créées avec succès.";
  } catch (error) {
    console.error("Erreur lors de la création des données :", error);
    document.getElementById("output").innerText =
      "Erreur lors de la création des données.";
  }
}

async function writeDataToPod() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const podUrl = "http://localhost:3000/hetic/public/my-data.ttl";
    let dataset;

    try {
      // Tente de récupérer le dataset existant
      dataset = await getSolidDataset(podUrl, { fetch: session.fetch });
    } catch (error) {
      if (error.statusCode === 404) {
        // Si le dataset n'existe pas, crée un nouveau dataset
        dataset = createSolidDataset();
      } else {
        console.error("Erreur lors de la récupération du dataset :", error);
        alert("Erreur lors de la récupération du dataset.");
        return;
      }
    }

    // Crée un nouveau Thing
    let myThing = createThing({ name: "example" });
    myThing = addStringNoLocale(
      myThing,
      "https://schema.org/name",
      "Mon Exemple de Donnée"
    );

    // Ajoute le Thing au dataset
    dataset = setThing(dataset, myThing);

    // Sauvegarde le dataset dans le Pod
    await saveSolidDatasetAt(podUrl, dataset, { fetch: session.fetch });
    alert("Données ajoutées avec succès dans le Pod !");
  } catch (error) {
    console.error("Erreur lors de l'écriture des données :", error);
    alert("Erreur : " + error.message);
  }
}

async function readData() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const podUrl = "http://localhost:3000/hetic/profile/card";
    const dataset = await getSolidDataset(podUrl, { fetch: session.fetch });
    const thingUrl = `${podUrl}#me`;
    let thing = getThing(dataset, thingUrl);

    if (!thing) {
      // Si le Thing n'existe pas, crée un nouveau Thing
      thing = createThing({ url: thingUrl });
      thing = addStringNoLocale(
        thing,
        "https://schema.org/name",
        "Nouveau Nom"
      );
      const updatedDataset = setThing(dataset, thing);

      // Sauvegarde le dataset mis à jour
      await saveSolidDatasetAt(podUrl, updatedDataset, {
        fetch: session.fetch,
      });
      document.getElementById("output").innerText =
        "Nouveau Thing créé avec succès.";
    } else {
      const value = getStringNoLocale(thing, "https://schema.org/name");
      document.getElementById("output").innerText = `Données lues : ${
        value || "Pas de données trouvées"
      }`;
    }
  } catch (error) {
    console.error("Erreur lors de la lecture des données :", error);
    document.getElementById("output").innerText =
      "Erreur lors de la lecture des données.";
  }
}

async function querySparql() {
  const session = getDefaultSession();
  if (!session.info.isLoggedIn) {
    alert("Veuillez vous connecter d'abord.");
    return;
  }

  try {
    const podUrl = "http://localhost:3000/Hetic/public/my-data.ttl";

    // Récupère le dataset RDF
    const dataset = await getSolidDataset(podUrl, { fetch: session.fetch });

    // Transforme en un store RDF
    const store = await rdf.dataset().import(dataset);

    // Requête SPARQL
    const sparqlQuery = document.getElementById("sparqlQuery").value;
    const parser = new SparqlParser();
    const query = parser.parse(sparqlQuery);

    // Exécute la requête
    const executor = new SparqlQueryExecutor(store);
    const results = await executor.execute(query);

    console.log("Résultats SPARQL :", results);
    document.getElementById("output").innerText = JSON.stringify(
      results,
      null,
      2
    );
  } catch (error) {
    console.error("Erreur lors de l'exécution de la requête SPARQL :", error);
    document.getElementById("output").innerText =
      "Erreur lors de l'exécution de la requête SPARQL.";
  }
}

window.querySparql = querySparql;
window.loginSolid = loginSolid;
window.readData = readData;
window.writeDataToPod = writeDataToPod;
window.createSolidData = createSolidData;
handleRedirect();
