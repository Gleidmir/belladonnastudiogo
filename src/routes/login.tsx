import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Loader2, Phone, User, Mail, Lock } from "lucide-react";
import { BarberGoLogo } from "../components/ui/logo";
import { toast } from "sonner";
import { getCurrentUser, setCurrentUser, addClient, logout, getBarberShopProfile } from "../lib/db";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar - Meu Barbeiro GO" },
      { name: "description", content: "Acesse sua conta para agendar horários ou gerenciar atendimentos na barbearia." },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://meubarbeirogo.netlify.app/login" }
    ]
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"client" | "admin">("client");
  const [loading, setLoading] = useState(false);
  const [isClientOnly, setIsClientOnly] = useState(false);
  const [shopProfile, setShopProfile] = useState<any>(null);

  // Client form state
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  // Admin form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  // Check if already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isAdminOverride = params.get("admin") === "true" || params.get("role") === "admin";
      
      if (isAdminOverride) {
        setIsClientOnly(false);
        setActiveTab("admin");
        window.localStorage.removeItem("mbg_client_tenant");
      } else {
        const tenant = params.get("t") || params.get("barberia");
        if (tenant) {
          window.localStorage.setItem("mbg_client_tenant", tenant);
          setIsClientOnly(true);
          setActiveTab("client");
          getBarberShopProfile(tenant).then(setShopProfile);
        } else {
          setIsClientOnly(false);
          const storedTenant = window.localStorage.getItem("mbg_client_tenant");
          if (storedTenant) {
            getBarberShopProfile(storedTenant).then(setShopProfile);
          }
        }
      }
    }

    const checkSession = async () => {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUser({
            role: "admin",
            name: session.user?.user_metadata?.name || "Barbeiro Administrador",
            email: session.user?.email || "",
          });
          navigate({ to: "/admin" });
        } else {
          // Prevent infinite redirect loops if there is an offline session but no Supabase session
          const localSession = getCurrentUser();
          if (localSession && localSession.role === "admin") {
            logout();
          } else if (localSession && localSession.role === "client") {
            navigate({ to: "/client" });
          }
        }
      } else {
        const session = getCurrentUser();
        if (session) {
          if (session.role === "admin") {
            navigate({ to: "/admin" });
          } else {
            navigate({ to: "/client" });
          }
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || clientPhone.length < 10) {
      toast.error("Por favor, preencha o nome e um telefone válido.");
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      // Add or find client in database
      const client = await addClient(clientName, clientPhone);
      
      // Save session
      setCurrentUser({
        role: "client",
        name: client.name,
        phone: client.phone,
      });

      toast.success(`Bem-vindo, ${client.name}! Redirecionando para o agendamento...`);
      navigate({ to: "/client" });
      setLoading(false);
    }, 800);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });

        if (error) throw error;

        // Save session locally to support getCurrentUser()
        setCurrentUser({
          role: "admin",
          name: data.user?.user_metadata?.name || "Barbeiro Administrador",
          email: adminEmail,
        });

        toast.success("Login administrativo efetuado com sucesso!");
        navigate({ to: "/admin" });
      } catch (error: any) {
        console.error("Erro no login ADM:", error);
        toast.error(error.message || "E-mail ou senha incorretos.");
      } finally {
        setLoading(false);
      }
    } else {
      // Fallback local if Supabase is not configured: check if there's a custom password saved
      const storedPassword = typeof window !== "undefined" ? window.localStorage.getItem(`mbg_local_password_${adminEmail}`) : null;
      const expectedPassword = storedPassword || "123456";
      
      if (adminPassword === expectedPassword) {
        setCurrentUser({
          role: "admin",
          name: adminEmail.split("@")[0].toUpperCase(),
          email: adminEmail,
        });
        toast.success("Login efetuado com sucesso!");
        navigate({ to: "/admin" });
      } else {
        toast.error("Senha incorreta.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between antialiased">
      {/* Header / Nav */}
      {!isClientOnly && (
        <header className="px-6 py-4 flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para o início
          </Link>
        </header>
      )}

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className={`w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl transition-all duration-500 ${
          activeTab === "client" ? "glow-emerald" : "glow-gold"
        }`}>
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            {shopProfile?.logoUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 mb-3 flex items-center justify-center bg-zinc-900 shadow-xl shrink-0">
                <img
                  src={shopProfile.logoUrl}
                  alt={shopProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <BarberGoLogo className="w-16 h-16 mb-3 animate-pulse" />
            )}
            <h1 className="text-2xl font-extrabold tracking-tight">
              {shopProfile ? shopProfile.name : (
                <>Meu Barbeiro <span className="text-amber-500">GO</span></>
              )}
            </h1>
            <p className="text-zinc-500 text-xs mt-1 text-center">
              {isClientOnly ? "Identifique-se para Agendar seu Horário" : "Selecione como deseja acessar"}
            </p>
          </div>
 
          {/* Role selection tab */}
          {!isClientOnly && (
            <div className="flex rounded-xl bg-zinc-950/50 p-1 border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("client")}
                className={`flex-1 rounded-lg py-2.5 text-xs font-black transition-all ${
                  activeTab === "client" ? "bg-amber-500 text-zinc-950 shadow-md glow-emerald-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                Sou Cliente
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`flex-1 rounded-xl py-2.5 text-xs font-black transition-all ${
                  activeTab === "admin" ? "bg-gold-gradient text-zinc-950 shadow-md glow-gold-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                Sou Barbeiro / ADM
              </button>
            </div>
          )}

          {activeTab === "client" ? (
            /* CLIENT FORM */
            <form onSubmit={handleClientSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Seu Nome</label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Celular (WhatsApp)</label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ex: 62999998888"
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Apenas números com DDD</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold tracking-wide text-zinc-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "AGENDAR MEU HORÁRIO →"}
              </button>
            </form>
          ) : (
            /* ADMIN FORM */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">E-mail Administrativo</label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@barberboss.com"
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Senha</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-[#fbbf24] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gold-gradient py-3.5 text-sm font-bold tracking-wide hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-950" /> : "ENTRAR NO PAINEL →"}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-600 border-t border-zinc-900/60">
        © {new Date().getFullYear()} Meu Barbeiro GO — Todos os direitos reservados.
      </footer>
    </div>
  );
}
