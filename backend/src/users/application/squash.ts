// Sans accents, majuscules ni ponctuation : « Hélène » = « helene », « O'Neil » = « oneil », « Jean-Pierre » = « jeanpierre ».
// Même règle en SQL dans DrizzleUserRepository.
export const squash = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}@.]/gu, '');
