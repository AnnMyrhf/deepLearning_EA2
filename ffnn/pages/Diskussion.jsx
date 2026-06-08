export default function Diskussion() {
    return (
        <div className="container py-5 mb-5 pb-5">
            <div className="row justify-content-center">
                {/* Haupt-Header */}
                <h1 className="display-4 fw-bold text-light mb-4">Diskussion</h1>
                <div className="mb-5">
                    <p>
                        Nach dem Durcharbeiten des Tutorials mit TensorFlow.js und tfjs-vis wurde mir schnell klar, dass
                        Modelltraining deutlich kniffliger ist als es auf den ersten Blick scheint. Bei der
                        Modell-Architektur und der Entwicklungskonfiguration habe ich viel experimentiert. Dabei hat sich gezeigt
                        sich, dass die Grenze zwischen Best-Fit und einem Over-Fit oft ziemlich fließend und relativ
                        schwer zu treffen ist. Besonders bei zwei Layern mit 128 zu 64, die für eine einfache
                        Regression eigentlich schon sehr leistungsstark ist. Dabei neigte das Modell dazu, eher das Rauschen
                        auswendig zu lernen anstatt den Trend zu generalisieren.</p>
                        <p>
                        Beim Training habe ich gelernt, dass das bloße Hochdrehen einzelner Parameter wie z. B. der
                        Datenmenge
                        oder den Epochen meist nicht ausreicht. Wie zu erwarten war, hatte die Datenmenge jedoch den
                        größten Einfluss. So konnte ich mit 500 statt 50 Punkten das Overfitting deutlich besser in den
                        Griff bekommen.
                        Zudem war spannend zu sehen, wie sehr die Qualität der Daten das Ergebnis beeinflusst.
                        Identische Einstellungen lieferten bei variierenden Datensätzen oft unterschiedliche Ergebnisse.
                        </p>
                        <p> Mein wichtigstes Learning ist, dass es beim Training keine "magischen" Default-Werte für
                        Best-Fit
                        oder Over-Fit gibt. Vielmehr geht es um die Optimierung und Balance aus allen Parametern und der
                        Modell-Architektur, um möglichst präzise Ergebnisse zu erzielen. </p>
                    </div>
            </div>
        </div>
    )
}