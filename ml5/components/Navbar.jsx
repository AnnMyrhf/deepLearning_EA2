    import { useState, useEffect } from 'react'
    import { NavLink } from 'react-router-dom'

    export default function Navbar() {
        const [isDarkMode, setIsDarkMode] = useState(true)
        const [isMenuOpen, setIsMenuOpen] = useState(false)

        useEffect(() => {
            document.documentElement.setAttribute('data-bs-theme', isDarkMode ? 'dark' : 'light')
        }, [isDarkMode])

        // Funktion zum Schließen des Menüs
        const handleNavLinkClick = () => {
            setIsMenuOpen(false)
        }

    return (
                <nav className="navbar navbar-expand-lg border-bottom border-secondary shadow-sm">
                    <div className="container-fluid px-4">
                        <NavLink className="navbar-brand fw-bold" to="/" onClick={handleNavLinkClick}>
                            EA1 – Bilderkennung mit ml5
                        </NavLink>

                        {/* Wrapper für die Buttons rechts auf Mobilgeräten */}
                        <div className="d-flex align-items-center ms-auto order-lg-last">
                            <button
                                id="theme-toggle"
                                className={`btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center me-2 ${isDarkMode ? 'is-sun' : 'is-moon'}`}
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                style={{ width: '40px', height: '40px' }}
                                title={isDarkMode ? 'Zu Light Mode wechseln' : 'Zu Dark Mode wechseln'}
                            >
                                {isDarkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5zM0 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 0 8zm13 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5zM2.866 2.866a.5.5 0 0 1 .708 0l1.414 1.414a.5.5 0 0 1-.708.708L2.866 3.574a.5.5 0 0 1 0-.708zm9.9 9.9a.5.5 0 0 1 .708 0l1.414 1.414a.5.5 0 0 1-.708.708l-1.414-1.414a.5.5 0 0 1 0-.708zm-9.9 9.9a.5.5 0 0 1 0-.708l1.414-1.414a.5.5 0 0 1 .708.708l-1.414 1.414a.5.5 0 0 1-.708 0zm9.9-9.9a.5.5 0 0 1 0-.708l1.414-1.414a.5.5 0 0 1 .708.708l-1.414 1.414a.5.5 0 0 1-.708 0z"/>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06a.752.752 0 0 1 .876.218z"/>
                                    </svg>
                                )}
                            </button>

                            <button
                                className="navbar-toggler border-0 shadow-none p-0"
                                type="button"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                ) : (
                                    <span className="navbar-toggler-icon"></span>
                                )}
                            </button>
                        </div>

                        {/* 'isMenuOpen' steuert Klasse 'show' */}
                        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
                            <ul className="navbar-nav ms-auto pt-3 pt-lg-0">
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/" onClick={handleNavLinkClick}>Bilderkennung</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/diskussion" onClick={handleNavLinkClick}>Diskussion</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/dokumentation" onClick={handleNavLinkClick}>Dokumentation</NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>
    )
}