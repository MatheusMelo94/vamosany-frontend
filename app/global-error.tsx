"use client";

import type { JSX } from "react";
import { montserrat } from "@/lib/fonts";

type Props = { error: Error & { digest?: string }; reset: () => void };

/**
 * Boundary de ultimo recurso: substitui o root layout inteiro, por isso renderiza html/body
 * e nao depende de nada que possa ter falhado (tokens, globals.css). Copy generica por design:
 * a mensagem real fica no log do servidor (frontend-architecture-conventions § Error Handling).
 *
 * Fonte (DDR-0005): a familia da instancia next/font de Montserrat vai inline, sem var() nem
 * classe no <html>, seguida de Arial. Se o CSS/woff2 da fonte nao carregar, a familia nao
 * resolve e o navegador cai em Arial: a pagina nunca depende da fonte para renderizar.
 */
const FONT_FAMILY = `${montserrat.style.fontFamily}, Arial, sans-serif`;

export default function GlobalError({ error, reset }: Props): JSX.Element {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily: FONT_FAMILY,
          margin: 0,
          padding: "4rem 1.5rem",
          color: "#080a0b",
        }}
      >
        <main style={{ maxWidth: "40rem" }}>
          <p
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Algo se rompió
          </p>
          <h1
            style={{
              fontSize: "2rem",
              lineHeight: 1.1,
              margin: "0.5rem 0 1rem",
            }}
          >
            No pudimos cargar esta página.
          </h1>
          <p style={{ margin: "0 0 1.5rem" }}>
            Probá de nuevo en un momento. Si sigue pasando, recargá la página.
            {error.digest ? ` Referencia: ${error.digest}` : null}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "2px solid #080a0b",
              background: "#ffd800",
              padding: "0.75rem 1.25rem",
              font: "inherit",
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Probar de nuevo
          </button>
        </main>
      </body>
    </html>
  );
}
