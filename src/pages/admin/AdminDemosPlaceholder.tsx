export function AdminDemosPlaceholder() {
  return (
    <div className="max-w-lg rounded border border-brand-border bg-brand-surface/40 p-8">
      <h1 className="text-xl font-semibold text-white mb-2">Demos</h1>
      <p className="text-sm text-brand-text-secondary leading-relaxed">
        Under development. Public <code className="text-xs bg-brand-bg px-1">/api/demos</code> still serves
        static data from the server until this section is built.
      </p>
    </div>
  );
}
