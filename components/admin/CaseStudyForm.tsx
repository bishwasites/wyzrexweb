import UploadField from "@/components/admin/UploadField";
import type { CaseStudy } from "@/db/schema";

interface CaseStudyFormProps {
  action: (formData: FormData) => void;
  initial?: CaseStudy;
  submitLabel: string;
}

export default function CaseStudyForm({ action, initial, submitLabel }: CaseStudyFormProps) {
  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Client name" name="clientName" defaultValue={initial?.clientName} required />
        <Field label="Slug" name="slug" defaultValue={initial?.slug} required placeholder="aurum-and-co" />
        <Field label="Category" name="category" defaultValue={initial?.category} required placeholder="Branding" />
        <Field label="Year" name="year" defaultValue={initial?.year} required placeholder="2025" />
      </div>

      <TextAreaField label="Description" name="description" defaultValue={initial?.description} required />

      <Field
        label="Tags (comma-separated)"
        name="tags"
        defaultValue={initial?.tags?.join(", ")}
        placeholder="Branding, Strategy, Design"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <UploadField name="clientLogoUrl" label="Client logo" defaultValue={initial?.clientLogoUrl} />
        <UploadField
          name="heroMediaUrl"
          label="Hero media"
          defaultValue={initial?.heroMediaUrl}
          accept="image/*,video/*"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <SelectField
          label="Hero media type"
          name="heroMediaType"
          defaultValue={initial?.heroMediaType ?? "image"}
          options={[
            { value: "image", label: "Image" },
            { value: "video", label: "Video" },
          ]}
        />
        <SelectField
          label="Status"
          name="status"
          defaultValue={initial?.status ?? "draft"}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
        <Field
          label="Display order"
          name="displayOrder"
          type="number"
          defaultValue={String(initial?.displayOrder ?? 0)}
        />
      </div>

      <button
        type="submit"
        className="w-fit rounded-pill bg-gold px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="rounded-control border border-line bg-surface px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        rows={4}
        className="resize-y rounded-control border border-line bg-surface px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="rounded-control border border-line bg-surface px-4 py-2.5 text-sm focus:border-gold focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
