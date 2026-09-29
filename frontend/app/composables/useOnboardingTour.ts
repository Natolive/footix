import type { EventDto } from '@footix/shared'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

// Visite guidée affichée une seule fois par compte, sur les vrais éléments de la page des créneaux.
// Créneau d'exemple affiché le temps de la visite, pour avoir quelque chose à montrer même sans vrai créneau.
const demoEvent = (): EventDto => ({
  id: 'demo',
  title: 'Foot du jeudi',
  description: 'Chasubles fournies, prévois des chaussures à crampons moulés.',
  location: 'Urban Soccer, 12 rue du Stade',
  startsAt: new Date(Date.now() + 3 * 24 * 3_600_000).toISOString(),
  durationMinutes: 60,
  maxParticipants: 10,
  paymentUrl: 'https://lydia-app.com/',
  cancelledAt: null,
  participants: [
    { id: 'demo-1', firstName: 'Camille', lastName: 'Martin' },
    { id: 'demo-2', firstName: 'Hugo', lastName: 'Bernard' },
    { id: 'demo-3', firstName: 'Inès', lastName: 'Petit' },
  ],
  declined: [{ id: 'demo-4', firstName: 'Lucas', lastName: 'Robert' }],
  guests: [{ id: 'demo-5', name: 'Paul', invitedBy: { id: 'demo-2', firstName: 'Hugo', lastName: 'Bernard' } }],
})

export const useOnboardingTour = () => {
  const { user } = useAuth()
  const api = useApi()
  const toast = useToast()
  const demo = ref<EventDto>()

  onMounted(async () => {
    if (!user.value || user.value.onboarded) return
    // Marquée dès l'affichage : elle ne revient pas, même si elle est fermée avant la fin.
    try {
      await api('/auth/me/onboarding', { method: 'POST' })
    } catch (e) {
      toast.add({ title: 'Visite guidée indisponible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
      return
    }
    user.value.onboarded = true
    demo.value = demoEvent()
    await nextTick()
    driver({
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: 'C’est parti',
      popoverClass: 'footix-tour',
      // Le créneau d'exemple n'est pas cliquable : ses boutons appelleraient l'API.
      disableActiveInteraction: true,
      onDestroyed: () => (demo.value = undefined),
      animate: !matchMedia('(prefers-reduced-motion: reduce)').matches,
      steps: [
        { popover: { title: 'Bienvenue sur Footix', description: 'On te montre en trente secondes comment réserver ta place.' } },
        { element: '[data-tour="event"]', popover: { title: 'Les créneaux', description: 'Chaque match proposé s’affiche ici : date, lieu et places libres.' } },
        { element: '[data-tour="answer"]', popover: { title: 'Réponds au sondage', description: '« Je viens » réserve ta place, « Je ne viens pas » prévient les autres. Tu peux changer d’avis à tout moment.' } },
        { element: '[data-tour="pay"]', popover: { title: 'Paie ta place', description: 'Si le créneau a un lien de paiement, règle ta part avant le match.' } },
        { element: '[data-tour="account"]', popover: { title: 'Donne tes dispos', description: 'Dans « Mon profil », coche les jours où tu peux jouer : les organisateurs s’en servent pour choisir les créneaux.' } },
      ],
    }).drive()
  })

  return { demo }
}
