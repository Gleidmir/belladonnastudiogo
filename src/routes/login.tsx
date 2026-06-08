import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Loader2, Phone, User, Mail, Lock } from "lucide-react";
import { BarberGoLogo } from "../components/ui/logo";
import { toast } from "sonner";
import { getCurrentUser, setCurrentUser, addClient } from "../lib/db";
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
      const tenant = params.get("t") || params.get("barberia");
      if (tenant) {
        window.localStorage.setItem("mbg_client_tenant", tenant);
      }
    }
    const session = getCurrentUser();
    if (session) {
      if (session.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/client" });
      }
    }
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
      // Fallback local if Supabase is not configured: allow any email with password '123456'
      if (adminPassword === "123456") {
        setCurrentUser({
          role: "admin",
          name: adminEmail.split("@")[0].toUpperCase(),
          email: adminEmail,
        });
        toast.success(`Login de teste para ${adminEmail} efetuado!`);
        navigate({ to: "/admin" });
      } else {
        toast.error("Para testes locais, utilize a senha padrão 123456.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between antialiased">
      {/* Header / Nav */}
      <header className="px-6 py-4 flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para o início
        </Link>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-zinc-900/60 ring-1 ring-zinc-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <BarberGoLogo className="w-16 h-16 mb-3" />
            <h1 className="text-2xl font-extrabold tracking-tight">Meu Barbeiro <span className="text-amber-500">GO</span></h1>
            <p className="text-zinc-500 text-xs mt-1">Selecione como deseja acessar</p>
          </div>

          {/* Role selection tab */}
          <div className="flex rounded-xl bg-zinc-950/80 p-1 ring-1 ring-zinc-800 mb-6">
            <button
              onClick={() => setActiveTab("client")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                activeTab === "client" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sou Cliente
            </button>
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                activeTab === "admin" ? "bg-amber-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-white"
              }`}
            >
              Sou Barbeiro / ADM
            </button>
          </div>

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
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
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
                    className="w-full rounded-xl bg-zinc-950/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2 text-xs text-amber-400">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Acesso de teste:</span> Use o e-mail <code className="bg-zinc-950 px-1 rounded text-white font-mono text-[10px]">admin@barberboss.com</code> e a senha <code className="bg-zinc-950 px-1 rounded text-white font-mono text-[10px]">123456</code>.
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold tracking-wide text-zinc-950 hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "ENTRAR NO PAINEL →"}
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
