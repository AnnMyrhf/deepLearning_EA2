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
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum</p>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item bg-transparent text-secondary border-secondary px-0 py-3">
                        <strong className="text-light">React</strong><p>Dient als Frontend-Framework für eine
                        komponentenbasierte Architektur. Die Nutzung von Hooks (useState, useEffect, useRef)
                        ermöglicht ein effizientes State-Management und eine reaktive Benutzeroberfläche.</p>
                    </li>
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