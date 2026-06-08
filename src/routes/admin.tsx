import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BarberGoLogo } from "../components/ui/logo";
import {
  Scissors,
  DollarSign,
  Users,
  CalendarCheck,
  TrendingUp,
  LogOut,
  Trash2,
  Edit2,
  Plus,
  Check,
  X,
  Search,
  Sliders,
  Calendar,
  Layers,
  ChevronRight,
  TrendingDown,
  UserCheck,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";
import {
  getCurrentUser,
  logout,
  getAppointments,
  getClients,
  getServices,
  getDashboardStats,
  updateAppointmentStatus,
  addService,
  updateService,
  deleteService,
  Service,
  Appointment,
  Client,
  getBarbers,
  addBarber,
  updateBarber,
  deleteBarber,
  Barber,
} from "../lib/db";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const weekdaysList = [
  { label: "Dom", value: 0 },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sáb", value: 6 }
];

const hourOptions = [
  "06:00", "07:00", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "22:00"
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "agenda" | "clientes" | "servicos" | "barbeiros">("dashboard");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for DB data
  const [stats, setStats] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  // Search filters
  const [clientSearch, setClientSearch] = useState("");
  const [agendaFilter, setAgendaFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");

  // Edit/Add service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState<number | string>("");
  const [serviceDuration, setServiceDuration] = useState<number | string>("");

  // Edit/Add barber form state
  const [showBarberForm, setShowBarberForm] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
  const [barberName, setBarberName] = useState("");
  const [barberAvatar, setBarberAvatar] = useState("");
  const [barberPhone, setBarberPhone] = useState("");
  const [barberWorkDays, setBarberWorkDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);
  const [barberStartTime, setBarberStartTime] = useState("08:00");
  const [barberEndTime, setBarberEndTime] = useState("19:00");
  const [barberBlockedDates, setBarberBlockedDates] = useState("");

  // Load session and data
  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate({ to: "/login" });
          return;
        }
        setSession(session.user);
      } else {
        const user = getCurrentUser();
        if (!user || user.role !== "admin") {
          navigate({ to: "/login" });
          return;
        }
        setSession(user);
      }
      await loadAllData();
      setMounted(true);
    };

    checkAuth();
  }, [navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [s, a, c, svcs, barbs] = await Promise.all([
        getDashboardStats(),
        getAppointments(),
        getClients(),
        getServices(),
        getBarbers(),
      ]);
      setStats(s);
      setAppointments(a);
      setClients(c);
      setServices(svcs);
      setBarbers(barbs);
    } catch (e) {
      console.error("Erro ao carregar dados no admin:", e);
      toast.error("Erro ao sincronizar dados do servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    logout();
    navigate({ to: "/" });
  };

  // Appointment Actions
  const handleCompleteApt = async (id: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(id, "completed");
      await loadAllData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleCancelApt = async (id: string) => {
    if (confirm("Deseja realmente cancelar este agendamento?")) {
      setLoading(true);
      try {
        await updateAppointmentStatus(id, "cancelled");
        await loadAllData();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  };

  // Service Actions
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim() || !servicePrice || !serviceDuration) {
      toast.error("Por favor, preencha todos os campos do serviço.");
      return;
    }

    const priceNum = Number(servicePrice);
    const durationNum = Number(serviceDuration);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("O preço deve ser um número positivo.");
      return;
    }
    if (isNaN(durationNum) || durationNum <= 0) {
      toast.error("A duração deve ser um número positivo de minutos.");
      return;
    }

    setLoading(true);
    try {
      if (editingService) {
        await updateService({
          ...editingService,
          name: serviceName,
          price: priceNum,
          duration: durationNum,
        });
        setEditingService(null);
      } else {
        await addService({
          name: serviceName,
          price: priceNum,
          duration: durationNum,
        });
      }

      // Reset Form
      setServiceName("");
      setServicePrice("");
      setServiceDuration("");
      setShowServiceForm(false);
      await loadAllData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleEditServiceClick = (svc: Service) => {
    setEditingService(svc);
    setServiceName(svc.name);
    setServicePrice(svc.price);
    setServiceDuration(svc.duration);
    setShowServiceForm(true);
  };

  const handleDeleteServiceClick = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este serviço? Ele não aparecerá mais para agendamento.")) {
      setLoading(true);
      try {
        await deleteService(id);
        await loadAllData();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  };

  const handleBarberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barberName.trim()) {
      toast.error("Por favor, preencha o nome do barbeiro.");
      return;
    }

    const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face";
    const avatarUrl = barberAvatar.trim() || defaultAvatar;
    const cleanPhone = barberPhone.replace(/\D/g, "");

    const parsedBlocked = barberBlockedDates
      .split(",")
      .map((d) => d.trim())
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));

    setLoading(true);
    try {
      if (editingBarber) {
        await updateBarber({
          ...editingBarber,
          name: barberName,
          avatar: avatarUrl,
          phone: cleanPhone || undefined,
          workDays: barberWorkDays,
          startTime: barberStartTime,
          endTime: barberEndTime,
          blockedDates: parsedBlocked,
        });
        setEditingBarber(null);
      } else {
        await addBarber({
          name: barberName,
          avatar: avatarUrl,
          phone: cleanPhone || undefined,
          workDays: barberWorkDays,
          startTime: barberStartTime,
          endTime: barberEndTime,
          blockedDates: parsedBlocked,
        });
      }

      setBarberName("");
      setBarberAvatar("");
      setBarberPhone("");
      setBarberWorkDays([1, 2, 3, 4, 5, 6]);
      setBarberStartTime("08:00");
      setBarberEndTime("19:00");
      setBarberBlockedDates("");
      setShowBarberForm(false);
      await loadAllData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const handleEditBarberClick = (barber: Barber) => {
    setEditingBarber(barber);
    setBarberName(barber.name);
    setBarberAvatar(barber.avatar);
    setBarberPhone(barber.phone || "");
    setBarberWorkDays(barber.workDays || [1, 2, 3, 4, 5, 6]);
    setBarberStartTime(barber.startTime || "08:00");
    setBarberEndTime(barber.endTime || "19:00");
    setBarberBlockedDates((barber.blockedDates || []).join(", "));
    setShowBarberForm(true);
  };

  const handleDeleteBarberClick = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este barbeiro?")) {
      setLoading(true);
      try {
        await deleteBarber(id);
        await loadAllData();
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
  };

  const handleToggleServiceActive = async (svc: Service) => {
    setLoading(true);
    try {
      const updated = { ...svc, isActive: svc.isActive === false ? true : false };
      await updateService(updated);
      await loadAllData();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };

  const getClientReminderLink = (apt: Appointment) => {
    let cleanPhone = apt.clientPhone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    }
    
    const dateStr = new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR");
    const message = `Olá, ${apt.clientName}! Passando para lembrar do seu agendamento no Meu Barbeiro GO:\n\n` +
      `💇 *Serviço:* ${apt.serviceName}\n` +
      `📅 *Data:* ${dateStr}\n` +
      `⏰ *Horário:* ${apt.time}\n` +
      `💈 *Profissional:* ${apt.barberName}\n\n` +
      `Confirmado? Te esperamos lá!`;
      
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${String(hrs).padStart(2, "0")}:${String(rem).padStart(2, "0")} h`;
    }
    return `${mins} min`;
  };

  // Filters for client list
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
  );

  // Filters for agenda list
  const todayStr = mounted ? new Date().toISOString().split("T")[0] : "";
  const filteredAppointments = appointments.filter((apt) => {
    if (agendaFilter === "all") return true;
    return apt.status === agendaFilter;
  });

  // Today's appointments only
  const todaysAppointments = appointments.filter(
    (apt) => apt.date === todayStr && apt.status === "pending"
  );

  if (!session || !stats) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased flex flex-col justify-between relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-zinc-900 ring-1 ring-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500" />
            <span className="text-xs text-zinc-300 font-semibold">Atualizando...</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-zinc-900 bg-zinc-900/40 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <BarberGoLogo className="w-10 h-10" />
            <div>
              <span className="text-base font-extrabold tracking-tight block">Meu Barbeiro <span className="text-amber-500">GO</span></span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Painel do Barbeiro</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 ring-1 ring-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-300">Caixa Aberto</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 px-4 py-2 text-xs font-bold border border-zinc-800 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: "dashboard" as const, label: "Dashboard", icon: Sliders },
            { id: "agenda" as const, label: "Agenda / Agendamentos", icon: Calendar, badge: todaysAppointments.length },
            { id: "clientes" as const, label: "Clientes Cadastrados", icon: Users },
            { id: "servicos" as const, label: "Gerenciar Serviços", icon: Layers },
            { id: "barbeiros" as const, label: "Gerenciar Barbeiros", icon: Scissors },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-xs font-bold transition-all border ${
                activeTab === tab.id
                  ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/10"
                  : "bg-zinc-900/40 text-zinc-400 border-zinc-900 hover:text-white hover:bg-zinc-900/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </div>
              {tab.badge && tab.badge > 0 ? (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id ? "bg-zinc-950 text-amber-500" : "bg-amber-500/20 text-amber-400"
                }`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </aside>

        {/* Content Section */}
        <main className="lg:col-span-4 space-y-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* KPIs Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { label: "Faturamento Hoje", value: formatPrice(stats.dailyEarnings), icon: DollarSign, trend: "Diário", color: "text-emerald-400" },
                  { label: "Faturamento Semanal", value: formatPrice(stats.weeklyEarnings), icon: TrendingUp, trend: "Últimos 7 dias", color: "text-amber-400" },
                  { label: "Faturamento Mensal", value: formatPrice(stats.monthlyEarnings), icon: DollarSign, trend: "Mês Corrente", color: "text-sky-400" },
                  { label: "Faturamento Anual", value: formatPrice(stats.yearlyEarnings), icon: TrendingUp, trend: "Ano Corrente", color: "text-indigo-400" },
                  { label: "Clientes Cadastrados", value: stats.registeredClients, icon: Users, trend: "Total histórico", color: "text-purple-400" },
                  { label: "Serviços Realizados", value: stats.completedServices, icon: CalendarCheck, trend: "Finalizados", color: "text-pink-400" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5 hover:ring-zinc-800 transition-all flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{kpi.label}</span>
                      <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                    <div className="mt-4">
                      <p className="text-xl font-extrabold text-white tracking-tight">{kpi.value}</p>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-1 uppercase">{kpi.trend}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              {mounted && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Revenue History Chart */}
                  <div className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Evolução do Faturamento (Histórico 12 Meses)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.monthlyHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }}
                            labelClassName="font-bold text-white"
                          />
                          <Area type="monotone" dataKey="faturamento" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorFaturamento)" name="Faturamento (R$)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Barber Performance Chart */}
                  <div className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Desempenho por Barbeiro (Faturamento)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.barberPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", fontSize: "11px" }}
                            labelClassName="font-bold text-white"
                          />
                          <Bar dataKey="faturamento" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Faturamento (R$)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              )}

              {/* Service Popularity Grid */}
              <div className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Serviços Mais Procurados (Top 5)</h3>
                <div className="space-y-3">
                  {stats.servicePopularity.map((svc: any, idx: number) => {
                    const maxVal = stats.servicePopularity[0]?.valor || 1;
                    const pct = (svc.valor / maxVal) * 100;
                    return (
                      <div key={svc.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">{idx + 1}. {svc.name}</span>
                          <span className="text-amber-400">{svc.valor} atendimentos</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.servicePopularity.length === 0 && (
                    <p className="text-center text-xs text-zinc-600">Nenhum atendimento realizado ainda.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AGENDA / APPOINTMENTS */}
          {activeTab === "agenda" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Controle de Horários</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Gerencie os atendimentos agendados pelos clientes.</p>
                </div>
                
                {/* Filter Selector */}
                <div className="flex gap-1.5 rounded-lg bg-zinc-950 p-1 ring-1 ring-zinc-800 self-start sm:self-center">
                  {[
                    { id: "all" as const, label: "Todos" },
                    { id: "pending" as const, label: "Agendados" },
                    { id: "completed" as const, label: "Realizados" },
                    { id: "cancelled" as const, label: "Cancelados" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAgendaFilter(f.id)}
                      className={`rounded px-2.5 py-1.5 text-[10px] font-black transition-all ${
                        agendaFilter === f.id ? "bg-amber-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-3">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl bg-zinc-900/40 border border-zinc-900 p-6">
                    <p className="text-xs text-zinc-600">Nenhum agendamento correspondente encontrado.</p>
                  </div>
                ) : (
                  filteredAppointments.slice(0, 100).map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-zinc-900/60 ring-1 ring-zinc-900 hover:ring-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800 text-amber-500">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-black text-white">{apt.clientName}</h4>
                            <a
                              href={`https://wa.me/55${apt.clientPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-zinc-500 hover:text-green-400 transition-colors font-mono"
                            >
                              ({apt.clientPhone})
                            </a>
                          </div>
                          <p className="text-xs text-zinc-300 font-semibold mt-1">
                            {apt.serviceName} • <span className="text-zinc-500">com {apt.barberName}</span>
                          </p>
                          <p className="text-[10px] text-zinc-500 font-bold mt-1">
                            Data: {new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR")} às{" "}
                            <span className="text-amber-400 font-black">{apt.time}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-0 border-zinc-800 pt-3 md:pt-0">
                        {/* Price */}
                        <div className="text-left md:text-right">
                          <span className="text-[9px] text-zinc-500 uppercase font-bold block">Valor</span>
                          <span className="text-xs font-black text-sky-400 block">{formatPrice(apt.price)}</span>
                        </div>

                        {/* Status / Controls */}
                        <div className="flex items-center gap-2">
                          {apt.status === "completed" && (
                            <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[9px] font-black text-emerald-400">
                              Realizado
                            </span>
                          )}
                          {apt.status === "cancelled" && (
                            <span className="rounded bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[9px] font-black text-red-400">
                              Cancelado
                            </span>
                          )}
                          {apt.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleCancelApt(apt.id)}
                                className="p-2 rounded-xl bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                                title="Cancelar Agendamento"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <a
                                href={getClientReminderLink(apt)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white px-3.5 py-2 text-xs font-bold transition-all shadow shadow-green-500/10 active:scale-95"
                                title="Enviar Lembrete via WhatsApp"
                              >
                                <WhatsAppIcon className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Lembrete</span>
                              </a>
                              <button
                                onClick={() => handleCompleteApt(apt.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-2 text-xs font-bold transition-all shadow shadow-emerald-500/10"
                              >
                                <Check className="h-3.5 w-3.5" /> Concluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CLIENTS */}
          {activeTab === "clientes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Clientes Cadastrados</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Veja a lista de clientes cadastrados no sistema.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Pesquisar por nome ou celular"
                    className="w-full rounded-xl bg-zinc-950/90 pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Clients Table */}
              <div className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/40 text-zinc-500 uppercase tracking-wider font-bold">
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Celular (WhatsApp)</th>
                        <th className="p-4">Cadastrado em</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="p-4 font-bold text-white flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[10px]">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{client.name}</span>
                          </td>
                          <td className="p-4 font-mono text-zinc-400">
                            <a
                              href={`https://wa.me/55${client.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-green-400 transition-colors"
                            >
                              {client.phone}
                            </a>
                          </td>
                          <td className="p-4 text-zinc-500">
                            {new Date(client.registeredAt).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href={`https://wa.me/55${client.phone}?text=Ol%C3%A1%20${encodeURIComponent(client.name)}!%20Tudo%20bem%3F%20Entramos%20em%20contato%20pela%20Barbearia.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                            >
                              Enviar Mensagem
                            </a>
                          </td>
                        </tr>
                      ))}
                      {filteredClients.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-zinc-600">
                            Nenhum cliente correspondente encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GERENCIAR SERVIÇOS */}
          {activeTab === "servicos" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Gerenciador de Serviços</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Configure os serviços disponíveis para agendamento dos clientes.</p>
                </div>
                {!showServiceForm && (
                  <button
                    onClick={() => {
                      setEditingService(null);
                      setServiceName("");
                      setServicePrice("");
                      setServiceDuration("");
                      setShowServiceForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 text-xs font-bold transition-all shadow shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" /> Novo Serviço
                  </button>
                )}
              </div>

              {/* Service Creator/Editor Form */}
              {showServiceForm && (
                <form
                  onSubmit={handleServiceSubmit}
                  className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {editingService ? "Editar Serviço" : "Cadastrar Novo Serviço"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Serviço</label>
                      <input
                        type="text"
                        required
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        placeholder="Ex: Corte Degradê"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Valor (R$)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        placeholder="Ex: 45.00"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Duração (Minutos)</label>
                      <input
                        type="number"
                        required
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(e.target.value)}
                        placeholder="Ex: 30"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowServiceForm(false);
                        setEditingService(null);
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 text-xs font-bold transition-all shadow"
                    >
                      {editingService ? "Salvar Alterações" : "Adicionar Serviço"}
                    </button>
                  </div>
                </form>
              )}

              {/* Services List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className={`bg-zinc-900/60 ring-1 rounded-2xl p-4 flex justify-between items-start transition-all ${
                      svc.isActive === false ? "ring-zinc-950/40 opacity-50" : "ring-zinc-900 hover:ring-zinc-800"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-black text-white">{svc.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDuration(svc.duration)}</span>
                      </div>
                      <p className="text-xs font-black text-sky-400 mt-2">{formatPrice(svc.price)}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Active toggle */}
                      <button
                        onClick={() => handleToggleServiceActive(svc)}
                        className={`rounded px-2 py-1 text-[9px] font-black transition-all ${
                          svc.isActive === false
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                        title={svc.isActive === false ? "Clique para ativar" : "Clique para desativar"}
                      >
                        {svc.isActive === false ? "Desativo" : "Ativo"}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleEditServiceClick(svc)}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteServiceClick(svc.id)}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GERENCIAR BARBEIROS */}
          {activeTab === "barbeiros" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Gerenciador de Barbeiros</h2>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Adicione, edite ou remova profissionais da sua barbearia.</p>
                </div>
                {!showBarberForm && (
                  <button
                    onClick={() => {
                      setEditingBarber(null);
                      setBarberName("");
                      setBarberAvatar("");
                      setBarberPhone("");
                      setShowBarberForm(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 text-xs font-bold transition-all shadow shadow-amber-500/10"
                  >
                    <Plus className="h-4 w-4" /> Novo Barbeiro
                  </button>
                )}
              </div>

              {/* Barber Creator/Editor Form */}
              {showBarberForm && (
                <form
                  onSubmit={handleBarberSubmit}
                  className="bg-zinc-900/60 ring-1 ring-zinc-900 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-top-3 duration-200"
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {editingBarber ? "Editar Barbeiro" : "Cadastrar Novo Barbeiro"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Nome do Barbeiro</label>
                      <input
                        type="text"
                        required
                        value={barberName}
                        onChange={(e) => setBarberName(e.target.value)}
                        placeholder="Ex: Rafael Silva"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Celular (WhatsApp - com DDD)</label>
                      <input
                        type="text"
                        value={barberPhone}
                        onChange={(e) => setBarberPhone(e.target.value)}
                        placeholder="Ex: (62) 99329-9120"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Foto (URL da Imagem - Opcional)</label>
                      <input
                        type="url"
                        value={barberAvatar}
                        onChange={(e) => setBarberAvatar(e.target.value)}
                        placeholder="Deixe em branco para usar foto padrão"
                        className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {/* Dias de Atendimento */}
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Dias de Atendimento</label>
                      <div className="flex flex-wrap gap-2">
                        {weekdaysList.map((day) => {
                          const isChecked = barberWorkDays.includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  if (barberWorkDays.length > 1) {
                                    setBarberWorkDays(barberWorkDays.filter(d => d !== day.value));
                                  }
                                } else {
                                  setBarberWorkDays([...barberWorkDays, day.value].sort());
                                }
                              }}
                              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                                isChecked
                                  ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-md shadow-amber-500/10"
                                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horários de Início e Fim */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">Horário do Turno</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={barberStartTime}
                          onChange={(e) => setBarberStartTime(e.target.value)}
                          className="flex-1 rounded-xl bg-zinc-950 px-3 py-2.5 text-xs text-white ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-xs text-zinc-600 font-bold">até</span>
                        <select
                          value={barberEndTime}
                          onChange={(e) => setBarberEndTime(e.target.value)}
                          className="flex-1 rounded-xl bg-zinc-950 px-3 py-2.5 text-xs text-white ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Datas de Folga Específicas / Bloqueios (Formato: AAAA-MM-DD, separados por vírgula)</label>
                    <input
                      type="text"
                      value={barberBlockedDates}
                      onChange={(e) => setBarberBlockedDates(e.target.value)}
                      placeholder="Ex: 2026-06-12, 2026-06-25 (deixe em branco se nenhuma)"
                      className="w-full rounded-xl bg-zinc-950 mt-1.5 px-4 py-3 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBarberForm(false);
                        setEditingBarber(null);
                        setBarberName("");
                        setBarberAvatar("");
                        setBarberPhone("");
                        setBarberWorkDays([1, 2, 3, 4, 5, 6]);
                        setBarberStartTime("08:00");
                        setBarberEndTime("19:00");
                        setBarberBlockedDates("");
                      }}
                      className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2.5 text-xs font-bold transition-all shadow"
                    >
                      {editingBarber ? "Salvar Alterações" : "Adicionar Barbeiro"}
                    </button>
                  </div>
                </form>
              )}

              {/* Barbers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="bg-zinc-900/60 ring-1 ring-zinc-900 hover:ring-zinc-800 rounded-2xl p-4 flex justify-between items-center transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={barber.avatar}
                        alt={barber.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-zinc-800 shadow"
                      />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{barber.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-zinc-500 font-bold">Profissional</span>
                          {barber.phone && (
                            <>
                              <span className="text-[10px] text-zinc-600">•</span>
                              <span className="text-[10px] text-zinc-400 font-mono font-bold">
                                {barber.phone.length === 13 ? `+${barber.phone.substring(0, 2)} (${barber.phone.substring(2, 4)}) ${barber.phone.substring(4, 9)}-${barber.phone.substring(9)}` : barber.phone}
                              </span>
                            </>
                          )}
                        </div>
                        
                        {/* Exibição da Escala/Horários */}
                        <div className="text-[10px] text-zinc-500 mt-1.5 space-y-0.5 font-medium">
                          <p>
                            🕒 Turno: <span className="text-amber-500 font-semibold">{barber.startTime || "08:00"} - {barber.endTime || "19:00"}</span>
                          </p>
                          <p>
                            📅 Dias: <span className="text-zinc-300 font-semibold">
                              {barber.workDays && barber.workDays.length > 0
                                ? barber.workDays.map((d) => weekdaysList.find((w) => w.value === d)?.label).join(", ")
                                : "Nenhum dia cadastrado"}
                            </span>
                          </p>
                          {barber.blockedDates && barber.blockedDates.length > 0 && (
                            <p>
                              🚫 Folgas: <span className="text-red-400 font-semibold">{barber.blockedDates.join(", ")}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => handleEditBarberClick(barber)}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteBarberClick(barber.id)}
                        className="p-2 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-red-500 hover:border-red-500/30 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
        Painel de Gerenciamento Meu Barbeiro GO — Todos os direitos reservados.
      </footer>
    </div>
  );
}
