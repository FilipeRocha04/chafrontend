import { Link, createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";

import butterfly from "@/assets/butterfly.png";
import { PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/inicio")({
  head: () => ({
    meta: [
      { title: "Chá da Maya — listinha de presentes" },
      {
        name: "description",
        content:
          "A mamãe Bella preparou uma listinha especial para o Chá da Maya. Escolha o que você gostaria de levar.",
      },
      { property: "og:title", content: "Chá da Maya 🦋" },
      {
        property: "og:description",
        content: "Escolha com carinho o que você vai levar para o Chá da Maya.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <div className="flex flex-col items-center text-center">
        <img
          src={butterfly}
          alt="Borboleta em aquarela cor-de-rosa"
          width={768}
          height={768}
          className="mt-6 w-32 drop-shadow-sm"
        />

        <h1 className="mt-4 text-4xl leading-tight font-medium text-foreground">Chá da Maya 🦋</h1>

        <p className="mt-3 rounded-2xl bg-card px-4 py-2 text-base font-medium text-foreground shadow-petal">
          Estamos preparando tudo com muito carinho para a chegada da Maya.
        </p>

        <div className="mt-8 w-full rounded-3xl border border-border bg-card p-6 shadow-petal">
          <Heart className="mx-auto h-5 w-5 text-primary" aria-hidden="true" />
          <p className="mt-3 text-[15px] leading-relaxed text-foreground">
            A mamãe Bella preparou uma listinha especial como sugestão. Escolha abaixo o que você
            gostaria de levar para o Chá da Maya. 💕
          </p>
        </div>

        <Link
          to="/lista"
          className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-petal transition-colors hover:bg-primary/90"
        >
          Ver listinha de presentes
        </Link>

        {/* <p className="mt-6 text-sm text-muted-foreground">
          Sem cadastro, sem complicação — é só escolher com o coração.
        </p> */}
      </div>
    </PageShell>
  );
}
