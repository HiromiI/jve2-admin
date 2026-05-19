interface FeaturePageProps {
  title: string;
}

function FeaturePage({ title }: FeaturePageProps) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-panel">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
    </section>
  );
}

export default FeaturePage;
