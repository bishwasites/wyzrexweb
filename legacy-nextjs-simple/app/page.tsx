import Link from "next/link";
import FrameSequence from "@/components/FrameSequence";
import ServiceCard from "@/components/ServiceCard";
import WorkCard from "@/components/WorkCard";
import { SERVICES, WORK_ITEMS } from "@/lib/content";
import { WARRIOR_FRAMES } from "@/lib/frames";

export default function HomePage() {
  return (
    <>
      <FrameSequence
        config={WARRIOR_FRAMES}
        sceneDescription="Illustrated Spartan warrior, standing still, camera slowly pushing in."
        opacity={0.75}
      />

      <div className="hero-content">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Digital Marketing &amp; Creative Production</p>
          <h1>Strategy sharp enough to cut through. Execution built to last.</h1>
          <p className="sub">
            WYZREX is a Colombo-based agency for brands that want both — the thinking and the shipping.
          </p>
          <div className="hero-ctas">
            <Link className="btn btn--outline" href="/work">
              See Our Work <span className="btn__badge">↗</span>
            </Link>
            <Link className="btn btn--gold" href="/contact">
              Start a Project <span className="btn__badge">↗</span>
            </Link>
          </div>
        </div>
      </div>

      <section className="services-preview">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">The Services</p>
              <h2>What we do</h2>
            </div>
            <Link className="btn btn--outline" href="/services">
              All Services <span className="btn__badge">↗</span>
            </Link>
          </div>
          <div className="service-grid">
            {SERVICES.map((service) => (
              <ServiceCard key={service.index} service={service} href="/services" />
            ))}
          </div>
        </div>
      </section>

      <section className="work-preview band-surface">
        <div className="container">
          <div className="section-head section-head--split">
            <div>
              <p className="eyebrow">Selected Work</p>
              <h2>Proof, not promises</h2>
            </div>
            <Link className="btn btn--outline" href="/work">
              View all work <span className="btn__badge">↗</span>
            </Link>
          </div>
          <div className="work-grid work-grid--preview">
            {WORK_ITEMS.slice(0, 4).map((item) => (
              <WorkCard key={item.client} item={item} href="/work" />
            ))}
          </div>
        </div>
      </section>

      <section className="stats band-dark">
        <div className="container">
          <div className="stats-grid">
            <div className="stat">
              <div className="stat__num">150+</div>
              <div className="stat__label">Projects delivered</div>
            </div>
            <div className="stat">
              <div className="stat__num">98%</div>
              <div className="stat__label">Client retention</div>
            </div>
            <div className="stat">
              <div className="stat__num">6</div>
              <div className="stat__label">Years of craft</div>
            </div>
            <div className="stat">
              <div className="stat__num">20+</div>
              <div className="stat__label">Team &amp; partner network</div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band-section">
        <div className="container cta-band">
          <h2>Have a project in mind? Let&apos;s build it.</h2>
          <Link className="btn btn--gold" href="/contact">
            Start a project <span className="btn__badge">↗</span>
          </Link>
        </div>
      </section>
    </>
  );
}
