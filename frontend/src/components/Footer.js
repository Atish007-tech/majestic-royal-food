import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="zomato-footer">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <h2>Majestic Royal Food</h2>
                    </div>
                    <div className="footer-lang-country">
                        <select className="lang-select">
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                        <select className="country-select">
                            <option value="in">India</option>
                        </select>
                    </div>
                </div>

                <div className="footer-links">
                    <div className="link-column">
                        <h4>ABOUT FOODAPP</h4>
                        <ul>
                            <li><a href="/">Who We Are</a></li>
                            <li><a href="/">Blog</a></li>
                            <li><a href="/">Work With Us</a></li>
                            <li><a href="/">Investor Relations</a></li>
                            <li><a href="/">Report Fraud</a></li>
                            <li><a href="/">Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="link-column">
                        <h4>Majestic Royal</h4>
                        <ul>
                            <li><a href="/">FoodApp</a></li>
                            <li><a href="/">Delivery Web</a></li>
                            <li><a href="/">Feeding India</a></li>
                            <li><a href="/">Hyperpure</a></li>
                            <li><a href="/">FoodApp Land</a></li>
                        </ul>
                    </div>
                    <div className="link-column">
                        <h4>FOR RESTAURANTS</h4>
                        <ul>
                            <li><a href="/">Partner With Us</a></li>
                            <li><a href="/">Apps For You</a></li>
                        </ul>
                        <h4>FOR ENTERPRISES</h4>
                        <ul>
                            <li><a href="/">FoodApp For Enterprise</a></li>
                        </ul>
                    </div>
                    <div className="link-column">
                        <h4>LEARN MORE</h4>
                        <ul>
                            <li><a href="/">Privacy</a></li>
                            <li><a href="/">Security</a></li>
                            <li><a href="/">Terms</a></li>
                            <li><a href="/">Sitemap</a></li>
                        </ul>
                    </div>
                    <div className="link-column social-links-col">
                        <h4>SOCIAL LINKS</h4>
                        <div className="social-icons">
                            <a href="https://github.com" aria-label="GitHub"><i className="fab fa-github"></i></a>
                            <a href="https://linkedin.com" aria-label="LinkedIn" ><i className="fab fa-linkedin-in"></i></a>
                            <a href="https://instagram.com" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                            <a href="https://twitter.com" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                            <a href="https://youtube.com" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                            <a href="https://facebook.com" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                        </div>
                        <div className="app-buttons">
                            <img src="https://b.zmtcdn.com/data/webuikit/23e930757c3df49840c482a8638bf5c31556001144.png" alt="App Store" />
                            <img src="https://b.zmtcdn.com/data/webuikit/9f0c85a5e33adb783fa0aef667075f9e1556003622.png" alt="Play Store" />
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>By continuing past this page, you agree to our Terms of Service, Cookie Policy, Privacy Policy and Content Policies. All trademarks are properties of their respective owners. 2008-2025 © FoodApp™ Ltd. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
