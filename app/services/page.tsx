import Link from 'next/link';
import ThemeToggle from '../theme-toggle';

const themes = [
  ['♡', 'Love & relationships', 'Bring focus to connection, communication, compatibility, or a relationship decision.'],
  ['▣', 'Career & work', 'Explore direction, a role change, professional timing, or the next move in your work.'],
  ['◌', 'Money & planning', 'Look at financial rhythms, stability, opportunities, and planning with more perspective.'],
  ['⌂', 'Home & family', 'Consider family dynamics, home changes, and the foundations that support you.'],
  ['✧', 'Wellbeing', 'Reflect on personal rhythms, energy, and supportive periods for balance and care.'],
  ['➹', 'Life direction', 'Ask about purpose, transitions, and the chapter you are preparing to enter.'],
];

const faqs = [
  ['What does one question mean?', 'Choose one specific situation or decision. A focused question gives the consultation a clear centre and makes the chart timing easier to discuss.'],
  ['What should I prepare?', 'Create your birth chart first and save it to your profile. Keep your question concise, and include only the context that helps explain the decision or timing you want to explore.'],
  ['How is my information handled?', 'Your saved birth profiles are linked to your sign-in and are visible only within your profile.'],
  ['Can I ask more than one question?', 'Yes. Each question is treated as a separate $10 consultation so every answer can stay focused on its own chart context and timing.'],
];

export default function ServicesPage() {
  return <main className="service-page">
    <header className="landing-header service-header">
      <Link href="/" className="landing-brand"><span>✧</span> <b>AstraLoom</b></Link>
      <nav aria-label="Main navigation"><Link href="/">Home</Link><a href="#consultations">Consultations</a><a href="#how-it-works">How it works</a><a href="#questions">FAQs</a><Link className="landing-nav-cta" href="/studio/">Create your chart</Link><ThemeToggle/></nav>
    </header>
    <section className="service-hero">
      <div className="service-hero-copy"><p className="landing-kicker">PERSONAL ASTROLOGY CONSULTATIONS</p><h1>Ask with intention.<br/><em>See the timing clearly.</em></h1><p>Every AstraLoom consultation begins with your saved birth chart and one focused question. We consider the chart, planetary periods, and current transits to bring perspective to the moment you are in.</p><div className="service-promise"><span>✦ Private chart context</span><span>◌ One focused question</span><span>⌁ $10 each</span></div><Link className="landing-primary" href="/studio/">Create your chart <b>→</b></Link></div>
      <div className="service-orbit" aria-hidden="true"><div className="service-orbit-moon"></div><div className="service-orbit-circle orbit-a"></div><div className="service-orbit-circle orbit-b"></div><div className="service-orbit-circle orbit-c"></div><span className="service-orbit-star star-s1">✦</span><span className="service-orbit-star star-s2">✧</span><span className="service-orbit-star star-s3">✦</span><div className="service-orbit-label">YOUR<br/>QUESTION<small>✦</small></div></div>
    </section>
    <section id="consultations" className="service-themes"><div className="landing-section-heading"><p className="landing-kicker">CONSULTATION AREAS</p><h2>A considered look at what matters to you.</h2><p>Use your chart as a point of reflection around the question, decision, or theme that is most present for you.</p></div><div className="service-theme-grid">{themes.map(([icon,title,copy])=><article key={title}><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="service-offer"><div><p className="landing-kicker">A SIMPLE CONSULTATION</p><h2>$10 per focused question.</h2><p>Your question is considered alongside your birth chart, current transits, and relevant planetary periods. Start by preparing and saving a chart, then keep the question as specific as you can.</p><ul><li>Personal birth-chart context</li><li>Current transit and timing perspective</li><li>One defined question at a time</li></ul></div><aside><span>ONE QUESTION</span><strong>$10</strong><p>A focused astrology perspective for the decision or theme in front of you.</p><Link href="/studio/">Prepare my chart →</Link></aside></section>
    <section id="how-it-works" className="service-steps"><p className="landing-kicker">HOW IT WORKS</p><h2>From chart to question in four steps.</h2><div><article><b>01</b><i>◫</i><h3>Create your chart</h3><p>Enter your date, time, and place of birth.</p></article><article><b>02</b><i>✦</i><h3>Save your profile</h3><p>Keep the full chart ready in your signed-in profile.</p></article><article><b>03</b><i>⌁</i><h3>Choose one question</h3><p>Tell us the decision or life theme you want to explore.</p></article><article><b>04</b><i>☼</i><h3>Receive perspective</h3><p>Use the chart and current timing to look at the situation clearly.</p></article></div></section>
    <section className="service-reasons"><div className="service-quote">“The chart does not make the choice for you. It offers a way to look at the season you are in.”</div><div><p className="landing-kicker">THE ASTRALOOM APPROACH</p><h2>Practical, personal, and chart-led.</h2><ul><li>Built around your actual birth details</li><li>Focused on your stated question</li><li>Informed by current timing and transits</li><li>Designed for reflection, not generic reports</li></ul></div></section>
    <section id="questions" className="service-faq"><p className="landing-kicker">FREQUENTLY ASKED QUESTIONS</p><h2>A few helpful details.</h2><div>{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="landing-final service-final"><p className="landing-kicker">START WITH A CHART</p><h2>Bring your question into focus.</h2><p>Create and save your chart first. It takes only a few minutes and gives your consultation the context it needs.</p><Link className="landing-final-cta" href="/studio/">Open AstraLoom <b>→</b></Link></section>
    <footer className="landing-footer"><span>✧ AstraLoom</span><span>Personal astrology workspace and consultations.</span><Link href="/studio/">Open workspace →</Link></footer>
  </main>;
}