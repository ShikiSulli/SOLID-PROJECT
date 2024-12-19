import React, { useState, useEffect } from 'react';
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
} from "@inrupt/solid-client";
import rdf from "rdf-ext";
import { Parser as SparqlParser } from "sparqljs";
import { newEngine } from "@comunica/actor-init-sparql";

const SolidApp: React.FC = () => {
    const [oidcIssuer, setOidcIssuer] = useState('http://localhost:3000');
    const [dataTitle, setDataTitle] = useState('');
    const [dataContent, setDataContent] = useState('');
    const [sparqlQuery, setSparqlQuery] = useState('');
    const [output, setOutput] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [webId, setWebId] = useState('');

    useEffect(() => {
        handleRedirect();
    }, []);

    const handleRedirect = async () => {
        await handleIncomingRedirect();
        const session = getDefaultSession();

        if (session.info.isLoggedIn) {
            setIsLoggedIn(true);
            setWebId(session.info.webId || '');
            setOutput(`Connecté en tant que : ${session.info.webId}`);
        }
    };

    const loginSolid = async () => {
        try {
            await login({
                oidcIssuer,
                redirectUrl: window.location.href,
                clientName: "Solid Local App",
            });
        } catch (error) {
            console.error("Erreur lors de la connexion :", error);
            setOutput(`Erreur de connexion: ${error.message}`);
        }
    };

    const createSolidData = async () => {
        const session = getDefaultSession();
        if (!session.info.isLoggedIn) {
            setOutput("Vous devez être connecté pour créer des données.");
            return;
        }

        const datasetUrl = `${session.info.webId}/public/example`;
        let dataset;

        try {
            try {
                dataset = await getSolidDataset(datasetUrl, { fetch: session.fetch });
            } catch (error) {
                if (error.statusCode === 404) {
                    dataset = createSolidDataset();
                } else {
                    throw error;
                }
            }

            let thing = createThing({ name: "example" });
            thing = addStringNoLocale(thing, "http://schema.org/name", dataTitle);
            thing = addStringNoLocale(thing, "http://schema.org/text", dataContent);
            const updatedDataset = setThing(dataset, thing);

            await saveSolidDatasetAt(datasetUrl, updatedDataset, {
                fetch: session.fetch,
            });
            setOutput("Données créées avec succès.");
        } catch (error) {
            console.error("Erreur lors de la création des données :", error);
            setOutput(`Erreur lors de la création des données: ${error.message}`);
        }
    };

    const readData = async () => {
        const session = getDefaultSession();
        if (!session.info.isLoggedIn) {
            setOutput("Veuillez vous connecter d'abord.");
            return;
        }

        try {
            const podUrl = "http://localhost:3000/hetic/profile/card";
            const dataset = await getSolidDataset(podUrl, { fetch: session.fetch });
            const thingUrl = `${podUrl}#me`;
            let thing = getThing(dataset, thingUrl);

            if (!thing) {
                thing = createThing({ url: thingUrl });
                thing = addStringNoLocale(thing, "https://schema.org/name", "Nouveau Nom");
                const updatedDataset = setThing(dataset, thing);
                await saveSolidDatasetAt(podUrl, updatedDataset, {
                    fetch: session.fetch,
                });
                setOutput("Nouveau Thing créé avec succès.");
            } else {
                const value = getStringNoLocale(thing, "https://schema.org/name");
                setOutput(`Données lues : ${value || "Pas de données trouvées"}`);
            }
        } catch (error) {
            console.error("Erreur lors de la lecture des données :", error);
            setOutput(`Erreur lors de la lecture des données: ${error.message}`);
        }
    };

    const writeDataToPod = async () => {
        const session = getDefaultSession();
        if (!session.info.isLoggedIn) {
            setOutput("Veuillez vous connecter d'abord.");
            return;
        }

        try {
            const podUrl = "http://localhost:3000/hetic/public/my-data.ttl";
            let dataset;

            try {
                dataset = await getSolidDataset(podUrl, { fetch: session.fetch });
            } catch (error) {
                if (error.statusCode === 404) {
                    dataset = createSolidDataset();
                } else {
                    throw error;
                }
            }

            let myThing = createThing({ name: "example" });
            myThing = addStringNoLocale(
                myThing,
                "https://schema.org/name",
                "Mon Exemple de Donnée"
            );

            dataset = setThing(dataset, myThing);
            await saveSolidDatasetAt(podUrl, dataset, { fetch: session.fetch });
            setOutput("Données ajoutées avec succès dans le Pod !");
        } catch (error) {
            console.error("Erreur lors de l'écriture des données :", error);
            setOutput(`Erreur lors de l'écriture: ${error.message}`);
        }
    };

    const querySparql = async () => {
        const session = getDefaultSession();
        if (!session.info.isLoggedIn) {
            setOutput("Veuillez vous connecter d'abord.");
            return;
        }

        try {
            const podUrl = "http://localhost:3000/Hetic/public/my-data.ttl";
            const dataset = await getSolidDataset(podUrl, { fetch: session.fetch });
            const store = rdf.dataset();
            await store.import(dataset);
            const engine = newEngine();
            const results = await engine.query(sparqlQuery, {
                sources: [store],
            });
            const results = await executor.execute(query);

            setOutput(JSON.stringify(results, null, 2));
        } catch (error) {
            console.error("Erreur lors de l'exécution de la requête SPARQL :", error);
            setOutput(`Erreur lors de l'exécution de la requête SPARQL: ${error.message}`);
        }
    };

    return (
        <div className="solid-app">
            <h1>Bienvenue dans votre Solid App</h1>

            {isLoggedIn ? (
                <div className="user-info">
                    <p>Connecté avec WebID: {webId}</p>
                </div>
            ) : (
                <div className="login-form">
                    <label htmlFor="oidcIssuer">URL du fournisseur de Pod :</label>
                    <input
                        type="text"
                        id="oidcIssuer"
                        value={oidcIssuer}
                        onChange={(e) => setOidcIssuer(e.target.value)}
                    />
                    <button onClick={loginSolid}>Se connecter</button>
                </div>
            )}

            <div className="data-form">
                <h2>Créer des données Solid</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                    <label htmlFor="dataTitle">Titre :</label>
                    <input
                        type="text"
                        id="dataTitle"
                        value={dataTitle}
                        onChange={(e) => setDataTitle(e.target.value)}
                        required
                    />
                    <label htmlFor="dataContent">Contenu :</label>
                    <textarea
                        id="dataContent"
                        value={dataContent}
                        onChange={(e) => setDataContent(e.target.value)}
                        required
                    />
                    <button type="button" onClick={createSolidData}>
                        Créer des données
                    </button>
                </form>
            </div>

            <div className="data-actions">
                <button onClick={readData}>Lire les données du Pod</button>
                <button onClick={writeDataToPod}>
                    Ajouter des données dans le Pod
                </button>
            </div>

            <div className="sparql-form">
                <h2>Exécuter une requête SPARQL</h2>
                <textarea
                    value={sparqlQuery}
                    onChange={(e) => setSparqlQuery(e.target.value)}
                    placeholder="Écrivez votre requête SPARQL ici"
                />
                <button onClick={querySparql}>Exécuter la requête SPARQL</button>
            </div>

            <div className="output">
                <h3>Résultats :</h3>
                <pre>{output}</pre>
            </div>
        </div>
    );
};

export default SolidApp;