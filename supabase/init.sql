-- Créer une table pour les profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  fishing_styles JSONB,
  favorite_spots JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer une table pour les spots de pêche
CREATE TABLE IF NOT EXISTS spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location JSONB NOT NULL,
  address TEXT,
  image TEXT,
  water_type TEXT NOT NULL,
  fish_types JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Créer une table pour les captures
CREATE TABLE IF NOT EXISTS catches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  spot_id UUID REFERENCES spots(id) ON DELETE CASCADE,
  fishes JSONB NOT NULL,
  bait TEXT,
  fishing_type TEXT,
  weather TEXT,
  water_type TEXT,
  photo TEXT,
  notes TEXT,
  catch_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement le champ updated_at pour la table profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Ajouter des politiques de sécurité Row Level Security (RLS)

-- Activer RLS pour toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

-- Politiques pour les profils
CREATE POLICY "Les utilisateurs peuvent lire n'importe quel profil"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Politiques pour les spots
CREATE POLICY "Les spots sont visibles par tous"
ON spots FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des spots"
ON spots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres spots"
ON spots FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres spots"
ON spots FOR DELETE
TO authenticated
USING (auth.uid() = created_by);

-- Politiques pour les captures
CREATE POLICY "Les captures sont visibles par tous"
ON catches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des captures"
ON catches FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres captures"
ON catches FOR UPDATE
TO authenticated
USING (auth.uid() = created_by);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres captures"
ON catches FOR DELETE
TO authenticated
USING (auth.uid() = created_by); 