import {useState, useEffect, useRef} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

// Zu modellierende Funktion laut Aufgabenstellung
const targetFunction = (x) => 0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;

// Gaußsches Rauschen mit einer Varianz V = 0.05 laut Aufgabenstellung
const gaussianNoise = (variance = 0.05) => {
    const std = Math.sqrt(variance);
    const u1 = 1 - Math.random();
    const u2 = 1 - Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * std;
};

// Datenerzeugung
const generateData = (n) => {
    const data = [];

    for (let i = 0; i < n; i++) {
        const x = Math.random() * 4 - 2;
        const y = targetFunction(x);

        data.push({
            x, y, yNoisy: y + gaussianNoise()
        });
    }

    return data;
};

// Aufteilung in N/2 Trainings- und N/2 Testdaten-Paare und N muss gerade sein
const splitData = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);

    const half = data.length / 2;

    return {
        train: shuffled.slice(0, half), test: shuffled.slice(half)
    };
};

export default function Regression() {
    // 8 Diagramm-Referenzen für 2-Spalten-Layout
    const r1LeftRef = useRef(null);
    const r1RightRef = useRef(null);
    const r2LeftRef = useRef(null);
    const r2RightRef = useRef(null);
    const r3LeftRef = useRef(null);
    const r3RightRef = useRef(null);
    const r4LeftRef = useRef(null);
    const r4RightRef = useRef(null);
    const lossChartRef = useRef(null);

    const [data, setData] = useState(null);
    const [results, setResults] = useState(null);
    const [isTraining, setIsTraining] = useState(false);

    // Einstellbare Parameter für den eigenen Entwicklungszyklus (Epochen, Anzahl Datenpunkte und BatchSitze)
    const [epochsBest, setEpochsBest] = useState(80);
    const [epochsOverfit, setEpochsOverfit] = useState(800);
    const [numSamples, setNumSamples] = useState(100);
    const [batchSize, setBatchSize] = useState(32);

    // Referenzen auf die im RAM gehaltenen Modelle für den Export
    const modelsRef = useRef({clean: null, best: null, overfit: null});

// Feste mathematische Normalisierungsgrenzen für X basierend auf dem Definitionsbereich [-2, 2]
    const xMin = -2.0;
    const xMax = 2.0;

    const handleNewData = () => {
        let n = Number(numSamples);

        if (n < 2) {
            alert("N muss mindestens 2 sein");
            return;
        }

        if (n % 2 !== 0) {
            alert("N muss gerade sein");
            return;
        }

        setData(splitData(generateData(n)));
        setResults(null);
        modelsRef.current = {clean: null, best: null, overfit: null};
    };

// Erzeugen eines neuen Datensatzes beim Start
    useEffect(() => {
        handleNewData();
    }, []);


// Datensatz speichern (Download als JSON)
    const saveDataset = () => {
        if (!data) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "regressions_datensatz.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

// Datensatz laden (Upload von JSON)
    const loadDataset = (event) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.train && parsed.test) {
                    // Instanziierte Modelle im Speicher verwerfen
                    modelsRef.current = {clean: null, best: null, overfit: null};

                    // Zustand komplett bereinigen, um Altlasten aus den Plots zu werfen
                    setResults(null);

                    // Dem DOM ein Frame-Zeit geben, die Modell-Plots zu leeren, dann Daten rendern
                    setTimeout(() => {
                        setData(parsed);
                    }, 10);
                }
            } catch (err) {
                alert("Fehler beim Parsen der JSON-Datei");
            }
        };
        if (event.target.files[0]) fileReader.readAsText(event.target.files[0]);
    };

    // Erstellen der Modellarchitektur
    const createModel = () => {
        const model = tf.sequential(); // Eingabe fliesst direkt in Ausgabe
        model.add(tf.layers.dense({inputShape: [1], units: 100, activation: "relu"}));  // Input Layer + 1. Hidden Layer (100 Neuronen, ReLU)
        model.add(tf.layers.dense({units: 100, activation: "relu"})); // 2. Hidden Layer (100 Neuronen, ReLU)
        model.add(tf.layers.dense({units: 1})); // Output Layer (1 Neuron, linear)
        model.compile({
            optimizer: tf.train.adam(0.01), // Adam-Optimizer und Learning Rate 0.01 laut Aufgabenstellung
            loss: "meanSquaredError"
        });

        return model;
    };

// Generierung der mathematischen glatten Kurvenpunkte
    const generateSmoothCurve = (model) => {
        const size = 100;
        const xValues = [];
        for (let i = 0; i < size; i++) {
            xValues.push(xMin + (i / (size - 1)) * (xMax - xMin));
        }

        // 1. Werte für das Modell auf [0, 1] normieren
        const normXInputs = xValues.map(x => (x - xMin) / (xMax - xMin));
        const inputTensor = tf.tensor2d(normXInputs, [size, 1]);

        // 2. Vorhersage generieren
        const predTensor = model.predict(inputTensor);
        const outputs = Array.from(predTensor.dataSync());

        // FÜR DAS DIAGRAMM: x sind die echten Werte [-2, 2], y sind die korrekten Vorhersagen
        const points = xValues.map((x, i) => ({
            x: x, y: outputs[i]
        }));

        tf.dispose([inputTensor, predTensor]);
        return points;
    };

// Training mit Loss-Kurve
    const trainModel = async (train, test, epochs, batchSize, useCleanY = false) => {
        const model = createModel(); // Verwendet den Standard-Optimizer mit fix 0.01 Learning Rate

        const xTrainArr = train.map(d => d.x);
        // Best-Fit und Overfit trainieren auf verrauschten Daten, Clean auf sauberen Daten
        const yTrainArr = useCleanY ? train.map(d => d.y) : train.map(d => d.yNoisy);

        // Testdaten für die MSE-Ermittlung werden immer gegen die saubere Zielfunktion (d.y) evaluiert
        const xTestArr = test.map(d => d.x);
        const yTestArr = test.map(d => d.y);

        const normXTrain = tf.tensor2d(xTrainArr.map(x => (x - xMin) / (xMax - xMin)), [train.length, 1]);
        const yTrainTensor = tf.tensor2d(yTrainArr, [train.length, 1]);
        const normXTest = tf.tensor2d(xTestArr.map(x => (x - xMin) / (xMax - xMin)), [test.length, 1]);
        const yTestTensor = tf.tensor2d(yTestArr, [test.length, 1]);

        const history = {
            trainLoss: [], testLoss: []
        };

        await model.fit(normXTrain, yTrainTensor, {
            epochs, batchSize, shuffle: true, callbacks: {
                onEpochEnd: () => {
                    const trainLoss = model.evaluate(normXTrain, yTrainTensor).dataSync()[0];
                    const testLoss = model.evaluate(normXTest, yTestTensor).dataSync()[0];
                    history.trainLoss.push(trainLoss);
                    history.testLoss.push(testLoss);
                }
            }
        });

        // Finale MSE-Werte nach Abschluss aller Epochen extrahieren
        const finalTrainLoss = model.evaluate(normXTrain, yTrainTensor).dataSync()[0];
        const finalTestLoss = model.evaluate(normXTest, yTestTensor).dataSync()[0];

        const curvePoints = generateSmoothCurve(model);
        tf.dispose([normXTrain, yTrainTensor, normXTest, yTestTensor]);

        return {
            model, trainLoss: finalTrainLoss, testLoss: finalTestLoss, curvePoints, history
        };
    };

// Modelle exportieren (Kombiniert alle 3 Modelle + Epochen-Konfiguration in einer einzigen JSON-Datei)
    const saveModelsLocally = async () => {
        if (!modelsRef.current.clean || !modelsRef.current.best || !modelsRef.current.overfit) return;

        try {
            const exportSingleModel = async (model) => {
                const artifacts = await model.save(tf.io.withSaveHandler(async (art) => art));
                let weightDataStr = "";
                if (artifacts.weightData) {
                    const bytes = new Uint8Array(artifacts.weightData);
                    let binary = "";
                    for (let i = 0; i < bytes.byteLength; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    weightDataStr = btoa(binary);
                }
                return {
                    modelTopology: artifacts.modelTopology,
                    weightSpecs: artifacts.weightSpecs,
                    weightDataStr: weightDataStr
                };
            };

            const bigPayload = {
                config: {
                    epochsBest: epochsBest, epochsOverfit: epochsOverfit
                }, models: {
                    clean: await exportSingleModel(modelsRef.current.clean),
                    best: await exportSingleModel(modelsRef.current.best),
                    overfit: await exportSingleModel(modelsRef.current.overfit)
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bigPayload));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "regressions_modell.json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

        } catch (err) {
            alert("Fehler beim Erstellen der Export-Datei");
            console.error(err);
        }
    };

    // Modelle importieren
    const loadModelsFromPC = async (event) => {
        const file = event.target.files[0];
        if (!file || !data) {
            alert("Bitte stelle sicher, dass zuerst ein Datensatz generiert oder importiert wurde.");
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async (e) => {
            try {
                setIsTraining(true);
                setResults(null); // Alte Diagramme sofort leeren

                const payload = JSON.parse(e.target.result);

                if (!payload.models || !payload.models.clean || !payload.models.best || !payload.models.overfit) {
                    alert("Ungültige Modelldatei. Es müssen alle 3 Modelle enthalten sein.");
                    setIsTraining(false);
                    return;
                }

                // EINGABEWERTE SOFORT AKTUALISIEREN (Verhindert Blockaden)
                if (payload.config) {
                    const b = parseInt(payload.config.epochsBest, 10);
                    const o = parseInt(payload.config.epochsOverfit, 10);
                    if (!isNaN(b)) setEpochsBest(b);
                    if (!isNaN(o)) setEpochsOverfit(o);
                }

                const importSingleModel = async (modelData) => {
                    const binaryStr = atob(modelData.weightDataStr);
                    const bytes = new Uint8Array(binaryStr.length);
                    for (let i = 0; i < binaryStr.length; i++) {
                        bytes[i] = binaryStr.charCodeAt(i);
                    }
                    const artifacts = {
                        modelTopology: modelData.modelTopology,
                        weightSpecs: modelData.weightSpecs,
                        weightData: bytes.buffer
                    };
                    return await tf.loadLayersModel(tf.io.fromMemory(artifacts));
                };

                const modelClean = await importSingleModel(payload.models.clean);
                const modelBest = await importSingleModel(payload.models.best);
                const modelOverfit = await importSingleModel(payload.models.overfit);

                modelsRef.current = {clean: modelClean, best: modelBest, overfit: modelOverfit};

                const evalLoss = (model, currentData, useCleanY = false) => {
                    const xArr = currentData.map(d => d.x);
                    const yArr = currentData.map(d => useCleanY ? d.y : d.yNoisy);
                    const nIn = tf.tensor2d(xArr.map(x => (x - xMin) / (xMax - xMin)), [currentData.length, 1]);
                    const nLab = tf.tensor2d(yArr, [currentData.length, 1]);
                    const res = model.evaluate(nIn, nLab).dataSync()[0];
                    tf.dispose([nIn, nLab]);
                    return res;
                };

                const cleanRes = {
                    trainLoss: evalLoss(modelClean, data.train, true),
                    testLoss: evalLoss(modelClean, data.test, true),
                    curvePoints: generateSmoothCurve(modelClean)
                };
                const bestRes = {
                    trainLoss: evalLoss(modelBest, data.train, false),
                    testLoss: evalLoss(modelBest, data.test, false),
                    curvePoints: generateSmoothCurve(modelBest)
                };
                const overfitRes = {
                    trainLoss: evalLoss(modelOverfit, data.train, false),
                    testLoss: evalLoss(modelOverfit, data.test, false),
                    curvePoints: generateSmoothCurve(modelOverfit)
                };

                setResults({cleanRes, bestRes, overfitRes});
                setIsTraining(false);
                event.target.value = "";
            } catch (err) {
                alert("Fehler beim Einlesen der Modelldatei");
                console.error(err);
                setIsTraining(false);
                event.target.value = "";
            }
        };
        fileReader.readAsText(file);
    };

    // Charts verwalten und aufräumen
    useEffect(() => {
        if (!data) return;
        const options = {
            xLabel: 'X', yLabel: 'Y', height: 240, zoomToFit: true, connectedLines: true
        };

        // Für eine korrekte visuelle Darstellung sortieren wir die Punkte temporär nach X
        const sortedTrainClean = [...data.train].sort((a, b) => a.x - b.x);
        const sortedTestClean = [...data.test].sort((a, b) => a.x - b.x);

        r1LeftRef.current.innerHTML = '';
        tfvis.render.scatterplot(r1LeftRef.current, {
            values: [sortedTrainClean.map(d => ({x: d.x, y: d.y})), sortedTestClean.map(d => ({x: d.x, y: d.y}))],
            series: ["Trainingsdaten", "Testdaten"]
        }, options);

        r1RightRef.current.innerHTML = '';
        tfvis.render.scatterplot(r1RightRef.current, {
            values: [sortedTrainClean.map(d => ({x: d.x, y: d.yNoisy})), sortedTestClean.map(d => ({
                x: d.x, y: d.yNoisy
            }))], series: ["Trainingsdaten", "Testdaten"]
        }, options);

        if (results) {
            r2LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r2LeftRef.current, {
                values: [sortedTrainClean.map(d => ({x: d.x, y: d.y})), results.cleanRes.curvePoints],
                series: ["Trainingsdaten", "Modell-Vorhersage"]
            }, options);

            r2RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r2RightRef.current, {
                values: [sortedTestClean.map(d => ({x: d.x, y: d.y})), results.cleanRes.curvePoints],
                series: ["Testdaten", "Modell-Vorhersage"]
            }, options);

            r3LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r3LeftRef.current, {
                values: [sortedTrainClean.map(d => ({x: d.x, y: d.yNoisy})), results.bestRes.curvePoints],
                series: ["Trainingsdaten", "Modell-Vorhersage"]
            }, options);

            r3RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r3RightRef.current, {
                values: [sortedTestClean.map(d => ({x: d.x, y: d.yNoisy})), results.bestRes.curvePoints],
                series: ["Testdaten", "Modell-Vorhersage"]
            }, options);

            r4LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r4LeftRef.current, {
                values: [sortedTrainClean.map(d => ({x: d.x, y: d.yNoisy})), results.overfitRes.curvePoints],
                series: ["Trainingsdaten", "Modell-Vorhersage"]
            }, options);

            r4RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r4RightRef.current, {
                values: [sortedTestClean.map(d => ({x: d.x, y: d.yNoisy})), results.overfitRes.curvePoints],
                series: ["Testdaten", "Modell-Vorhersage"]
            }, options);
        } else {
            if (r2LeftRef.current) r2LeftRef.current.innerHTML = '';
            if (r2RightRef.current) r2RightRef.current.innerHTML = '';
            if (r3LeftRef.current) r3LeftRef.current.innerHTML = '';
            if (r3RightRef.current) r3RightRef.current.innerHTML = '';
            if (r4LeftRef.current) r4LeftRef.current.innerHTML = '';
            if (r4RightRef.current) r4RightRef.current.innerHTML = '';
        }
    }, [data, results]);

    // Run
    const run = async () => {
        if (!data) return;
        setIsTraining(true);
        setResults(null); // Alte Diagramme sofort löschen bei Trainingsstart

        const cleanPack = await trainModel(data.train, data.test, 50, batchSize, true);
        const bestPack = await trainModel(data.train, data.test, epochsBest, batchSize, false);
        const overfitPack = await trainModel(data.train, data.test, epochsOverfit, batchSize, false);

        modelsRef.current = {
            clean: cleanPack.model, best: bestPack.model, overfit: overfitPack.model
        };

        setResults({
            cleanRes: cleanPack, bestRes: bestPack, overfitRes: overfitPack
        });

        tfvis.render.linechart(lossChartRef.current, {
            values: [cleanPack.history.trainLoss.map((y, x) => ({x, y})), bestPack.history.trainLoss.map((y, x) => ({
                x,
                y
            })), overfitPack.history.trainLoss.map((y, x) => ({x, y}))], series: ["Clean", "Best-Fit", "Overfit"]
        }, {
            xLabel: "Epoch", yLabel: "Loss", height: 300
        });

        setIsTraining(false);
    };

    return (<div className="container py-5 mb-5">
            <header className="mb-5">
                <h1 className="display-4 fw-bold dashboard-title mb-4">Regression</h1>
                <p className="lead dashboard-subtitle mb-3">
                    Interaktive Anwendung zur Regressionsanalyse mit neuronalen Netzen. Generiere eigene Datensätze mit
                    oder ohne Rauschen, passe Modellparameter flexibel an und trainiere verschiedene Modelle vom
                    Idealszenario bis zur Überanpassung im direkten Vergleich. Nutze die Export- und Importfunktionen,
                    um Datensätze sowie trainierte Modelle jederzeit zu speichern, zu laden und auf neuen Testdaten zu
                    prüfen.
                </p>
            </header>

            {/* Obere Kontrollbar */}
            <div className="mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
                {/* Datensatz Buttons */}
                <div className="d-flex flex-wrap gap-2">
                    <button
                        className="btn btn-sm btn-primary-inverse ms-2"
                        onClick={saveDataset}
                        disabled={!data || isTraining}
                    >
                        <span className="btn-icon">↓</span> Daten exportieren
                    </button>
                    <label className={`btn btn-sm btn-primary-inverse m-0 ${isTraining ? 'disabled' : ''}`}>
                        <span className="btn-icon">↑</span> Daten importieren
                        <input
                            type="file"
                            accept=".json"
                            onChange={loadDataset}
                            className="file-input-hidden"
                            disabled={isTraining}
                        />
                    </label>
                </div>

                {/* Modell Buttons */}
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-secondary-inverse fw-bold"
                        onClick={saveModelsLocally}
                        disabled={!results || isTraining}
                    >
                        <span className="btn-icon">↑</span> Modelle exportieren
                    </button>
                    <label
                        className={`btn btn-sm btn-secondary-inverse fw-bold m-0 px-3 ${isTraining || !data ? 'disabled' : ''}`}>
                        <span className="btn-icon">↓</span> Modelle importieren
                        <input
                            type="file"
                            accept=".json"
                            onChange={loadModelsFromPC}
                            className="file-input-hidden"
                            disabled={isTraining || !data}
                        />
                    </label>
                </div>
            </div>

            {/* Cards für Parameter Einstellungen */}
            <div className="card border-0 shadow-sm mb-5 epoch-card p-4">
                <h3 className="h5 fw-bold mb-4 epoch-card-label text-start"
                    style={{color: 'var(--dashboard-title-color, #fff)'}}>
                    Parameter einstellen
                </h3>
                <div className="row g-3">
                    <div className="col-md-3">
                        <div className="text-start">
                            <label className="form-label small epoch-card-label d-block mb-2">Daten-Paare (N)</label>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center epoch-input"
                                value={numSamples}
                                onChange={(e) => setNumSamples(Number(e.target.value) || 0)}
                                disabled={isTraining}
                                placeholder="N"
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-start">
                            <label className="form-label small epoch-card-label d-block mb-2">Batch-Size</label>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center epoch-input"
                                value={batchSize}
                                onChange={(e) => setBatchSize(Number(e.target.value) || 0)}
                                disabled={isTraining}
                                placeholder="Batch Size"
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-start">
                            <label className="form-label small epoch-card-label d-block mb-2">Epochen (Best-Fit)</label>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center epoch-input"
                                value={epochsBest}
                                onChange={(e) => setEpochsBest(Number(e.target.value) || 0)}
                                disabled={isTraining}
                                placeholder="Best Epochs"
                            />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="text-start">
                            <label className="form-label small epoch-card-label d-block mb-2">Epochen (Overfit)</label>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center epoch-input"
                                value={epochsOverfit}
                                onChange={(e) => setEpochsOverfit(Number(e.target.value) || 0)}
                                disabled={isTraining}
                                placeholder="Overfit Epochs"
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center mt-4">
                    <button
                        className="btn btn-sm btn-custom-inverse px-4"
                        onClick={handleNewData}
                        disabled={isTraining}
                    >
                        Anwenden & Daten generieren
                    </button>
                </div>
            </div>
            {/* Zentrierter Start-Button-Bereich */}
            <div className="d-flex justify-content-center mb-5 text-center start-action-area">
                <button
                    className={`btn fw-bold px-5 py-2 btn-cta ${isTraining ? 'training-active' : ''}`}
                    onClick={run}
                    disabled={isTraining || !data}
                >
                    {isTraining ? 'Training läuft...' : 'Start (alle Modelle trainieren)'}
                </button>
            </div>
            {/* Graphen-Bereich */}
            <div className="d-flex flex-column gap-5">
                <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                    <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">Datenbasis</h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Zielfunktion (Ground-Truth)</span>
                            <div ref={r1LeftRef}></div>
                            <div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                        <span
                            className="d-block small fw-bold mb-1 text-start chart-axis-title">Daten (mit Rauschen)</span>
                            <div ref={r1RightRef}></div>
                            <div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                    <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                        Idealszenario ohne Rauschen (Clean-Modell)
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Modellverlauf auf sauberen Trainingsdaten</span>
                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Warte auf Training...'}</div>}
                            <div ref={r2LeftRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = 50</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Train
                                MSE: {results.cleanRes.trainLoss.toFixed(5)}</div>}
                        </div>
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Überprüfung auf sauberen Testdaten</span>
                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Warte auf Training...'}</div>}
                            <div ref={r2RightRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = 50</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Test
                                MSE: {results.cleanRes.testLoss.toFixed(5)}</div>}
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                    <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                        Realszenario mit Rauschen (Best-Fit-Modell)
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Trainingsdaten (mit Rauschen)</span>
                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Warte auf Training...'}</div>}
                            <div ref={r3LeftRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = {epochsBest}</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Train
                                MSE: {results.bestRes.trainLoss.toFixed(5)}</div>}
                        </div>
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Testdaten (mit Rauschen)</span>
                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Warte auf Training...'}</div>}
                            <div ref={r3RightRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = {epochsBest}</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Test
                                MSE: {results.bestRes.testLoss.toFixed(5)}</div>}
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm card-border-danger">
                    <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                        Überanpassung mit Rauschen (Over-Fit-Modell)
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Trainingsdaten (mit Rauschen)</span>
                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung...'}</div>}
                            <div ref={r4LeftRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = {epochsOverfit}</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Train
                                MSE: {results.overfitRes.trainLoss.toFixed(5)}</div>}
                        </div>
                        <div className="col-md-6 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Testdaten (mit Rauschen)</span>

                            {!results && <div
                                className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Warte auf Training...'}</div>}
                            <div ref={r4RightRef} className={results ? "d-block" : "d-none"}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                <div>N = {numSamples}</div>
                                <div>Batch Size = {batchSize}</div>
                                <div>Epochen = {epochsOverfit}</div>
                            </div>)}
                            {results && <div className="mt-2 small fw-bold text-start">Test
                                MSE: {results.overfitRes.testLoss.toFixed(5)}</div>}
                        </div>
                    </div>
                </div>
                {/* Trainingsverlauf (Loss-Kurve) */}
                <div
                    className={`p-4 border rounded-4 dashboard-chart-card shadow-sm ${results ? 'd-block' : 'd-none'}`}>
                    <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                        Trainingsverlauf (Loss-Historie)
                    </h4>
                    <div className="row">
                        <div className="col-12 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">
                                Fehlerminimierung (MSE) über alle Epochen im Vergleich
                            </span>
                            <div ref={lossChartRef} className="d-block w-100" style={{minHeight: '340px'}}></div>
                            {results && (<div className="text-start small opacity-75 mb-2">
                                    <div className="d-flex flex-wrap gap-4">
                                        <div>N = {numSamples}</div>
                                        <div>Batch-Size = {batchSize}</div>
                                        <div>Epochen (Clean) = 50</div>
                                        <div>Epochen (Best-Fit) = {epochsBest}</div>
                                        <div>Epochen (Overfit) = {epochsOverfit}</div>
                                    </div>
                                </div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>);
}