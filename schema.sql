-- ====================================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ====================================================

-- Habilitar a extensão UUID se não estiver ativa
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Barbeiros
CREATE TABLE IF NOT EXISTS public.barbers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    phone TEXT,
    work_days TEXT DEFAULT '[1,2,3,4,5,6]',
    start_time TEXT DEFAULT '08:00',
    end_time TEXT DEFAULT '19:00',
    blocked_dates TEXT DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para Barbeiros (Leitura pública, escrita autenticada)
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de barbeiros" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Escrita para admins autenticados" ON public.barbers FOR ALL TO authenticated USING (true);

-- 2. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Serviços (Leitura pública, escrita autenticada)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de serviços" ON public.services FOR SELECT USING (true);
CREATE POLICY "Escrita de serviços para admins" ON public.services FOR ALL TO authenticated USING (true);

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índice para busca rápida por telefone
CREATE UNIQUE INDEX IF NOT EXISTS clients_phone_idx ON public.clients (phone);

-- Habilitar RLS para Clientes (Qualquer um pode ler/escrever para permitir agendamentos rápidos)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura para todos" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de clientes" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Gerenciamento total de clientes por admins" ON public.clients FOR ALL TO authenticated USING (true);

-- 4. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    barber_id TEXT NOT NULL,
    barber_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Agendamentos (Todos podem criar, somente admins gerenciam tudo)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir criar agendamentos" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura de agendamentos para todos" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Gerenciamento total por admins" ON public.appointments FOR ALL TO authenticated USING (true);


-- ====================================================
-- CARGA INICIAL DE DADOS (OPCIONAL/RECOMENDADO)
-- ====================================================

-- Inserir Barbeiros Iniciais (caso não existam)
INSERT INTO public.barbers (id, name, avatar, phone, work_days, start_time, end_time, blocked_dates) VALUES
('b1', 'PASTOR', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]'),
('b2', 'RAFAEL', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]'),
('b3', 'ANDRÉ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]'),
('b4', 'BRUNO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]')
ON CONFLICT (id) DO NOTHING;

-- Inserir Serviços Iniciais (caso não existam)
INSERT INTO public.services (id, name, price, duration, is_active) VALUES
('s1', 'Cabelo + Barba e Sobrancelha', 80.00, 60, true),
('s2', 'Corte + Cavanhaque + Sobrancelha', 60.00, 60, true),
('s3', 'Depilação a Cera / Nariz e Orelhas', 10.00, 10, true),
('s4', 'Luzes', 100.00, 60, true),
('s5', 'Pezinho', 10.00, 15, true),
('s6', 'Pigmentação', 30.00, 50, true),
('s7', 'Platinado', 120.00, 60, true),
('s8', 'Sobrancelha', 10.00, 10, true),
('s9', 'Barba', 35.00, 30, true),
('s10', 'Barba + Pezinho + Sobrancelha', 50.00, 40, true),
('s11', 'Cabelo', 35.00, 30, true),
('s12', 'Cabelo + Barba', 70.00, 50, true),
('s13', 'Cabelo + Bigode + Sobrancelha', 50.00, 50, true),
('s14', 'Cabelo + Pigmentação', 70.00, 50, true)
ON CONFLICT (id) DO NOTHING;
