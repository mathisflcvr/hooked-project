// Service de géocodage utilisant Nominatim (OpenStreetMap)
export const geocodingService = {
  // Convertir une adresse en coordonnées lat/lng
  async geocodeAddress(address) {
    try {
      // Encoder l'adresse pour l'URL
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des coordonnées');
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        return null; // Aucun résultat trouvé
      }
      
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return null;
    }
  },
  
  // Convertir des coordonnées en adresse (géocodage inverse)
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'adresse');
      }
      
      const data = await response.json();
      
      return {
        displayName: data.display_name,
        address: data.address
      };
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return null;
    }
  }
}; 