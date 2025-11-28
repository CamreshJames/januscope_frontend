import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-text">Januscope v1.0.0</span>
          <span className="footer-separator">•</span>
          <span className="footer-text">Sky World Limited</span>
        </div>
        <div className="footer-right">
          <span className="footer-text">{currentYear} All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
