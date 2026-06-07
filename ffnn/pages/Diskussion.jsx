export default function Diskussion() {
    return (
        <div className="container py-5 mb-5 pb-5">
            <div className="row justify-content-center">
                {/* Haupt-Header */}
                <h1 className="display-4 fw-bold text-light mb-4">Diskussion</h1>
                <div className="mb-5">
                    <p>

                        Der wichtigste „Aha-Effekt“ ist: Mehr Training ist nicht automatisch besser – besonders bei verrauschten Daten


                        Mehr Daten (N=500) haben dein System stabilisiert und Overfitting stark reduziert. Wenn du wirklich sichtbares Overfitting zurückhaben willst, dann: N=100 oder 250


                        Wenn du wirklich Overfitting sehen willst: großes Modell (128-64) und lange Trainingszeit (500 Daten)


                        Overfitting entsteht nicht nur durch viele Epochen, sondern durch das Verhältnis von:
                        Model Capacity vs Data Size vs Noise

                        Underfit: 8–4
                        Best Fit: 32–16
                        Overfit: 128–64

                        Das gibt dir die klarste, sichtbarste und stabilste Lernkurve


                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                        laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
                        voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
                        non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</p>

                </div>
            </div>
        </div>
    )
}