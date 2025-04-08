import { createClient } from '@supabase/supabase-js';

// Définir directement les valeurs au lieu d'utiliser des variables d'environnement
const supabaseUrl = 'https://nndamtxwdllkhcowmheb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uZGFtdHh3ZGxsa2hjb3dtaGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDE2MjQsImV4cCI6MjA1OTY3NzYyNH0.vferJpS2RmTDPJFg7176ud32K3AnOE0hQMVtthTvLnA';

console.log("Initialisation du client Supabase avec URL:", supabaseUrl);

// Création du client Supabase avec options avancées
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Log pour confirmer l'initialisation
console.log("Client Supabase initialisé"); 