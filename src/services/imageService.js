// Service pour gérer les images localement
export const imageService = {
  // Convertir un fichier en base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },
  
  // Valider un fichier image
  validateImage(file) {
    // Vérifier le type de fichier
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    
    // Vérifier la taille (max 50MB)
    const isLt50M = file.size / 1024 / 1024 < 50;
    
    return {
      isValid: isJpgOrPng && isLt50M,
      errors: [
        !isJpgOrPng ? 'Seuls les fichiers JPG/PNG sont autorisés' : null,
        !isLt50M ? 'L\'image doit être inférieure à 50MB' : null
      ].filter(Boolean)
    };
  },
  
  // Simuler un upload d'image pour obtenir une URL (en utilisant base64)
  async uploadImage(file) {
    try {
      const validation = this.validateImage(file);
      
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Convertir en base64 pour simuler une URL d'image
      const base64 = await this.fileToBase64(file);
      
      return {
        url: base64,
        success: true
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload d\'image:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}; 