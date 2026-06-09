import {useState, useEffect, useRef} from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

// Mathematische Ziel-Funktion laut Aufgabenstellung
const targetFunction = (x) => 0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;

// Gaußsches Rauschen mittels Box-Muller-Transformation (Varianz = 0,05)
const gaussianNoise = (variance = 0.05) => {
    const std = Math.sqrt(variance);
    const u1 = 1 - Math.random();
    const u2 = 1 - Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * std;
};

// Generiert Datensatz mit rauschfreien und verrauschten y-Werten (Label-Rauschen))
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

// Teilt Daten in Training (50%) und Test (50%)
const splitData = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);

    const half = data.length / 2;

    return {
        train: shuffled.slice(0, half), test: shuffled.slice(half)
    };
};

export default function Regression() {
    // DOM-Referenzen für tfvis-Diagramme
    const r1LeftRef = useRef(null);
    const r1RightRef = useRef(null);
    const r2LeftRef = useRef(null);
    const r2RightRef = useRef(null);
    const r3LeftRef = useRef(null);
    const r3RightRef = useRef(null);
    const r4LeftRef = useRef(null);
    const r4RightRef = useRef(null);

    // Loss-Kurven
    const lossChartRef = useRef(null);
    const testLossChartRef = useRef(null);

    const [data, setData] = useState(null);
    const [results, setResults] = useState(null);
    const [isTraining, setIsTraining] = useState(false);

    //Import & Export: Daten & Modelle
    const [importStatus, setImportStatus] = useState("");
    const [modelImportStatus, setModelImportStatus] = useState("");

    // Trainings-Parameter (Epochen, Anzahl Datenpunkte und BatchSitze)
    const [numSamples, setNumSamples] = useState(150);
    const [batchSize, setBatchSize] = useState(32);
    const [epochsClean, setEpochsClean] = useState(150);
    const [epochsBest, setEpochsBest] = useState(500);
    const [epochsOverfit, setEpochsOverfit] = useState(4000);

    // N muss für die 50/50-Aufteilung gerade sein
    const isInvalidN = numSamples < 2 || numSamples % 2 !== 0;
    const [numSamplesError, setNumSamplesError] = useState("");

    // Referenzen auf RAM-Modelle für Export, verhindert Re-Rendering (nicht Teil des UI-States)
    const modelsRef = useRef({clean: null, best: null, overfit: null});

    // Feste mathematische Normalisierungsgrenzen für X basierend auf dem Definitionsbereich [-2, 2]
    const xMin = -2.0;
    const xMax = 2.0;

    const handleNewData = () => {

        // Status bereinigen
        setImportStatus("");
        setModelImportStatus("");
        const n = Number(numSamples);

        // Validierung
        if (isInvalidN) {
            setNumSamplesError("N muss eine gerade Zahl ab 2 sein");
            return;
        }

        setNumSamplesError("");
        setData(splitData(generateData(n)));
        setResults(null);
        modelsRef.current = {clean: null, best: null, overfit: null};
    };

// Erzeugen eines neuen Datensatzes beim Start
    useEffect(() => {
        handleNewData();
    }, []);


// Exportiert aktuellen Datensatz als JSON
    const saveDataset = () => {
        if (!data) return;

        // Erstellt ein Daten-Objekt inkl. aller Parameter
        const exportObject = {
            train: data.train, test: data.test, config: {
                n: numSamples,
                batchSize: batchSize,
                epochsClean: epochsClean,
                epochsBest: epochsBest,
                epochsOverfit: epochsOverfit
            }
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "regressions_datensatz.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

// Lädt Datensatz (JSON) und stellt Parameter wieder her
    const loadDataset = (event) => {
        // Status komplett zurücksetzen
        setImportStatus("");
        setModelImportStatus("");

        const file = event.target.files[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target.result);

                // Prüft, ob die Basiskriterien (train/test) erfüllt sind
                if (parsed.train && parsed.test) {
                    //Daten in den State
                    setData({train: parsed.train, test: parsed.test});

                    // Parameter aus der Config wiederherstellen
                    if (parsed.config) {
                        if (parsed.config.n !== undefined) setNumSamples(parsed.config.n);
                        if (parsed.config.batchSize !== undefined) setBatchSize(parsed.config.batchSize);
                        if (parsed.config.epochsClean !== undefined) setEpochsClean(parsed.config.epochsClean);
                        if (parsed.config.epochsBest !== undefined) setEpochsBest(parsed.config.epochsBest);
                        if (parsed.config.epochsOverfit !== undefined) setEpochsOverfit(parsed.config.epochsOverfit);
                    }

                    //Zustand zurücksetzen
                    modelsRef.current = {clean: null, best: null, overfit: null};
                    setResults(null);

                    setImportStatus("Datensatz & Parameter erfolgreich geladen!");
                    setTimeout(() => setImportStatus(""), 3000);

                } else {
                    throw new Error("Ungültiges Format");
                }
            } catch (err) {
                console.error(err);
                setImportStatus("Fehler: Datei konnte nicht geladen werden!");
            }
        };
        fileReader.readAsText(file);
        event.target.value = ""; // Ermöglicht das erneute Laden derselben Datei
    };

    // Erstellen der Modell-Architektur, nach tf.loadLayersModel neu kompilieren (für evaluate & Training nötig)
    const createModel = () => {
        const model = tf.sequential(); // Eingabe fliesst direkt in Ausgabe
        model.add(tf.layers.dense({inputShape: [1], units: 128, activation: "relu"}));  // Input Layer + 1. Hidden Layer (128 Neuronen, ReLU)
        model.add(tf.layers.dense({units: 64, activation: "relu"})); // 2. Hidden Layer (64 Neuronen, ReLU)
        model.add(tf.layers.dense({units: 1})); // Output Layer (1 Neuron, linear)
        model.compile({
            optimizer: tf.train.adam(0.01), // Adam-Optimizer und Learning Rate 0.01 laut Aufgabenstellung
            loss: "meanSquaredError"
        });

        return model;
    };

// Erzeugt X-Y Punkte basierend auf Modellvorhersagen für eine glatte Kurve
    const generateSmoothCurve = (model) => {
        const size = 200;
        const xValues = [];
        for (let i = 0; i < size; i++) {
            xValues.push(xMin + (i / (size - 1)) * (xMax - xMin));
        }

        // Input-Normalisierung auf [0, 1] für das Modell
        const normXInputs = xValues.map(x => (x - xMin) / (xMax - xMin));
        const inputTensor = tf.tensor2d(normXInputs, [size, 1]);

        // Vorhersage generieren
        const predTensor = model.predict(inputTensor);
        const outputs = Array.from(predTensor.dataSync());

        // x sind die echten Werte [-2, 2], y sind die korrekten Vorhersagen
        const points = xValues.map((x, i) => ({
            x: x, y: outputs[i]
        }));

        tf.dispose([inputTensor, predTensor]);
        return points;
    };

    // Training mit Loss-Kurve
    const trainModel = async (train, test, epochs, batchSize, useCleanY = false) => {
        const model = createModel();

        //Datenvorbereitung
        const xTrainArr = train.map(d => d.x);
        const yTrainArr = useCleanY ? train.map(d => d.y) : train.map(d => d.yNoisy);
        const xTestArr = test.map(d => d.x);
        const yTestArr = useCleanY ? test.map(d => d.y) : test.map(d => d.yNoisy);

        // Min-Max-Normalisierung auf [0,1] um stabiler und schneller zu trainieren
        const normXTrain = tf.tensor2d(xTrainArr.map(x => (x - xMin) / (xMax - xMin)), [train.length, 1]);
        const yTrainTensor = tf.tensor2d(yTrainArr, [train.length, 1]);
        const normXTest = tf.tensor2d(xTestArr.map(x => (x - xMin) / (xMax - xMin)), [test.length, 1]);
        const yTestTensor = tf.tensor2d(yTestArr, [test.length, 1]);

        //Training
        let fitResult;
        try {
            fitResult = await model.fit(normXTrain, yTrainTensor, {
                epochs, batchSize, shuffle: true, validationData: [normXTest, yTestTensor]
            });
        } catch (err) {
            console.error("Training fehlgeschlagen:", err);
            return null; // Abbruch, wenn Training scheitert
        }

        // Loss-Extraktion
        const history = fitResult?.history || {};
        const lossArr = Array.isArray(history.loss) ? history.loss : [];
        const valLossArr = Array.isArray(history.val_loss) ? history.val_loss : [];

        console.log("Trainings-History erhalten:", {lossArr, valLossArr});

        const finalTrainLoss = lossArr.length > 0 ? lossArr[lossArr.length - 1] : 0;
        const finalTestLoss = valLossArr.length > 0 ? valLossArr[valLossArr.length - 1] : 0;

        const curvePoints = generateSmoothCurve(model);
        tf.dispose([normXTrain, yTrainTensor, normXTest, yTestTensor]);

        return {
            model, trainLoss: finalTrainLoss, testLoss: finalTestLoss, curvePoints, history: {
                trainLoss: lossArr, testLoss: valLossArr
            }
        };
    };

    // Exportiert Modelle als Base64-kodierte Blobs in JSON-Datei
    const saveModels = async () => {
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
                    n: numSamples,
                    batchSize: batchSize,
                    epochsClean: epochsClean,
                    epochsBest: epochsBest,
                    epochsOverfit: epochsOverfit
                }, models: {
                    clean: await exportSingleModel(modelsRef.current.clean),
                    best: await exportSingleModel(modelsRef.current.best),
                    overfit: await exportSingleModel(modelsRef.current.overfit)
                }, history: {
                    clean: results.cleanRes.history, best: results.bestRes.history, overfit: results.overfitRes.history
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
    const loadModels = async (event) => {
        const file = event.target.files[0];

        // Status zurücksetzen
        setImportStatus("");
        setModelImportStatus("");

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
                console.log("Payload:", payload);

                if (!payload.models || !payload.models.clean || !payload.models.best || !payload.models.overfit) {
                    throw new Error("Ungültiges Format der Modelldatei.");
                }

                // Parameter aktualisieren
                if (payload.config) {
                    setNumSamples(payload.config.n);
                    setBatchSize(payload.config.batchSize);
                    setEpochsClean(payload.config.epochsClean);
                    setEpochsBest(payload.config.epochsBest);
                    setEpochsOverfit(payload.config.epochsOverfit);
                }

                // Hilfsfunktion zum Dekodieren
                const importSingleModel = async (modelData) => {
                    try {
                        const binaryStr = atob(modelData.weightDataStr);
                        const len = binaryStr.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryStr.charCodeAt(i);
                        }
                        const artifacts = {
                            modelTopology: modelData.modelTopology,
                            weightSpecs: modelData.weightSpecs,
                            weightData: bytes.buffer
                        };

                        // Modell laden
                        const model = await tf.loadLayersModel(tf.io.fromMemory(artifacts));

                        // Modell hier kompilieren, damit .evaluate() funktioniert
                        model.compile({
                            optimizer: tf.train.adam(0.01), loss: "meanSquaredError"
                        });

                        return model;

                    } catch (e) {
                        console.error("Fehler beim Laden:", e);
                        throw e; // Fehler weiterwerfen, damit der catch-Block in loadModels ihn fängt
                    }
                };

                // Modelle laden
                const modelClean = await importSingleModel(payload.models.clean);
                const modelBest = await importSingleModel(payload.models.best);
                const modelOverfit = await importSingleModel(payload.models.overfit);

                modelsRef.current = {clean: modelClean, best: modelBest, overfit: modelOverfit};

                // Ergebnisse evaluieren
                const evalLoss = (model, currentData, useCleanY = false) => {
                    const xArr = currentData.map(d => d.x);
                    const yArr = currentData.map(d => useCleanY ? d.y : d.yNoisy);
                    const nIn = tf.tensor2d(xArr.map(x => (x - xMin) / (xMax - xMin)), [currentData.length, 1]);
                    const nLab = tf.tensor2d(yArr, [currentData.length, 1]);
                    const res = model.evaluate(nIn, nLab).dataSync()[0];
                    tf.dispose([nIn, nLab]);
                    return res;
                };

                setResults({
                    cleanRes: {
                        trainLoss: evalLoss(modelClean, data.train, true),
                        testLoss: evalLoss(modelClean, data.test, true),
                        curvePoints: generateSmoothCurve(modelClean),
                        history: payload.history?.clean ?? {
                            trainLoss: [], testLoss: []
                        }
                    }, bestRes: {
                        trainLoss: evalLoss(modelBest, data.train, false),
                        testLoss: evalLoss(modelBest, data.test, false),
                        curvePoints: generateSmoothCurve(modelBest),
                        history: payload.history?.best ?? {
                            trainLoss: [], testLoss: []
                        }
                    }, overfitRes: {
                        trainLoss: evalLoss(modelOverfit, data.train, false),
                        testLoss: evalLoss(modelOverfit, data.test, false),
                        curvePoints: generateSmoothCurve(modelOverfit),
                        history: payload.history?.overfit ?? {
                            trainLoss: [], testLoss: []
                        }
                    }
                });

                // Erfolgsmeldung für die Status-Box
                setModelImportStatus("Modelle & Parameter erfolgreich geladen!");
                setTimeout(() => setModelImportStatus(""), 3000);

                setIsTraining(false);

            } catch (err) {
                console.error(err);
                setImportStatus("");
                setModelImportStatus("Fehler: Modell-Import fehlgeschlagen!");
                setIsTraining(false);
            }
            event.target.value = "";
        };
        fileReader.readAsText(file);
    };

    // Diagramm-Visualisierung mittels tfvis
    useEffect(() => {
        if (!data) return;

        // Alle DOM-Referenzen leeren
        const allRefs = [r1LeftRef, r1RightRef, r2LeftRef, r2RightRef, r3LeftRef, r3RightRef, r4LeftRef, r4RightRef, lossChartRef, testLossChartRef];
        allRefs.forEach(ref => {
            if (ref.current) ref.current.innerHTML = '';
        });

        const scatterOpts = {xLabel: 'X-Wert', yLabel: 'Y-Wert', height: 240, zoomToFit: true};
        const lossOpts = {xLabel: 'Epoche', height: 300};

        // Daten für Scatterplots sortieren
        const sortedTrain = [...data.train].sort((a, b) => a.x - b.x);
        const sortedTest = [...data.test].sort((a, b) => a.x - b.x);

        const mapS = (arr, key) => arr.map(d => ({x: d.x, y: d[key]}));
        const mapL = (arr) => Array.isArray(arr) ? arr.map((v, i) => ({x: i, y: v || 0})) // Ersetzt undefinierte Werte durch 0
            : [];

        // Basis-Plots rendern
        if (r1LeftRef.current) tfvis.render.scatterplot(r1LeftRef.current, {
            values: [mapS(sortedTrain, 'y'), mapS(sortedTest, 'y')], series: ["Train", "Test"]
        }, scatterOpts);
        if (r1RightRef.current) tfvis.render.scatterplot(r1RightRef.current, {
            values: [mapS(sortedTrain, 'yNoisy'), mapS(sortedTest, 'yNoisy')], series: ["Train", "Test"]
        }, scatterOpts);

        // Modell-Plots bei Vorhandensein rendern
        if (results?.cleanRes && results?.bestRes && results?.overfitRes) {

            const models = [{ref: r2LeftRef, refRight: r2RightRef, res: results.cleanRes}, {
                ref: r3LeftRef, refRight: r3RightRef, res: results.bestRes
            }, {ref: r4LeftRef, refRight: r4RightRef, res: results.overfitRes}];

            models.forEach(({ref, refRight, res}) => {
                if (ref.current && refRight.current && res.curvePoints) {
                    tfvis.render.scatterplot(ref.current, {
                        values: [mapS(sortedTrain, 'yNoisy'), res.curvePoints], series: ["Daten", "Modell"]
                    }, scatterOpts);
                    tfvis.render.scatterplot(refRight.current, {
                        values: [mapS(sortedTest, 'yNoisy'), res.curvePoints], series: ["Daten", "Modell"]
                    }, scatterOpts);
                }
            });

            // Loss-Plots rendern
            if (lossChartRef.current && testLossChartRef.current) {
                // Train Loss
                tfvis.render.linechart(lossChartRef.current, {
                    values: [mapL(results.cleanRes.history?.trainLoss), mapL(results.bestRes.history?.trainLoss), mapL(results.overfitRes.history?.trainLoss)],
                    series: ["Clean", "Best-Fit", "Over-Fit"]
                }, {...lossOpts, yLabel: 'Train Loss (MSE)'});

                // Test Loss
                tfvis.render.linechart(testLossChartRef.current, {
                    values: [mapL(results.cleanRes.history?.testLoss), mapL(results.bestRes.history?.testLoss), mapL(results.overfitRes.history?.testLoss)],
                    series: ["Clean", "Best-Fit", "Over-Fit"]
                }, {...lossOpts, yLabel: 'Test Loss (MSE)'});
            }
        }
    }, [data, results]);

    // Neus Training starten
    const run = async () => {
        if (!data) return;

        // Status bereinigen, bevor das Training beginnt
        setImportStatus("");
        setModelImportStatus("");

        setIsTraining(true);
        setResults(null); // Alte Diagramme sofort löschen bei Trainingsstart

        // Trainiert die drei geforderten Szenarien
        const cleanPack = await trainModel(data.train, data.test, epochsClean, batchSize, true); // Clean = ideale Daten ohne Rauschen
        const bestPack = await trainModel(data.train, data.test, epochsBest, batchSize, false); // Best-Fit = realistische Training mit Rauschen
        const overfitPack = await trainModel(data.train, data.test, epochsOverfit, batchSize, false); // Over-Fit= absichtlich übertrainiertes Modell mit Rauschen

        modelsRef.current = {
            clean: cleanPack.model, best: bestPack.model, overfit: overfitPack.model
        };

        setResults({
            cleanRes: cleanPack, bestRes: bestPack, overfitRes: overfitPack
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
                    onClick={saveModels}
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
                        onChange={loadModels}
                        className="file-input-hidden"
                        disabled={isTraining || !data}
                    />
                </label>
            </div>
            {/* Status-Boxen */}
            {importStatus && (<div
                className={`status-box ${importStatus.toLowerCase().includes("fehler") ? "status-error" : "status-success"}`}>
                {importStatus}
            </div>)}
            {modelImportStatus && (<div
                className={`status-box ${modelImportStatus.toLowerCase().includes("fehler") ? "status-error" : "status-success"}`}>
                {modelImportStatus}
            </div>)}
        </div>
        {/* Parameter Einstellungen */}
        <div className="card border-0 shadow-sm mb-5 epoch-card p-4">
            <h3 className="h5 fw-bold mb-4 epoch-card-label text-start">
                Parameter einstellen
            </h3>
            <div className="row g-3">
                <div className="col-md-3">
                    <div className="text-start">
                        <label className="form-label small epoch-card-label d-block mb-2">Daten-Paare (N)</label>
                        <input
                            type="number"
                            min="2"
                            step="2"
                            className={`form-control form-control-sm text-center epoch-input ${isInvalidN ? 'is-invalid' : ''}`}
                            value={numSamples}
                            onChange={(e) => setNumSamples(Number(e.target.value))}
                            disabled={isTraining}
                            placeholder="N"
                        />
                        {numSamplesError && (<div className="invalid-feedback d-block small mt-1">
                            {numSamplesError}
                        </div>)}
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="text-start">
                        <label className="form-label small epoch-card-label d-block mb-2">Batch-Size</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm text-center epoch-input"
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value) || 0)}
                            disabled={isTraining}
                            placeholder="Batch Size"
                        />
                    </div>
                </div>
            </div>
            {/* Epochen */}
            <div className="row g-3 mt-2">
                <div className="col-12">
                    <label className="form-label small epoch-card-label d-block mb-0 fw-bold">Epochen:</label>
                </div>
                <div className="col-md-3">
                    <div className="text-start">
                        <label className="form-label small epoch-card-label d-block mb-1">Clean</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm text-center epoch-input"
                            value={epochsClean}
                            onChange={(e) => setEpochsClean(Number(e.target.value) || 0)}
                            disabled={isTraining}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="text-start">
                        <label className="form-label small epoch-card-label d-block mb-1">Best-Fit</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm text-center epoch-input"
                            value={epochsBest}
                            onChange={(e) => setEpochsBest(Number(e.target.value) || 0)}
                            disabled={isTraining}
                        />
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="text-start">
                        <label className="form-label small epoch-card-label d-block mb-1">Over-Fit</label>
                        <input
                            type="number"
                            min="1"
                            className="form-control form-control-sm text-center epoch-input"
                            value={epochsOverfit}
                            onChange={(e) => setEpochsOverfit(Number(e.target.value) || 0)}
                            disabled={isTraining}
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
        {/* Start-Button */}
        <div className="d-flex justify-content-center mb-5 text-center start-action-area">
            <button
                className={`btn fw-bold px-5 py-2 btn-cta ${isTraining ? 'training-active' : ''}`}
                onClick={run}
                disabled={isTraining || !data || isInvalidN}
            >
                {isTraining ? 'Training läuft...' : 'Start (alle Modelle trainieren)'}
            </button>
        </div>
        {/* Graphen-Bereich */}
        <div className="d-flex flex-column gap-5">
            {/* Datenbasis */}
            <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">Datenbasis</h4>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Daten ohne Rauschen (Ground-Truth)</span>
                        <div ref={r1LeftRef}></div>
                        <div className="text-start small opacity-75 mb-2">
                            <div>N = {numSamples}</div>
                        </div>
                    </div>
                    <div className="col-md-6 mb-3">
                        <span
                            className="d-block small fw-bold mb-1 text-start chart-axis-title">Daten mit Rauschen</span>
                        <div ref={r1RightRef}></div>
                        <div className="text-start small opacity-75 mb-2">
                            <div>N = {numSamples}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Clean-Modell */}
            <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                    Idealszenario ohne Rauschen (Clean-Modell)
                </h4>
                <div className="row">
                    <div className="col-md-6 mb-3 text-center">
                        <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Trainingsdaten (ohne Rauschen)</span>
                        {!results && <div
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
                        <div ref={r2LeftRef} className={results ? "d-block" : "d-none"}></div>
                        {results && (<div className="text-start small opacity-75 mb-2">
                            <div>N = {numSamples}</div>
                            <div>Batch Size = {batchSize}</div>
                            <div>Epochen = {epochsClean}</div>
                        </div>)}
                        {results && <div className="mt-2 small fw-bold text-start">Train
                            MSE: {results.cleanRes.trainLoss.toFixed(5)}</div>}
                    </div>
                    <div className="col-md-6 mb-3 text-center">
                        <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Testdaten (ohne Rauschen)</span>
                        {!results && <div
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
                        <div ref={r2RightRef} className={results ? "d-block" : "d-none"}></div>
                        {results && (<div className="text-start small opacity-75 mb-2">
                            <div>N = {numSamples}</div>
                            <div>Batch Size = {batchSize}</div>
                            <div>Epochen = {epochsClean}</div>
                        </div>)}
                        {results && <div className="mt-2 small fw-bold text-start">Test
                            MSE: {results.cleanRes.testLoss.toFixed(5)}</div>}
                    </div>
                </div>
            </div>
            {/* Best-Fit-Modell */}
            <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm">
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                    Realszenario mit Rauschen (Best-Fit-Modell)
                </h4>
                <div className="row">
                    <div className="col-md-6 mb-3 text-center">
                        <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Trainingsdaten (mit Rauschen)</span>
                        {!results && <div
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
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
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
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
            {/* Over-Fit-Modell */}
            <div className="p-4 border rounded-4 dashboard-chart-card shadow-sm card-border-danger">
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                    Überanpassung mit Rauschen (Over-Fit-Modell)
                </h4>
                <div className="row">
                    <div className="col-md-6 mb-3 text-center">
                        <span className="d-block small fw-bold mb-1 text-start chart-axis-title">Trainingsdaten (mit Rauschen)</span>
                        {!results && <div
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
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
                            className="py-5 small placeholder-text">{isTraining ? 'Training läuft...' : 'Training starten für Visualisierung'}</div>}
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
            {/* Training (Loss-Kurve) */}
            <div
                className={`p-4 border rounded-4 dashboard-chart-card shadow-sm ${results ? 'd-block' : 'd-none'}`}>
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                    Training (Loss-Historie)
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
                                <div>Epochen (Clean) = {epochsClean}</div>
                                <div>Epochen (Best-Fit) = {epochsBest}</div>
                                <div>Epochen (Overfit) = {epochsOverfit}</div>
                            </div>
                        </div>)}
                    </div>
                </div>
            </div>
            {/* Test (Loss-Kurve) */}
            <div
                className={`p-4 border rounded-4 dashboard-chart-card shadow-sm ${results ? 'd-block' : 'd-none'}`}>
                <h4 className="h5 fw-bold mb-4 chart-card-title pb-2">
                    Test (Loss-Historie)
                </h4>
                <div className="row">
                    <div className="col-12 mb-3 text-center">
                            <span className="d-block small fw-bold mb-1 text-start chart-axis-title">
                                Fehlerminimierung (MSE) über alle Epochen im Vergleich
                            </span>
                        <div ref={testLossChartRef} className="d-block w-100" style={{minHeight: '340px'}}></div>
                        {results && (<div className="text-start small opacity-75 mb-2">
                            <div className="d-flex flex-wrap gap-4">
                                <div>N = {numSamples}</div>
                                <div>Batch-Size = {batchSize}</div>
                                <div>Epochen (Clean) = {epochsClean}</div>
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