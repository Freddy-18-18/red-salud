export function ProfilePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <h2 className="text-sm font-medium text-zinc-300 mb-3">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
