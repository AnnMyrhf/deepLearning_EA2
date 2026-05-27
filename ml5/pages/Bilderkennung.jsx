import {useState, useEffect, useRef} from 'react'
//import ml5 from 'ml5'

export default function Bilderkennung() {
    const [selectedImage, setSelectedImage] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analyzingId, setAnalyzingId] = useState(null)
    const [classifier, setClassifier] = useState(null)
    const [resultsMap, setResultsMap] = useState({})
    const [uploadResults, setUploadResults] = useState([])
    const imageRefs = useRef({})
    const uploadImageRef = useRef(null)
    const [uploadError, setUploadError] = useState(null)

    /* useEffect(() => {
         const loadModel = async () => {
             try {
                 // Erzwingt WebGL, um den WebGPU-Fehler (t.requestAdapterMix) zu umgehen
                 if (ml5.tf) {
                     await ml5.tf.setBackend('webgl')
                     await ml5.tf.ready()
                 }
                 const model = await ml5.imageClassifier('MobileNet')
                 setClassifier(model)
                 console.log("MobileNet v1.3.1 (WebGL) geladen")
             } catch (err) {
                 console.error("Fehler beim Modell-Setup:", err)
             }
         }
         loadModel()
     }, [])*/

    useEffect(() => {
        const loadModel = async () => {
            try {
                const ml5 = (await import('ml5')).default; // Lädt ml5 asynchron im Hintergrund für schnelleren Initial Load

                if (ml5.tf) {
                    await ml5.tf.setBackend('webgl');
                    await ml5.tf.ready();
                }
                const model = await ml5.imageClassifier('MobileNet');
                setClassifier(model);
                console.log("MobileNet v1.3.1 (WebGL) geladen")
            } catch (err) {
                console.error("Fehler:", err);
            }
        }
        loadModel();
    }, []);

    const examples = [
        {
            id: 1,
            title: 'Dreirad',
            img: '/images/correct/dreirad.jpg',
            alt: 'Ein Kinderdreirad auf einem hellen Kiesweg',
            status: 'RICHTIG'
        },
        {
            id: 2,
            title: 'Königspinguin',
            img: '/images/correct/pinguins.jpg',
            alt: 'Drei erwachsene Königspinguine nebeneinander auf einem dunklen Strand',
            status: 'RICHTIG'
        },
        {
            id: 3,
            title: 'Mountainbike',
            img: '/images/correct/bike.jpg',
            alt: 'Ein bepacktes Mountainbike bei Sonnenuntergang in einer Hügellandschaft',
            status: 'RICHTIG'
        },
        {
            id: 4,
            title: 'Kaffeebohnen',
            img: '/images/incorrect/kaffee.jpg',
            alt: 'Dichte Ansicht einer großen Menge gerösteter Kaffeebohnen',
            status: 'FALSCH'
        },
        {
            id: 5,
            title: 'Muffin',
            img: '/images/incorrect/muffin.jpg',
            alt: 'Ein einzelner Blaubeermuffin auf einer dunklen Fläche',
            status: 'FALSCH'
        },
        {
            id: 6,
            title: 'Wald',
            img: '/images/incorrect/wald.jpg',
            alt: 'Sonnenlicht in einem Wald mit Moosboden',
            status: 'FALSCH'
        }
    ]

    const translateText = async (labelsArray) => {
        if (!labelsArray || labelsArray.length === 0) return []

        // Nur den Hauptbegriff vor dem Komma nehmen und formatieren
        const cleaned = labelsArray.map(l => {
            const first = l.split(',')[0].trim()
            return first.charAt(0).toUpperCase() + first.slice(1)
        })

        try {
            const query = cleaned.join(' | ')
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(query)}&langpair=en|de`)

            if (!response.ok) return cleaned

            const data = await response.json()
            const rawTranslation = data.responseData?.translatedText

            if (!rawTranslation || data.responseStatus !== 200) return cleaned

            return rawTranslation.split('|').map((s, index) => {
                const word = s.trim()
                return word ? word.charAt(0).toUpperCase() + word.slice(1) : cleaned[index]
            })
        } catch (error) {
            console.error("Übersetzungsfehler:", error)
            return cleaned
        }
    }

    const classifyImage = async (imgElement, id = null) => {
        if (!classifier || !imgElement) return

        if (id) {
            setAnalyzingId(id)
            setResultsMap(prev => ({...prev, [id]: null}))
        } else {
            setIsAnalyzing(true)
            setUploadResults([])
        }

        try {
            const results = await classifier.classify(imgElement)

            if (results && results.length > 0) {
                const deLabels = await translateText(results.map(r => r.label))

                const finalResults = results.map((r, i) => ({
                    ...r,
                    label: deLabels[i] || r.label
                }))

                if (id) {
                    setResultsMap(prev => ({...prev, [id]: finalResults}))
                } else {
                    setUploadResults(finalResults)
                }
            }
        } catch (err) {
            console.error("Analysefehler:", err)
        } finally {
            setAnalyzingId(null)
            setIsAnalyzing(false)
        }
    }

    const resetAllResults = () => {
        setResultsMap({}) // Leert alle Analyseergebnisse der Beispielbilder
        setAnalyzingId(null) // Stoppt eventuelle laufende Analysen
    }

    const handleImageUpload = (files) => {
        const file = files[0]
        if (!file) return

        // Loescht alte Fehler
        setUploadError(null)

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        const maxSize = 5 * 1024 * 1024 // 5 MB

        if (!allowedTypes.includes(file.type)) {
            setUploadError("Ungültiges Format! Bitte lade nur JPG, PNG oder WebP Dateien hoch.")
            return // Stoppt hier
        }

        if (file.size > maxSize) {
            setUploadError("Datei zu groß! Das Bild darf maximal 5 MB groß sein.")
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            setSelectedImage(e.target.result)
            setUploadResults([])
            setIsAnalyzing(true)
        }
        reader.readAsDataURL(file)
    }

    // Startet Analyse des hochgeladenen Bildes sobald Bild geladen ist
    useEffect(() => {
        if (selectedImage && uploadImageRef.current && isAnalyzing && uploadResults.length === 0) {
            classifyImage(uploadImageRef.current)
        }
    }, [selectedImage, isAnalyzing])

    const AnalysisBox = ({show, onClose, isAnalyzing, predictions}) => {
        if (!show) return null
        const isLoading = isAnalyzing || !predictions || predictions.length === 0
        return (
            <div
                className="p-4 bg-dark border border-secondary rounded-4 shadow h-100 position-relative d-flex flex-column justify-content-center">
                <button type="button" className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                        onClick={onClose}></button>
                <h3 className="h6 fw-bold text-light mb-3 text-uppercase">Ergebnis</h3>
                {isLoading ? (
                    <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary mb-2"></div>
                        <p className="text-secondary small m-0">Bild wird analysiert...</p>
                    </div>
                ) : (
                    predictions.map((p, i) => (
                        <div key={i} className="mb-3">
                            <div className="d-flex justify-content-between small mb-1">
                                <span className="text-light">{p.label}</span>
                                <span className="text-primary">{(p.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div className="progress" style={{height: '4px'}}>
                                <div className="progress-bar bg-primary"
                                     style={{width: `${p.confidence * 100}%`}}></div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )
    }

    return (
        <div className="container py-5 mb-5">
            <header className="mb-5">
                <h1 className="display-4 fw-bold text-light mb-4">Bilderkennung</h1>
                <p className="lead text-secondary mb-3">
                    Teste die Bildklassifizierung mit ml5.js und dem MobileNet_Modell: Nutze dafür entweder die sechs
                    Beispielbilder oder lade eigene Bilder hoch, um automatisch die Analyse zu starten und sofort die
                    Ergebnisse zu sehen.</p>
                <nav>
                    <ul className="list-unstyled d-flex flex-column gap-2">
                        <li><a href="#beispiel-sektion" className="text-primary text-decoration-none hover-link">→
                            Beispielbilder klassifizieren</a></li>
                        <li><a href="#upload-sektion" className="text-primary text-decoration-none hover-link">→ Eigenes
                            Bild hochladen</a></li>
                    </ul>
                </nav>
            </header>

            <section id="beispiel-sektion" className="mb-5 pb-5 border-bottom border-secondary border-opacity-25">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h4 text-emphasis m-0">Beispielbilder klassifizieren</h2>

                    {Object.keys(resultsMap).length > 0 && (
                        <button
                            className="btn-clear-results"
                            onClick={resetAllResults}
                        >
                            <span className="me-2">✕</span> Alle Ergebnisse löschen
                        </button>
                    )}
                </div>

                {examples.map((ex) => {
                    const isCurrentlyAnalyzing = analyzingId === ex.id
                    const hasResult = !!resultsMap[ex.id]

                    // Dynamische Farb-Logik Beispielbilder
                    let statusClass = 'border-secondary bg-body-tertiary'; // Neutraler Startwert

                    if (hasResult) {
                        statusClass = ex.status === 'RICHTIG'
                            ? 'border-success bg-success bg-opacity-10'
                            : 'border-danger bg-danger bg-opacity-10';
                    }

                    return (
                        <div key={ex.id} className="row g-4 mb-4 align-items-stretch">
                            <div className="col-md-7">
                                <div
                                    className={`p-3 rounded-4 border h-100 d-flex flex-column justify-content-center ${statusClass}`}
                                    style={{
                                        borderWidth: hasResult ? '3px' : '1px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div className="row align-items-center">
                                        <div className="col-5">
                                            <div className="position-relative">
                                                <img
                                                    src={ex.img}
                                                    loading="lazy"
                                                    className="img-fluid rounded-3 shadow-sm"
                                                    alt={ex.alt}
                                                    ref={el => imageRefs.current[ex.id] = el}
                                                />
                                                {hasResult && (
                                                    <span
                                                        className={`badge position-absolute top-0 start-0 m-2 shadow-sm ${ex.status === 'RICHTIG' ? 'bg-success' : 'bg-danger'}`}>
                                            {ex.status}
                                        </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-7">
                                            <h3 className="h5 text-emphasis mb-3">{ex.title}</h3>
                                            <button
                                                className={`btn rounded-pill w-100 btn-theme-ai ${hasResult ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (hasResult) {
                                                        setResultsMap(prev => {
                                                            const n = {...prev}
                                                            delete n[ex.id]
                                                            return n
                                                        })
                                                    } else {
                                                        classifyImage(imageRefs.current[ex.id], ex.id)
                                                    }
                                                }}
                                            >
                                                {hasResult ? 'Zurücksetzen' : 'Analyse starten'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-5">
                                <AnalysisBox
                                    show={isCurrentlyAnalyzing || hasResult}
                                    isAnalyzing={isCurrentlyAnalyzing}
                                    predictions={resultsMap[ex.id]}
                                    onClose={() => {
                                        const n = {...resultsMap};
                                        delete n[ex.id];
                                        setResultsMap(n);
                                        if (analyzingId === ex.id) setAnalyzingId(null);
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
            </section>

            <section id="upload-sektion" className="mb-5 pb-5">
                <h2 className="h4 text-emphasis mb-4">Eigenes Bild hochladen</h2>
                {/*Fehlermeldung*/}
                {uploadError && (
                    <div
                        className="alert alert-danger d-flex align-items-center justify-content-between rounded-4 mb-3 border-0 shadow-sm py-2 px-3"
                        role="alert">
                        <div className="d-flex align-items-center">
                            <span className="small fw-medium">{uploadError}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close small"
                            style={{fontSize: '0.6rem'}}
                            onClick={() => setUploadError(null)}
                        ></button>
                    </div>
                )}
                <div className="row g-4 align-items-stretch">
                    <div className="col-md-7">
                        <div
                            className={`drop-zone p-5 rounded-4 text-center h-100 d-flex flex-column align-items-center justify-content-center 
                    ${isDragging ? 'dragging' : ''} ${selectedImage ? 'has-image' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                handleImageUpload(e.dataTransfer.files);
                            }}
                            onClick={() => !selectedImage && document.getElementById('fileInput').click()}
                        >
                            {selectedImage ? (
                                <div className="position-relative w-100">
                                    <img
                                        src={selectedImage}
                                        ref={uploadImageRef}
                                        className="img-fluid rounded-3 shadow-lg mb-3"
                                        alt="Vorschau"
                                        style={{maxHeight: '300px', objectFit: 'contain'}}
                                    />
                                    <button
                                        className="btn rounded-pill btn-theme-ai px-4 shadow-sm" // Nutzt deine btn-theme-ai Klasse
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(null);
                                            setUploadResults([]);
                                            setIsAnalyzing(false);
                                        }}
                                    >
                                        Bild entfernen
                                    </button>
                                </div>
                            ) : (
                                <div className="upload-content py-2">
                                    {/* Upload-Icon */}
                                    <div className="upload-icon mb-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"
                                             fill="currentColor" viewBox="0 0 16 16">
                                            <path
                                                d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/>
                                            <path
                                                d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z"/>
                                        </svg>
                                    </div>

                                    <p className="fw-bold text-emphasis mb-1">Ziehe dein Bild hierher oder wähle eine Datei aus</p>
                                    <p className="text-secondary small mb-4">JPG, PNG oder WebP bis zu 5 MB</p>

                                    <button className="btn btn-outline-primary rounded-pill px-4 fw-medium shadow-sm">
                                        Datei auswählen
                                    </button>

                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="d-none"
                                        accept=".jpg,.jpeg,.png,.webp"
                                        onChange={(e) => handleImageUpload(e.target.files)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-5">
                        <AnalysisBox
                            show={!!selectedImage}
                            isAnalyzing={isAnalyzing}
                            predictions={uploadResults}
                            onClose={() => {
                                setSelectedImage(null);
                                setUploadResults([]);
                                setIsAnalyzing(false);
                            }}
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}