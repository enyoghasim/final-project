import { Check, X } from "lucide-react";

interface SkillListProps {
  title: string;
  skills: string[];
  variant: "matched" | "missing";
}

const VARIANT_STYLES: Record<
  SkillListProps["variant"],
  { chip: string; icon: string; count: string }
> = {
  matched: {
    chip: "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200",
    icon: "bg-emerald-100 text-emerald-700",
    count: "text-emerald-700",
  },
  missing: {
    chip: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    icon: "bg-amber-100 text-amber-700",
    count: "text-amber-700",
  },
};

export function SkillList({ title, skills, variant }: SkillListProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = variant === "matched" ? Check : X;

  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {title}
        <span className={`text-xs font-normal ${styles.count}`}>({skills.length})</span>
      </h3>
      {skills.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None</p>
      ) : (
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li
              key={skill}
              className={`flex items-center gap-1.5 rounded-full py-1 pl-1.5 pr-3 text-sm font-medium ${styles.chip}`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full ${styles.icon}`}>
                <Icon className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              {skill}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
