import { storageService } from '../services/storageService';
import { createInitialSpots } from './spotData';

export const initializeApp = () => {
  console.log('Début de l\'initialisation de l\'application');
  
  try {
    // Vérifier si l'application a déjà été initialisée
    const currentSpots = storageService.getSpots();
    console.log(`Spots existants trouvés: ${currentSpots.length}`);
    
    if (currentSpots.length === 0) {
      console.log('Aucun spot trouvé, initialisation des spots prédéfinis...');
      
      // Créer les spots prédéfinis
      const initialSpots = createInitialSpots();
      console.log(`Nombre de spots à ajouter: ${initialSpots.length}`);
      
      // Stocker chaque spot individuellement
      initialSpots.forEach((spot, index) => {
        console.log(`Ajout du spot ${index + 1}/${initialSpots.length}: ${spot.name}`);
        storageService.addSpot(spot);
      });
      
      // Vérifier que les spots ont bien été ajoutés
      const spotsAfterInit = storageService.getSpots();
      console.log(`Spots après initialisation: ${spotsAfterInit.length}`);
      
      if (spotsAfterInit.length > 0) {
        console.log('Initialisation réussie!');
        return true;
      } else {
        console.error('Échec de l\'initialisation: aucun spot n\'a été ajouté');
        return false;
      }
    }
    
    console.log('L\'application a déjà été initialisée, aucune action nécessaire');
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return false;
  }
}; 