interface Stat {
  value: number;
  label: string;
}

export function ProfileStats({ stats }: { stats: Stat[] }) {
  return (
    <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-6">
      {stats.map((s) => (
        <div key={s.label} className="rounded-md border bg-surface p-4">
          <dd className="font-serif text-3xl font-medium leading-none text-ink tabular-nums">
            {s.value}
          </dd>
          <dt className="mt-1 text-xs uppercase tracking-wider text-muted">{s.label}</dt>
        </div>
      ))}
    </dl>
  );
}
