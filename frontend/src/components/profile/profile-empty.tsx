export function ProfileEmpty({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted">
      {label}
    </div>
  );
}
