function LandingPage({ onLogin, onRegister}) {
    return (
        <div className="landing-page">
        <nav className="navbar">
            <h2>CARGO<span>NEX</span></h2>

            <div className="nav-links">
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#services">Services</a>
                <a href="#contact">Contact</a>
            </div>

            <div className="nav-buttons">
                <button className="login-nav" onClick={onLogin}>Login</button>
                <button className="register-nav" onClick={onRegister}>Get Started</button>
            </div>
        </nav> 
        <section className="hero" id="home">
            <div className="hero-content">
                <span className="hero-tag">SMART CARGO. SIMPLE SHIPPING</span>
                <h1>Moving Your Cargo <span>Connecting Your World.</span></h1>
                <p>Manage your shipment ,track cargo movement and stay informed throughout your shipping journey with CARGONEX.</p>
                <div className="hero-buttons">
                    <button  onClick={onRegister}>Get Started</button>
                    <button className="outline-button" onClick={onLogin}>Sign In</button>
                </div>
            </div>

                   </section>

                   <section className= "services" id="services">
                       <h2>Our Services</h2>
                       <p>Everything you need to manage your shipment information easily.</p>

                          <div className="service-grid">
                            <div className="service-card">
                                <h3>Cargo Registration</h3>
                                <p>Register and manage your shipment information easily.</p>
                            </div>

                            <div className="service-card">
                                <h3>Shipment Tracking</h3>
                                <p>Monitor shipment progress and view status updates.</p>
                            </div>
        
                            <div className="service-card">
                                <h3>Payment Management</h3>
                                <p>Keep track of shipping costs and payment records.</p>
                            </div>
                          </div>
                   </section>

                   <footer className="footer">
                    <h2>CARGONEX</h2>
                    <p>Connecting cargo to its destination.</p>
                    <p>&copy; 2026 CARGONEX. All rights reserved.</p>
                </footer>
            </div>
     );
 }

export default LandingPage;