import { v4 as uuidv4 } from 'uuid';
import { storageService } from './storageService';

// Clé d'utilisateur par défaut (pour le mode démo)
const DEFAULT_USER_ID = 'default-user';

/**
 * Service de gestion des utilisateurs
 */
export const userService = {
  /**
   * Récupère l'utilisateur actuel
   * Dans une application réelle, cela vérifierait les cookies/session
   * @returns {Object} L'utilisateur actuel
   */
  getCurrentUser() {
    // En démo, on retourne toujours l'utilisateur par défaut
    const users = storageService.getUsers();
    
    // Si aucun utilisateur n'existe, on crée l'utilisateur par défaut
    if (users.length === 0) {
      const defaultUser = this.createDefaultUser();
      return defaultUser;
    }
    
    // Dans une vraie app, on vérifierait quel utilisateur est connecté
    // Ici, on retourne toujours le premier utilisateur
    return users[0];
  },
  
  /**
   * Crée l'utilisateur par défaut
   * @returns {Object} L'utilisateur par défaut
   */
  createDefaultUser() {
    const defaultUser = {
      id: DEFAULT_USER_ID,
      username: 'Demo User',
      email: 'demo@example.com',
      avatar: null, // URL de l'avatar
      preferences: {
        theme: 'light',
        language: 'fr',
        notifications: true
      },
      createdAt: new Date().toISOString()
    };
    
    storageService.addUser(defaultUser);
    return defaultUser;
  },
  
  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} userData - Les données à mettre à jour
   * @returns {Object} L'utilisateur mis à jour
   */
  updateUserProfile(userData) {
    const currentUser = this.getCurrentUser();
    const updatedUser = {
      ...currentUser,
      ...userData,
      // On évite d'écraser certaines propriétés sensibles
      id: currentUser.id,
      createdAt: currentUser.createdAt
    };
    
    if (userData.preferences) {
      updatedUser.preferences = {
        ...currentUser.preferences,
        ...userData.preferences
      };
    }
    
    storageService.updateUser(updatedUser);
    return updatedUser;
  },
  
  /**
   * Met à jour l'avatar de l'utilisateur
   * @param {string} avatarUrl - L'URL de l'avatar
   * @returns {Object} L'utilisateur mis à jour
   */
  updateUserAvatar(avatarUrl) {
    return this.updateUserProfile({
      avatar: avatarUrl
    });
  },
  
  /**
   * Récupère les spots favoris de l'utilisateur
   * @returns {Array} Liste des spots favoris
   */
  getUserFavorites() {
    const currentUser = this.getCurrentUser();
    return storageService.getFavoriteSpots(currentUser.id);
  },
  
  /**
   * Vérifie si un spot est dans les favoris de l'utilisateur
   * @param {string} spotId - ID du spot à vérifier
   * @returns {boolean} true si le spot est un favori
   */
  isSpotFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.isSpotFavorite(spotId, currentUser.id);
  },
  
  /**
   * Ajoute un spot aux favoris
   * @param {string} spotId - ID du spot à ajouter aux favoris
   * @returns {boolean} true si l'ajout a réussi
   */
  addFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.addFavorite(spotId, currentUser.id);
  },
  
  /**
   * Retire un spot des favoris
   * @param {string} spotId - ID du spot à retirer des favoris
   * @returns {boolean} true si le retrait a réussi
   */
  removeFavorite(spotId) {
    const currentUser = this.getCurrentUser();
    return storageService.removeFavorite(spotId, currentUser.id);
  },
  
  /**
   * Récupère les captures de l'utilisateur
   * @returns {Array} Liste des captures de l'utilisateur
   */
  getUserCatches() {
    const currentUser = this.getCurrentUser();
    return storageService.getCatches().filter(c => c.createdBy === currentUser.id);
  }
}; 