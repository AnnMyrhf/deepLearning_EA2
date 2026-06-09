export default function Diskussion() {
    return (<div className="container py-5 mb-5 pb-5">
        <div className="row justify-content-center">
            {/* Haupt-Header */}
            <h1 className="display-4 fw-bold text-light mb-4">Diskussion</h1>
            <div className="text-secondary mb-5">
                <p>
                    Nach dem Durcharbeiten des Tutorials mit TensorFlow.js und tfjs-vis wurde mir schnell klar, dass
                    Modelltraining deutlich kniffliger ist als es auf den ersten Blick scheint. Bei der
                    Modell-Architektur und der Entwicklungskonfiguration habe ich viel experimentiert. Dabei war die
                    Grenze zwischen Best-Fit und Over-Fit oft ziemlich fließend und relativ schwer zu treffen.
                    Besonders ein Modell mit zwei Hidden Layers und 128 bzw. 64 Neuronen erwies sich für die
                    einfache Regressionsaufgabe als sehr leistungsstark.</p>
                <p>
                    Beim Training habe ich gelernt, dass das bloße Hochdrehen einzelner Parameter wie z. B.
                    Datenmenge oder Epochen meist nicht ausreicht. In meinen Versuchen hatte die Datenmenge den größten
                    Einfluss.</p>
                <p>
                    Besonders spannend war zu sehen, wie stark die Qualität und Struktur der Daten das Ergebnis
                    beeinflussen. Obwohl Modell-Architektur und Trainingsparameter unverändert blieben, entstanden
                    je nach Datensatz teils deutlich unterschiedliche Modelle. Dadurch wurde mir deutlich, dass
                    nicht nur die Konfiguration, sondern vor allem auch die Daten selbst eine entscheidende Rolle
                    spielen.
                </p>
                <p> Mein wichtigstes Learning ist, dass es beim Training keine „magischen“ Default-Werte gibt, die
                    automatisch zu optimalen Ergebnissen führen. Vielmehr geht es darum, eine ausgewogene Balance
                    zwischen Modell-Architektur, Parametern und Daten zu finden, um möglichst gut, um möglichst
                    präzise Ergebnisse zu erhalten.</p>
            </div>
        </div>
    </div>)
}