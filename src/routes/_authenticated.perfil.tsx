import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  return (
    <div className="p-10 text-white bg-red-500">
      <h1 className="text-4xl font-bold">PERFIL PAGE TEST</h1>
      <p>This should be visible.</p>
    </div>
  );
}
