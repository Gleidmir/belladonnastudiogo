import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Clock,
  User,
  Calendar as CalendarIcon,
  LogOut,
  CheckCircle2,
  CalendarCheck,
  ChevronLeft,
  Search,
  AlertTriangle,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { BarberGoLogo } from "../components/ui/logo";
import { toast } from "sonner";
import {
  getCurrentUser,
  setCurrentUser,
  logout,
  getServices,
  getBarbers,
  addAppointment,
  getAppointments,
  updateAppointmentStatus,
  deleteClientAppointments,
  Service,
  Barber,
  Appointment,
  DEFAULT_ADMIN_PHONE,
  resetLocalDB,
  getBarberShopProfile,
  type BarberShopProfile,
  checkSubscriptionStatus,
  type SubscriptionCheck,
} from "../lib/db";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const Route = createFileRoute("/client")({
  head: () => ({
    meta: [
      { title: "Painel do Cliente - Meu Barbeiro GO" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClientDashboard,
});

function ClientDashboard() {
  const navigate = useNavigate();
  
  const handleClearSessionAndGoHome = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mbg_client_tenant");
      window.localStorage.removeItem("mbg_session");
    }
    navigate({ to: "/" });
  };

  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"book" | "my-appointments">("book");
  const [shopProfile, setShopProfile] = useState<BarberShopProfile | null>(null);
  const [subCheck, setSubCheck] = useState<SubscriptionCheck | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load session
  useEffect(() => {
    let tenant = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      tenant = params.get("t") || params.get("barberia") || "";
      if (tenant) {
        window.localStorage.setItem("mbg_client_tenant", tenant);
      } else {
        tenant = window.localStorage.getItem("mbg_client_tenant") || "";
      }
    }
    if (tenant) {
      getBarberShopProfile(tenant)
        .then((prof) => {
          setShopProfile(prof);
          const check = checkSubscriptionStatus();
          setSubCheck(check);
          setProfileLoaded(true);
        })
        .catch(() => {
          setProfileLoaded(true);
        });
    } else {
      setProfileLoaded(true);
    }

    const user = getCurrentUser();
    if (!user) {
      navigate({ to: tenant ? `/login?t=${tenant}` : "/login" });
    } else if (user.role === "admin") {
      // Permite que o administrador visualize a página do cliente como visualização de teste
      setSession({
        role: "client",
        name: `${user.name} (Visualização)`,
        phone: "5562993299120",
      });
    } else if (user.role !== "client") {
      navigate({ to: tenant ? `/login?t=${tenant}` : "/login" });
    } else {
      setSession(user);
    }
  }, [navigate]);

  const handleLogout = () => {
    const user = getCurrentUser();
    if (user && user.role === "admin") {
      navigate({ to: "/admin" });
      return;
    }
    const tenant = typeof window !== "undefined" ? window.localStorage.getItem("mbg_client_tenant") : "";
    logout();
    navigate({ to: tenant ? `/login?t=${tenant}` : "/login" });
  };

  const getTenantParam = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("t") || params.get("barberia") || window.localStorage.getItem("mbg_client_tenant") || "";
    }
    return "";
  };
  const tenant = getTenantParam();

  if (!profileLoaded || (!session && tenant)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <LoaderComponent />
      </div>
    );
  }

  if (profileLoaded && !shopProfile && tenant) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white antialiased flex flex-col justify-between">
        {/* Top Navbar */}
        <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 pt-[calc(28px+env(safe-area-inset-top,0px))] sm:pt-3 pb-3">
          <div className="mx-auto max-w-lg px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <BarberGoLogo className="w-8 h-8" />
              <span className="text-sm font-extrabold tracking-tight">Meu Barbeiro GO</span>
            </div>
          </div>
        </header>

        {/* Not Found Message Body */}
        <main className="flex-1 mx-auto w-full max-w-lg px-4 py-12 flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 mb-6">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">
            Estabelecimento Não Encontrado
          </h1>
          <p className="text-zinc-400 text-xs mt-3 max-w-xs leading-relaxed">
            Esta barbearia não foi encontrada em nossa base de dados ou foi desativada pelo administrador.
          </p>
           <button
            onClick={handleClearSessionAndGoHome}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#39ff14] hover:bg-[#2ee610] text-zinc-950 px-6 py-3.5 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-lg shadow-[#39ff14]/20 uppercase animate-pulse"
          >
            Voltar para o Início
          </button>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
          Desenvolvido para Meu Barbeiro GO — Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  if (subCheck?.status === "expired") {
    return (
      <div className="min-h-screen bg-zinc-950 text-white antialiased flex flex-col justify-between">
        {/* Top Navbar */}
        <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 pt-[calc(28px+env(safe-area-inset-top,0px))] sm:pt-3 pb-3">
          <div className="mx-auto max-w-lg flex items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              {shopProfile?.logoUrl ? (
                <img
                  src={shopProfile.logoUrl}
                  alt={shopProfile.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-500/50 shadow-sm"
                />
              ) : (
                <BarberGoLogo className="w-8 h-8" />
              )}
              <span className="text-sm font-extrabold tracking-tight">
                {shopProfile ? shopProfile.name : "Meu Barbeiro GO"}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-zinc-400 font-medium flex flex-col items-end">
                <span>Olá, {session.name}</span>
                <span className="text-[9px] text-zinc-500 font-mono tracking-tight mt-0.5">{session.phone}</span>
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center"
                title="Sair"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Expired Message Body */}
        <main className="flex-1 mx-auto w-full max-w-lg px-4 py-12 flex flex-col justify-center items-center text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-6 animate-pulse">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-lg font-extrabold text-white tracking-tight">
            Agendamento Indisponível
          </h1>
          <p className="text-zinc-400 text-xs mt-3 max-w-xs leading-relaxed">
            Esta barbearia está temporariamente indisponível para novos agendamentos online. Por favor, entre em contato diretamente com o estabelecimento para mais informações.
          </p>
          <a
            href={`https://wa.me/${DEFAULT_ADMIN_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <WhatsAppIcon className="h-4 w-4 fill-current shrink-0" /> Falar com o Estabelecimento
          </a>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
          Desenvolvido para Meu Barbeiro GO — Todos os direitos reservados.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white antialiased flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 pt-[calc(28px+env(safe-area-inset-top,0px))] sm:pt-3 pb-3">
        <div className="mx-auto max-w-lg flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {shopProfile?.logoUrl ? (
              <img
                src={shopProfile.logoUrl}
                alt={shopProfile.name}
                className="w-8 h-8 rounded-full object-cover border border-amber-500/50 shadow-sm"
              />
            ) : (
              <BarberGoLogo className="w-8 h-8" />
            )}
            <span className="text-sm font-extrabold tracking-tight">
              {shopProfile ? shopProfile.name : (
                <>Meu Barbeiro <span className="text-amber-500">GO</span></>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-zinc-400 font-medium flex flex-col items-end">
              <span>Olá, {session.name}</span>
              <span className="text-[9px] text-zinc-500 font-mono tracking-tight mt-0.5">{session.phone}</span>
            </span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer flex items-center justify-center"
              title="Sair"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-zinc-950 py-2">
        <div className="mx-auto max-w-lg px-4 flex gap-2">
          <button
            onClick={() => setActiveTab("book")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all border ${
              activeTab === "book"
                ? "bg-amber-500 text-zinc-950 border-amber-500 glow-emerald shadow-lg shadow-amber-500/10"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            Agendar Horário
          </button>
          <button
            onClick={() => setActiveTab("my-appointments")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all border ${
              activeTab === "my-appointments"
                ? "bg-amber-500 text-zinc-950 border-amber-500 glow-emerald shadow-lg shadow-amber-500/10"
                : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white"
            }`}
          >
            Meus Agendamentos
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-4">
        {activeTab === "book" ? (
          <BookingFlow
            clientPhone={session.phone}
            clientName={session.name}
            shopProfile={shopProfile}
            onSessionUpdate={setSession}
            onLogout={handleLogout}
          />
        ) : (
          <MyAppointments clientPhone={session.phone} />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-zinc-600 border-t border-zinc-900 bg-zinc-950">
        Desenvolvido para Meu Barbeiro GO — Todos os direitos reservados.
      </footer>
    </div>
  );
}

// Circular logo component for rendering either custom barbearia logo or Goiás themed default logo
function ShopCircleLogo({ profile, className = "w-12 h-12" }: { profile: BarberShopProfile | null; className?: string }) {
  if (profile?.logoUrl) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={profile.logoUrl}
          alt={profile.name}
          className="w-full h-full rounded-full object-cover border-2 border-amber-500 shadow-lg"
        />
      </div>
    );
  }
  return <BarberGoLogo className={className} animate={false} />;
}

function LoaderComponent() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      <span className="text-xs text-zinc-500">Carregando...</span>
    </div>
  );
}

/* ========================================================================= */
/* BOOKING WIZARD COMPONENT                                                  */
/* ========================================================================= */
interface BookingFlowProps {
  clientPhone: string;
  clientName: string;
  shopProfile: BarberShopProfile | null;
  onSessionUpdate: (newSession: any) => void;
  onLogout: () => void;
}

type Step = "service" | "barber" | "datetime" | "confirm" | "success";

function BookingFlow({ clientPhone, clientName, shopProfile, onSessionUpdate, onLogout }: BookingFlowProps) {
  const [step, setStep] = useState<Step>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(""); // YYYY-MM-DD
  const [selectedTime, setSelectedTime] = useState<string>(""); // HH:MM
  
  // Date configuration
  const [days, setDays] = useState<{ label: string; dateStr: string; dayNum: string; isAvailable: boolean }[]>([]);
  const [currentMonthYear, setCurrentMonthYear] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);

  // Local state for client details (so they can be edited)
  const [customClientName, setCustomClientName] = useState(clientName);
  const [customClientPhone, setCustomClientPhone] = useState(clientPhone);

  useEffect(() => {
    setCustomClientName(clientName);
    setCustomClientPhone(clientPhone);
  }, [clientName, clientPhone]);

  // Load static data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const svcs = await getServices();
        setServices(svcs.filter(s => s.isActive !== false));
        const barbs = await getBarbers();
        setBarbers(barbs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Load appointments dynamically when date or barber changes
  useEffect(() => {
    if (step === "datetime") {
      const loadApts = async () => {
        try {
          const all = await getAppointments();
          setAppointments(all);
        } catch (e) {
          console.error(e);
        }
      };
      loadApts();
    }
  }, [step, selectedDate, selectedBarber]);

  // Generate days slider based on selected month offset
  useEffect(() => {
    const today = new Date();
    const list = [];
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const baseDate = new Date();
    baseDate.setMonth(today.getMonth() + monthOffset);
    
    // Set Month label
    setCurrentMonthYear(`${months[baseDate.getMonth()]} | ${baseDate.getFullYear()}`);

    // Generate 15 days from start of this month (or from today if current month)
    const startDate = (monthOffset === 0) ? new Date() : new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let i = 0; i < 15; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Make sure we only show days in the selected month
      if (d.getMonth() !== baseDate.getMonth() && monthOffset !== 0) continue;
      
      const dayName = dayNames[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, "0");
      const monthNum = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Check if selected barber works this day
      const dayOfWeek = d.getDay();
      const worksThisWeekday = selectedBarber?.workDays
        ? selectedBarber.workDays.includes(dayOfWeek)
        : [1, 2, 3, 4, 5, 6].includes(dayOfWeek); // Mon-Sat default
      
      const isBlocked = selectedBarber?.blockedDates
        ? selectedBarber.blockedDates.includes(dateStr)
        : false;

      const isAvailable = worksThisWeekday && !isBlocked;
      
      list.push({
        label: dayName,
        dayNum: `${dayNum}/${monthNum}`,
        dateStr,
        isAvailable,
      });
    }

    setDays(list);
    
    // Select first AVAILABLE day by default if current selectedDate is not available or empty
    const firstAvailableDay = list.find((d) => d.isAvailable);
    if (firstAvailableDay && (!selectedDate || !list.find(d => d.dateStr === selectedDate)?.isAvailable)) {
      setSelectedDate(firstAvailableDay.dateStr);
    }
  }, [monthOffset, selectedDate, selectedBarber]);

  // Format Duration
  const formatDuration = (mins: number) => {
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${String(hrs).padStart(2, "0")}:${String(rem).padStart(2, "0")} h`;
    }
    return `${mins}min`;
  };

  // Format Price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };

  // Available times logic (every 30 minutes)
  const allTimeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

  // checking booked slots
  const getOcupiedSlots = (): string[] => {
    if (!selectedDate || !selectedBarber) return [];
    return appointments
      .filter((a) => a.date === selectedDate && a.barberId === selectedBarber.id && a.status !== "cancelled")
      .map((a) => a.time);
  };

  const occupiedSlots = getOcupiedSlots();

  // Formata o número do WhatsApp (garante código do país e limpa caracteres)
  const getBarberWhatsAppLink = () => {
    if (!selectedBarber || !selectedService) return "";
    
    let rawPhone = selectedBarber.phone || DEFAULT_ADMIN_PHONE;
    let cleanPhone = rawPhone.replace(/\D/g, "");
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    } else if (cleanPhone.length === 0) {
      cleanPhone = DEFAULT_ADMIN_PHONE;
    }

    const dateStr = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR");
    const message = `Olá, ${selectedBarber.name}! Acabei de realizar um agendamento pelo aplicativo:\n\n` +
      `👤 *Cliente:* ${customClientName}\n` +
      `📞 *Telefone:* ${customClientPhone}\n` +
      `💇 *Serviço:* ${selectedService.name}\n` +
      `💰 *Valor:* R$ ${selectedService.price.toFixed(2)}\n` +
      `📅 *Data:* ${dateStr}\n` +
      `⏰ *Horário:* ${selectedTime}\n\n` +
      `Por favor, confirme se está tudo certo! Obrigado.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const handleFinishBooking = async () => {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) return;

    if (!customClientName.trim() || customClientPhone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, preencha o nome e um telefone válido.");
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = customClientPhone.replace(/\D/g, "");
      await addAppointment({
        clientId: `c_${cleanPhone}`,
        clientName: customClientName,
        clientPhone: cleanPhone,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: selectedService.price,
        barberId: selectedBarber.id,
        barberName: selectedBarber.name,
        date: selectedDate,
        time: selectedTime,
      });

      const newSession = {
        role: "client" as const,
        name: customClientName,
        phone: cleanPhone,
      };
      setCurrentUser(newSession);
      onSessionUpdate(newSession);
      setStep("success");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar o agendamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate("");
    setSelectedTime("");
    setMonthOffset(0);
    setStep("service");
  };

  // Steps Progress Bar Renderer
  const renderStepsHeader = () => {
    const stepsList = ["Serviço", "Profissional", "Data e horário", "Confirmação"];
    const stepIndexes: Record<Step, number> = {
      service: 0,
      barber: 1,
      datetime: 2,
      confirm: 3,
      success: 4,
    };
    
    const currentIndex = stepIndexes[step];
    if (step === "success") return null;

    return (
      <div className="mb-6">
        <p className="text-center text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Passos para agendar</p>
        <div className="flex items-center justify-between mt-3 px-2">
          {stepsList.map((s, idx) => (
            <div key={s} className="flex flex-col items-center flex-1 relative">
              {/* Connecting line */}
              {idx > 0 && (
                <div
                  className={`absolute right-[50%] top-2 -translate-y-1/2 h-[2px] w-full -z-10 ${
                    idx <= currentIndex ? "bg-amber-500" : "bg-zinc-800"
                  }`}
                />
              )}
              {/* Dot */}
              <div
                className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  idx <= currentIndex
                    ? "bg-amber-500 border-amber-500 text-zinc-950"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                {idx < currentIndex && <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />}
              </div>
              <span
                className={`text-[9px] mt-1.5 font-bold transition-all ${
                  idx === currentIndex ? "text-amber-400" : "text-zinc-500"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && step === "service") {
    return (
      <div className="py-12 flex justify-center">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 py-2">
      {renderStepsHeader()}

      {/* STEP 1: SERVICE SELECTION */}
      {step === "service" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-sm font-bold text-zinc-300 mb-3 px-1 uppercase tracking-wider">Serviços</h2>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {services.map((svc) => (
              <button
                key={svc.id}
                onClick={() => {
                  setSelectedService(svc);
                  setStep("barber");
                }}
                className="w-full flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/60 hover:border-amber-500/30 rounded-2xl p-4 text-left transition-all group active:scale-[0.99] hover:scale-[1.01] hover:shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-center gap-3">
                  <ShopCircleLogo profile={shopProfile} />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                      {svc.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(svc.duration)}</span>
                    </div>
                    <p className="text-[12px] font-extrabold text-sky-400 mt-1">
                      {formatPrice(svc.price)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-amber-400 transition-colors" />
              </button>
            ))}
            {services.length === 0 && (
              <p className="text-center text-xs text-zinc-600 py-8">Nenhum serviço cadastrado.</p>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: BARBER SELECTION */}
      {step === "barber" && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-sm font-bold text-zinc-300 mb-3 uppercase tracking-wider">Escolha o Profissional</h2>
          
          {selectedService && (
            <div className="mb-4 bg-zinc-900/30 border border-zinc-800/40 rounded-xl p-3 flex items-center gap-3">
              <ShopCircleLogo profile={shopProfile} />
              <div>
                <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Serviço Selecionado</p>
                <p className="text-xs font-bold text-white">{selectedService.name}</p>
                <p className="text-xs text-sky-400 font-bold">{formatPrice(selectedService.price)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {barbers.map((barber) => (
              <button
                key={barber.id}
                onClick={() => {
                  setSelectedBarber(barber);
                  setStep("datetime");
                }}
                className={`rounded-2xl p-4 text-center border transition-all active:scale-95 hover:scale-[1.02] flex flex-col items-center ${
                  selectedBarber?.id === barber.id
                    ? "bg-amber-500 text-zinc-950 border-amber-400 glow-emerald"
                    : "bg-zinc-900/40 text-white border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70"
                }`}
              >
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-zinc-800 shadow"
                />
                <span className="text-xs font-black tracking-wider uppercase">{barber.name}</span>
                <span className="text-[10px] opacity-65 mt-1 font-bold">Barbeiro</span>
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("service")}
              className="flex-1 rounded-xl border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-zinc-950 transition-all py-3.5 text-xs font-bold active:scale-95"
            >
              Voltar
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE & TIME */}
      {step === "datetime" && selectedService && selectedBarber && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          {/* Chosen Item Summary Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ShopCircleLogo profile={shopProfile} />
              <div>
                <h3 className="text-xs font-bold text-white">{selectedService.name}</h3>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(selectedService.duration)}</span>
                  <span>•</span>
                  <span>com {selectedBarber.name}</span>
                </div>
                <p className="text-xs font-extrabold text-sky-400 mt-0.5">{formatPrice(selectedService.price)}</p>
              </div>
            </div>
          </div>

          {/* Month selector */}
          <div className="flex items-center justify-between mb-3 px-1 text-xs">
            <span className="font-extrabold text-zinc-300 uppercase tracking-wide">{currentMonthYear}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setMonthOffset((prev) => Math.max(0, prev - 1))}
                disabled={monthOffset === 0}
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMonthOffset((prev) => prev + 1)}
                className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days horizontal slider */}
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-800 select-none">
            {days.map((d) => (
              <button
                key={d.dateStr}
                disabled={!d.isAvailable}
                onClick={() => {
                  setSelectedDate(d.dateStr);
                  setSelectedTime(""); // Reset time on date change
                }}
                className={`flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] text-center transition-all border shrink-0 hover:scale-[1.02] ${
                  !d.isAvailable
                    ? "bg-zinc-950/20 text-zinc-700 border-zinc-950/10 cursor-not-allowed opacity-30"
                    : selectedDate === d.dateStr
                    ? "bg-amber-500 text-zinc-950 border-amber-400 glow-emerald shadow-md"
                    : "bg-zinc-900/40 text-white border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <p className="text-[10px] font-bold opacity-60 uppercase">{d.label}</p>
                <p className="text-xs font-black mt-1">{d.dayNum}</p>
              </button>
            ))}
          </div>

          {/* Grid selection */}
          <div className="mt-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">Escolha um horário</h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {(() => {
                const todayStr = (() => {
                  const d = new Date();
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                })();

                const nowTimeStr = (() => {
                  const d = new Date();
                  const hours = String(d.getHours()).padStart(2, "0");
                  const minutes = String(d.getMinutes()).padStart(2, "0");
                  return `${hours}:${minutes}`;
                })();

                const barberHours = selectedBarber?.workHours && selectedBarber.workHours.length > 0
                  ? selectedBarber.workHours
                  : allTimeSlots;

                const activeSlots = barberHours.filter((time) => {
                  const barberStart = selectedBarber?.startTime || "08:00";
                  const barberEnd = selectedBarber?.endTime || "19:00";
                  
                  const isWithinShift = time >= barberStart && time < barberEnd;
                  
                  if (selectedDate === todayStr) {
                    return isWithinShift && time > nowTimeStr;
                  }
                  return isWithinShift;
                });

                if (activeSlots.length === 0) {
                  return (
                    <p className="text-center text-xs text-zinc-500 col-span-5 py-4 font-semibold">
                      Sem horários disponíveis para o turno deste barbeiro neste dia.
                    </p>
                  );
                }

                return activeSlots.map((time) => {
                  const isOccupied = occupiedSlots.includes(time);
                  return (
                    <button
                      key={time}
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 text-center text-[10px] font-black rounded-lg transition-all border hover:scale-[1.02] ${
                        selectedTime === time
                          ? "bg-amber-500 text-zinc-950 border-amber-400 glow-emerald shadow-md"
                          : isOccupied
                          ? "bg-zinc-900/20 text-zinc-700 line-through border-zinc-900/10 cursor-not-allowed"
                          : "bg-zinc-900/40 text-white border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {time}
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStep("barber")}
              className="flex-1 rounded-xl border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-zinc-950 transition-all py-3.5 text-xs font-bold active:scale-95"
            >
              Voltar
            </button>
            <button
              onClick={() => {
                if (!selectedTime) {
                  toast.error("Por favor, selecione um horário!");
                  return;
                }
                setStep("confirm");
              }}
              disabled={!selectedTime}
              className="flex-1 rounded-xl bg-amber-500 py-3.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL CONFIRMATION */}
      {step === "confirm" && selectedService && selectedBarber && (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Confirme seu Agendamento</h2>
          
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
              <ShopCircleLogo profile={shopProfile} />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Serviço</p>
                <h3 className="text-sm font-bold text-white">{selectedService.name}</h3>
                <p className="text-[11px] text-sky-400 font-bold">{formatPrice(selectedService.price)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Barbeiro</p>
                <p className="font-bold text-white mt-0.5">{selectedBarber.name}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Duração</p>
                <p className="font-bold text-white mt-0.5">{formatDuration(selectedService.duration)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Data</p>
                <p className="font-bold text-white mt-0.5">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Horário</p>
                <p className="font-bold text-amber-400 mt-0.5">{selectedTime}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 text-xs space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Dados do Agendamento</p>
              <div>
                <label className="text-[10px] text-zinc-400 font-medium">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={customClientName}
                  onChange={(e) => setCustomClientName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full rounded-xl bg-zinc-950 mt-1 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 font-medium">WhatsApp (com DDD)</label>
                <input
                  type="tel"
                  required
                  value={customClientPhone}
                  onChange={(e) => setCustomClientPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ex: 62999998888"
                  className="w-full rounded-xl bg-zinc-950 mt-1 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 ring-1 ring-zinc-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => setStep("datetime")}
              className="flex-1 rounded-xl border border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-zinc-950 transition-all py-3.5 text-xs font-bold active:scale-95"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleFinishBooking}
              className="flex-1 rounded-xl bg-amber-500 py-3.5 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2"
            >
              {loading ? "Processando..." : "Confirmar Agendamento"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS RECEIPT */}
      {step === "success" && selectedService && selectedBarber && (
        <div className="text-center py-6 animate-in zoom-in-95 duration-300">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/20 mb-4 animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <h2 className="text-lg font-extrabold text-white">Agendamento Confirmado!</h2>
          <p className="text-zinc-400 text-xs mt-1.5 px-4">
            Seu horário foi agendado e enviado para a barbearia. Te esperamos lá!
          </p>

          <div className="bg-zinc-900/60 border border-amber-500/20 rounded-3xl p-5 my-6 text-left relative overflow-hidden holo-card glow-gold shadow-2xl">
            {/* Holographic glowing backdrops */}
            <div className="absolute -left-12 -top-12 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -right-12 -bottom-12 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
            
            {/* Ticket teeth decorations */}
            <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950 border-r border-zinc-900" />
            <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-950 border-l border-zinc-900" />
            
            <div className="text-center pb-5 border-b border-dashed border-zinc-800/80">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black flex items-center justify-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Comprovante de Reserva VIP
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              </span>
              <p className="text-2xl font-mono text-white font-extrabold mt-2 tracking-wide glow-gold-sm">{selectedTime}</p>
              <p className="text-xs text-zinc-400 font-medium">
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </p>
            </div>

            <div className="space-y-3 pt-5 text-xs font-mono text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-500">ESTABELECIMENTO:</span>
                <span className="text-white font-extrabold uppercase">{shopProfile?.name || "Meu Barbeiro GO"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">SERVIÇO:</span>
                <span className="text-white font-extrabold">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">VALOR:</span>
                <span className="text-amber-400 font-extrabold">{formatPrice(selectedService.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">PROFISSIONAL:</span>
                <span className="text-white font-extrabold">{selectedBarber.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">CLIENTE:</span>
                <span className="text-white font-extrabold">{customClientName}</span>
              </div>
            </div>
          </div>

          <a
            href={getBarberWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 mb-3 active:scale-[0.98]"
          >
            <WhatsAppIcon className="w-5 h-5" />
            Notificar Barbeiro no WhatsApp
          </a>

          <button
            onClick={handleReset}
            className="w-full rounded-xl bg-blue-900 border border-blue-800 hover:bg-blue-800 py-3.5 text-xs font-bold text-white transition-colors active:scale-[0.98] mb-3"
          >
            Fazer Novo Agendamento
          </button>

          <button
            onClick={onLogout}
            className="w-full rounded-xl bg-red-600 hover:bg-red-500 py-3.5 text-xs font-bold text-white transition-colors active:scale-[0.98]"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}

/* ========================================================================= */
/* MY APPOINTMENTS HISTORY                                                   */
/* ========================================================================= */
interface MyAppointmentsProps {
  clientPhone: string;
}

function MyAppointments({ clientPhone }: MyAppointmentsProps) {
  const [apts, setApts] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload bookings
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const [allApts, allBarbers] = await Promise.all([
        getAppointments(),
        getBarbers()
      ]);
      
      const dismissedStr = window.localStorage.getItem(`mbg_dismissed_apts_${clientPhone}`);
      const dismissedIds = dismissedStr ? JSON.parse(dismissedStr) : [];

      const clientApts = allApts
        .filter((a) => a.clientPhone === clientPhone && !dismissedIds.includes(a.id))
        .sort((a, b) => {
          const getStatusPriority = (status: string) => {
            if (status === "pending") return 1;
            if (status === "completed") return 2;
            if (status === "cancelled") return 3;
            return 4;
          };

          const priorityA = getStatusPriority(a.status);
          const priorityB = getStatusPriority(b.status);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          if (a.status === "pending") {
            // Pendentes: ordem cronológica crescente (mais próximo primeiro)
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
          } else {
            // Realizados/Cancelados: ordem cronológica decrescente (mais recente primeiro)
            const dateCompare = b.date.localeCompare(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.time.localeCompare(a.time);
          }
        });
      setApts(clientApts);
      setBarbers(allBarbers);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar seus agendamentos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [clientPhone]);

  const handleCancel = async (id: string) => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      setLoading(true);
      try {
        await updateAppointmentStatus(id, "cancelled");
        await loadAppointments();
      } catch (e) {
        console.error(e);
        toast.error("Erro ao cancelar agendamento.");
        setLoading(false);
      }
    }
  };

  const handleClearHistory = async () => {
    if (confirm("Deseja realmente limpar todo o histórico de agendamentos?")) {
      setLoading(true);
      try {
        await deleteClientAppointments(clientPhone);
        
        // Also clean up local dismissed state since it is deleted from DB
        window.localStorage.removeItem(`mbg_dismissed_apts_${clientPhone}`);
        await loadAppointments();
      } catch (e) {
        console.error("Erro ao limpar histórico no banco, aplicando limpeza local...", e);
        // Fallback: save all current apt IDs as dismissed locally
        const currentIds = apts.map((a) => a.id);
        const key = `mbg_dismissed_apts_${clientPhone}`;
        const dismissedStr = window.localStorage.getItem(key);
        const dismissedIds = dismissedStr ? JSON.parse(dismissedStr) : [];
        const updated = Array.from(new Set([...dismissedIds, ...currentIds]));
        window.localStorage.setItem(key, JSON.stringify(updated));
        
        toast.success("Histórico limpo localmente!");
        await loadAppointments();
      }
    }
  };

  const getBarberWhatsAppLink = (apt: Appointment) => {
    const barber = barbers.find((b) => b.id === apt.barberId);
    let rawPhone = barber?.phone || DEFAULT_ADMIN_PHONE;
    let cleanPhone = rawPhone.replace(/\D/g, "");
    
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith("55")) {
      cleanPhone = "55" + cleanPhone;
    } else if (cleanPhone.length === 0) {
      cleanPhone = DEFAULT_ADMIN_PHONE;
    }

    const dateStr = new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR");
    const message = `Olá, ${apt.barberName}! Sou o cliente ${apt.clientName} e estou enviando esta mensagem para confirmar meu agendamento no aplicativo:\n\n` +
      `💇 *Serviço:* ${apt.serviceName}\n` +
      `📅 *Data:* ${dateStr}\n` +
      `⏰ *Horário:* ${apt.time}\n\n` +
      `Está tudo confirmado? Obrigado!`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading && apts.length === 0) {
    return (
      <div className="py-12 flex justify-center">
        <LoaderComponent />
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-4 gap-2">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Histórico de Agendamentos</h2>
        {apts.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-3.5 py-2 text-[10px] font-bold border border-red-500/20 hover:border-transparent transition-all cursor-pointer active:scale-95 shrink-0"
            title="Limpar Histórico de Agendamentos"
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpar Página
          </button>
        )}
      </div>

      {apts.length === 0 ? (
        <div className="text-center py-12 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-6">
          <CalendarCheck className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-zinc-400">Nenhum agendamento encontrado</p>
          <p className="text-xs text-zinc-500 font-mono mt-2 bg-zinc-950/60 border border-zinc-800/50 py-1.5 px-3 rounded-lg inline-block">
            Celular: {clientPhone}
          </p>
          <p className="text-[11px] text-zinc-600 mt-3 leading-relaxed">
            Se este não for o seu número de cadastro, ou se agendou usando outro celular, clique no botão de <strong>Sair</strong> (porta com seta) no topo direito e acesse com o número correto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {apts.map((apt) => (
            <div
              key={apt.id}
              className="bg-zinc-900/60 ring-1 ring-zinc-800 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white">{apt.serviceName}</h3>
                  <span className="text-[10px] text-zinc-500 font-bold">com {apt.barberName}</span>
                </div>
                
                {/* Status Badges */}
                {apt.status === "completed" && (
                  <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                    Realizado
                  </span>
                )}
                {apt.status === "pending" && (
                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                    Agendado
                  </span>
                )}
                {apt.status === "cancelled" && (
                  <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-400">
                    Cancelado
                  </span>
                )}
              </div>

              {/* Middle Row */}
              <div className="flex justify-between items-end border-t border-zinc-800/60 pt-3 text-xs">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Data & Hora</p>
                  <p className="font-bold text-white mt-0.5">
                    {new Date(apt.date + "T12:00:00").toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    })}{" "}
                    às <span className="text-amber-400">{apt.time}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Valor</p>
                  <p className="font-extrabold text-sky-400 mt-0.5">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(apt.price)}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              {apt.status === "pending" && (
                <div className="flex gap-2 mt-1 w-full">
                  <a
                    href={getBarberWhatsAppLink(apt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 rounded-xl bg-green-600 hover:bg-green-500 text-[10px] font-bold text-white transition-colors flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <WhatsAppIcon className="h-3.5 w-3.5" />
                    <span>Confirmar</span>
                  </a>
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="flex-1 text-center py-2 rounded-xl border border-red-500/20 text-[10px] font-bold text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
