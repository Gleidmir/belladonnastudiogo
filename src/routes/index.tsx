import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BellaDonna Studio GO — Agendamento de Salão de Beleza" },
      {
        name: "description",
        content:
          "Agende seu horário no salão em poucos cliques. Simples, rápido e no seu controle.",
      },
      { property: "og:title", content: "BellaDonna Studio GO — Seu Atendimento, Sua Hora" },
      {
        property: "og:description",
        content:
          "Agende seus serviços de manicure, pedicure, sobrancelha, cabelo e cílios em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "keywords", content: "salão de beleza, agendamento online, manicure, pedicure, sobrancelha, alongamento de cilios, progressiva, escova, belladonna studio go" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://belladonnastudiogo.netlify.app/",
      },
    ],
  }),
  component: LandingPage,
});
