export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CIDADÃO+ | Erro</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #080C18; color: #F0F4FF; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: #0F1629; border-radius: 1.5rem; border: 1px solid #1E2D4A; }
      h1 { font-size: 1.5rem; margin: 0 0 0.5rem; color: #00C4FF; font-weight: 800; }
      p { color: #8899BB; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.75rem 1.5rem; border-radius: 1rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-weight: bold; }
      .primary { background: #00C4FF; color: #080C18; }
      .secondary { background: transparent; color: #F0F4FF; border-color: #1E2D4A; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Ops! Algo deu errado.</h1>
      <p>Não foi possível carregar esta página. Tente recarregar ou volte para o início.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Tentar novamente</button>
        <a class="secondary" href="/">Voltar ao início</a>
      </div>
    </div>

  </body>
</html>`;
}
