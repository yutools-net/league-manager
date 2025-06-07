import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="https://yutools.net/" className="site-logo">YUTOOLS</a>
        <nav className="site-navigation">
          <button className="menu-toggle" aria-label="メニューを開閉" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="hamburger-icon"></span>
          </button>
          <ul className={`nav-links ${isMenuOpen ? 'is-active' : ''}`}>
            <li><a href="https://yutools.net/tools/">全てのツールを見る</a></li>
            {/* 他にリンクが必要な場合は、ここに追加できます */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;