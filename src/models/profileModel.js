/**
 * Modèle pour les profils utilisateurs dans l'application Hooked
 */

/**
 * Crée un nouveau profil utilisateur
 * @param {Object} data - Les données du profil
 * @returns {Object} - Le profil formaté
 */
export const createUserProfile = (data) => ({
  id: data.id, // ID de l'utilisateur (vient de Supabase Auth)
  username: data.username || '',
  full_name: data.full_name || '',
  avatar_url: data.avatar_url || '',
  bio: data.bio || '',
  location: data.location || '',
  favorite_spots: data.favorite_spots || [],
  fishing_preferences: data.fishing_preferences || {
    preferred_fish_types: [],
    preferred_water_types: [],
    preferred_fishing_types: []
  },
  notifications_enabled: data.notifications_enabled !== undefined ? data.notifications_enabled : true,
  created_at: data.created_at || new Date().toISOString(),
  updated_at: data.updated_at || new Date().toISOString()
});

/**
 * Structure de la table Supabase 'profiles'
 * 
 * CREATE TABLE profiles (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id),
 *   username TEXT UNIQUE,
 *   full_name TEXT,
 *   avatar_url TEXT,
 *   bio TEXT,
 *   location TEXT,
 *   favorite_spots JSONB,
 *   fishing_preferences JSONB,
 *   notifications_enabled BOOLEAN DEFAULT TRUE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * -- Créer une politique RLS pour permettre l'accès public en lecture seule
 * CREATE POLICY "Profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de modifier leur propre profil
 * CREATE POLICY "Users can update their own profiles." ON profiles FOR UPDATE USING (auth.uid() = id);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de supprimer leur propre profil
 * CREATE POLICY "Users can delete their own profiles." ON profiles FOR DELETE USING (auth.uid() = id);
 */

/**
 * Structure de la table Supabase 'catches'
 * 
 * CREATE TABLE catches (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   spot_id UUID REFERENCES spots(id),
 *   fish_type TEXT NOT NULL,
 *   custom_fish_type TEXT,
 *   water_type TEXT NOT NULL,
 *   location JSONB,
 *   address TEXT,
 *   photo_url TEXT,
 *   bait TEXT,
 *   technique TEXT,
 *   weather TEXT,
 *   weight DECIMAL,
 *   length DECIMAL,
 *   notes TEXT,
 *   catch_date TIMESTAMP WITH TIME ZONE,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de voir toutes les captures
 * CREATE POLICY "Catches are viewable by everyone." ON catches FOR SELECT USING (true);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de créer leurs propres captures
 * CREATE POLICY "Users can create their own catches." ON catches FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de modifier leurs propres captures
 * CREATE POLICY "Users can update their own catches." ON catches FOR UPDATE USING (auth.uid() = user_id);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de supprimer leurs propres captures
 * CREATE POLICY "Users can delete their own catches." ON catches FOR DELETE USING (auth.uid() = user_id);
 */

/**
 * Structure de la table Supabase 'spots'
 * 
 * CREATE TABLE spots (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   type TEXT,
 *   water_type TEXT NOT NULL,
 *   fishing_type TEXT,
 *   fish_types JSONB,
 *   location JSONB NOT NULL,
 *   address TEXT,
 *   image_url TEXT,
 *   created_by UUID REFERENCES auth.users(id),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de voir tous les spots
 * CREATE POLICY "Spots are viewable by everyone." ON spots FOR SELECT USING (true);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de créer des spots
 * CREATE POLICY "Users can create spots." ON spots FOR INSERT WITH CHECK (auth.uid() = created_by);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de modifier leurs propres spots
 * CREATE POLICY "Users can update their own spots." ON spots FOR UPDATE USING (auth.uid() = created_by);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de supprimer leurs propres spots
 * CREATE POLICY "Users can delete their own spots." ON spots FOR DELETE USING (auth.uid() = created_by);
 */

/**
 * Structure de la table Supabase 'favorites'
 * 
 * CREATE TABLE favorites (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   spot_id UUID REFERENCES spots(id) NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(user_id, spot_id)
 * );
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de voir leurs propres favoris
 * CREATE POLICY "Users can view their own favorites." ON favorites FOR SELECT USING (auth.uid() = user_id);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs d'ajouter des favoris
 * CREATE POLICY "Users can add favorites." ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * -- Créer une politique RLS pour permettre aux utilisateurs de supprimer leurs propres favoris
 * CREATE POLICY "Users can delete their own favorites." ON favorites FOR DELETE USING (auth.uid() = user_id);
 */ 