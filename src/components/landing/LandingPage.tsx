import { useState } from "react";
import {
  MessageSquareX,
  CalendarX,
  TrendingDown,
  Scissors,
  Star,
  Check,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  ShieldCheck,
} from "lucide-react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-amber-500/20 via-amber-500/0 to-amber-500/10 blur-2xl" />
      <div className="relative rounded-[2.5rem] bg-zinc-800 p-3 shadow-2xl ring-1 ring-zinc-700">
        <div className="rounded-[2rem] bg-zinc-950 p-1 ring-1 ring-zinc-700">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-zinc-900 to-zinc-950">
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-5 w-24 rounded-full bg-zinc-800" />
            </div>
            <div className="px-5 pb-6 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">Olá, Carlos</p>
                  <p className="text-sm font-bold text-white">Painel de Hoje</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
                  <Scissors className="h-4 w-4 text-amber-400" />
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-zinc-950 shadow-lg">
                <p className="text-[10px] font-semibold uppercase tracking-wider">Faturamento Hoje</p>
                <p className="mt-1 text-2xl font-extrabold">R$ 1.847,00</p>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>+24% vs ontem</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-zinc-800/80 p-3 ring-1 ring-zinc-700">
                  <Users className="h-3.5 w-3.5 text-amber-400" />
                  <p className="mt-1 text-base font-bold text-white">23</p>
                  <p className="text-[9px] text-zinc-400">Atendimentos</p>
                </div>
                <div className="rounded-xl bg-zinc-800/80 p-3 ring-1 ring-zinc-700">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <p className="mt-1 text-base font-bold text-white">8</p>
                  <p className="text-[9px] text-zinc-400">Próximos</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-white">Próximos Horários</p>
                  <p className="text-[10px] text-amber-400">Ver tudo</p>
                </div>
                <div className="mt-2 space-y-1.5">
                  {[
                    { name: "João S.", time: "14:30", svc: "Corte + Barba" },
                    { name: "Pedro M.", time: "15:00", svc: "Corte" },
                    { name: "Lucas A.", time: "15:30", svc: "Barba" },
                  ].map((a) => (
                    <div
                      key={a.name}
                      className="flex items-center gap-2 rounded-lg bg-zinc-800/60 p-2 ring-1 ring-zinc-700/50"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-[10px] font-bold text-amber-400">
                        {a.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-semibold text-white">{a.name}</p>
                        <p className="text-[9px] text-zinc-400">{a.svc}</p>
                      </div>
                      <p className="text-[10px] font-bold text-amber-400">{a.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-zinc-800/60 p-3 ring-1 ring-zinc-700/50">
                <div className="flex items-end justify-between gap-1 h-12">
                  {[40, 65, 50, 80, 70, 95, 85].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-amber-600 to-amber-400"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-[9px] text-zinc-500">Faturamento semanal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  return (
    <div className="rounded-2xl bg-zinc-900 p-6 ring-1 ring-zinc-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Dashboard</p>
          <p className="text-lg font-bold text-white">Visão Geral — Hoje</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/30">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">Ao vivo</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Faturamento", value: "R$ 4.280", trend: "+18%" },
          { icon: Users, label: "Clientes", value: "47", trend: "+9%" },
          { icon: Calendar, label: "Agendados", value: "62", trend: "+12%" },
          { icon: TrendingUp, label: "Ticket Médio", value: "R$ 91", trend: "+6%" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-zinc-950/60 p-4 ring-1 ring-zinc-800">
            <s.icon className="h-4 w-4 text-amber-400" />
            <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className="mt-0.5 text-lg font-extrabold text-white">{s.value}</p>
            <p className="text-[10px] font-semibold text-emerald-400">{s.trend}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl bg-zinc-950/60 p-5 ring-1 ring-zinc-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Faturamento últimos 7 dias</p>
            <p className="text-xs text-zinc-500">R$ 24.180 total</p>
          </div>
          <div className="mt-5 flex items-end justify-between gap-2 h-32">
            {[
              { d: "Seg", h: 45 },
              { d: "Ter", h: 62 },
              { d: "Qua", h: 55 },
              { d: "Qui", h: 78 },
              { d: "Sex", h: 92 },
              { d: "Sáb", h: 100 },
              { d: "Dom", h: 38 },
            ].map((b) => (
              <div key={b.d} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400"
                  style={{ height: `${b.h}%` }}
                />
                <span className="text-[10px] text-zinc-500">{b.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-950/60 p-5 ring-1 ring-zinc-800">
          <p className="text-sm font-semibold text-white">Comissão por barbeiro</p>
          <div className="mt-4 space-y-3">
            {[
              { n: "Rafael", v: 1240, p: 92 },
              { n: "André", v: 980, p: 74 },
              { n: "Bruno", v: 720, p: 54 },
            ].map((b) => (
              <div key={b.n}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white">{b.n}</span>
                  <span className="font-bold text-amber-400">R$ {b.v}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300"
                    style={{ width: `${b.p}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientApp() {
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[300px] rounded-[2.5rem] bg-zinc-800 p-3 shadow-2xl ring-1 ring-zinc-700">
        <div className="rounded-[2rem] bg-zinc-950 p-1 ring-1 ring-zinc-700">
          <div className="overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-zinc-900 to-zinc-950 px-5 py-5">
            <div className="flex justify-center pb-2">
              <div className="h-4 w-20 rounded-full bg-zinc-800" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">BarberPass</p>
            <p className="mt-1 text-lg font-extrabold text-white">Agende em 3 toques</p>

            <p className="mt-5 text-[11px] font-semibold text-zinc-400">1. Profissional</p>
            <div className="mt-2 flex gap-2 overflow-hidden">
              {[
                { n: "Rafael", a: "R", on: true },
                { n: "André", a: "A", on: false },
                { n: "Bruno", a: "B", on: false },
              ].map((b) => (
                <div
                  key={b.n}
                  className={`flex-1 rounded-xl p-2 text-center ring-1 ${
                    b.on ? "bg-amber-500 text-zinc-950 ring-amber-400" : "bg-zinc-800/60 text-white ring-zinc-700"
                  }`}
                >
                  <div
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      b.on ? "bg-zinc-950 text-amber-400" : "bg-zinc-700 text-white"
                    }`}
                  >
                    {b.a}
                  </div>
                  <p className="mt-1 text-[10px] font-semibold">{b.n}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] font-semibold text-zinc-400">2. Serviço</p>
            <div className="mt-2 space-y-1.5">
              {[
                { n: "Corte + Barba", t: "45 min", v: "R$ 70", on: true },
                { n: "Corte", t: "30 min", v: "R$ 45", on: false },
                { n: "Barba", t: "20 min", v: "R$ 30", on: false },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`flex items-center justify-between rounded-lg p-2 ring-1 ${
                    s.on ? "bg-amber-500/10 ring-amber-500/40" : "bg-zinc-800/60 ring-zinc-700"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-semibold text-white">{s.n}</p>
                    <p className="text-[9px] text-zinc-500">{s.t}</p>
                  </div>
                  <p className={`text-[11px] font-bold ${s.on ? "text-amber-400" : "text-zinc-300"}`}>{s.v}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] font-semibold text-zinc-400">3. Horário</p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {["09:00", "10:30", "14:00", "15:30", "16:00", "17:30", "18:00", "19:00"].map((t, i) => (
                <div
                  key={t}
                  className={`rounded-md py-1.5 text-center text-[10px] font-semibold ring-1 ${
                    i === 3
                      ? "bg-amber-500 text-zinc-950 ring-amber-400"
                      : i === 1
                      ? "bg-zinc-800/30 text-zinc-600 line-through ring-zinc-800"
                      : "bg-zinc-800/60 text-white ring-zinc-700"
                  }`}
                >
                  {t}
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition-colors">
              Confirmar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewTabs() {
  const [tab, setTab] = useState<"admin" | "client">("admin");
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-zinc-900/60 p-2 ring-1 ring-zinc-800 max-w-2xl mx-auto">
        {[
          { id: "admin" as const, label: "Painel do Administrador (BarberBoss)" },
          { id: "client" as const, label: "App do Cliente (BarberPass)" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-amber-500 text-zinc-950 shadow-lg"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-8">{tab === "admin" ? <AdminPanel /> : <ClientApp />}</div>
    </div>
  );
}

function SignupCard() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passValid = pass.length >= 6;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-2xl bg-zinc-900/80 p-6 ring-1 ring-zinc-800 backdrop-blur-sm shadow-2xl"
    >
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Acesso Antecipado
        </p>
      </div>
      <p className="mt-2 text-lg font-bold text-white">Comece seu teste de 30 dias</p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            E-mail
          </label>
          <div className="relative mt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@suabarbearia.com"
              className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
            {emailValid && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            )}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Senha
          </label>
          <div className="relative mt-1">
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Crie uma senha segura"
              className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
            {passValid && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-lg bg-amber-500 px-6 py-4 text-sm font-bold tracking-wide text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
      >
        CRIAR MINHA CONTA BARBERBOSS →
      </button>
      <p className="mt-3 text-center text-xs text-zinc-500">
        ✓ Sem cartão de crédito. Teste grátis por 1 mês completo.
      </p>
    </form>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      {/* Nav */}
      <header className="border-b border-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
              <Scissors className="h-5 w-5 text-zinc-950" />
            </div>
            <span className="text-lg font-extrabold tracking-tight">BarberBoss</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#problema" className="hover:text-white transition-colors">Problema</a>
            <a href="#plataforma" className="hover:text-white transition-colors">Plataforma</a>
            <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
          </nav>
          <a
            href="#hero"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-colors"
          >
            Teste Grátis
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="hero" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-amber-400 ring-1 ring-amber-500/20">
              🔥 OFERTA DE LANÇAMENTO: 30 DIAS GRÁTIS
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-4xl">
              Sua Barbearia no <span className="text-amber-400">Piloto Automático</span>.
              O Controle Total do Seu Faturamento na Palma da Mão.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Elimine o caos das mensagens de WhatsApp. Deixe que o{" "}
              <span className="font-semibold text-white">BarberPass</span> agende seus clientes
              sozinhos enquanto você lucra mais e monitora tudo em tempo real.
            </p>

            <div className="mt-8 w-full max-w-md">
              <SignupCard />
            </div>

            <div className="mt-12 flex justify-center">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* PAS */}
      <section id="problema" className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">O Problema</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              O que o caos da agenda manual está custando ao seu bolso hoje?
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {[
              {
                Icon: MessageSquareX,
                title: "Mensagens Perdidas no WhatsApp",
                body: "Enquanto você corta cabelo, 3 clientes desistem esperando você responder para marcar um horário.",
              },
              {
                Icon: CalendarX,
                title: "Cadeiras Vazias e Furos",
                body: "O cliente esquece que agendou e não aparece. Você perde o horário, o barbeiro perde a comissão e sua empresa perde dinheiro.",
              },
              {
                Icon: TrendingDown,
                title: "Falta de Caixa Oculta",
                body: "Você não sabe exatamente quanto faturou na semana, quem pagou em dinheiro ou quanto deve pagar de comissão para cada cadeira.",
              },
            ].map(({ Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-2xl bg-zinc-900/50 p-7 ring-1 ring-zinc-800 hover:ring-amber-500/40 hover:bg-zinc-900 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 ring-1 ring-amber-500/20">
                  <Icon className="h-6 w-6 text-amber-400" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW */}
      <section id="plataforma" className="border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">A Solução</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Todo o controle da sua barbearia em 3 cliques rápidos.
            </h2>
          </div>
          <div className="mt-12">
            <PreviewTabs />
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section id="depoimentos" className="border-t border-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Resultados</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Quem assumiu o controle mudou o jogo.
            </h2>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Marcos Oliveira",
                role: "Dono — Studio Lâmina, SP",
                initials: "MO",
                quote:
                  "Aumentei o faturamento em 35% nos primeiros 20 dias usando o BarberBoss. Os no-shows praticamente sumiram com o lembrete automático.",
                metric: "+35% faturamento",
              },
              {
                name: "Diego Ferreira",
                role: "Dono — Barbearia Rei, RJ",
                initials: "DF",
                quote:
                  "Antes eu perdia horas no WhatsApp respondendo cliente. Hoje a agenda se enche sozinha e eu fecho o caixa em 2 minutos.",
                metric: "8h/semana economizadas",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-zinc-900/60 p-7 ring-1 ring-zinc-800"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-lg font-medium leading-relaxed text-white">
                  "{t.quote}"
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-sm font-extrabold text-zinc-950">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.name}</p>
                      <p className="text-xs text-zinc-400">{t.role}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">
                    {t.metric}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Risk reversal */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-8 sm:p-10 text-zinc-950">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest">Garantia Total</p>
                <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold">
                  30 dias grátis. Sem cartão. Sem risco.
                </h3>
                <p className="mt-2 max-w-xl text-sm font-medium opacity-90">
                  Se em um mês o BarberBoss não organizar sua agenda e aumentar seu faturamento,
                  você simplesmente para de usar. Nada cobrado.
                </p>
              </div>
              <a
                href="#hero"
                className="inline-flex items-center gap-2 rounded-lg bg-zinc-950 px-6 py-4 text-sm font-bold text-amber-400 hover:bg-zinc-900 transition-colors whitespace-nowrap"
              >
                Começar agora <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
                <Scissors className="h-4 w-4 text-zinc-950" />
              </div>
              <span className="font-extrabold tracking-tight">BarberBoss</span>
              <span className="ml-3 hidden sm:inline text-xs text-zinc-500">
                © {new Date().getFullYear()} — Todos os direitos reservados
              </span>
            </div>
            <nav className="flex items-center gap-6 text-xs text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <Clock className="h-3 w-3" /> Suporte
              </a>
            </nav>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/5562993299120"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1 rounded-2xl bg-green-600 px-3 py-2 text-white shadow-2xl shadow-green-600/40 ring-4 ring-green-600/20 hover:bg-green-500 hover:scale-105 transition-all"
      >
        <div className="relative flex h-10 w-10 items-center justify-center">
          <WhatsAppIcon className="h-7 w-7" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">SUPORTE</span>
      </a>
    </div>
  );
}
