export default function Diskussion() {
    return (
        <div className="container py-5 mb-5 pb-5">
            <div className="row justify-content-center">
                {/* Haupt-Header */}
                <h1 className="display-4 fw-bold text-light mb-4">Diskussion</h1>
                <div className="mb-5">
                    <p>
                        Bei den Klassifizierungsergebnissen ist mir aufgefallen, dass markante Objekte meist sehr gut
                        erkannt werden (z. B. die Königspinguine). Kleinteilige Strukturen wie Kaffeebohnen oder
                        komplexere Hintergründe, z. B. die Waldlichtung mit unterschiedlicher Sonneneinstrahlung und
                        vielen Grüntönen, führen hingegen oft zu Fehlklassifizierungen.</p>

                        <p>Manche Ergebnisse waren auch ziemlich amüsant und haben mich dazu gebracht, das Bild noch einmal
                        genauer anzuschauen. So wurde ein, im Gegensatz zu den Beispielbildern, selbst hochgeladenes
                        Mountainbike-Bild zum Beispiel als „Wallet“, „Pencil Box“ oder „Safety Pin“ erkannt. Das liegt
                        vermutlich daran, dass das Modell bestimmte Formen oder Linien im Bild stärker gewichtet als das
                        eigentliche Gesamtobjekt. In einigen Fällen konnte ich mir die Ergebnisse allerdings gar nicht erklären.</p>

                        <p>Außerdem ist mir beim Testen der erstellten Web-Anwendungen von anderen Kursteilnehmenden
                        aufgefallen, dass sich die Ergebnisse je nach verwendeter ml5-Version deutlich unterscheiden
                        können. Die von mir verwendete Version 1.3.1 ist dabei in manchen Fällen aber auch nicht
                        unbedingt genauer als eine ältere Version.</p>

                        <p>Insgesamt lernt man durch diese Versuche sehr anschaulich, dass solche Modelle Bilder nicht
                        wirklich „verstehen“, sondern nur gelernte Muster und Wahrscheinlichkeiten abgleichen.</p>

                    {/* Info-Box*/}
                    <div className="d-flex align-items-start p-3 mt-5 rounded-4 border border-secondary bg-dark shadow-sm">
                        <div className="me-3 fs-3 d-flex align-items-center" style={{ color: 'var(--link-color)', marginTop: '-2px' }}>
                            {/* Einfacheres, robustes Outline Info-Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                            </svg>
                        </div>
                        <div className="small lh-base text-secondary">
                            <strong className="text-light d-block mb-1">Hinweis</strong>
                            Um eine Verfälschung der Ergebnisse zu vermeiden, bezieht sich die Diskussion ausschließlich auf die englischen Originalbegriffe vor der Übersetzung durch die MyMemory API (Details siehe <a
                            href="/dokumentation">Dokumentation)</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}