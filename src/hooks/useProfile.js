import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userProfileService } from '../services/userProfileService';
import { catchService } from '../services/catchService';
import { spotService } from '../services/spotService';

/**
 * Hook personnalisé pour gérer le profil utilisateur
 * @returns {Object} Données et fonctions pour gérer le profil
 */
export const useProfile = () => {
  const { user, profile, updateUserProfile, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [catchesStats, setCatchesStats] = useState(null);
  const [favoriteSpots, setFavoriteSpots] = useState([]);
  const [error, setError] = useState(null);

  // Chargement initial des données
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Fonction pour charger les données du profil
  const loadUserData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Mettre à jour le profil
      if (!profile) {
        await refreshUserProfile();
      }
      
      // 2. Charger les statistiques des captures
      const stats = await catchService.getUserCatchStats();
      setCatchesStats(stats);
      
      // 3. Charger les spots favoris
      const favorites = await spotService.getUserFavorites(user.id);
      setFavoriteSpots(favorites);
    } catch (err) {
      console.error('Erreur lors du chargement des données utilisateur:', err);
      setError('Impossible de charger les données utilisateur');
    } finally {
      setLoading(false);
    }
  }, [user, profile, refreshUserProfile]);

  // Fonction pour mettre à jour le profil
  const updateProfile = async (updates) => {
    if (!user) return;
    
    try {
      const updatedProfile = await updateUserProfile(updates);
      return updatedProfile;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Impossible de mettre à jour le profil');
      throw err;
    }
  };

  // Fonction pour mettre à jour l'avatar
  const updateAvatar = async (file) => {
    if (!user || !file) return;
    
    try {
      const updatedProfile = await userProfileService.updateAvatar(user.id, file);
      await refreshUserProfile();
      return updatedProfile;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'avatar:', err);
      setError('Impossible de mettre à jour l\'avatar');
      throw err;
    }
  };

  // Fonction pour mettre à jour les préférences de pêche
  const updateFishingPreferences = async (preferences) => {
    if (!user) return;
    
    try {
      const updatedProfile = await userProfileService.updateFishingPreferences(user.id, preferences);
      await refreshUserProfile();
      return updatedProfile;
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences de pêche:', err);
      setError('Impossible de mettre à jour les préférences de pêche');
      throw err;
    }
  };

  // Fonction pour ajouter un spot aux favoris
  const addFavoriteSpot = async (spotId) => {
    if (!user) return;
    
    try {
      await spotService.addFavorite(spotId, user.id);
      // Recharger les favoris
      const favorites = await spotService.getUserFavorites(user.id);
      setFavoriteSpots(favorites);
    } catch (err) {
      console.error('Erreur lors de l\'ajout aux favoris:', err);
      setError('Impossible d\'ajouter ce spot aux favoris');
      throw err;
    }
  };

  // Fonction pour retirer un spot des favoris
  const removeFavoriteSpot = async (spotId) => {
    if (!user) return;
    
    try {
      await spotService.removeFavorite(spotId, user.id);
      // Recharger les favoris
      const favorites = await spotService.getUserFavorites(user.id);
      setFavoriteSpots(favorites);
    } catch (err) {
      console.error('Erreur lors du retrait des favoris:', err);
      setError('Impossible de retirer ce spot des favoris');
      throw err;
    }
  };

  // Fonction pour vérifier si un spot est dans les favoris
  const isSpotFavorite = async (spotId) => {
    if (!user) return false;
    
    try {
      return await spotService.isSpotFavorite(spotId, user.id);
    } catch (err) {
      console.error('Erreur lors de la vérification des favoris:', err);
      return false;
    }
  };

  // Rafraîchir toutes les données
  const refreshAllData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  return {
    profile,
    loading,
    error,
    catchesStats,
    favoriteSpots,
    updateProfile,
    updateAvatar,
    updateFishingPreferences,
    addFavoriteSpot,
    removeFavoriteSpot,
    isSpotFavorite,
    refreshAllData
  };
}; 