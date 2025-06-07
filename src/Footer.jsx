import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="copyright">&copy; {new Date().getFullYear()} YUTOOLS. All rights reserved.</p>
        <nav>
          <ul className="footer-nav">
            <li><a href="https://yutools.net/terms.html">利用規約</a></li>
            <li><a href="https://yutools.net/privacy.html">プライバシーポリシー</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;