import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { BarberGoLogo } from "../ui/logo";
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
  Loader2,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";
import { toast } from "sonner";
import { setCurrentUser } from "../../lib/db";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
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
            <p className="text-[10px] uppercase tracking-widest text-zinc-500">Meu Barbeiro GO</p>
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
          { id: "admin" as const, label: "Painel do Administrador (Meu Barbeiro GO)" },
          { id: "client" as const, label: "App do Cliente (Meu Barbeiro GO)" },
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
  const [loading, setLoading] = useState(false);
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passValid = pass.length >= 6;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !passValid) {
      toast.error("Por favor, preencha um e-mail válido e uma senha com no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    // Initialize tenant config locally to start the 30-day trial immediately
    if (typeof window !== "undefined") {
      const configKey = `mbg_tenant_config_${email}`;
      if (!window.localStorage.getItem(configKey)) {
        window.localStorage.setItem(configKey, JSON.stringify({
          registeredAt: new Date().toISOString(),
          subscriptionStatus: "trial",
        }));
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password: pass,
          options: {
            data: {
              role: "admin",
              name: "Barbeiro Administrador",
            }
          }
        });

        if (error) throw error;

        toast.success("Cadastro efetuado! Se necessário, confirme seu e-mail ou faça login no painel.");
        navigate({ to: "/login" });
      } catch (error: any) {
        console.error("Erro no cadastro:", error);
        toast.error(error.message || "Erro ao efetuar cadastro. Tente novamente.");
      } finally {
        setLoading(false);
      }
    } else {
      // Save password locally for local mock login
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`mbg_local_password_${email}`, pass);
      }
      
      // Local fallback: log in directly using the newly registered email as the tenant ID!
      setCurrentUser({
        role: "admin",
        name: "Barbeiro Administrador",
        email: email,
      });
      toast.success("Cadastro de teste efetuado e conectado com sucesso!");
      navigate({ to: "/admin" });
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-amber-500 px-4 py-3 sm:px-6 sm:py-4 text-xs sm:text-sm font-bold tracking-wide text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "CRIAR MINHA CONTA →"}
      </button>
      <p className="mt-3 text-center text-xs text-zinc-500">
        ✓ Sem cartão de crédito. Teste grátis por 1 mês completo.
      </p>
    </form>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isPWA = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      const savedTenant = window.localStorage.getItem("mbg_client_tenant");
      
      if (isPWA && savedTenant) {
        navigate({ to: `/client?t=${savedTenant}` });
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased">
      {/* Nav */}
      <header className="border-b border-zinc-900 bg-zinc-950 sticky top-0 z-40 pt-[calc(28px+env(safe-area-inset-top,0px))] sm:pt-3 pb-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <BarberGoLogo className="w-6 h-6 sm:w-8 h-8 shrink-0 animate-pulse" />
            <span className="text-[10px] xs:text-xs sm:text-base md:text-lg font-extrabold tracking-tight whitespace-nowrap truncate">
              Meu Barbeiro <span className="text-amber-500">GO</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              to="/login"
              className="rounded-lg border border-emerald-500 bg-zinc-950 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold text-emerald-400 hover:text-zinc-950 hover:bg-emerald-500 transition-all whitespace-nowrap"
            >
              Entrar
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById("pricing-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="rounded-lg bg-amber-500 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-xs md:text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all whitespace-nowrap cursor-pointer"
            >
              Planos
            </button>
          </div>
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
            <h1 className="mt-6 text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] sm:leading-[1.05] tracking-tight max-w-4xl">
              Sua Barbearia no <span className="text-amber-400">Piloto Automático</span>.
              O Controle Total do Seu Faturamento na Palma da Mão.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Elimine o caos das mensagens de WhatsApp. Deixe que o{" "}
              <span className="font-semibold text-white">Meu Barbeiro GO</span> agende seus clientes
              sozinhos enquanto você lucra mais e monitora tudo em tempo real.
            </p>

            <div className="mt-8 w-full max-w-md">
              <SignupCard />
            </div>


          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing-section" className="py-20 border-t border-zinc-900 bg-zinc-950/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Planos de Assinatura</h2>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Escolha o melhor plano para a sua barbearia
            </p>
            <p className="mt-4 text-base text-zinc-400">
              Todas as assinaturas iniciam com o período de 30 dias de teste grátis automático a partir do seu cadastro na página inicial.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Mensal", price: "R$ 29,90", rawPrice: 29.90, desc: "Acesso total por 30 dias", detail: "R$ 29,90 / mês" },
              { name: "Trimestral", price: "R$ 74,90", rawPrice: 74.90, desc: "Acesso total por 90 dias", detail: "R$ 24,96 / mês", popular: true },
              { name: "Semestral", price: "R$ 139,90", rawPrice: 139.90, desc: "Acesso total por 180 dias", detail: "R$ 23,31 / mês" },
              { name: "Anual", price: "R$ 239,90", rawPrice: 239.90, desc: "Acesso total por 365 dias", detail: "R$ 19,99 / mês", bestDeal: true },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col justify-between p-6 rounded-2xl border text-left bg-zinc-900/60 transition-all ${
                  p.popular
                    ? "border-amber-500 ring-2 ring-amber-500/20"
                    : "border-zinc-800"
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-4 rounded-full bg-amber-500 text-zinc-950 font-black text-[9px] px-2 py-0.5 uppercase tracking-wider">
                    Mais Popular
                  </span>
                )}
                {p.bestDeal && (
                  <span className="absolute -top-3 left-4 rounded-full bg-emerald-500 text-zinc-950 font-black text-[9px] px-2 py-0.5 uppercase tracking-wider">
                    Melhor Preço
                  </span>
                )}
                <div>
                  <h3 className="text-base font-extrabold text-white tracking-wide">{p.name}</h3>
                  <p className="text-3xl font-black text-white mt-3">{p.price}</p>
                  <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase tracking-wider">{p.detail}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800 w-full space-y-4">
                  <p className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {p.desc}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    A ativação do plano é realizada enviando o comprovante via WhatsApp.
                  </p>
                  <a
                    href={`https://wa.me/5562993299120?text=${encodeURIComponent(`Olá Gleidmir! Gostaria de adquirir o plano *${p.name}* (R$ ${p.price}) para minha barbearia.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 py-3 text-xs font-bold transition-all shadow shadow-amber-500/10 cursor-pointer text-center"
                  >
                    Adquirir Plano
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center max-w-xl mx-auto bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 text-xs text-zinc-400">
            💡 <strong>Quer testar antes?</strong> Basta criar sua conta no formulário no topo da página. Sua barbearia ganhará <strong>30 dias de teste grátis imediatamente</strong>, sem necessidade de pagamento inicial!
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <BarberGoLogo className="w-6 h-6 sm:w-8 h-8" />
              <span className="font-extrabold tracking-tight text-xs sm:text-base whitespace-nowrap">Meu Barbeiro <span className="text-amber-500">GO</span></span>
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
