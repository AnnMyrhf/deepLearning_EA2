export default function Dokumentation() {
    return (<div className="container py-5 mb-5 pb-5">
            <div className="row justify-content-center">
                {/* Haupt-Header */}
                <h1 className="display-4 fw-bold text-light mb-4">Dokumentation</h1>
                <p className="lead text-secondary mb-4">
                    Nachfolgend werden die technische und fachliche Umsetzung der Web-Anwendung erläutert. Dargestellt
                    werden der TechStack, die technischen Besonderheiten, Implementierung und Logik sowie die
                    Quellen. </p>
                <nav className="mb-4">
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><a href="#frameworks" className="text-primary text-decoration-none hover-link">→ Frameworks
                            & Infrastruktur</a></li>
                        <li><a href="#techBesonderheiten" className="text-primary text-decoration-none hover-link">→
                            Technische Besonderheiten</a></li>
                        <li><a href="#implementierung" className="text-primary text-decoration-none hover-link">→
                            Implementierung & Logik</a></li>
                        <li><a href="#quellen" className="text-primary text-decoration-none hover-link">→ Quellen</a>
                        </li>
                    </ul>
                </nav>
                {/* Frameworks & Tools */}
                <div className="mb-4">
                    <h2 id="frameworks" className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                        Frameworks & Infrastruktur
                    </h2>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">React</strong><p>Dient als Frontend-Framework für eine
                            komponentenbasierte Architektur. Die Nutzung von Hooks (useState, useEffect, useRef)
                            ermöglicht ein effizientes State-Management und eine reaktive Benutzeroberfläche.</p>
                        </li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">TensorFlow.js</strong><p>Kern-Bibliothek zur Erstellung, zum
                            Training und zur Vorhersage mittels neuronaler Netze direkt im Browser.</p>
                        </li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">tfjs-vis</strong><p>Wird als Modell-Visor zur Visualisierung
                            der
                            Trainingsfortschritte (Loss-Kurven) sowie zur grafischen Darstellung der
                            Regressionsergebnisse und Datenpunkte genutzt.</p></li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Bootstrap 5</strong> <p>Wird für das responsive Layout und
                            die UI-Komponenten verwendet, um eine konsistente Darstellung auf mobilen und
                            Desktop-Endgeräten zu gewährleisten.</p></li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Vite</strong> <p>Modernes Build-Tool für schnelle
                            Entwicklungszyklen sowie optimierte Productions Builds.</p></li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Render</strong> <p>Plattform für Hosting und Continuous
                            Deployment (CD), um Aktualisierungen automatisiert bereitzustellen.</p></li>
                    </ul>
                </div>
                {/* Technische Besonderheiten */}
                <div className="mb-4">
                    <h2 id="techBesonderheiten"
                        className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                        Technische Besonderheiten
                    </h2>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Optimiertes State-Management</strong>
                            <p>Es wird zwischen UI-relevanten Zuständen (useState) und rechenintensiven Modell-Instanzen
                                (useRef) unterscheiden. Letztere werden in Referenzen gehalten, um bei
                                Modell-Aktualisierungen unnötige Re-Renderings zu vermeiden und die Performance während
                                des Trainings zu sichern.</p>
                        </li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Modell-Export & Import</strong>
                            <p> Wie in der Aufgabenstellung gefordert, wurden Funktionen zum Export und Import der
                                Modelle implementiert. Technisch wird dabei nicht nur die Modell-Struktur, sondern auch
                                das gesamte „Wissen“ in Form der gelernten Modell-Parameter extrahiert. Da diese
                                Informationen technisch als binäre Daten vorliegen, werden sie für den JSON-Export
                                mittels Base64-Kodierung (btoa/atob) konvertiert. Zusammen mit den relevanten
                                Konfigurationsparametern (Daten-Paare, Batch Size, Epochen) werden diese Daten in einer JSON-Datei
                                gebündelt.</p>
                        </li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Daten-Export & Import</strong>
                            <p> Auch der Daten-Export und -Import erfolgt über eine JSON-Datei. Hierbei werden neben den
                                eigentlichen Trainings- und Testdaten auch alle Konfigurationsparameter (Daten-Paare, Batch Size,
                                Epochen) gespeichert. So können beim Laden eines Datensatzes die
                                Rahmenbedingungen der ursprünglichen Generierung reproduziert werden.</p>
                        </li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Theme-Management</strong>
                            <p>Wie bereits bei EA 1 werden zentrale CSS-Variablen für ein konsistentes Design zwischen
                                Light- und Dark Mode genutzt und über das Attribut [data-bs-theme] gesteuert.</p>
                        </li>
                    </ul>
                </div>
                {/* Implementierung & Logik */}
                <div className="mb-4">
                    <h2 id="implementierung" className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                        Implementierung & Logik
                    </h2>
                    <ul className="list-group list-group-flush">
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Modell-Architektur</strong> <p>Sequenzielles
                            Modell mit zwei Hidden Layern (128 und 64 Neuronen, ReLU-Aktivierung) und einem linearen
                            Output-Layer.</p></li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Training</strong> <p>Der Trainingsprozess nutzt den
                            Adam-Optimizer mit einer konstanten Learning Rate von 0,01. Der Datensatz wird dynamisch in
                            Trainings- und Testdaten (Verhältnis 1:1) unterteilt. Zur Simulation der Daten wird ein
                            Gaußsches Rauschen mit einer Varianz von 0,05 angewendet. Es werden simultan drei Szenarien
                            trainiert: Clean (basierend auf sauberen Daten), Best-Fit sowie Over-Fit (jeweils mit
                            zusätzlichem Rauschen)</p></li>
                        <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                            <strong className="text-light">Visualisierung</strong> <p>Die tfjs-vis Bibliothek rendert
                            Scatterplots für die Verteilung der Datenpunkte sowie die Regressionskurven. Loss-Verläufe
                            werden in Liniendiagrammen gegenübergestellt, um den Trainingseffekt und das Overfitting
                            visuell nachvollziehbar zu machen.</p></li>
                    </ul>
                </div>
                {/* Quellen*/}
                <div className="mb-4">
                    <h2 id="quellen" className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                        Quellen
                    </h2>
                    <ul className="text-secondary ps-4">
                        <li className="mb-2"><strong>Modulskript DeepLearning:</strong> Theoretische Grundlagen zu Deep
                            Learning, neuronalen Netzen und Feed-Forward-Netzwerken.
                        </li>
                        <li className="mb-2"><strong> TensorFlow.js Dokumentation & Tutorials:</strong>Referenz zur
                            Modell-Implementierung udd Konfigurationen
                        </li>
                        <li className="mb-2"><strong>Stackoverflow:</strong> Unterstützung beim Debugging sowie bei der
                            Lösung spezifischer technischer Probleme, insbesondere beim Modell-Import/-Export
                        </li>
                        <li className="mb-2"><strong>Austausch mit anderen Kursteilnehmenden:</strong>Allgemeiner
                            Erfahrungsaustausch, Durchführung von Modell-Experimenten sowie konstruktives Feedback zu
                            GUI und Usability
                        </li>
                        <li className="mb-2"><strong>ChatGPT & Gemini:</strong>Unterstützung beim Debugging,
                            Code-Refactoring, der Erstellung von Code-Kommentaren und beim UI-Design
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}