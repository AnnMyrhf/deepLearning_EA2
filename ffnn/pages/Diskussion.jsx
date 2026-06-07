export default function Diskussion() {
    return (
        <div className="container py-5 mb-5 pb-5">
            <div className="row justify-content-center">
                {/* Haupt-Header */}
                <h1 className="display-4 fw-bold text-light mb-4">Diskussion</h1>
                <div className="mb-5">
                    <p>

                        Der wichtigste „Aha-Effekt“ ist: Mehr Training ist nicht automatisch besser – besonders bei
                        verrauschten Daten


                        Mehr Daten (N=500) haben dein System stabilisiert und Overfitting stark reduziert. Wenn du
                        wirklich sichtbares Overfitting zurückhaben willst, dann: N=100 oder 250


                        Wenn du wirklich Overfitting sehen willst: großes Modell (128-64) und lange Trainingszeit (500
                        Daten)


                        Overfitting entsteht nicht nur durch viele Epochen, sondern durch das Verhältnis von:
                        Model Capacity vs Data Size vs Noise

                        Underfit: 8–4
                        Best Fit: 32–16
                        Overfit: 128–64

                        Das gibt dir die klarste, sichtbarste und stabilste Lernkurve


                        kleine Batches → mehr „Rauschen im Gradient“ → oft bessere Generalisierung
                        große Batches → eher „deterministisches Lernen“ → Overfitting wird klarer


                        aktuellen Einstellungen (128 -> 64 Neuronen, 100 / 400 / 4000 Epochen) sind für eine Abgabe
                        ideal.
                        "Die Architektur 128 -> 64 ermöglichte eine präzise Abbildung der zugrunde liegenden
                        Zielfunktion. Durch die Steigerung der Trainings-Epochen beim 'Overfit'-Modell auf 4000 konnte
                        das Phänomen der mangelnden Generalisierungsfähigkeit durch den Vergleich von sinkendem
                        Trainings-MSE und stagnierendem Test-MSE eindeutig visualisiert werden."

                        Du hast damit ein Setup geschaffen, das drei sehr wichtige didaktische Aspekte abdeckt, die
                        Dozenten bei solchen Projekten sehen wollen:

                        Stabilität & Kapazität: Die gewählte Schichtbreite (128 -> 64) ist groß genug, um die
                        Zielfunktion "glatt" zu lernen, was zeigt, dass du verstehst, wie man ein Modell für eine
                        Aufgabe dimensioniert.

                        Nachvollziehbare Entwicklung: Mit deinen gewählten Epochen-Zahlen hast du eine klare Hierarchie:

                        Clean (100): Zeigt, wie das Modell lernt, wenn es "perfekte" Daten bekommt.

                        Best-Fit (400): Zeigt die optimale Balance zwischen Bias und Varianz.

                        Overfit (4000): Zeigt das bewusste "Übertreiben", das als Beweis für dein Verständnis der
                        Generalisierungsproblematik dient.

                        Visuelle Beweiskraft: Die Schere in deinem Loss-Diagramm ist nun so deutlich, dass sie keinen
                        Spielraum für Interpretationsfehler lässt. Jeder Betrachter erkennt sofort: "Hier wurde das
                        Rauschen auswendig gelernt."
</p>

                </div>
            </div>
        </div>
    )
}