// Email prêt à partir, produit par un template de `mail/application/templates/`.
export interface Mail {
  to: { email: string; name: string };
  subject: string;
  html: string;
  // Contenu en clair (texte), encodé en base64 par l'adaptateur.
  attachments?: { name: string; contentType: string; content: string }[];
}
