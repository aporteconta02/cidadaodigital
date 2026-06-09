import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your App" },
      { name: "description", content: "Replace this with a one-sentence description of your app." },
      { property: "og:title", content: "Your App" },
      { property: "og:description", content: "Replace this with a one-sentence description of your app." },
    ],
  }),
  component: Index,
});

export function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-background p-4 pb-20">
      <header className="flex items-center justify-between py-6">
        <h1 className="text-3xl font-bold text-primary">CIDADÃO+</h1>
        <div className="size-10 rounded-full bg-muted" />
      </header>

      <main className="flex-1 space-y-6">
        <section className="rounded-2xl border bg-card p-6 shadow-standard">
          <h2 className="text-xl font-bold">Olá, Cidadão!</h2>
          <p className="text-muted-foreground">Como podemos ajudar seu bairro hoje?</p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-4 hover:bg-card-hover border border-border">
            <span className="text-4xl">📢</span>
            <span className="font-bold">Denunciar</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-4 hover:bg-card-hover border border-border">
            <span className="text-4xl">🛒</span>
            <span className="font-bold">Comércio</span>
          </button>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 p-4 backdrop-blur-md">
        <div className="flex justify-around">
          <button className="text-primary">Início</button>
          <button className="sos-pulse size-14 rounded-full bg-sos flex items-center justify-center text-white font-bold">SOS</button>
          <button className="text-muted-foreground">Perfil</button>
        </div>
      </nav>
    </div>
  );
}

