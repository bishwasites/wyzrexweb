import { updateAboutCopy, updateContactInfo, updateHomeStats } from "@/lib/actions/settings";
import { getAboutCopy, getContactInfo, getHomeStats } from "@/lib/queries";

export default async function SettingsPage() {
  const [aboutCopy, homeStats, contactInfo] = await Promise.all([getAboutCopy(), getHomeStats(), getContactInfo()]);

  return (
    <div className="flex max-w-3xl flex-col gap-12">
      <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold">About page copy</h2>
        <form action={updateAboutCopy} className="flex flex-col gap-4">
          <textarea
            name="aboutCopy"
            defaultValue={aboutCopy}
            rows={10}
            className="rounded-control border border-line bg-surface px-4 py-3 text-sm focus:border-gold focus:outline-none"
          />
          <button type="submit" className="w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg">
            Save about copy
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Homepage stats</h2>
        <form action={updateHomeStats} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatInput name="projectsDelivered" label="Projects delivered" defaultValue={homeStats.projectsDelivered} />
          <StatInput name="clientRetention" label="Client retention" defaultValue={homeStats.clientRetention} />
          <StatInput name="yearsOfCraft" label="Years of craft" defaultValue={homeStats.yearsOfCraft} />
          <StatInput name="teamNetwork" label="Team & partner network" defaultValue={homeStats.teamNetwork} />
          <button type="submit" className="col-span-2 w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg sm:col-span-4">
            Save stats
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Contact info &amp; socials</h2>
        <form action={updateContactInfo} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatInput name="email" label="Email" defaultValue={contactInfo.email} />
            <StatInput name="phone" label="Phone" defaultValue={contactInfo.phone} />
            <StatInput name="location" label="Location" defaultValue={contactInfo.location} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {contactInfo.socials.map((social) => (
              <StatInput
                key={social.name}
                name={`social_${social.name}`}
                label={`${social.name} URL`}
                defaultValue={social.href}
              />
            ))}
          </div>
          <button type="submit" className="w-fit rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-ink-fg">
            Save contact info
          </button>
        </form>
      </section>
    </div>
  );
}

function StatInput({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="rounded-control border border-line bg-surface px-3 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}
