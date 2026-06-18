import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Barber {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  workDays?: number[]; // array of numbers [0-6] where 0 is Sunday, 1 is Monday...
  startTime?: string; // e.g. "08:00"
  endTime?: string; // e.g. "19:00"
  blockedDates?: string[]; // array of dates formatted YYYY-MM-DD
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  registeredAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  barberId: string;
  barberName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}

export interface BarberShopProfile {
  tenantId: string;
  name: string;
  logoUrl?: string;
  createdAt?: string;
  subscriptionPlan?: "mensal" | "trimestral" | "semestral" | "anual" | "master";
  subscriptionStatus?: "trial" | "active" | "expired";
  subscriptionExpiresAt?: string;
}

const isServer = typeof window === "undefined";

export const getCurrentTenantId = (): string => {
  if (isServer) return "default";
  const sessionItem = window.localStorage.getItem("mbg_session");
  if (sessionItem) {
    try {
      const session = JSON.parse(sessionItem);
      if (session && session.role === "admin" && session.email) {
        return session.email;
      }
    } catch (e) {
      console.error("Erro ao ler sessão:", e);
    }
  }
  const clientTenant = window.localStorage.getItem("mbg_client_tenant");
  return clientTenant || "default";
};

const getTenantKey = (key: string): string => {
  if (key === "mbg_session" || key === "mbg_client_tenant") {
    return key;
  }
  const tenantId = getCurrentTenantId();
  return `${key}_${tenantId}`;
};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (isServer) return defaultValue;
  try {
    const tenantKey = getTenantKey(key);
    const item = window.localStorage.getItem(tenantKey);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Erro ao ler localStorage:", key, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  if (isServer) return;
  try {
    const tenantKey = getTenantKey(key);
    window.localStorage.setItem(tenantKey, JSON.stringify(value));
  } catch (error) {
    console.error("Erro ao gravar localStorage:", key, error);
  }
};

// MAPPERS FOR SUPABASE -> DTO
const mapServiceFromDB = (s: any): Service => ({
  id: s.id,
  name: s.name,
  price: Number(s.price),
  duration: s.duration,
  isActive: s.is_active !== false,
});

const mapAppointmentFromDB = (a: any): Appointment => ({
  id: a.id,
  clientId: a.client_id,
  clientName: a.client_name,
  clientPhone: a.client_phone,
  serviceId: a.service_id,
  serviceName: a.service_name,
  price: Number(a.price),
  barberId: a.barber_id,
  barberName: a.barber_name,
  date: a.date,
  time: a.time,
  status: a.status as any,
  createdAt: a.created_at,
});

const mapClientFromDB = (c: any): Client => ({
  id: c.id,
  name: c.name,
  phone: c.phone,
  email: c.email || undefined,
  registeredAt: c.registered_at,
});

const mapBarberFromDB = (b: any): Barber => {
  let workDays = [1, 2, 3, 4, 5, 6];
  if (b.work_days) {
    try {
      workDays = typeof b.work_days === "string" ? JSON.parse(b.work_days) : b.work_days;
    } catch (e) {
      if (typeof b.work_days === "string") {
        workDays = b.work_days.split(",").map(Number).filter((n: any) => !isNaN(n));
      }
    }
  }

  let blockedDates: string[] = [];
  if (b.blocked_dates) {
    try {
      blockedDates = typeof b.blocked_dates === "string" ? JSON.parse(b.blocked_dates) : b.blocked_dates;
    } catch (e) {
      if (typeof b.blocked_dates === "string") {
        blockedDates = b.blocked_dates.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
  }

  return {
    id: b.id,
    name: b.name,
    avatar: b.avatar,
    phone: b.phone || undefined,
    workDays: Array.isArray(workDays) ? workDays : [1, 2, 3, 4, 5, 6],
    startTime: b.start_time || "08:00",
    endTime: b.end_time || "19:00",
    blockedDates: Array.isArray(blockedDates) ? blockedDates : [],
  };
};

// Default data
const defaultBarbers: Barber[] = [
  { id: "b1", name: "PASTOR", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", phone: "5562993299120", workDays: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "19:00", blockedDates: [] },
  { id: "b2", name: "RAFAEL", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face", phone: "5562993299120", workDays: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "19:00", blockedDates: [] },
  { id: "b3", name: "ANDRÉ", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", phone: "5562993299120", workDays: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "19:00", blockedDates: [] },
  { id: "b4", name: "BRUNO", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", phone: "5562993299120", workDays: [1, 2, 3, 4, 5, 6], startTime: "08:00", endTime: "19:00", blockedDates: [] },
];

const defaultServices: Service[] = [
  { id: "s1", name: "Cabelo + Barba e Sobrancelha", price: 80, duration: 60, isActive: true },
  { id: "s2", name: "Corte + Cavanhaque + Sobrancelha", price: 60, duration: 60, isActive: true },
  { id: "s3", name: "Depilação a Cera / Nariz e Orelhas", price: 10, duration: 10, isActive: true },
  { id: "s4", name: "Luzes", price: 100, duration: 60, isActive: true },
  { id: "s5", name: "Pezinho", price: 10, duration: 15, isActive: true },
  { id: "s6", name: "Pigmentação", price: 30, duration: 50, isActive: true },
  { id: "s7", name: "Platinado", price: 120, duration: 60, isActive: true },
  { id: "s8", name: "Sobrancelha", price: 10, duration: 10, isActive: true },
  { id: "s9", name: "Barba", price: 35, duration: 30, isActive: true },
  { id: "s10", name: "Barba + Pezinho + Sobrancelha", price: 50, duration: 40, isActive: true },
  { id: "s11", name: "Cabelo", price: 35, duration: 30, isActive: true },
  { id: "s12", name: "Cabelo + Barba", price: 70, duration: 50, isActive: true },
  { id: "s13", name: "Cabelo + Bigode + Sobrancelha", price: 50, duration: 50, isActive: true },
  { id: "s14", name: "Cabelo + Pigmentação", price: 70, duration: 50, isActive: true },
];

const defaultClients: Client[] = [];

export const DEFAULT_ADMIN_PHONE = "5562993299120";

export const initDB = () => {
  if (isServer) return;
  const tenantId = getCurrentTenantId();
  if (!window.localStorage.getItem(`mbg_barbers_${tenantId}`)) {
    window.localStorage.setItem(`mbg_barbers_${tenantId}`, JSON.stringify(defaultBarbers));
  }
  if (!window.localStorage.getItem(`mbg_services_${tenantId}`)) {
    window.localStorage.setItem(`mbg_services_${tenantId}`, JSON.stringify(defaultServices));
  }
  if (!window.localStorage.getItem(`mbg_clients_${tenantId}`)) {
    window.localStorage.setItem(`mbg_clients_${tenantId}`, JSON.stringify([]));
  }
  if (!window.localStorage.getItem(`mbg_appointments_${tenantId}`)) {
    window.localStorage.setItem(`mbg_appointments_${tenantId}`, JSON.stringify([]));
  }
};

// --- SERVICES ---
export const getServices = async (): Promise<Service[]> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });
      if (error) throw error;
      
      // Se for um novo tenant e não houver nenhum serviço cadastrado no Supabase,
      // popula com os serviços padrões do sistema
      if (data && data.length === 0) {
        const servicesToInsert = defaultServices.map(s => ({
          id: `${s.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: s.name,
          price: s.price,
          duration: s.duration,
          is_active: s.isActive,
          tenant_id: tenantId
        }));
        
        const { error: insertError } = await supabase
          .from("services")
          .insert(servicesToInsert);
          
        if (!insertError) {
          return servicesToInsert.map(mapServiceFromDB);
        }
      }
      
      return (data || []).map(mapServiceFromDB);
    } catch (e) {
      console.warn("Erro ao buscar serviços no Supabase, usando localStorage:", e);
    }
  }
  initDB();
  return getStorageItem<Service[]>("mbg_services", defaultServices);
};

export const addService = async (service: Omit<Service, "id">): Promise<Service> => {
  const newService: Service = {
    ...service,
    id: `s_${Date.now()}`,
    isActive: true,
  };

  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase.from("services").insert({
        id: newService.id,
        name: newService.name,
        price: newService.price,
        duration: newService.duration,
        is_active: newService.isActive,
        tenant_id: tenantId,
      });
      if (error) throw error;
      toast.success("Serviço adicionado ao Supabase!");
      return newService;
    } catch (e) {
      console.error("Erro ao adicionar serviço no Supabase:", e);
      toast.error("Erro ao salvar no banco online, salvando local...");
    }
  }

  const services = await getServices();
  services.push(newService);
  setStorageItem("mbg_services", services);
  toast.success("Serviço adicionado localmente!");
  return newService;
};

export const updateService = async (updatedService: Service): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("services")
        .update({
          name: updatedService.name,
          price: updatedService.price,
          duration: updatedService.duration,
          is_active: updatedService.isActive,
        })
        .eq("id", updatedService.id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Serviço atualizado no Supabase!");
      return;
    } catch (e) {
      console.error("Erro ao atualizar serviço no Supabase:", e);
    }
  }

  const services = await getServices();
  const index = services.findIndex((s) => s.id === updatedService.id);
  if (index !== -1) {
    services[index] = updatedService;
    setStorageItem("mbg_services", services);
    toast.success("Serviço atualizado localmente!");
  }
};

export const deleteService = async (id: string): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Serviço removido do Supabase!");
      return;
    } catch (e) {
      console.error("Erro ao excluir serviço no Supabase:", e);
    }
  }

  const services = await getServices();
  const filtered = services.filter((s) => s.id !== id);
  setStorageItem("mbg_services", filtered);
  toast.success("Serviço removido localmente!");
};

// --- BARBERS ---
export const getBarbers = async (): Promise<Barber[]> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { data, error } = await supabase
        .from("barbers")
        .select("*")
        .eq("tenant_id", tenantId);
      if (error) throw error;
      
      // Se for um novo tenant e não houver nenhum barbeiro cadastrado no Supabase,
      // popula com os barbeiros padrões do sistema
      if (data && data.length === 0) {
        const barbersToInsert = defaultBarbers.map(b => ({
          id: `${b.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: b.name,
          avatar: b.avatar,
          phone: b.phone,
          work_days: JSON.stringify(b.workDays),
          start_time: b.startTime,
          end_time: b.endTime,
          blocked_dates: JSON.stringify(b.blockedDates),
          tenant_id: tenantId
        }));
        
        const { error: insertError } = await supabase
          .from("barbers")
          .insert(barbersToInsert);
          
        if (!insertError) {
          return barbersToInsert.map(mapBarberFromDB);
        }
      }
      
      if (data && data.length > 0) {
        return data.map(mapBarberFromDB);
      }
    } catch (e) {
      console.warn("Erro ao buscar barbeiros no Supabase, usando localStorage:", e);
    }
  }
  initDB();
  return getStorageItem<Barber[]>("mbg_barbers", defaultBarbers);
};

export const addBarber = async (barber: Omit<Barber, "id">): Promise<Barber> => {
  const newBarber: Barber = {
    ...barber,
    id: `b_${Date.now()}`,
  };

  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase.from("barbers").insert({
        id: newBarber.id,
        name: newBarber.name,
        avatar: newBarber.avatar,
        phone: newBarber.phone,
        work_days: JSON.stringify(newBarber.workDays || [1, 2, 3, 4, 5, 6]),
        start_time: newBarber.startTime || "08:00",
        end_time: newBarber.endTime || "19:00",
        blocked_dates: JSON.stringify(newBarber.blockedDates || []),
        tenant_id: tenantId,
      });
      if (error) throw error;
      toast.success("Barbeiro adicionado ao Supabase!");
      return newBarber;
    } catch (e) {
      console.error("Erro ao adicionar barbeiro no Supabase:", e);
      toast.error("Erro ao salvar no banco online, salvando local...");
    }
  }

  const barbers = await getBarbers();
  barbers.push(newBarber);
  setStorageItem("mbg_barbers", barbers);
  toast.success("Barbeiro adicionado localmente!");
  return newBarber;
};

export const updateBarber = async (updatedBarber: Barber): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("barbers")
        .update({
          name: updatedBarber.name,
          avatar: updatedBarber.avatar,
          phone: updatedBarber.phone,
          work_days: JSON.stringify(updatedBarber.workDays || [1, 2, 3, 4, 5, 6]),
          start_time: updatedBarber.startTime || "08:00",
          end_time: updatedBarber.endTime || "19:00",
          blocked_dates: JSON.stringify(updatedBarber.blockedDates || []),
        })
        .eq("id", updatedBarber.id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Barbeiro atualizado no Supabase!");
      return;
    } catch (e) {
      console.error("Erro ao atualizar barbeiro no Supabase:", e);
    }
  }

  const barbers = await getBarbers();
  const index = barbers.findIndex((b) => b.id === updatedBarber.id);
  if (index !== -1) {
    barbers[index] = updatedBarber;
    setStorageItem("mbg_barbers", barbers);
    toast.success("Barbeiro atualizado localmente!");
  }
};

export const deleteBarber = async (id: string): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("barbers")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Barbeiro removido do Supabase!");
      return;
    } catch (e) {
      console.error("Erro ao excluir barbeiro no Supabase:", e);
    }
  }

  const barbers = await getBarbers();
  const filtered = barbers.filter((b) => b.id !== id);
  setStorageItem("mbg_barbers", filtered);
  toast.success("Barbeiro removido localmente!");
};

// --- CLIENTS ---
export const getClients = async (): Promise<Client[]> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("tenant_id", tenantId);
      if (error) throw error;
      return (data || []).map(mapClientFromDB);
    } catch (e) {
      console.warn("Erro ao buscar clientes no Supabase:", e);
    }
  }
  initDB();
  return getStorageItem<Client[]>("mbg_clients", defaultClients);
};

export const addClient = async (name: string, phone: string, email?: string): Promise<Client> => {
  const tenantId = getCurrentTenantId();
  const newClient: Client = {
    id: `c_${Date.now()}`,
    name,
    phone,
    email,
    registeredAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      // Check if client exists
      const { data: existing } = await supabase
        .from("clients")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("phone", phone)
        .maybeSingle();

      if (existing) {
        return mapClientFromDB(existing);
      }

      const { error } = await supabase.from("clients").insert({
        id: newClient.id,
        name: newClient.name,
        phone: newClient.phone,
        email: newClient.email,
        registered_at: newClient.registeredAt,
        tenant_id: tenantId,
      });

      if (error) throw error;
      return newClient;
    } catch (e) {
      console.error("Erro ao cadastrar cliente no Supabase:", e);
    }
  }

  const clients = await getClients();
  const existing = clients.find((c) => c.phone === phone);
  if (existing) return existing;

  clients.push(newClient);
  setStorageItem("mbg_clients", clients);
  return newClient;
};

export const updateClient = async (updatedClient: Client): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("clients")
        .update({
          name: updatedClient.name,
          phone: updatedClient.phone,
          email: updatedClient.email,
        })
        .eq("id", updatedClient.id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Cliente atualizado no servidor!");
      return;
    } catch (e) {
      console.error("Erro ao atualizar cliente no Supabase:", e);
    }
  }

  const clients = await getClients();
  const index = clients.findIndex((c) => c.id === updatedClient.id);
  if (index !== -1) {
    clients[index] = updatedClient;
    setStorageItem("mbg_clients", clients);
    toast.success("Cliente atualizado localmente!");
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Cliente excluído no servidor!");
      return;
    } catch (e) {
      console.error("Erro ao excluir cliente no Supabase:", e);
    }
  }

  const clients = await getClients();
  const filtered = clients.filter((c) => c.id !== id);
  setStorageItem("mbg_clients", filtered);
  toast.success("Cliente excluído localmente!");
};

// --- APPOINTMENTS ---
export const getAppointments = async (): Promise<Appointment[]> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("date", { ascending: false })
        .order("time", { ascending: false });
      if (error) throw error;
      return (data || []).map(mapAppointmentFromDB);
    } catch (e) {
      console.warn("Erro ao buscar agendamentos no Supabase:", e);
    }
  }
  initDB();
  return getStorageItem<Appointment[]>("mbg_appointments", []);
};

export const addAppointment = async (
  appointment: Omit<Appointment, "id" | "createdAt" | "status">
): Promise<Appointment> => {
  // Check if client already has a pending/active booking at the same date and time
  const appointments = await getAppointments();
  const duplicate = appointments.find(
    (a) =>
      a.clientPhone === appointment.clientPhone &&
      a.date === appointment.date &&
      a.time === appointment.time &&
      a.status === "pending"
  );

  if (duplicate) {
    throw new Error("Você já possui um agendamento pendente neste mesmo dia e horário!");
  }

  // Register client
  await addClient(appointment.clientName, appointment.clientPhone);

  const newApt: Appointment = {
    ...appointment,
    id: `apt_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase.from("appointments").insert({
        id: newApt.id,
        client_id: newApt.clientId,
        client_name: newApt.clientName,
        client_phone: newApt.clientPhone,
        service_id: newApt.serviceId,
        service_name: newApt.serviceName,
        price: newApt.price,
        barber_id: newApt.barberId,
        barber_name: newApt.barberName,
        date: newApt.date,
        time: newApt.time,
        status: newApt.status,
        created_at: newApt.createdAt,
        tenant_id: tenantId,
      });
      if (error) throw error;
      toast.success("Agendamento efetuado no Supabase!");
      triggerWhatsAppNotification(newApt);
      return newApt;
    } catch (e) {
      console.error("Erro ao adicionar agendamento no Supabase:", e);
      toast.error("Erro ao salvar no banco online, salvando local...");
    }
  }

  const apts = await getAppointments();
  apts.unshift(newApt);
  setStorageItem("mbg_appointments", apts);
  toast.success("Agendamento efetuado localmente!");
  triggerWhatsAppNotification(newApt);
  return newApt;
};

export const triggerWhatsAppNotification = async (appointment: Appointment) => {
  const apiUrl = import.meta.env.VITE_WHATSAPP_API_URL;
  const apiToken = import.meta.env.VITE_WHATSAPP_API_TOKEN;

  if (apiUrl && apiToken) {
    try {
      const barbers = await getBarbers();
      const barber = barbers.find((b) => b.id === appointment.barberId);
      const targetPhone = barber?.phone || DEFAULT_ADMIN_PHONE;

      const dateStr = new Date(appointment.date + "T12:00:00").toLocaleDateString("pt-BR");
      const messageText = `Olá, ${appointment.barberName}! Você tem um novo agendamento:\n\n` +
        `👤 Cliente: ${appointment.clientName}\n` +
        `📞 Telefone: ${appointment.clientPhone}\n` +
        `💇 Serviço: ${appointment.serviceName}\n` +
        `💰 Preço: R$ ${appointment.price.toFixed(2)}\n` +
        `📅 Data: ${dateStr}\n` +
        `⏰ Horário: ${appointment.time}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}`,
          "Client-Token": apiToken,
          "x-api-key": apiToken,
        },
        body: JSON.stringify({
          number: targetPhone,
          to: targetPhone,
          phone: targetPhone,
          message: messageText,
          text: messageText,
        }),
      });

      if (!response.ok) {
        console.warn("Falha ao enviar notificação automática via gateway:", response.statusText);
      } else {
        console.log("Notificação automática enviada com sucesso!");
      }
    } catch (error) {
      console.error("Erro na notificação automática de WhatsApp:", error);
    }
  }
};

export const updateAppointmentStatus = async (
  id: string,
  status: "completed" | "cancelled" | "pending"
): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", id)
        .eq("tenant_id", tenantId);
      if (error) throw error;
      
      if (status === "completed") {
        toast.success("Agendamento concluído no Supabase!");
      } else if (status === "cancelled") {
        toast.error("Agendamento cancelado no Supabase.");
      }
      return;
    } catch (e) {
      console.error("Erro ao atualizar agendamento no Supabase:", e);
      throw e;
    }
  }

  const apts = await getAppointments();
  const index = apts.findIndex((a) => a.id === id);
  if (index !== -1) {
    apts[index].status = status;
    setStorageItem("mbg_appointments", apts);
    if (status === "completed") {
      toast.success("Agendamento concluído localmente!");
    } else if (status === "cancelled") {
      toast.error("Agendamento cancelado localmente.");
    }
  }
};

// --- AUTH ---
export interface UserSession {
  role: "admin" | "client";
  name: string;
  phone?: string;
  email?: string;
}

export const getCurrentUser = (): UserSession | null => {
  return getStorageItem<UserSession | null>("mbg_session", null);
};

export const setCurrentUser = (session: UserSession) => {
  setStorageItem("mbg_session", session);
};

export const logout = () => {
  if (isServer) return;
  window.localStorage.removeItem("mbg_session");
  toast.info("Sessão encerrada.");
};

export const resetLocalDB = async () => {
  if (isServer) return;
  const tenantId = getCurrentTenantId();

  if (isSupabaseConfigured) {
    try {
      // Deleta TODOS os agendamentos no Supabase para o tenant atual
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("tenant_id", tenantId);
      if (error) throw error;
    } catch (e) {
      console.error("Erro ao limpar todos os agendamentos no Supabase no reset:", e);
      toast.error("Erro ao sincronizar reset com o servidor.");
      return;
    }
  }

  const appointmentsKey = `mbg_appointments_${tenantId}`;
  window.localStorage.setItem(appointmentsKey, JSON.stringify([]));
  toast.success("Histórico de atendimentos e faturamento zerados com sucesso!");
};

export const deleteClientAppointments = async (clientPhone: string): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("tenant_id", tenantId)
        .eq("client_phone", clientPhone);
      if (error) throw error;
      toast.success("Histórico limpo no Supabase!");
      return;
    } catch (e) {
      console.error("Erro ao limpar histórico no Supabase:", e);
      throw e;
    }
  }

  const tenantId = getCurrentTenantId();
  const appointmentsKey = `mbg_appointments_${tenantId}`;
  const appointmentsStr = window.localStorage.getItem(appointmentsKey);
  if (appointmentsStr) {
    try {
      const appointments = JSON.parse(appointmentsStr) as Appointment[];
      const filtered = appointments.filter((a) => a.clientPhone !== clientPhone);
      window.localStorage.setItem(appointmentsKey, JSON.stringify(filtered));
      toast.success("Histórico limpo localmente!");
    } catch (e) {
      console.error("Erro ao limpar histórico local:", e);
    }
  }
};

// --- SUBSCRIPTION & TRIAL ---
export interface TenantConfig {
  registeredAt: string;
  subscriptionPlan?: "mensal" | "trimestral" | "semestral" | "anual" | "master";
  subscriptionStatus: "trial" | "active" | "expired";
  subscriptionExpiresAt?: string;
}

export const getTenantConfig = (): TenantConfig => {
  if (isServer) {
    return { registeredAt: new Date().toISOString(), subscriptionStatus: "trial" };
  }
  const tenantId = getCurrentTenantId();
  const key = `mbg_tenant_config_${tenantId}`;
  
  // Tenta carregar do localStorage
  const stored = window.localStorage.getItem(key);
  let config: TenantConfig | null = null;
  if (stored) {
    try {
      config = JSON.parse(stored) as TenantConfig;
    } catch (e) {
      console.error("Erro ao parsear TenantConfig:", e);
    }
  }

  // Tenta obter a data de criação real do perfil da barbearia para sincronizar registeredAt
  const profileKey = `mbg_profile_${tenantId}`;
  const profileStored = window.localStorage.getItem(profileKey);
  let dbRegisteredAt: string | null = null;
  if (profileStored) {
    try {
      const prof = JSON.parse(profileStored);
      if (prof && prof.createdAt) {
        dbRegisteredAt = prof.createdAt;
      }
    } catch (e) {
      console.error("Erro ao ler data de registro do perfil:", e);
    }
  }

  const finalRegisteredAt = dbRegisteredAt || (config ? config.registeredAt : null) || new Date().toISOString();

  const finalConfig: TenantConfig = {
    registeredAt: finalRegisteredAt,
    subscriptionStatus: config ? config.subscriptionStatus : "trial",
    subscriptionPlan: config ? config.subscriptionPlan : undefined,
    subscriptionExpiresAt: config ? config.subscriptionExpiresAt : undefined,
  };

  window.localStorage.setItem(key, JSON.stringify(finalConfig));
  return finalConfig;
};

export const updateTenantConfig = (config: TenantConfig) => {
  if (isServer) return;
  const tenantId = getCurrentTenantId();
  const key = `mbg_tenant_config_${tenantId}`;
  window.localStorage.setItem(key, JSON.stringify(config));
};

export interface SubscriptionCheck {
  status: "trial" | "active" | "expired";
  daysLeft: number;
  plan?: "mensal" | "trimestral" | "semestral" | "anual" | "master";
}

export const checkSubscriptionStatus = (): SubscriptionCheck => {
  const config = getTenantConfig();
  const now = new Date();

  // Se for master/premium permanente
  if (config.subscriptionStatus === "active" && config.subscriptionPlan === "master") {
    return { status: "active", daysLeft: 9999, plan: "master" };
  }

  // Se possuir assinatura ativa
  if (config.subscriptionStatus === "active" && config.subscriptionExpiresAt) {
    const expiresAt = new Date(config.subscriptionExpiresAt);
    if (now > expiresAt) {
      // Expirou
      const expiredConfig: TenantConfig = {
        ...config,
        subscriptionStatus: "expired",
      };
      updateTenantConfig(expiredConfig);
      return { status: "expired", daysLeft: 0, plan: config.subscriptionPlan };
    } else {
      const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: "active", daysLeft: diffDays, plan: config.subscriptionPlan };
    }
  }

  // Se estiver no período de testes (trial)
  if (config.subscriptionStatus === "trial") {
    const regDate = new Date(config.registeredAt);
    const trialEndDate = new Date(regDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    if (now > trialEndDate) {
      // O período de testes acabou
      const expiredConfig: TenantConfig = {
        ...config,
        subscriptionStatus: "expired",
      };
      updateTenantConfig(expiredConfig);
      return { status: "expired", daysLeft: 0, plan: config.subscriptionPlan };
    } else {
      const diffTime = Math.abs(trialEndDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { status: "trial", daysLeft: diffDays, plan: config.subscriptionPlan };
    }
  }

  return { status: config.subscriptionStatus, daysLeft: 0, plan: config.subscriptionPlan };
};

export const activateSubscription = async (code: string): Promise<boolean> => {
  const cleanCode = code.trim().toUpperCase();
  const config = getTenantConfig();
  let daysToAdd = 0;
  let plan: "mensal" | "trimestral" | "semestral" | "anual" | "master" | null = null;

  switch (cleanCode) {
    case "ATIVA_MEN_MBG":
      daysToAdd = 30;
      plan = "mensal";
      break;
    case "ATIVA_TRI_MBG":
      daysToAdd = 90;
      plan = "trimestral";
      break;
    case "ATIVA_SEM_MBG":
      daysToAdd = 180;
      plan = "semestral";
      break;
    case "ATIVA_ANU_MBG":
      daysToAdd = 365;
      plan = "anual";
      break;
    case "MASTER_MBG_VIP":
      plan = "master";
      break;
    default:
      return false; // Código inválido
  }

  const now = new Date();
  let baseDate = now;

  // Se já possuir um plano ativo, soma ao tempo restante
  if (config.subscriptionStatus === "active" && config.subscriptionExpiresAt) {
    const currentExpiry = new Date(config.subscriptionExpiresAt);
    if (currentExpiry > now) {
      baseDate = currentExpiry;
    }
  }

  let expiresAtStr: string | undefined;
  if (plan !== "master") {
    const newExpiry = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    expiresAtStr = newExpiry.toISOString();
  }

  const updatedConfig: TenantConfig = {
    ...config,
    subscriptionStatus: "active",
    subscriptionPlan: plan!,
    subscriptionExpiresAt: expiresAtStr,
  };

  updateTenantConfig(updatedConfig);

  // Sincroniza com o Supabase se estiver configurado
  if (isSupabaseConfigured) {
    try {
      const tenantId = getCurrentTenantId();
      await supabase
        .from("barber_shops")
        .update({
          subscription_plan: plan,
          subscription_status: "active",
          subscription_expires_at: expiresAtStr,
        })
        .eq("tenant_id", tenantId);
    } catch (e) {
      console.error("Erro ao sincronizar ativação de assinatura com Supabase:", e);
    }
  }

  return true;
};

// --- STATS ---
export interface DashboardStats {
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  registeredClients: number;
  completedServices: number;
  monthlyHistory: { name: string; faturamento: number }[];
  barberPerformance: { name: string; faturamento: number; atendimentos: number }[];
  servicePopularity: { name: string; valor: number }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const appointments = await getAppointments();
  const clients = await getClients();
  const barbers = await getBarbers();

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  let dailyEarnings = 0;
  let weeklyEarnings = 0;
  let monthlyEarnings = 0;
  let yearlyEarnings = 0;
  let completedServices = 0;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const monthlySums: { [key: string]: number } = {};
  const barberSums: { [key: string]: { value: number; count: number } } = {};
  const servicePopularity: { [key: string]: number } = {};

  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    monthlySums[key] = 0;
  }

  barbers.forEach((b) => {
    barberSums[b.name] = { value: 0, count: 0 };
  });

  appointments.forEach((apt) => {
    if (apt.status !== "completed") return;

    completedServices++;
    const aptPrice = apt.price || 0;
    const aptDateStr = apt.date;
    const aptDate = new Date(aptDateStr + "T12:00:00");

    if (aptDateStr === todayStr) {
      dailyEarnings += aptPrice;
    }
    if (aptDate >= oneWeekAgo && aptDate <= now) {
      weeklyEarnings += aptPrice;
    }
    if (aptDate >= startOfMonth && aptDate.getFullYear() === now.getFullYear() && aptDate.getMonth() === now.getMonth()) {
      monthlyEarnings += aptPrice;
    }
    if (aptDate >= startOfYear && aptDate.getFullYear() === now.getFullYear()) {
      yearlyEarnings += aptPrice;
    }

    const mKey = `${monthNames[aptDate.getMonth()]} ${aptDate.getFullYear().toString().substring(2)}`;
    if (mKey in monthlySums) {
      monthlySums[mKey] += aptPrice;
    }

    const bName = apt.barberName;
    if (barberSums[bName]) {
      barberSums[bName].value += aptPrice;
      barberSums[bName].count += 1;
    } else {
      barberSums[bName] = { value: aptPrice, count: 1 };
    }

    const sName = apt.serviceName;
    servicePopularity[sName] = (servicePopularity[sName] || 0) + 1;
  });

  const monthlyHistory = Object.entries(monthlySums).map(([name, faturamento]) => ({
    name,
    faturamento,
  }));

  const barberPerformance = Object.entries(barberSums).map(([name, stats]) => ({
    name,
    faturamento: stats.value,
    atendimentos: stats.count,
  }));

  const popularServices = Object.entries(servicePopularity)
    .map(([name, valor]) => ({ name, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return {
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
    yearlyEarnings,
    registeredClients: clients.length,
    completedServices,
    monthlyHistory,
    barberPerformance,
    servicePopularity: popularServices,
  };
};

// --- BARBER SHOP PROFILE ---
export const getBarberShopProfile = async (tenantId: string): Promise<BarberShopProfile> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("barber_shops")
        .select("*")
        .eq("tenant_id", tenantId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        const prof: BarberShopProfile = {
          tenantId: data.tenant_id,
          name: data.name,
          logoUrl: data.logo_url || undefined,
          createdAt: data.created_at,
          subscriptionPlan: data.subscription_plan || "mensal",
          subscriptionStatus: data.subscription_status || "trial",
          subscriptionExpiresAt: data.subscription_expires_at || undefined,
        };
        if (!isServer) {
          window.localStorage.setItem(`mbg_profile_${tenantId}`, JSON.stringify(prof));
          
          // Sincroniza o TenantConfig no localStorage
          const configKey = `mbg_tenant_config_${tenantId}`;
          const currentConfigStr = window.localStorage.getItem(configKey);
          let currentConfig = { registeredAt: data.created_at || new Date().toISOString(), subscriptionStatus: "trial" as const };
          if (currentConfigStr) {
            try {
              currentConfig = JSON.parse(currentConfigStr);
            } catch (e) {}
          }
          const updatedConfig: TenantConfig = {
            registeredAt: data.created_at || currentConfig.registeredAt,
            subscriptionPlan: data.subscription_plan || undefined,
            subscriptionStatus: data.subscription_status || "trial",
            subscriptionExpiresAt: data.subscription_expires_at || undefined,
          };
          window.localStorage.setItem(configKey, JSON.stringify(updatedConfig));
        }
        return prof;
      } else if (tenantId !== "default") {
        // Se não existir o perfil no banco ainda, cria um padrão automaticamente no Supabase
        const defaultName = tenantId.split("@")[0].toUpperCase() + " BARBEARIA";
        const { data: newData, error: insertError } = await supabase
          .from("barber_shops")
          .insert({
            tenant_id: tenantId,
            name: defaultName,
          })
          .select()
          .single();
          
        if (!insertError && newData) {
          const prof: BarberShopProfile = {
            tenantId: newData.tenant_id,
            name: newData.name,
            logoUrl: newData.logo_url || undefined,
            createdAt: newData.created_at,
            subscriptionPlan: newData.subscription_plan || "mensal",
            subscriptionStatus: newData.subscription_status || "trial",
            subscriptionExpiresAt: newData.subscription_expires_at || undefined,
          };
          if (!isServer) {
            window.localStorage.setItem(`mbg_profile_${tenantId}`, JSON.stringify(prof));
            
            // Sincroniza o TenantConfig no localStorage
            const configKey = `mbg_tenant_config_${tenantId}`;
            const updatedConfig: TenantConfig = {
              registeredAt: newData.created_at || new Date().toISOString(),
              subscriptionPlan: newData.subscription_plan || undefined,
              subscriptionStatus: newData.subscription_status || "trial",
              subscriptionExpiresAt: newData.subscription_expires_at || undefined,
            };
            window.localStorage.setItem(configKey, JSON.stringify(updatedConfig));
          }
          return prof;
        }
      }
    } catch (e) {
      console.warn("Erro ao buscar perfil da barbearia no Supabase:", e);
    }
  }

  // Fallback local
  if (!isServer) {
    const stored = window.localStorage.getItem(`mbg_profile_${tenantId}`);
    if (stored) {
      try {
        return JSON.parse(stored) as BarberShopProfile;
      } catch (e) {
        console.error("Erro ao ler perfil local:", e);
      }
    }
  }

  // Perfil padrão caso não exista
  const config = getTenantConfig();
  return {
    tenantId,
    name: tenantId === "default" ? "Meu Barbeiro GO" : tenantId.split("@")[0].toUpperCase() + " BARBEARIA",
    subscriptionPlan: config.subscriptionPlan || "mensal",
    subscriptionStatus: config.subscriptionStatus || "trial",
    subscriptionExpiresAt: config.subscriptionExpiresAt || undefined,
  };
};

export const updateBarberShopProfile = async (profile: BarberShopProfile): Promise<void> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("barber_shops")
        .upsert({
          tenant_id: profile.tenantId,
          name: profile.name,
          logo_url: profile.logoUrl || null,
        });

      if (error) throw error;
      toast.success("Perfil da barbearia atualizado no servidor!");
    } catch (e) {
      console.error("Erro ao salvar perfil no Supabase:", e);
      toast.error("Erro ao salvar no servidor, atualizando localmente...");
    }
  }

  // Sempre salva localmente como fallback/sincronização
  if (!isServer) {
    window.localStorage.setItem(`mbg_profile_${profile.tenantId}`, JSON.stringify(profile));
    toast.success("Perfil da barbearia atualizado localmente!");
  }
};

// --- MASTER ADMIN ACTIONS ---
export const getAllBarberShops = async (): Promise<BarberShopProfile[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("barber_shops")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        tenantId: d.tenant_id,
        name: d.name,
        logoUrl: d.logo_url || undefined,
        createdAt: d.created_at,
        subscriptionPlan: d.subscription_plan || "mensal",
        subscriptionStatus: d.subscription_status || "trial",
        subscriptionExpiresAt: d.subscription_expires_at || undefined,
      }));
    } catch (e) {
      console.error("Erro ao buscar todas as barbearias:", e);
      return [];
    }
  }
  return [];
};

export const updateBarberShopSubscription = async (
  tenantId: string,
  plan: "mensal" | "trimestral" | "semestral" | "anual" | "master",
  status: "trial" | "active" | "expired",
  expiresAt: string | null
): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from("barber_shops")
        .update({
          subscription_plan: plan,
          subscription_status: status,
          subscription_expires_at: expiresAt,
        })
        .eq("tenant_id", tenantId);
      if (error) throw error;
      toast.success("Assinatura da barbearia atualizada com sucesso!");
      return true;
    } catch (e) {
      console.error("Erro ao atualizar assinatura no Supabase:", e);
      toast.error("Erro ao salvar alterações no banco online.");
      return false;
    }
  }
  return false;
};

