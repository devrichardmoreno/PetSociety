export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  FISH = 'FISH',
  REPTILE = 'REPTILE',
  CAPYBARA = 'CAPYBARA',
  TURTLE = 'TURTLE',
  OTHER = 'OTHER'
}

export const PetTypeLabels: { [key in PetType]: string } = {
  [PetType.DOG]: 'Perro',
  [PetType.CAT]: 'Gato',
  [PetType.BIRD]: 'Ave',
  [PetType.RABBIT]: 'Conejo',
  [PetType.HAMSTER]: 'Hámster',
  [PetType.FISH]: 'Pez',
  [PetType.REPTILE]: 'Reptil',
  [PetType.CAPYBARA]: 'Capibara',
  [PetType.TURTLE]: 'Tortuga',
  [PetType.OTHER]: 'Otro'
};

