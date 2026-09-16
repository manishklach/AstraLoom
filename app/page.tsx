import Link from 'next/link';

export default function Home(){
  return <main className="landing-page">
    <header className="landing-header">
      <Link href="/" className="landing-brand">✧ <b>AstraLoom</b></Link>
      <nav aria-label="Main navigation"><a href="#about">About</a><a href="#services">Services</a><Link className="landing-nav-cta" href="/studio/">Open workspace</Link></nav>
    </header>
    <section className="landing-hero">
      <div><p className="landing-kicker">ASTROLOGY, MADE PERSONAL</p><h1>Find the pattern.<br/>Ask the question.</h1><p className="landing-lede">AstraLoom brings precise birth-chart tools and focused astrology consultations into one thoughtful space.</p><div className="landing-actions"><Link className="landing-primary" href="/studio/">Create your chart</Link><a className="landing-secondary" href="#services">Explore services</a></div></div>
      <aside className="landing-orbit" aria-label="AstraLoom astrology services"><span>✦</span><strong>Birth chart</strong><small>Dashas · cusps · transits</small></aside>
    </section>
    <section id="about" className="landing-section landing-about"><div><p className="landing-kicker">ABOUT US</p><h2>A clear chart is the beginning of a better question.</h2></div><div><p>AstraLoom is an astrology workspace for people who want to explore their birth chart with care. Build and save your chart, follow current transits, and look at timing through your personal planetary periods.</p><p>Our approach pairs precise chart calculation with practical, question-led consultation. The goal is to help you focus on the parts of the chart that matter to the decision in front of you.</p></div></section>
    <section id="services" className="landing-section landing-services"><div className="landing-section-heading"><p className="landing-kicker">SERVICES</p><h2>Focused astrology consultations</h2><p>Bring one clear question. Receive a chart-led perspective designed around the timing and themes most relevant to it.</p></div><div className="service-card"><div className="service-price"><span>$10</span><small>per question</small></div><h3>One-question consultation</h3><p>Ask about a specific area of life and receive a focused astrology consultation based on your birth chart, current periods, and transits.</p><ul><li>One focused question per consultation</li><li>Personal birth-chart context</li><li>Relevant periods and current transits</li><li>Clear, considered written guidance</li></ul><Link className="landing-primary" href="/studio/">Prepare your chart</Link></div></section>
    <section className="landing-process"><p className="landing-kicker">HOW IT WORKS</p><div><article><span>01</span><h3>Create your chart</h3><p>Enter your birth details and save the chart to your profile.</p></article><article><span>02</span><h3>Choose one question</h3><p>Keep it focused: career, relationships, timing, home, or a decision you are considering.</p></article><article><span>03</span><h3>Receive perspective</h3><p>Your consultation considers the chart, current timing, and the question you asked.</p></article></div></section>
    <footer className="landing-footer"><span>✧ AstraLoom</span><span>Personal astrology workspace and consultations.</span><Link href="/studio/">Open workspace →</Link></footer>
  </main>;
}
