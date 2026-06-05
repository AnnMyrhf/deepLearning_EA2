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

        data.push({
            x, y, yNoisy: y + gaussianNoise(),
        });
    }
    return data;
};

// Aufteilung in 50 Trainings- und 50 Testdaten-Paare
const splitData = (data) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return {
        train: shuffled.slice(0, 50), test: shuffled.slice(50),
    };
}

// Erstellen der Modellarchitektur mit 3 Hidden Layer
const createModel = () => {
    const model = tf.sequential(); // Eingabe fliesst direkt in Ausgabe

    model.add(tf.layers.dense({
        inputShape: [1], units: 100, activation: "relu",
    }));
    // Input Layer + 1. Hidden Layer (100 Neuronen, ReLU)
    model.add(tf.layers.dense({inputShape: [1], units: 100, activation: "relu"}));
    model.add(tf.layers.dense({units: 100, activation: 'relu'}));
    // 2. Hidden Layer (100 Neuronen, ReLU)
    model.add(tf.layers.dense({units: 100, activation: 'relu'}));
    // 3. Hidden Layer (100 Neuronen, ReLU)
    model.add(tf.layers.dense({units: 100, activation: 'relu'}));
    // Output Layer (1 Neuron, linear)
    model.add(tf.layers.dense({units: 1, activation: 'linear'}));

    model.compile({
        optimizer: tf.train.adam(0.01), // Adam-Optimizer und Learning Rate 0.01 laut Aufgabenstellung
        loss: "meanSquaredError",
    });

    return model;
};

// Training mit Mean-Squared-Error als Loss
const trainModel = async (train, test, epochs) => {
    const model = createModel();

    const xsTrain = tf.tensor2d(train.map(d => d.x), [train.length, 1]);
    const ysTrain = tf.tensor2d(train.map(d => d.yNoisy), [train.length, 1]);

    const xsTest = tf.tensor2d(test.map(d => d.x), [test.length, 1]);
    const ysTest = tf.tensor2d(test.map(d => d.yNoisy), [test.length, 1]);

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

    // x-Gitter (testX) erstellen
    const testX = tf.linspace(-2, 2, 100).reshape([100, 1]);

    // Normalisierung
    const normPredIn = testX.sub(iMin).div(iMax.sub(iMin));
    const normPredOut = model.predict(normPredIn);
    const unnormPredY = normPredOut.mul(lMax.sub(lMin)).add(lMin);

    // Modellvorhersage als (x, y)-Punkte für die Darstellung der gelernten Kurve
    const curvePoints = Array.from(testX.dataSync()).map((x, i) => ({
        x, y: unnormPredY.dataSync()[i]
    }));

    // Speicherbereinigung
    tf.dispose([xsTrain, ysTrain, xsTest, ysTest, normIn, normLab, normTestIn, normTestLab, testX, normPredIn, normPredOut, unnormPredY]);

    return {trainLoss, testLoss, curvePoints};
};

export default function Regression() {
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chart3Ref = useRef(null);
    const chart4Ref = useRef(null);

    const [data, setData] = useState(null); // State für die generierten Daten (Train/Test)
    const [results, setResults] = useState(null); // State für die Ergebnisse der Trainingsläufe

    // State für den Ladebalken/Button-Text
    const [isTraining, setIsTraining] = useState(false);

    useEffect(() => {
        setData(splitData(generateData()));
    }, []);

// Rendert Chart 1 (Train/Test-Datensätze)
    useEffect(() => {
        if (data && chart1Ref.current) {
            chart1Ref.current.innerHTML = '';
            tfvis.render.scatterplot(
                chart1Ref.current,
                {
                    values: [
                        data.train.map(d => ({x: d.x, y: d.yNoisy})),
                        data.test.map(d => ({x: d.x, y: d.yNoisy})),
                    ],
                    series: ["Trainingsdaten", "Testdaten"],
                },
                {xLabel: 'X', yLabel: 'Y', height: 260, zoomToFit: true}
            );
        }
    }, [data]);

    // Rendert die Modell-Kurven, sobald Ergebnisse da sind
    useEffect(() => {
        if (results && chart2Ref.current && chart3Ref.current && chart4Ref.current) {
            // Chart 2 (Sauber | Trainings- und Testdaten + Vorhersage)
            chart2Ref.current.innerHTML = '';
            tfvis.render.scatterplot(
                chart2Ref.current,
                {
                    values: [
                        data.train.map(d => ({x: d.x, y: d.y})),
                        data.test.map(d => ({x: d.x, y: d.y})),
                        results.cleanRes.curvePoints
                    ],
                    series: ["Trainingsdaten (Sauber)", "Testdaten (Sauber)", "Modell-Vorhersage"]
                },
                {xLabel: 'X', yLabel: 'Y', height: 260, zoomToFit: true}
            );

            // Chart 3 (Best-Fit | verrauschte Trainings- und Testdaten + Vorhersage))
            chart3Ref.current.innerHTML = '';
            tfvis.render.scatterplot(
                chart3Ref.current,
                {
                    values: [
                        data.train.map(d => ({x: d.x, y: d.yNoisy})),
                        data.test.map(d => ({x: d.x, y: d.yNoisy})),
                        results.bestRes.curvePoints
                    ],
                    series: ["Trainingsdaten (Verrauscht)", "Testdaten (Verrauscht)", "Modell-Vorhersage"]
                },
                {xLabel: 'X', yLabel: 'Y', height: 260, zoomToFit: true}
            );

            // Chart 4 (Overfit | verrauschte Trainings- und Testdaten + Vorhersage)
            chart4Ref.current.innerHTML = '';
            tfvis.render.scatterplot(
                chart4Ref.current,
                {
                    values: [
                        data.train.map(d => ({x: d.x, y: d.yNoisy})),
                        data.test.map(d => ({x: d.x, y: d.yNoisy})),
                        results.overfitRes.curvePoints
                    ],
                    series: ["Trainingsdaten (Verrauscht)", "Testdaten (Verrauscht)", "Overfit-Vorhersage"]
                },
                {xLabel: 'X', yLabel: 'Y', height: 260, zoomToFit: true}
            );
        }
    }, [results, data]);

    const run = async () => {
        if (!data) return;
        setIsTraining(true);

        // Saubere Trainingsdaten spiegeln (yNoisy mit dem glatten y überschreiben)
        const cleanTrainData = data.train.map(d => ({x: d.x, yNoisy: d.y}));

        const cleanRes = await trainModel(cleanTrainData, data.test, 50);
        const bestRes = await trainModel(data.train, data.test, 80); // etwas höhere Trainings-Epochen
        const overfitRes = await trainModel(data.train, data.test, 800); // weitere Erhöhung für maximalen Effekt

        setResults({
            cleanRes,
            bestRes,
            overfitRes,
        });

        setIsTraining(false);
    };

    return (
        <div className="container py-5">
            <header className="mb-5">
                <h1 className="display-4 fw-bold mb-4">Regression</h1>
                <p className="lead text-secondary mb-3">
                    FFNN Regression einer unbekannten nichtlinearen Funktion.
                    Ziel ist es, die zugrunde liegende Funktion aus verrauschten Daten
                    zu approximieren und dabei Overfitting zu analysieren.
                </p>
                <button
                    className="btn btn-theme-ai btn-lg"
                    onClick={run}
                    disabled={isTraining}
                >
                    {isTraining ? 'Training läuft...' : 'Modelle trainieren'}
                </button>
            </header>

            <div className="row g-4">
                {/* 1. Datensätze */}
                <div className="col-md-6">
                    <div className="card h-100 bg-dark border-secondary rounded-4">
                        <div className="card-body d-flex flex-column justify-content-between p-4">
                            <div>
                                <h5 className="card-title fw-bold">1. Datensätze</h5>
                                <p className="card-text text-secondary">Trainings- und Testdaten (verrauscht)</p>
                                <div ref={chart1Ref}></div>
                            </div>
                            <div className="mt-3 pt-2 border-top border-secondary text-secondary text-center">
                                <small>Ausgangsdatenbasis für die Experimente</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Sauberes Modell */}
                <div className="col-md-6">
                    <div className="card h-100 bg-dark border-secondary rounded-4">
                        <div className="card-body d-flex flex-column justify-content-between p-4">
                            <div>
                                <h5 className="card-title fw-bold">2. Modell ohne Rauschen</h5>
                                <p className="card-text text-secondary mb-3">Training auf sauberen Daten (50
                                    Epochen)</p>
                                <div ref={chart2Ref}>
                                    {!results &&
                                        <div className="text-center text-secondary py-5">Warte auf Training...</div>}
                                </div>
                            </div>
                            {results && (
                                <div
                                    className="mt-3 pt-2 border-top border-secondary text-center bg-secondary bg-opacity-10 rounded py-2">
                                    <span className="fw-bold opacity-75">Modell-Fehlerwerte (MSE):</span><br/>
                                    <small className="text-success fw-bold">Train
                                        MSE: {results.cleanRes.trainLoss.toFixed(5)}</small>
                                    <span className="mx-2 text-secondary">|</span>
                                    <small className="text-success fw-bold">Test
                                        MSE: {results.cleanRes.testLoss.toFixed(5)}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Best-Fit-Modell */}
                <div className="col-md-6">
                    <div className="card h-100 bg-dark border-secondary rounded-4">
                        <div className="card-body d-flex flex-column justify-content-between p-4">
                            <div>
                                <h5 className="card-title fw-bold">3. Best-Fit-Modell</h5>
                                <p className="card-text text-secondary mb-3">Training auf verrauschten Daten (80
                                    Epochen)</p>
                                <div ref={chart3Ref}>
                                    {!results &&
                                        <div className="text-center text-secondary py-5">Warte auf Training...</div>}
                                </div>
                            </div>
                            {results && (
                                <div
                                    className="mt-3 pt-2 border-top border-secondary text-center bg-secondary bg-opacity-10 rounded py-2">
                                    <span className="fw-bold opacity-75">Modell-Fehlerwerte (MSE):</span><br/>
                                    <small className="text-success fw-bold">Train
                                        MSE: {results.bestRes.trainLoss.toFixed(5)}</small>
                                    <span className="mx-2 text-secondary">|</span>
                                    <small className="text-success fw-bold">Test
                                        MSE: {results.bestRes.testLoss.toFixed(5)}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Overfit-Modell */}
                <div className="col-md-6">
                    <div className="card h-100 bg-dark border-warning rounded-4" style={{borderWidth: '2px'}}>
                        <div className="card-body d-flex flex-column justify-content-between p-4">
                            <div>
                                <h5 className="card-title fw-bold text-warning">4. Overfit-Modell</h5>
                                <p className="card-text text-secondary mb-3">Übertraining auf verrauschten Daten (800
                                    Epochen)</p>
                                <div ref={chart4Ref}>
                                    {!results &&
                                        <div className="text-center text-secondary py-5">Warte auf Training...</div>}
                                </div>
                            </div>
                            {results && (
                                <div
                                    className="mt-3 pt-2 border-top border-warning text-center bg-secondary bg-opacity-10 rounded py-2">
                                    <span className="fw-bold opacity-75">Modell-Fehlerwerte (MSE):</span><br/>
                                    <small className="text-danger fw-bold">Train
                                        MSE: {results.overfitRes.trainLoss.toFixed(5)}</small>
                                    <span className="mx-2 text-secondary">|</span>
                                    <small className="text-danger fw-bold">Test
                                        MSE: {results.overfitRes.testLoss.toFixed(5)}</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}