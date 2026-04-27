export function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-8 border-b pb-5">
      <h2 className="font-serif text-2xl font-medium text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </header>
  );
}
