-- Mise à jour de la table profiles pour stocker les données utilisateur locales

-- Ajouter une colonne bio si elle n'existe pas déjà
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Ajouter des colonnes pour stocker les spots, captures et favoris de l'utilisateur
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stored_spots JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stored_catches JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stored_favorites JSONB DEFAULT '[]'::jsonb;

-- Commentaires sur les colonnes
COMMENT ON COLUMN profiles.bio IS 'Biographie ou à propos de l''utilisateur';
COMMENT ON COLUMN profiles.stored_spots IS 'Spots de pêche enregistrés localement par l''utilisateur';
COMMENT ON COLUMN profiles.stored_catches IS 'Captures de pêche enregistrées localement par l''utilisateur';
COMMENT ON COLUMN profiles.stored_favorites IS 'Favoris enregistrés localement par l''utilisateur';

-- Mettre à jour la fonction trigger pour s'assurer que les champs JSONB sont initialisés correctement
CREATE OR REPLACE FUNCTION initialize_profile_json_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialiser les champs JSONB s'ils sont NULL
  IF NEW.stored_spots IS NULL THEN
    NEW.stored_spots = '[]'::jsonb;
  END IF;
  
  IF NEW.stored_catches IS NULL THEN
    NEW.stored_catches = '[]'::jsonb;
  END IF;
  
  IF NEW.stored_favorites IS NULL THEN
    NEW.stored_favorites = '[]'::jsonb;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour initialiser automatiquement les champs JSONB
DROP TRIGGER IF EXISTS initialize_profile_json_fields_trigger ON profiles;
CREATE TRIGGER initialize_profile_json_fields_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION initialize_profile_json_fields();

-- Mettre à jour la politique de sécurité pour les profils
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Mettre à jour la politique d'insertion pour les profils
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON profiles;
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id); 