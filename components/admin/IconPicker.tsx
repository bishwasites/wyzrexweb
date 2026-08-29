"use client";

import { useState } from "react";
import { ServiceIcon, SERVICE_ICON_NAMES } from "@/components/site/Icons";

interface IconPickerProps {
  name: string;
  label: string;
  defaultValue?: string;
}

// Dropdown over the lucide icons the public site knows how to render, with a
// live preview of the current choice. Deliberately limited to that curated
// list rather than all ~1500 lucide icons: ServiceIcon only maps these, so
// offering the rest would let an editor pick something that silently falls
// back to the default glyph.
export default function IconPicker({ name, label, defaultValue }: IconPickerProps) {
  const [value, setValue] = useState(defaultValue || SERVICE_ICON_NAMES[0] || "sparkles");

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-control border border-line bg-bg text-gold-dark">
          <ServiceIcon name={value} />
        </span>
        <select
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-control border border-line bg-bg px-3 py-2 text-sm"
        >
          {SERVICE_ICON_NAMES.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
