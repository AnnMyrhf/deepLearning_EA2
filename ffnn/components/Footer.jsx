export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer mt-auto py-3 bg-dark text-light border-top border-secondary">
            <div className="container text-center">
        <span className="text-secondary small">
          © {currentYear} Ann-Kathrin Meyerhof
        </span>
            </div>
        </footer>
    )
}