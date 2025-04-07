import { storageService } from '../services/storageService';
import { createInitialSpots } from './spotData';

export const initializeApp = () => {
  const currentSpots = storageService.getSpots();
  
  // Vérifier si l'application a déjà été initialisée
  if (currentSpots.length === 0) {
    console.log('Initialisation de l\'application avec les spots prédéfinis...');
    
    // Créer et ajouter les spots prédéfinis
    const initialSpots = createInitialSpots();
    
    // Stocker chaque spot individuellement
    initialSpots.forEach(spot => {
      storageService.addSpot(spot);
    });
    
    console.log(`${initialSpots.length} spots de pêche ont été ajoutés avec succès.`);
    return true;
  }
  
  console.log('L\'application a déjà été initialisée.');
  return false;
}; 