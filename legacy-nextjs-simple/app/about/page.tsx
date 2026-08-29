import type { Metadata } from "next";
import Link from "next/link";
import FrameSequence from "@/components/FrameSequence";
import { PHILOSOPHER_FRAMES } from "@/lib/frames";

export const metadata: Metadata = {
  title: "About",
  description:
    "WYZREX is built on two instincts: the discipline to execute and the patience to think first. Meet the studio behind the work.",
};

export default function AboutPage() {
  return (
    <>
      <FrameSequence
        config={PHILOSOPHER_FRAMES}
        sceneDescription="Illustrated Greek philosopher in quiet contemplation, camera slowly pushing in."
        opacity={0.75}
      />

      <div className="intro-content">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">The Studio</p>
          <h1>Built on strategy. Proven by execution.</h1>
        </div>
      </div>

      <section>
        <div className="container about-copy">
          <p>
            WYZREX is a digital marketing and creative production agency based in Colombo, Sri Lanka, built on two
            instincts: the discipline to execute and the patience to think first.
          </p>
          <p>
            We work the way a warrior and a philosopher would, side by side — one&apos;s precision in what we ship,
            the other&apos;s care in the thinking behind it. Every project starts with a real question, not a
            template: what does this brand actually need to say, and who needs to hear it?
          </p>
          <p>
            From there, we build. Social content that feels considered instead of automated. Video that holds
            attention past the first three seconds. Identity systems and websites that don&apos;t need an
            explanation to make sense. Paid growth measured by what it earns back, not just what it spends.
          </p>
          <p>
            We stay small by design — every project gets senior attention, not a rotating handoff. Clients come to
            us because they want a partner who moves fast without ever mistaking speed for carelessness.
          </p>
        </div>
      </section>

      <section className="band-surface">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Our Approach</p>
            <h2>Strategy and execution, in equal measure</h2>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card">
              <div className="pillar-card__num">01</div>
              <h3>Think First</h3>
              <p>No template answers. Every engagement starts with the question a brand actually needs answered.</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-card__num">02</div>
              <h3>Ship Fast</h3>
              <p>Momentum matters. We move from strategy to shipped work without losing precision along the way.</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-card__num">03</div>
              <h3>Measure Everything</h3>
              <p>Growth is judged by what it earns back — not impressions, not vanity metrics.</p>
            </div>
            <div className="pillar-card">
              <div className="pillar-card__num">04</div>
              <h3>Stay Senior</h3>
              <p>We stay small by design, so every project gets senior attention, not a rotating handoff.</p>
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
