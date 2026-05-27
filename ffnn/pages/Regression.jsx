//import {useState, useEffect, useRef} from 'react'
//import ml5 from 'ml5'

export default function Regression() {

    return (
        <div className="container py-5 mb-5">
            <header className="mb-5">
                <h1 className="display-4 fw-bold text-light mb-4">Regression</h1>
                <p className="lead text-secondary mb-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                    aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.</p>
                <nav>
                </nav>
            </header>
            {/* Spalten-Layout für die Plots */}
            <div className="row g-4">
                {/* Reihe 1: Datenbasis */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">1. Datensätze</h5>
                            <p className="card-text text-muted">Saubere vs. verrauschte Daten im Intervall [-2.4,
                                2.4]</p>
                            <div className="bg-light p-5 text-center">[Hier Chart 1 einbinden]</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">2. Best-Fit Modell (Ohne Rauschen)</h5>
                            <p className="card-text text-muted">Trainiert auf sauberen Daten. MSE: ...</p>
                            <div className="bg-light p-5 text-center">[Hier Chart 2 einbinden]</div>
                        </div>
                    </div>
                </div>

                {/* Reihe 2: Analyse & Overfitting */}
                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">3. Best-Fit Modell (Mit Rauschen)</h5>
                            <p className="card-text text-muted">Trainiert auf verrauschten Daten. MSE: ...</p>
                            <div className="bg-light p-5 text-center">[Hier Chart 3 einbinden]</div>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">4. Overfitting Modell</h5>
                            <p className="card-text text-muted">Zu viele Epochen / hohe Komplexität. MSE: ...</p>
                            <div className="bg-light p-5 text-center">[Hier Chart 4 einbinden]</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}