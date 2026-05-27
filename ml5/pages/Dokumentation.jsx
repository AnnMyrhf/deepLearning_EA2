export default function Dokumentation() {
    return (<div className="container py-5 mb-5 pb-5">
        <div className="row justify-content-center">
            {/* Haupt-Header */}
            <h1 className="display-4 fw-bold text-light mb-4">Dokumentation</h1>
            <p className="lead text-secondary mb-4">
                Nachfolgend werden die technische und fachliche Umsetzung der Web-Anwendung erläutert. Dargestellt
                werden der TechStack, die technischen Besonderheiten, Implementierung und Logik sowie die Quellen. </p>
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
                <p>Die Auswahl des TechStacks basiert auf eigenen Erfahrungen
                    und den spezifischen Anforderungen an die Web-Anwendung. Der Fokus lag auf einer performanten,
                    schlanken und wartbaren Architektur. Um die Komplexität gering zu halten, wurden bewusst nur die
                    notwendigsten Technologien eingesetzt..</p>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">React</strong><p>Dient als Frontend-Framework für eine
                        komponentenbasierte Architektur. Die Nutzung von Hooks (useState, useEffect, useRef)
                        ermöglicht ein effizientes State-Management und eine reaktive Benutzeroberfläche.</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">ml5.js (Pflicht | v 1.3.1)</strong> <p>
                        High-Level-Schnittstelle zu TensorFlow.js. Es ermöglicht das Laden und Ausführen des
                        MobileNet-Modells direkt im Browser, ohne dass eine serverseitige Verarbeitung nötig ist.
                    </p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Bootstrap 5</strong> <p>Wird für das responsive Layout und
                        die UI-Komponenten verwendet, um eine konsistente Darstellung auf mobilen und
                        Desktop-Endgeräten zu gewährleisten.</p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Vite</strong> <p>Modernes Build-Tool für schnelle
                        Entwicklungszyklen sowie optimierte Productions Builds.</p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">My Memory API</strong> <p>Externe API zur Übersetzung der
                        englischen Klassifizierungsergebnisse ins Deutsche in Echtzeit (siehe auch <a
                            href="#automatische-uebersetzung">Automatische Übersetzung der
                            Klassifizierungsergebnisse
                        </a>).
                    </p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Render</strong> <p>Plattform für Hosting und Continuous
                        Deployment (CD), um Aktualisierungen automatisiert bereitzustellen.</p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Beispielbilder</strong> <p>Die sechs verwendeten
                        Beispielbilder stammen aus den lizenzfreien Bilddatenbanken <a
                            href="https://unsplash.com/de" target="_blank">Unsplash</a> und <a
                            href="https://pixabay.com" target="_blank">Pixabay</a>.</p></li>
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
                        <strong className="text-light">Hardware-Beschleunigung (WebGL)</strong>
                        <p> Die Anwendung erzwingt die Nutzung des WebGl-Backends (ml5.tf.setBackend('webgl')).
                            Dadurch wird die
                            Rechenlast an die GPU des Nutzendens delegiert und für eine performante
                            Bildanalyse gesorgt.</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Asynchrones Lazy Loading</strong>
                        <p> Durch den Einsatz von await import('ml5') werden die Bibliothek und das MobileNet-Modell erst bei Bedarf geladen. Das minimiert
                            die initiale Last beim ersten Laden der Seite und verbessert die "Time to
                            Interactive".</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Theme-Management (CSS Variables):</strong>
                        <p> Ich persönlich bevorzuge den Dark Mode. Dennoch war es mir wichtig, unterschiedliche
                            Nutzerpräferenzen zu berücksichtigen. Daher ist der Dark Mode zwar als Default gesetzt,
                            Nutzende können aber über den integrierten Theme-Switcher in der Navbar jederzeit in den
                            Light Mode
                            wechseln. Technisch basiert die Gestaltung auf zentralen CSS-Variablen. Das reduziert
                            den Pflegeaufwand erheblich und ermöglicht einen nahtlosen Wechsel zwischen den Modi über
                            das Attribut [data-bs-theme="light"]. Dadurch bleibt das Design über alle Komponenten
                            hinweg konsistent.</p>
                    </li>
                </ul>
            </div>
            {/* Implementierung & Logik */}
            <div className="mb-4">
                <h2 id="implementierung" className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                    Implementierung & Logik
                </h2><p>Dieser Abschnitt beschreibt die Implementierung, Logik sowie das User Interface und
                Interaktionsdesign.</p>
                <ul className="list-group list-group-flush">
                    <li id="automatische-uebersetzung"
                        className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Automatische Übersetzung der
                            Klassifizierungsergebnisse</strong>
                        <p> MobileNet liefert die Klassifizierungsergebnisse ausschließlich auf Englisch aus.
                            Deshalb habe ich noch eine automatische Übersetzung hinzugefügt. Gerade bei einer
                            ansonsten
                            komplett deutschen Seite empfand ich das in puncto Barrierefreiheit und UX als
                            notwendig.
                            Technisch habe ich es so gelöst, dass die Labels vorab bereinigt werden, indem nur der
                            Hauptbegriff vor dem Komma genommen wird. Diese Begriffe werden dann gebündelt als
                            Batch-Request an die kostenlose MyMemory API geschickt, was die Performance deutlich
                            verbessert.
                            Sollte die API einmal nicht erreichbar sein, greift ein Fallback-Mechanismus, der
                            einfach
                            die englischen Originalbegriffe anzeigt, damit die Anwendung stabil bleibt. Die
                            Übersetzungsqualität der MyMemory API ist allerdings teilweise eher mittelmäßig, was mir
                            während der Entwicklung auch aufgefallen ist. Gerade bei spezifischeren Begriffen sind
                            die
                            Ergebnisse nicht immer optimal. Alternativen wie Google Cloud Translation API oder DeepL
                            API
                            würden hier mit Sicherheit deutlich präzisere Ergebnisse liefern. Für die beispielhafte
                            Klassifizierung war mir ehrlich gesagt jedoch eine kostenfreie und unkompliziert
                            integrierbare
                            Schnittstelle wichtiger.</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Dynamische Ergebnisverwaltung</strong><p>Durch die
                        Speicherung der Analysedaten in einer Map-Struktur (resultsMap) können die
                        Klassifizierungsergebnisse
                        einzelner Bilder unabhängig voneinander verwaltet werden. Ergebnisse bereits analysierter
                        Bilder bleiben für Nutzende sichtbar, während andere neu berechnet oder zurückgesetzt werden
                        können.</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Asynchrone Verarbeitung & State-Management:</strong>
                        <p>Bildklassifizierung und automatische Übersetzung ins Deutsche erfolgen vollständig
                            asynchron. Verschiedene States (z. B. isAnalyzing, resultsMap, uploadResults) steuern
                            gezielt die UI-Elemente wie Lade-Spinner, wodurch die
                            Anwendung auch während rechenintensiver Abfragen jederzeit reaktionsfähig bleibt.</p>
                    </li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Ref-Management</strong> <p>Einsatz von useRef, um direkten
                        Zugriff auf DOM-Elemente (img) zu erhalten, da ml5.js sie unmittelbar für die
                        Klassifizierung benötigt.
                    </p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Beispielbilder</strong> <p>Nutzende können sechs
                        Beispielbilder klassifizieren, um die Genauigkeit des Modells zu testen. Die Anwendung
                        visualisiert die Ergebnisse wie gefordert durch eine Progress-Bar, die den Confidence-Wert
                        zusätzlich als Prozentzahl ausgibt. Zusätzlich wurde eine Soll-Ist-Vergleichslogik
                        implementiert. Basierend auf dem Analyseergebnis wird das Bild automatisch mit einer dynamischen
                        Farblogik hervorgehoben (Grün für „Richtig“, Rot für „Falsch“). Um die Barrierefreiheit zu
                        erhöhen und die Information nicht allein auf Farben basieren zu lassen, erhält
                        jedes Ergebnis zusätzlich ein explizites Status-Badge („RICHTIG“ / „FALSCH“). Das ermöglicht
                        einen schnellen und eindeutigen Abgleich zwischen der Modellvorhersage und dem tatsächlichen
                        Bildinhalt.</p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Feedback & Validierung</strong> <p>Die Anwendung bietet durch
                        Lade-Indikatoren und kontextsensitive Fehlermeldungen stets Rückmeldung über den Systemstatus.
                        Ein Schutzmechanismus prüft Uploads vorab auf zulässige Formate (JPG, PNG, WebP) und eine
                        maximale Dateigröße von 5 MB.</p></li>
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">Usability & Navigation</strong> <p>Das User Interface ist bewusst
                        reduziert gehalten, um den Fokus auf die Kernfunktion (Bildklassifizierung) zu lenken. Durch den
                        Einsatz von
                        Sprungmarken wird eine einfache Navigation ermöglicht, was besonders auf mobilen Endgeräten
                        vorteilhaft ist.</p></li>
                </ul>
            </div>
            {/* Quellen*/}
            <div className="mb-4">
                <h2 id="quellen" className="h4 fw-bold text-light border-bottom border-secondary pb-2 mb-4">
                    Quellen
                </h2>
                <ul className="text-secondary ps-4">
                    <li className="mb-2"><strong>Modulskript DeepLearning:</strong> Theoretische Grundlagen zu Deep
                        Learning und neuronalen Netzen
                    </li>
                    <li className="mb-2"><strong>ml5.js Dokumentatio:</strong> Referenz zur Implementierung des
                        Image Classifiers und Modell-Konfiguration
                    </li>
                    <li className="mb-2"><strong>Image Classification Tutorial:</strong> Best Practices für die
                        Nutzung von MobileNet
                    </li>
                    <li className="mb-2"><strong>Stackoverflow:</strong> Unterstützung beim Debugging und Lösen
                        technischer Probleme
                    </li>
                    <li className="mb-2"><strong>Austausch mit anderen Kursteilnehmenden:</strong> Allgemeiner
                        Erfahrungsaustausch sowie Feedback zu GUI und Usability
                    </li>
                    <li className="mb-2"><strong>ChatGPT & Gemini:</strong> Unterstützung beim Debugging,
                        Code-Refactoring, Erstellung von Kommentaren und UI-Design
                    </li>
                </ul>
            </div>
        </div>
    </div>)
}