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
const generateData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 4 - 2;
        const y = targetFunction(x);
        data.push({x, y, yNoisy: y + gaussianNoise()});
    }
    return data;
};

// Aufteilung in 50 Trainings- und 50 Testdaten-Paare
const splitData = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return {
        train: shuffled.slice(0, 50),
        test: shuffled.slice(50),
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

    const [data, setData] = useState(null);
    const [results, setResults] = useState(null);
    const [isTraining, setIsTraining] = useState(false);
    const [hasSavedModel, setHasSavedModel] = useState(false);

    // Einstellbare Parameter für den eigenen Entwicklungszyklus
    const [epochsBest, setEpochsBest] = useState(80);
    const [epochsOverfit, setEpochsOverfit] = useState(800);

    // Referenzen auf die im RAM gehaltenen Modelle für den Export
    const modelsRef = useRef({clean: null, best: null, overfit: null});

// Erzeugen eines neuen Datensatzes beim Start
    const handleNewData = () => {
        setData(splitData(generateData()));
        setResults(null);
        modelsRef.current = {clean: null, best: null, overfit: null};
    };

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
                    setData(parsed);
                    setResults(null);
                    modelsRef.current = {clean: null, best: null, overfit: null};
                }
            } catch (err) {
                alert("Fehler beim Parsen der JSON-Datei");
            }
        };
        if (event.target.files[0]) fileReader.readAsText(event.target.files[0]);
    };

    // Erstellen der Modellarchitektur mit exakt 2 Hidden Layer laut Aufgabenstellung
    const createModel = () => {
        const model = tf.sequential(); // Eingabe fliesst direkt in Ausgabe
        // Input Layer + 1. Hidden Layer (100 Neuronen, ReLU)
        model.add(tf.layers.dense({inputShape: [1], units: 100, activation: "relu"}));
        // 2. Hidden Layer (100 Neuronen, ReLU)
        model.add(tf.layers.dense({units: 100, activation: 'relu'}));
// Output Layer (1 Neuron, linear)
        model.add(tf.layers.dense({units: 1, activation: 'linear'}));

        model.compile({
            optimizer: tf.train.adam(0.01), // Adam-Optimizer und Learning Rate 0.01 laut Aufgabenstellung
            loss: "meanSquaredError",
        });
        return model;
    };

// Generierung der mathematischen glatten Kurvenpunkte
    const generateSmoothCurve = (model, iMin, iMax, lMin, lMax) => {
        const size = 100;
        const tempX = tf.linspace(-2, 2, size).reshape([size, 1]);
        const normPredIn = tempX.sub(iMin).div(iMax.sub(iMin));
        const normPredOut = model.predict(normPredIn);
        const unnormPredY = normPredOut.mul(lMax.sub(lMin)).add(lMin);

        const points = Array.from(tempX.dataSync()).map((x, idx) => ({
            x, y: unnormPredY.dataSync()[idx]
        }));

        tf.dispose([tempX, normPredIn, normPredOut, unnormPredY]);
        return points;
    };

// Training Pipeline
    const trainModel = async (train, test, epochs, useNoisyTest = true) => {
        const model = createModel();

        const xsTrain = tf.tensor2d(train.map(d => d.x), [train.length, 1]);
        const ysTrain = tf.tensor2d(train.map(d => d.yNoisy), [train.length, 1]);
        const xsTest = tf.tensor2d(test.map(d => d.x), [test.length, 1]);
        const ysTest = tf.tensor2d(test.map(d => useNoisyTest ? d.yNoisy : d.y), [test.length, 1]);

        // Normalisierung (Min-Max-Scaling)
        const iMin = xsTrain.min(), iMax = xsTrain.max();
        const lMin = ysTrain.min(), lMax = ysTrain.max();

        const normIn = xsTrain.sub(iMin).div(iMax.sub(iMin));
        const normLab = ysTrain.sub(lMin).div(lMax.sub(lMin));

        // Trainieren mit Batch Size 32 laut Aufgabenstellung
        await model.fit(normIn, normLab, {
            epochs, batchSize: 32, shuffle: true, // Daten vor dem Trainieren mischen und Reihenfolge zufällig festlegen
        });

        // Fehlerwert/Loss nach dem Testen aus dem Modell herauslesen
        const trainLoss = model.evaluate(normIn, normLab).dataSync()[0];
        const normTestIn = xsTest.sub(iMin).div(iMax.sub(iMin));
        const normTestLab = ysTest.sub(lMin).div(lMax.sub(lMin));
        const testLoss = model.evaluate(normTestIn, normTestLab).dataSync()[0];

        const curvePoints = generateSmoothCurve(model, iMin, iMax, lMin, lMax);

        tf.dispose([xsTrain, ysTrain, xsTest, ysTest, normIn, normLab, normTestIn, normTestLab]);

        return {model, trainLoss, testLoss, curvePoints};
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
                    epochsBest: epochsBest,
                    epochsOverfit: epochsOverfit
                },
                models: {
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

                const xsTrain = tf.tensor2d(data.train.map(d => d.x), [data.train.length, 1]);
                const ysTrain = tf.tensor2d(data.train.map(d => d.yNoisy), [data.train.length, 1]);
                const xsTest = tf.tensor2d(data.test.map(d => d.x), [data.test.length, 1]);
                const iMin = xsTrain.min(), iMax = xsTrain.max();
                const lMin = ysTrain.min(), lMax = ysTrain.max();
                const ysTrainClean = tf.tensor2d(data.train.map(d => d.y), [data.train.length, 1]);
                const ysTestClean = tf.tensor2d(data.test.map(d => d.y), [data.test.length, 1]);
                const lMinClean = ysTrainClean.min(), lMaxClean = ysTrainClean.max();

                const evalLoss = (model, xs, ys, minI, maxI, minL, maxL) => {
                    const nIn = xs.sub(minI).div(maxI.sub(minI));
                    const nLab = ys.sub(minL).div(maxL.sub(minL));
                    const res = model.evaluate(nIn, nLab).dataSync()[0];
                    tf.dispose([nIn, nLab]);
                    return res;
                };

                const cleanRes = {
                    trainLoss: evalLoss(modelClean, xsTrain, ysTrainClean, iMin, iMax, lMinClean, lMaxClean),
                    testLoss: evalLoss(modelClean, xsTest, ysTestClean, iMin, iMax, lMinClean, lMaxClean),
                    curvePoints: generateSmoothCurve(modelClean, iMin, iMax, lMinClean, lMaxClean)
                };
                const bestRes = {
                    trainLoss: evalLoss(modelBest, xsTrain, ysTrain, iMin, iMax, lMin, lMax),
                    testLoss: evalLoss(modelBest, xsTest, tf.tensor2d(data.test.map(d => d.yNoisy), [data.test.length, 1]), iMin, iMax, lMin, lMax),
                    curvePoints: generateSmoothCurve(modelBest, iMin, iMax, lMin, lMax)
                };
                const overfitRes = {
                    trainLoss: evalLoss(modelOverfit, xsTrain, ysTrain, iMin, iMax, lMin, lMax),
                    testLoss: evalLoss(modelOverfit, xsTest, tf.tensor2d(data.test.map(d => d.yNoisy), [data.test.length, 1]), iMin, iMax, lMin, lMax),
                    curvePoints: generateSmoothCurve(modelOverfit, iMin, iMax, lMin, lMax)
                };

                setResults({cleanRes, bestRes, overfitRes});
                tf.dispose([xsTrain, ysTrain, xsTest, ysTestClean, ysTrainClean]);
                setIsTraining(false);
                event.target.value = "";
            } catch (err) {
                alert("Fehler beim Einlesen der Modelldatei.");
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
        const options = {xLabel: 'X', yLabel: 'Y', height: 240, zoomToFit: true};

        r1LeftRef.current.innerHTML = '';
        tfvis.render.scatterplot(r1LeftRef.current, {
            values: [data.train.map(d => ({x: d.x, y: d.y})), data.test.map(d => ({x: d.x, y: d.y}))],
            series: ["Trainingsdaten", "Testdaten"]
        }, options);

        r1RightRef.current.innerHTML = '';
        tfvis.render.scatterplot(r1RightRef.current, {
            values: [data.train.map(d => ({x: d.x, y: d.yNoisy})), data.test.map(d => ({x: d.x, y: d.yNoisy}))],
            series: ["Trainingsdaten", "Testdaten"]
        }, options);

        if (results) {
            r2LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r2LeftRef.current, {
                values: [data.train.map(d => ({x: d.x, y: d.y})), results.cleanRes.curvePoints],
                series: ["Trainingsdaten (Sauber)", "Modell-Vorhersage"]
            }, options);

            r2RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r2RightRef.current, {
                values: [data.test.map(d => ({x: d.x, y: d.y})), results.cleanRes.curvePoints],
                series: ["Testdaten (Sauber)", "Modell-Vorhersage"]
            }, options);

            r3LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r3LeftRef.current, {
                values: [data.train.map(d => ({x: d.x, y: d.yNoisy})), results.bestRes.curvePoints],
                series: ["Trainingsdaten (Verrauscht)", "Modell-Vorhersage"]
            }, options);

            r3RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r3RightRef.current, {
                values: [data.test.map(d => ({x: d.x, y: d.yNoisy})), results.bestRes.curvePoints],
                series: ["Testdaten (Verrauscht)", "Modell-Vorhersage"]
            }, options);

            r4LeftRef.current.innerHTML = '';
            tfvis.render.scatterplot(r4LeftRef.current, {
                values: [data.train.map(d => ({x: d.x, y: d.yNoisy})), results.overfitRes.curvePoints],
                series: ["Trainingsdaten (Verrauscht)", "Overfit-Vorhersage"]
            }, options);

            r4RightRef.current.innerHTML = '';
            tfvis.render.scatterplot(r4RightRef.current, {
                values: [data.test.map(d => ({x: d.x, y: d.yNoisy})), results.overfitRes.curvePoints],
                series: ["Testdaten (Verrauscht)", "Overfit-Vorhersage"]
            }, options);
        } else {
            // Wichtig: Wenn 'results' null wird, die DOM-Knoten der Modell-Charts gezielt leeren
            if (r2LeftRef.current) r2LeftRef.current.innerHTML = '';
            if (r2RightRef.current) r2RightRef.current.innerHTML = '';
            if (r3LeftRef.current) r3LeftRef.current.innerHTML = '';
            if (r3RightRef.current) r3RightRef.current.innerHTML = '';
            if (r4LeftRef.current) r4LeftRef.current.innerHTML = '';
            if (r4RightRef.current) r4RightRef.current.innerHTML = '';
        }
    }, [data, results]);

    const run = async () => {
        if (!data) return;
        setIsTraining(true);
        setResults(null); // Alte Diagramme sofort löschen bei Trainingsstart

        const cleanTrainData = data.train.map(d => ({x: d.x, yNoisy: d.y}));

        const cleanPack = await trainModel(cleanTrainData, data.test, 50, false);
        const bestPack = await trainModel(data.train, data.test, epochsBest);
        const overfitPack = await trainModel(data.train, data.test, epochsOverfit);

        modelsRef.current = {clean: cleanPack.model, best: bestPack.model, overfit: overfitPack.model};

        setResults({
            cleanRes: {
                trainLoss: cleanPack.trainLoss,
                testLoss: cleanPack.testLoss,
                curvePoints: cleanPack.curvePoints
            },
            bestRes: {trainLoss: bestPack.trainLoss, testLoss: bestPack.testLoss, curvePoints: bestPack.curvePoints},
            overfitRes: {
                trainLoss: overfitPack.trainLoss,
                testLoss: overfitPack.testLoss,
                curvePoints: overfitPack.curvePoints
            }
        });
        setIsTraining(false);
    };

    return (
        <div className="container py-5 mb-5">
            <header className="mb-5">
                <h1 className="display-4 fw-bold text-light mb-4">Regression</h1>
                <p className="lead text-secondary mb-3">
                    Interaktive Anwendung zur Regressionsanalyse mit neuronalen Netzen. Generiere eigene Datensätze mit
                    oder ohne Rauschen, passe Modellparameter flexibel an und trainiere verschiedene Modelle vom
                    Idealszenario bis zur Überanpassung im direkten Vergleich. Nutze die Export- und Importfunktionen,
                    um Datensätze sowie trainierte Modelle jederzeit zu speichern, zu laden und auf neuen Testdaten zu
                    prüfen.
                </p>
            </header>
    {/* Obere Kontrollbar  */}
            <div className="p-3 rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 btn-control-bar">
                {/* Datensatz Buttons */}
                <div className="d-flex flex-wrap gap-2">
                    <button
                        className="btn btn-sm btn-generate-data"
                        onClick={handleNewData}
                        disabled={isTraining}
                    >
                        Neue Daten generieren
                    </button>
                    <button
                        className="btn btn-sm btn-action-export ms-2"
                        onClick={saveDataset}
                        disabled={!data || isTraining}
                    >
                        <span className="btn-icon">↑</span> Daten exportieren
                    </button>
                    <label className={`btn btn-sm btn-action-import m-0 ${isTraining ? 'disabled' : ''}`}>
                        <span className="btn-icon">↓</span> Daten importieren
                        <input
                            type="file"
                            accept=".json"
                            onChange={loadDataset}
                            style={{ display: 'none' }}
                            disabled={isTraining}
                        />
                    </label>
                </div>
        {/* Modell Buttons */}
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-model-export fw-bold"
                        onClick={saveModelsLocally}
                        disabled={!results || isTraining}
                    >
                        <span className="btn-icon">↑</span> Modelle exportieren
                    </button>
                    <label className={`btn btn-sm btn-model-import fw-bold m-0 px-3 ${isTraining || !data ? 'disabled' : ''}`}>
                        <span className="btn-icon">↓</span> Modelle importieren
                        <input
                            type="file"
                            accept=".json"
                            onChange={loadModelsFromPC}
                            style={{ display: 'none' }}
                            disabled={isTraining || !data}
                        />
                    </label>
                </div>
            </div>
    {/* Epochen-Einstellungs-Karten */}
    <div className="row g-3 mb-5">
        <div className="col-md-4">
            <div className="p-2 rounded text-center epoch-card">
                <span className="d-block text-secondary small">Modell 1: Idealszenario (Sauber)</span>
                <span className="fw-bold text-epoch-highlight">50 Epochen</span>
            </div>
        </div>
        <div className="col-md-4">
            <div className="p-2 rounded epoch-card">
                <label className="d-block text-secondary small text-center mb-1">
                    Modell 2: Realszenario (Best-Fit)
                </label>
                <input
                    type="number"
                    className="form-control form-control-sm text-center bg-dark text-white border-secondary border-opacity-50"
                    value={epochsBest}
                    onChange={(e) => setEpochsBest(Number(e.target.value) || 0)}
                    disabled={isTraining}
                />
            </div>
        </div>
        <div className="col-md-4">
            <div className="p-2 rounded epoch-card">
                <label className="d-block text-secondary small text-center mb-1">
                    Modell 3: Überanpassung (Overfit)
                </label>
                <input
                    type="number"
                    className="form-control form-control-sm text-center bg-dark text-white border-secondary border-opacity-50"
                    value={epochsOverfit}
                    onChange={(e) => setEpochsOverfit(Number(e.target.value) || 0)}
                    disabled={isTraining}
                />
            </div>
        </div>
    </div>
            {/* Zentrierter Start-Button-Bereich über den Epochen */}
            <div className="d-flex justify-content-center mb-5 text-center start-action-area">
                <button
                    className={`btn fw-bold px-5 py-2 btn-start-training ${isTraining ? 'training-active' : ''}`}
                    onClick={run}
                    disabled={isTraining || !data}
                >
                    {isTraining ? 'Training läuft...' : 'Start (Alle Modelle trainieren)'}
                </button>
            </div>

            {/* Graphen-Bereich */}
            <div className="d-flex flex-column gap-5">
                <div className="p-4 border rounded-4 bg-dark bg-opacity-10 text-white shadow-sm">
                    <h4 className="h5 fw-bold mb-4 border-bottom border-secondary pb-2 text-warning">Datenbasis im
                        Vergleich</h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Mathematische Idealfunktion (Grundwahrheit)</span>
                            <div ref={r1LeftRef}></div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Generierte Messdaten (mit Rauschkomponente)</span>
                            <div ref={r1RightRef}></div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border rounded-4 bg-dark bg-opacity-10 text-white shadow-sm">
                    <h4 className="h5 fw-bold mb-4 border-bottom border-secondary pb-2 text-warning">
                        Idealszenario: Lernen ohne Störsignale
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Modellverlauf auf sauberen Trainingsdaten</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r2LeftRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Überprüfung auf sauberen Testdaten</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r2RightRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                    </div>
                    {results && (
                        <div
                            className="mt-3 pt-3 border-top border-secondary border-opacity-30 d-flex justify-content-center gap-4 text-center">
                            <span
                                className="text-success small fw-bold">Train MSE: {results.cleanRes.trainLoss.toFixed(5)}</span>
                            <span
                                className="text-success small fw-bold">Test MSE: {results.cleanRes.testLoss.toFixed(5)}</span>
                        </div>
                    )}
                </div>

                <div className="p-4 border rounded-4 bg-dark bg-opacity-10 text-white shadow-sm">
                    <h4 className="h5 fw-bold mb-4 border-bottom border-secondary pb-2 text-warning">
                        Realszenario: Optimale Balance trotz Rauschen
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Robuste Annäherung an verrauschte Trainingsdaten</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r3LeftRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Erfolgreiche Generalisierung auf ungesehene Testdaten</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r3RightRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                    </div>
                    {results && (
                        <div
                            className="mt-3 pt-3 border-top border-secondary border-opacity-30 d-flex justify-content-center gap-4 text-center">
                            <span
                                className="text-success small fw-bold">Train MSE: {results.bestRes.trainLoss.toFixed(5)}</span>
                            <span
                                className="text-success small fw-bold">Test MSE: {results.bestRes.testLoss.toFixed(5)}</span>
                        </div>
                    )}
                </div>

                <div
                    className="p-4 border border-danger border-opacity-50 rounded-4 bg-dark bg-opacity-10 text-white shadow-sm">
                    <h4 className="h5 fw-bold mb-4 border-bottom border-danger border-opacity-30 pb-2 text-danger">
                        Überanpassung: Wenn das Modell Rauschen auswendig lernt
                    </h4>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Perfekte Anpassung an jeden Ausreißer (Überoptimierung)</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r4LeftRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <span className="d-block text-secondary small fw-bold mb-2 text-start">Drastischer Performance-Verlust auf den Testdaten</span>
                            {!results && <div
                                className="text-muted py-5 small text-center">{isTraining ? 'Training läuft...' : 'Warte auf Aktivierung...'}</div>}
                            <div ref={r4RightRef} style={{display: results ? 'block' : 'none'}}></div>
                        </div>
                    </div>
                    {results && (
                        <div
                            className="mt-3 pt-3 border-top border-danger border-opacity-20 d-flex justify-content-center gap-4 text-center">
                            <span
                                className="text-danger small fw-bold">Train MSE: {results.overfitRes.trainLoss.toFixed(5)}</span>
                            <span
                                className="text-danger small fw-bold">Test MSE: {results.overfitRes.testLoss.toFixed(5)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}