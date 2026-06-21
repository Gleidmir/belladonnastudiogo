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
    work_hours TEXT DEFAULT '["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]',
    tenant_id TEXT DEFAULT 'default' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para Barbeiros (Leitura pública, escrita autenticada por tenant)
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de barbeiros" ON public.barbers FOR SELECT USING (true);
CREATE POLICY "Escrita para admins autenticados" ON public.barbers FOR ALL TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text))
    WITH CHECK (tenant_id = (auth.jwt() ->> 'email'::text));

-- 2. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    duration INTEGER NOT NULL, -- em minutos
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    tenant_id TEXT DEFAULT 'default' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Serviços (Leitura pública, escrita autenticada por tenant)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de serviços" ON public.services FOR SELECT USING (true);
CREATE POLICY "Escrita de serviços para admins" ON public.services FOR ALL TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text))
    WITH CHECK (tenant_id = (auth.jwt() ->> 'email'::text));

-- 3. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    tenant_id TEXT DEFAULT 'default' NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índice para busca rápida por telefone (único por barbearia)
DROP INDEX IF EXISTS public.clients_phone_idx;
CREATE UNIQUE INDEX IF NOT EXISTS clients_tenant_phone_idx ON public.clients (tenant_id, phone);

-- Habilitar RLS para Clientes (Leitura/escrita controlada por tenant)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura de clientes" ON public.clients FOR SELECT 
    USING (
        (auth.role() = 'authenticated' AND tenant_id = (auth.jwt() ->> 'email'::text))
        OR
        (auth.role() = 'anon')
    );
CREATE POLICY "Permitir inserção de clientes" ON public.clients FOR INSERT WITH CHECK (tenant_id IS NOT NULL);
CREATE POLICY "Gerenciamento total de clientes por admins" ON public.clients FOR ALL TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text))
    WITH CHECK (tenant_id = (auth.jwt() ->> 'email'::text));

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
    tenant_id TEXT DEFAULT 'default' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Agendamentos (Controle refinado por tenant e cliente)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir criar agendamentos" ON public.appointments FOR INSERT WITH CHECK (tenant_id IS NOT NULL);
CREATE POLICY "Permitir leitura de agendamentos" ON public.appointments FOR SELECT 
    USING (
        (auth.role() = 'authenticated' AND tenant_id = (auth.jwt() ->> 'email'::text))
        OR
        (auth.role() = 'anon')
    );
CREATE POLICY "Permitir atualização de agendamentos por admins" ON public.appointments FOR UPDATE TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text))
    WITH CHECK (tenant_id = (auth.jwt() ->> 'email'::text));
CREATE POLICY "Permitir cancelamento pelo próprio cliente" ON public.appointments FOR UPDATE TO anon 
    USING (status = 'pending')
    WITH CHECK (status = 'cancelled');
CREATE POLICY "Permitir exclusão de agendamentos por admins" ON public.appointments FOR DELETE TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text));
CREATE POLICY "Permitir exclusão pelo próprio cliente" ON public.appointments FOR DELETE TO anon 
    USING (client_phone IS NOT NULL);


-- ====================================================
-- CARGA INICIAL DE DADOS (OPCIONAL/RECOMENDADO)
-- ====================================================

-- Inserir Barbeiros Iniciais (caso não existam)
INSERT INTO public.barbers (id, name, avatar, phone, work_days, start_time, end_time, blocked_dates, work_hours) VALUES
('b1', 'PASTOR', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]', '["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]'),
('b2', 'RAFAEL', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]', '["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]'),
('b3', 'ANDRÉ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]', '["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]'),
('b4', 'BRUNO', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', '5562993299120', '[1,2,3,4,5,6]', '08:00', '19:00', '[]', '["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00"]')
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


-- 5. Tabela de Perfis de Barbearias (Tenant Profiles)
CREATE TABLE IF NOT EXISTS public.barber_shops (
    tenant_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS para Perfis de Barbearias (Leitura pública, escrita autenticada pelo respectivo admin)
ALTER TABLE public.barber_shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública de perfis" ON public.barber_shops FOR SELECT USING (true);
CREATE POLICY "Escrita de perfis para admins" ON public.barber_shops FOR ALL TO authenticated 
    USING (tenant_id = (auth.jwt() ->> 'email'::text) OR (auth.jwt() ->> 'email'::text) = 'gleidmircristino@hotmail.com')
    WITH CHECK (tenant_id = (auth.jwt() ->> 'email'::text) OR (auth.jwt() ->> 'email'::text) = 'gleidmircristino@hotmail.com');


-- ====================================================
-- TRIGGERS E FUNÇÕES DE SEGURANÇA E EXCLUSÃO
-- ====================================================

-- 1. Função executada quando um usuário do Auth é deletado diretamente no Supabase
CREATE OR REPLACE FUNCTION public.handle_deleted_auth_user()
RETURNS TRIGGER
AS $$
BEGIN
  DELETE FROM public.appointments WHERE tenant_id = OLD.email;
  DELETE FROM public.clients WHERE tenant_id = OLD.email;
  DELETE FROM public.services WHERE tenant_id = OLD.email;
  DELETE FROM public.barbers WHERE tenant_id = OLD.email;
  DELETE FROM public.barber_shops WHERE tenant_id = OLD.email;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Revoga a execução pública por segurança (Advisor do Supabase)
REVOKE EXECUTE ON FUNCTION public.handle_deleted_auth_user() FROM PUBLIC;

-- Trigger para automatizar a limpeza caso o e-mail seja apagado no painel do Supabase
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_deleted_auth_user();


-- 2. Função de RPC para o Administrador Master usar na lixeira do Painel
CREATE OR REPLACE FUNCTION public.delete_barber_shop_cascade(target_tenant_id TEXT)
RETURNS BOOLEAN
AS $$
BEGIN
  -- Apenas o administrador master tem permissão
  IF auth.jwt() ->> 'email'::text <> 'gleidmircristino@hotmail.com' THEN
    RAISE EXCEPTION 'Apenas o administrador master pode executar esta ação.';
  END IF;

  -- Deleta os dados de todas as tabelas públicas
  DELETE FROM public.appointments WHERE tenant_id = target_tenant_id;
  DELETE FROM public.clients WHERE tenant_id = target_tenant_id;
  DELETE FROM public.services WHERE tenant_id = target_tenant_id;
  DELETE FROM public.barbers WHERE tenant_id = target_tenant_id;
  DELETE FROM public.barber_shops WHERE tenant_id = target_tenant_id;
  
  -- Deleta o usuário de login na tabela Auth
  DELETE FROM auth.users WHERE email = target_tenant_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Revoga a execução por usuários anônimos / público
REVOKE EXECUTE ON FUNCTION public.delete_barber_shop_cascade(TEXT) FROM PUBLIC;

-- Permite a execução apenas por usuários autenticados (como você no painel)
GRANT EXECUTE ON FUNCTION public.delete_barber_shop_cascade(TEXT) TO authenticated;


-- 3. Função executada quando um novo usuário se registra no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.barber_shops (tenant_id, name, subscription_status, subscription_plan)
  VALUES (
    NEW.email,
    UPPER(SPLIT_PART(NEW.email, '@', 1)) || ' BARBEARIA',
    'expired',
    'mensal'
  )
  ON CONFLICT (tenant_id) DO UPDATE
  SET subscription_status = 'expired';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Revoga a execução pública por segurança (Advisor do Supabase)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Trigger para automatizar a criação do perfil da barbearia após o cadastro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Função de trigger da tabela barber_shops para controle e validação de assinaturas
CREATE OR REPLACE FUNCTION public.check_barber_shop_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Para novas inserções: força o status 'expired' (Inativo) e plano mensal padrão
  IF TG_OP = 'INSERT' THEN
    IF (NEW.subscription_status IS DISTINCT FROM 'expired' OR NEW.subscription_plan IS DISTINCT FROM 'mensal' OR NEW.subscription_expires_at IS DISTINCT FROM NULL) THEN
      IF (auth.jwt() ->> 'email'::text) IS DISTINCT FROM 'gleidmircristino@hotmail.com' THEN
        NEW.subscription_status := 'expired';
        NEW.subscription_plan := 'mensal';
        NEW.subscription_expires_at := NULL;
      END IF;
    END IF;
  END IF;

  -- Para atualizações: reverte silenciosamente qualquer tentativa de alteração nas assinaturas
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan OR
        NEW.subscription_status IS DISTINCT FROM OLD.subscription_status OR
        NEW.subscription_expires_at IS DISTINCT FROM OLD.subscription_expires_at) THEN

      IF (auth.jwt() ->> 'email'::text) IS DISTINCT FROM 'gleidmircristino@hotmail.com' THEN
        NEW.subscription_plan := OLD.subscription_plan;
        NEW.subscription_status := OLD.subscription_status;
        NEW.subscription_expires_at := OLD.subscription_expires_at;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Revoga execução pública por segurança
REVOKE EXECUTE ON FUNCTION public.check_barber_shop_subscription() FROM PUBLIC, anon, authenticated;

-- Associa o trigger à tabela barber_shops
DROP TRIGGER IF EXISTS trg_check_barber_shop_subscription ON public.barber_shops;
CREATE TRIGGER trg_check_barber_shop_subscription
  BEFORE INSERT OR UPDATE ON public.barber_shops
  FOR EACH ROW EXECUTE FUNCTION public.check_barber_shop_subscription();



