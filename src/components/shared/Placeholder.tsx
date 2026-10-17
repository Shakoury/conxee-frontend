export default function Placeholder({ name }: { name: string }) {
  return (
    <section className="flex min-h-64 flex-1 items-center justify-center p-6">
      <h1 className="text-center text-h1">{name}</h1>
    </section>
  );
}
