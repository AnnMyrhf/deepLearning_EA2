import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Bilderkennung from '../pages/Bilderkennung.jsx'
import Dokumentation from '../pages/Dokumentation.jsx'
import Diskussion from '../pages/Diskussion.jsx'

function App() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }
        window.addEventListener('scroll', toggleVisibility)
        return () => window.removeEventListener('scroll', toggleVisibility)
    }, [])

    return (
        <BrowserRouter>
            {/* Sichtbarer Ankerpunkt für die IDE und den Browser */}
            <div id="top" className="min-vh-100 d-flex flex-column">
                <Navbar />
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<Bilderkennung />} />
                        <Route path="/diskussion" element={<Diskussion />} />
                        <Route path="/dokumentation" element={<Dokumentation />} />
                    </Routes>
                </main>

                {isVisible && (
                    <a href="#top" className="back-to-top shadow-lg">
                        ↑
                    </a>
                )}

                <Footer />
            </div>
        </BrowserRouter>
    )
}

export default App