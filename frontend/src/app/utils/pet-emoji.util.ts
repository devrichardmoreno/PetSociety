import { PetType } from '../models/enums/pet-type.enum';

/**
 * Utilidad para obtener emojis según el tipo de animal
 * Reutilizable en todos los componentes que necesiten mostrar emojis de mascotas
 */
export class PetEmojiUtil {
  private static emojiMap: { [key in PetType]: string } = {
    [PetType.DOG]: '🐕',
    [PetType.CAT]: '🐱',
    [PetType.BIRD]: '🐦',
    [PetType.RABBIT]: '🐰',
    [PetType.HAMSTER]: '🐹',
    [PetType.FISH]: '🐠',
    [PetType.REPTILE]: '🦎',
    [PetType.CAPYBARA]: '🦫',
    [PetType.TURTLE]: '🐢',
    [PetType.OTHER]: '🐾'
  };

  /**
   * Obtiene el emoji correspondiente al tipo de animal
   * @param petType Tipo de animal
   * @returns Emoji correspondiente o huella por defecto
   */
  static getEmoji(petType: PetType | string | undefined): string {
    if (!petType) {
      return '🐾';
    }
    return this.emojiMap[petType as PetType] || '🐾';
  }
}

