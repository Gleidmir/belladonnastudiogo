import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Copy,
  Check,
  X,
  Clock,
  Sparkles,
  Lock,
  Calendar,
  AlertTriangle,
  Store,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllBarberShops,
  updateBarberShopSubscription,
  deleteBarberShop,
  type BarberShopProfile,
} from "../lib/db";

export function MasterAdminPanel() {
  const [shops, setShops] = useState<BarberShopProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedShop, setExpandedShop] = useState<string | null>(null);

  const loadShops = async () => {
    setLoading(true);
    try {
      const data = await getAllBarberShops();
      setShops(data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar barbearias do servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, []);

  const handleExtendSubscription = async (
    shop: BarberShopProfile,
    days: number,
    planName: "mensal" | "trimestral" | "semestral" | "anual"
  ) => {
    const now = new Date();
    let baseDate = now;

    // Se já estiver ativa e com vencimento futuro, soma ao vencimento atual
    if (shop.subscriptionStatus === "active" && shop.subscriptionExpiresAt) {
      const currentExpiry = new Date(shop.subscriptionExpiresAt);
      if (currentExpiry > now) {
        baseDate = currentExpiry;
      }
    } else if (shop.subscriptionStatus === "trial" && shop.createdAt) {
      // Se estiver no período de testes (trial) e restar tempo, soma ao tempo restante do trial
      const regDate = new Date(shop.createdAt);
      const trialEndDate = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (trialEndDate > now) {
        baseDate = trialEndDate;
      }
    }

    const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
    const success = await updateBarberShopSubscription(
      shop.tenantId,
      planName,
      "active",
      newExpiry.toISOString()
    );

    if (success) {
      loadShops();
    }
  };

  const handleSetVIP = async (shop: BarberShopProfile) => {
    if (confirm(`Deseja definir a barbearia "${shop.name}" como VIP / Vitalícia?`)) {
      const success = await updateBarberShopSubscription(
        shop.tenantId,
        "master",
        "active",
        null
      );
      if (success) {
        loadShops();
      }
    }
  };

  const handleExpireSubscription = async (shop: BarberShopProfile) => {
    if (confirm(`Deseja desativar a licença da barbearia "${shop.name}" imediatamente?`)) {
      const success = await updateBarberShopSubscription(
        shop.tenantId,
        shop.subscriptionPlan || "mensal",
        "expired",
        new Date().toISOString()
      );
      if (success) {
        loadShops();
      }
    }
  };

  const handleSetTrial = async (shop: BarberShopProfile) => {
    if (confirm(`Deseja redefinir a barbearia "${shop.name}" para o modo Teste Grátis (Trial)?`)) {
      const success = await updateBarberShopSubscription(
        shop.tenantId,
        "mensal",
        "trial",
        null
      );
      if (success) {
        loadShops();
      }
    }
  };

  const handleDeleteShop = async (shop: BarberShopProfile) => {
    const confirm1 = confirm(
      `ATENÇÃO: Você está prestes a excluir permanentemente a barbearia "${shop.name}" (${shop.tenantId}).\n\nIsso apagará TODOS os dados no Supabase (Barbeiros, Serviços, Clientes, Agendamentos e Perfil) bem como o Usuário de Login correspondente.\n\nDeseja continuar?`
    );
    if (!confirm1) return;

    const confirm2 = confirm(
      `CONFIRMAÇÃO FINAL:\n\nEsta ação é IRREVERSÍVEL. Você realmente deseja apagar tudo relacionado à barbearia "${shop.name}" de forma definitiva?`
    );
    if (confirm2) {
      setLoading(true);
      try {
        const success = await deleteBarberShop(shop.tenantId);
        if (success) {
          loadShops();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const copyWhatsAppMessage = (shop: BarberShopProfile) => {
    const isMaster = shop.subscriptionPlan === "master";
    const planLabel = isMaster ? "VIP / Vitalício" : (shop.subscriptionPlan || "Mensal");
    const expiryStr = isMaster 
      ? "Permanente" 
      : shop.subscriptionExpiresAt 
        ? new Date(shop.subscriptionExpiresAt).toLocaleDateString("pt-BR") 
        : "N/A";
    
    const message = `Olá! Passando para informar que sua licença do *Meu Barbeiro GO* foi ativada com sucesso! 🎉\n\n` +
      `💈 *Barbearia:* ${shop.name}\n` +
      `📦 *Plano:* ${planLabel.charAt(0).toUpperCase() + planLabel.slice(1)}\n` +
      `📅 *Validade:* ${expiryStr}\n\n` +
      `Obrigado pela parceria e boas vendas! ✂️🚀`;

    navigator.clipboard.writeText(message);
    toast.success("Mensagem de ativação copiada para área de transferência!");
  };

  const copyActivationLink = (shop: BarberShopProfile, code: string) => {
    const url = `${window.location.origin}/admin?activate_code=${code}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de ativação automática copiado!");
  };

  // Filtragem das barbearias
  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.tenantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (shop: BarberShopProfile) => {
    const status = shop.subscriptionStatus || "expired";
    const plan = shop.subscriptionPlan || "mensal";

    if (plan === "master") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-black text-purple-400 ring-1 ring-purple-500/20">
          <Sparkles className="h-3 w-3" /> VIP / Vitalício
        </span>
      );
    }

    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-400 ring-1 ring-emerald-500/20">
          <Check className="h-3 w-3" /> Ativo
        </span>
      );
    }

    if (status === "expired") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-black text-red-400 ring-1 ring-red-500/20">
          <Lock className="h-3 w-3" /> Inativa
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black text-amber-400 ring-1 ring-amber-500/20">
        <Clock className="h-3 w-3" /> Teste Grátis
      </span>
    );
  };

  const getDaysLeft = (shop: BarberShopProfile) => {
    if (shop.subscriptionPlan === "master") return "Permanente";
    
    const now = new Date();
    if (shop.subscriptionStatus === "active" && shop.subscriptionExpiresAt) {
      const expiresAt = new Date(shop.subscriptionExpiresAt);
      if (now > expiresAt) return "Inativa";
      const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
    }

    if (shop.subscriptionStatus === "trial" && shop.createdAt) {
      const regDate = new Date(shop.createdAt);
      const trialEndDate = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (now > trialEndDate) return "Inativa";
      const diffTime = Math.abs(trialEndDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} ${diffDays === 1 ? 'dia' : 'dias'} (Teste)`;
    }

    return "Inativa";
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 ring-1 ring-zinc-800 rounded-3xl p-6">
        <div className="space-y-1 text-left">
          <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Painel do Administrador Master
          </h2>
          <p className="text-xs text-zinc-400">
            Gerencie todas as barbearias cadastradas no sistema, controle licenças e envie notificações.
          </p>
        </div>
        <button
          onClick={loadShops}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 text-xs font-bold border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
        </button>
      </div>

      {/* Códigos de Ativação Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: "Mensal", code: "ATIVA_MEN_MBG", days: "30 dias" },
          { label: "Trimestral", code: "ATIVA_TRI_MBG", days: "90 dias" },
          { label: "Semestral", code: "ATIVA_SEM_MBG", days: "180 dias" },
          { label: "Anual", code: "ATIVA_ANU_MBG", days: "365 dias" },
          { label: "VIP Vitalício", code: "MASTER_MBG_VIP", days: "Permanente" },
        ].map((item, idx) => (
          <div key={idx} className="bg-zinc-900/40 ring-1 ring-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-2.5">
            <div className="text-left">
              <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">{item.label} ({item.days})</span>
              <div className="font-mono text-xs text-amber-500 mt-1 select-all font-bold">{item.code}</div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.code);
                  toast.success("Código copiado!");
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                title="Copiar Código"
              >
                <Copy className="h-3 w-3" /> Código
              </button>
              <button
                onClick={() => copyActivationLink(null as any, item.code)}
                className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                title="Copiar Link de Ativação Direta"
              >
                <ExternalLink className="h-3 w-3" /> Link
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Listagem e Busca */}
      <div className="bg-zinc-900/40 ring-1 ring-zinc-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full rounded-xl bg-zinc-950/90 pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
            />
          </div>
          <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider">
            Total: {filteredShops.length} Barbearias
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            <span className="text-xs font-semibold">Buscando do Supabase...</span>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 text-xs border-2 border-dashed border-zinc-800 rounded-2xl">
            Nenhuma barbearia cadastrada encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredShops.map((shop) => (
              <div
                key={shop.tenantId}
                className="bg-zinc-950 ring-1 ring-zinc-800/80 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Cabeçalho do Card */}
                <div
                  onClick={() => setExpandedShop(expandedShop === shop.tenantId ? null : shop.tenantId)}
                  className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      {shop.logoUrl ? (
                        <img src={shop.logoUrl} alt={shop.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-5 w-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <h4 className="font-extrabold text-sm text-white truncate">{shop.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono truncate">{shop.tenantId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider block">Restam</span>
                      <span className="text-xs text-zinc-300 font-bold block">{getDaysLeft(shop)}</span>
                    </div>
                    <div>{getStatusBadge(shop)}</div>
                    <div className="text-zinc-500 hover:text-white transition-colors">
                      {expandedShop === shop.tenantId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expansíveis */}
                {expandedShop === shop.tenantId && (
                  <div className="px-5 pb-5 pt-3 border-t border-zinc-900 bg-zinc-900/10 space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Data de Cadastro</span>
                        <span className="text-zinc-300 font-bold mt-1 block">
                          {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString("pt-BR") : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Plano Atual</span>
                        <span className="text-zinc-300 font-bold mt-1 block capitalize">
                          {shop.subscriptionStatus === "trial" ? "Teste Grátis (Trial)" : (shop.subscriptionPlan || "N/A")}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Data de Vencimento</span>
                        <span className="text-zinc-300 font-bold mt-1 block">
                          {shop.subscriptionExpiresAt 
                            ? new Date(shop.subscriptionExpiresAt).toLocaleDateString("pt-BR") + " às " + new Date(shop.subscriptionExpiresAt).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})
                            : shop.subscriptionPlan === "master" 
                              ? "Permanente" 
                              : shop.subscriptionStatus === "trial" && shop.createdAt
                                ? new Date(new Date(shop.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR") + " (Fim do Teste)"
                                : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-zinc-900" />

                    {/* Ações de Licenciamento */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Modificar Licença (Salva direto na nuvem)</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleExtendSubscription(shop, 30, "mensal")}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 text-xs font-bold border border-zinc-800 transition-all cursor-pointer active:scale-95"
                        >
                          +30 Dias
                        </button>
                        <button
                          onClick={() => handleExtendSubscription(shop, 90, "trimestral")}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 text-xs font-bold border border-zinc-800 transition-all cursor-pointer active:scale-95"
                        >
                          +90 Dias (Trimestral)
                        </button>
                        <button
                          onClick={() => handleExtendSubscription(shop, 180, "semestral")}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 text-xs font-bold border border-zinc-800 transition-all cursor-pointer active:scale-95"
                        >
                          +180 Dias (Semestral)
                        </button>
                        <button
                          onClick={() => handleExtendSubscription(shop, 365, "anual")}
                          className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 text-xs font-bold border border-zinc-800 transition-all cursor-pointer active:scale-95"
                        >
                          +365 Dias (Anual)
                        </button>
                        <button
                          onClick={() => handleSetVIP(shop)}
                          className="rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white px-3 py-2 text-xs font-bold border border-purple-500/20 hover:border-transparent transition-all cursor-pointer active:scale-95"
                        >
                          Tornar VIP / Vitalício
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleSetTrial(shop)}
                          className="rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-zinc-950 px-3 py-2 text-xs font-bold border border-amber-500/20 hover:border-transparent transition-all cursor-pointer active:scale-95"
                        >
                          Redefinir para Teste Grátis (Trial)
                        </button>
                        <button
                          onClick={() => handleExpireSubscription(shop)}
                          className="rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3 py-2 text-xs font-bold border border-red-500/20 hover:border-transparent transition-all cursor-pointer active:scale-95"
                        >
                          Desativar Licença (Inativa)
                        </button>
                        <button
                          onClick={() => handleDeleteShop(shop)}
                          className="rounded-xl bg-red-600 hover:bg-red-500 text-white px-3 py-2 text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5 shrink-0" /> Excluir Barbearia
                        </button>
                        <button
                          onClick={() => copyWhatsAppMessage(shop)}
                          className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4.5 py-2 text-xs font-black transition-all cursor-pointer active:scale-95 ml-auto"
                        >
                          Copiar Mensagem WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
