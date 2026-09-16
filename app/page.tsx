import Link from 'next/link';

const areas=[
  ['♡','Relationships','Explore partnership patterns, communication, and the timing around connection.'],
  ['▣','Career','Look at direction, professional choices, and periods of movement or growth.'],
  ['◌','Money','Bring focus to earning, stability, planning, and financial decision-making.'],
  ['⌂','Home & family','Consider family dynamics, home changes, and the foundations that support you.'],
  ['✧','Wellbeing','Reflect on rhythms, energy, and supportive periods for your personal balance.'],
  ['➹','Life direction','Ask about purpose, transitions, and the next chapter you are preparing for.']
];

export default function Home(){
  return <main className="landing-page">
    <header className="landing-header">
      <Link href="/" className="landing-brand"><span>✧</span> <b>AstraLoom</b></Link>
      <nav aria-label="Main navigation"><a href="#about">About</a><a href="#services">Services</a><a href="#how-it-works">How it works</a><Link className="landing-nav-cta" href="/studio/">Start a consultation</Link></nav>
    </header>
    <section className="landing-hero">
      <div className="landing-hero-copy"><p className="landing-kicker">PERSONAL ASTROLOGY CONSULTATIONS</p><h1>Clarity for the<br/><em>next chapter.</em></h1><p className="landing-lede">AstraLoom combines a precise birth chart with a focused, question-led consultation—helping you look at the moment in front of you with more perspective.</p><div className="landing-trust"><span>✦ Private & personal</span><span>◌ $10 per question</span><span>⌁ Chart-led guidance</span></div><div className="landing-actions"><Link className="landing-primary" href="/studio/">Create your chart <b>→</b></Link><a className="landing-secondary" href="#services">Explore consultations</a></div></div>
      <div className="landing-celestial" aria-label="Celestial illustration"><div className="landing-moon"></div><div className="landing-ring landing-ring-one"></div><div className="landing-ring landing-ring-two"></div><div className="landing-star star-one">✦</div><div className="landing-star star-two">✧</div><div className="landing-star star-three">✦</div><div className="landing-zodiac">✦<small>YOUR CHART<br/>YOUR QUESTION</small></div></div>
    </section>
    <section id="about" className="landing-section landing-about"><div><p className="landing-kicker">ABOUT ASTRALOOM</p><h2>Thoughtful guidance starts with a clear chart.</h2></div><div><p>AstraLoom is a personal astrology studio built for questions that matter. Create and save a precise birth chart, follow current transits, and explore the timing shown through your personal planetary periods.</p><p>Our consultations stay focused on your question. Rather than general readings, we use your chart to bring attention to the themes, timing, and choices most relevant to the situation you are navigating.</p><div className="landing-about-points"><span>✦ Precise chart tools</span><span>✦ Question-led consultations</span><span>✦ Private saved profiles</span></div></div></section>
    <section id="services" className="landing-services"><div className="landing-section-heading"><p className="landing-kicker">CONSULTATION SERVICES</p><h2>Bring one clear question.</h2><p>Each consultation is $10 per question and is grounded in your saved birth chart, current timing, and transits.</p></div><div className="landing-service-grid">{areas.map(([icon,title,copy])=><article key={title} className="landing-service"><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div><div className="landing-price-band"><div><strong>$10</strong><span>per focused question</span></div><p>One question, a personal chart, and a considered astrology perspective for the moment you are in.</p><Link className="landing-light-cta" href="/studio/">Prepare your chart →</Link></div></section>
    <section id="how-it-works" className="landing-process"><p className="landing-kicker">HOW IT WORKS</p><h2>Simple, personal, and focused.</h2><div><article><span>01</span><i>◫</i><h3>Create your chart</h3><p>Enter your birth details and save the chart to your private profile.</p></article><article><span>02</span><i>✦</i><h3>Choose your question</h3><p>Keep it focused on one decision, theme, or area of life.</p></article><article><span>03</span><i>⌁</i><h3>Receive perspective</h3><p>Your consultation considers the chart, timing, and current transits.</p></article></div></section>
    <section className="landing-final"><p className="landing-kicker">BEGIN WITH YOUR CHART</p><h2>Your question deserves a closer look.</h2><p>Create a chart now, save it to your profile, and prepare the context for a focused consultation.</p><Link className="landing-final-cta" href="/studio/">Open AstraLoom <b>→</b></Link></section>
    <footer className="landing-footer"><span>✧ AstraLoom</span><span>Personal astrology workspace and consultations.</span><Link href="/studio/">Open workspace →</Link></footer>
  </main>;
}
