import type { Metadata } from "next";
import Link from "next/link";
import FrameSequence from "@/components/FrameSequence";
import WorkCard from "@/components/WorkCard";
import { WORK_ITEMS } from "@/lib/content";
import { PHILOSOPHER_FRAMES } from "@/lib/frames";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected work from WYZREX — branding, web design, social strategy, video production, and paid growth for brands across industries.",
};

export default function WorkPage() {
  return (
    <>
      <FrameSequence
        config={PHILOSOPHER_FRAMES}
        sceneDescription="Illustrated Greek philosopher in quiet contemplation, camera slowly pushing in."
        opacity={0.75}
      />

      <div className="intro-content">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Selected Work</p>
          <h1>Proof, not promises.</h1>
        </div>
      </div>

      <section>
        <div className="container">
          {/* DUMMY DATA — replace with real case studies */}
          <div className="work-grid">
            {WORK_ITEMS.map((item) => (
              <WorkCard key={item.client} item={item} href="/contact" />
            ))}
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
