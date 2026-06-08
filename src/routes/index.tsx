import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/components/landing/LandingPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meu Barbeiro GO — Seu Corte, Sua Hora" },
      {
        name: "description",
        content:
          "Agende seu horário online em poucos cliques. Simples, rápido e no seu controle.",
      },
      { property: "og:title", content: "Meu Barbeiro GO — Seu Corte, Sua Hora" },
      {
        property: "og:description",
        content:
          "Elimine a espera. Agende seu corte de cabelo e barba em tempo real.",
      },
      { property: "og:type", content: "website" },
      { name: "keywords", content: "barbearia, agendamento online, barbearia goiás, agendamento de barbeiro, cortar cabelo, fazer barba, barbearia go, meubarbeiro" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://meubarbeirogo.netlify.app/",
      },
    ],
  }),
  component: LandingPage,
});
