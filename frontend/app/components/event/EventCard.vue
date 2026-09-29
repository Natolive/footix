<script setup lang="ts">
import { addGuestSchema, type AddGuestDto, type EventDto, type GuestDto, type Permission } from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

// Un créneau : infos, places restantes, réponses au sondage, et les boutons pour répondre.
const props = defineProps<{ event: EventDto }>()
const emit = defineEmits<{ updated: [event: EventDto], edit: [], cancel: [], delete: [] }>()

const api = useApi()
const toast = useToast()
const { user } = useAuth()
const can = (p: Permission) => !!user.value?.permissions.includes(p)

// « jeudi 1 octobre, 18:00 – 19:30 »
const when = computed(() => {
  const start = new Date(props.event.startsAt)
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
    .formatRange(start, new Date(start.getTime() + props.event.durationMinutes * 60_000))
})
// Invités et inscrits se partagent les places.
const taken = computed(() => props.event.participants.length + props.event.guests.length)
const coming = computed(() => props.event.participants.some((p) => p.id === user.value?.id))
const declined = computed(() => props.event.declined.some((p) => p.id === user.value?.id))
const full = computed(() => taken.value >= props.event.maxParticipants)
// Annulé : reste affiché pour que personne ne vienne, mais plus rien ne se modifie (même règle que l'API).
const cancelled = computed(() => !!props.event.cancelledAt)
// Rebond de « Je viens » seulement au clic, pas au chargement de la page.
const kicked = ref(false)

// Même règle que l'API : ses propres invités, ou tous avec le droit de modifier les créneaux.
const removable = (g: GuestDto) => !cancelled.value && (g.invitedBy.id === user.value?.id || can('planning.update_event'))
const guestFields: FormFieldConfig<AddGuestDto>[] = [{ name: 'name', label: 'Nom', placeholder: 'Paul' }]
const guest = ref<AddGuestDto>()

async function addGuest(data: AddGuestDto) {
  let updated: EventDto
  try {
    updated = await api<EventDto>(`/events/${props.event.id}/guests`, { method: 'POST', body: data })
  } catch (e) {
    toast.add({ title: 'Ajout impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('updated', updated)
  guest.value = undefined
  toast.add({ title: 'Invité ajouté', description: `${data.name} a sa place pour « ${updated.title} ».`, color: 'success', icon: 'i-lucide-check' })
}

async function removeGuest(g: GuestDto) {
  let updated: EventDto
  try {
    updated = await api<EventDto>(`/events/${props.event.id}/guests/${g.id}`, { method: 'DELETE' })
  } catch (e) {
    toast.add({ title: 'Retrait impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  emit('updated', updated)
  toast.add({ title: 'Invité retiré', description: `${g.name} libère sa place.`, color: 'success', icon: 'i-lucide-check' })
}

// Même réponse qu'avant : rien à enregistrer, pas de toast à chaque clic.
async function answer(attending: boolean) {
  if (attending ? coming.value : declined.value) return true
  let updated: EventDto
  try {
    updated = await api<EventDto>(`/events/${props.event.id}/participation`, { method: 'PUT', body: { attending } })
  } catch (e) {
    toast.add({ title: 'Réponse impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return false
  }
  emit('updated', updated)
  kicked.value = attending
  toast.add({
    title: attending ? 'Tu viens, c’est noté' : 'Tu ne viens pas, c’est noté',
    description: attending ? `Rendez-vous ${when.value}, ${updated.location}.` : `Ta réponse à « ${updated.title} » est enregistrée.`,
    color: 'success',
    icon: 'i-lucide-check',
  })
  return true
}

// Se désinscrire libère la place (et celles de ses invités) : on demande d'abord.
const leaving = ref(false)
const myGuests = computed(() => props.event.guests.filter((g) => g.invitedBy.id === user.value?.id))

async function confirmLeave() {
  if (await answer(false)) leaving.value = false
}
</script>

<template>
  <UCard data-tour="event" :class="{ 'opacity-60': cancelled }" :ui="{ root: 'row-span-6 grid grid-rows-subgrid gap-y-0 p-4 sm:p-6', body: 'contents' }">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span class="first-letter:uppercase" :class="cancelled ? 'text-muted line-through' : 'text-primary'">{{ when }}</span>
          <UBadge v-if="cancelled" color="error" variant="subtle" icon="i-lucide-ban">Annulé</UBadge>
        </p>
        <h2 class="font-display text-highlighted mt-1.5 text-2xl font-bold tracking-tight leading-tight break-words">{{ event.title }}</h2>
        <p class="text-muted mt-2 flex items-center gap-1.5 text-sm">
          <UIcon name="i-lucide-map-pin" class="shrink-0" />{{ event.location }}
        </p>
      </div>
      <div class="flex shrink-0">
        <UButton v-if="!cancelled && can('planning.update_event')" icon="i-lucide-pencil" color="neutral" variant="ghost" :aria-label="`Modifier ${event.title}`" @click="emit('edit')" />
        <UButton v-if="!cancelled && can('planning.cancel_event')" icon="i-lucide-ban" color="error" variant="ghost" :aria-label="`Annuler ${event.title}`" @click="emit('cancel')" />
        <UButton v-if="can('planning.delete_event')" icon="i-lucide-trash-2" color="error" variant="ghost" :aria-label="`Supprimer ${event.title}`" @click="emit('delete')" />
      </div>
    </div>

    <p class="text-default whitespace-pre-line text-sm" :class="{ 'pt-5': event.description }">{{ event.description }}</p>

    <div class="pt-5">
      <div class="mb-2 flex justify-between text-sm">
        <span class="text-highlighted font-medium">{{ taken }} / {{ event.maxParticipants }} viennent</span>
        <UBadge v-if="full" color="error" variant="subtle">Complet</UBadge>
        <span v-else class="text-muted">{{ event.maxParticipants - taken }} place{{ event.maxParticipants - taken > 1 ? 's' : '' }} libre{{ event.maxParticipants - taken > 1 ? 's' : '' }}</span>
      </div>
      <UProgress :model-value="taken" :max="event.maxParticipants" :color="full ? 'error' : 'primary'" size="sm" />
    </div>

    <div v-if="taken" class="flex flex-wrap content-start gap-1.5 pt-5">
      <UBadge
        v-for="p in event.participants"
        :key="p.id"
        :color="p.id === user?.id ? 'primary' : 'neutral'"
        variant="subtle"
      >
        {{ p.firstName }} {{ p.lastName }}
      </UBadge>
      <UBadge
        v-for="g in event.guests"
        :key="g.id"
        :color="g.invitedBy.id === user?.id ? 'primary' : 'neutral'"
        variant="outline"
      >
        {{ g.name }} <span class="text-dimmed">· invité de {{ g.invitedBy.firstName }}</span>
        <UButton
          v-if="removable(g)"
          icon="i-lucide-x"
          color="neutral"
          variant="link"
          size="xs"
          class="-my-1 -mr-1 p-0"
          :aria-label="`Retirer ${g.name}`"
          loading-auto
          @click="removeGuest(g)"
        />
      </UBadge>
    </div>
    <p v-else class="text-dimmed pt-5 text-sm">Personne pour l'instant, lance-toi.</p>

    <p class="text-muted text-sm" :class="{ 'pt-3': event.declined.length }">
      <template v-if="event.declined.length">
        <span class="font-medium">Ne viennent pas :</span>
        {{ event.declined.map((p) => `${p.firstName} ${p.lastName}`).join(', ') }}
      </template>
    </p>

    <p v-if="cancelled" class="text-error self-end pt-5 text-sm font-medium">Match annulé par les organisateurs, il n’aura pas lieu.</p>
    <div v-else class="space-y-2 self-end pt-5">
      <UButton
        v-if="event.paymentUrl"
        :to="event.paymentUrl"
        data-tour="pay"
        target="_blank"
        rel="noopener noreferrer"
        color="neutral"
        variant="soft"
        icon="i-lucide-credit-card"
        trailing-icon="i-lucide-external-link"
        size="lg"
        block
      >
        Payer ma place
      </UButton>
      <div v-if="can('events.participate')" data-tour="answer" class="grid grid-cols-2 gap-2">
        <UButton
          :variant="coming ? 'solid' : 'outline'"
          :icon="coming ? 'i-lucide-circle-check' : 'i-lucide-user-plus'"
          :disabled="!coming && full"
          :aria-pressed="coming"
          size="lg"
          loading-auto
          class="justify-center font-semibold"
          :class="{ kick: kicked }"
          @click="answer(true)"
          @animationend="kicked = false"
        >
          Je viens
        </UButton>
        <UButton
          color="neutral"
          :variant="declined ? 'solid' : 'outline'"
          :icon="declined ? 'i-lucide-circle-x' : 'i-lucide-user-x'"
          :aria-pressed="declined"
          size="lg"
          loading-auto
          class="justify-center font-semibold"
          @click="coming ? (leaving = true) : answer(false)"
        >
          Je ne viens pas
        </UButton>
      </div>
      <UButton
        v-if="coming && can('events.invite_guest')"
        color="neutral"
        variant="ghost"
        icon="i-lucide-user-round-plus"
        :disabled="full"
        block
        @click="guest = { name: '' }"
      >
        Ramener quelqu’un
      </UButton>
    </div>

    <UModal
      :open="!!guest"
      title="Ramener quelqu’un"
      description="Ton invité n’a pas besoin de compte, il prend une place. Il part si tu ne viens plus."
      @update:open="(open) => !open && (guest = undefined)"
    >
      <template #body>
        <FormBuilder
          v-if="guest"
          v-model:state="guest"
          :schema="addGuestSchema"
          :fields="guestFields"
          :submit="addGuest"
          submit-label="Ajouter l’invité"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="leaving"
      title="Tu ne viens plus ?"
      :description="myGuests.length
        ? `Ta place et celles de tes invités (${myGuests.map((g) => g.name).join(', ')}) seront libérées pour « ${event.title} ».`
        : `Ta place pour « ${event.title} » sera libérée, quelqu’un d’autre pourra la prendre.`"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="leaving = false">Rester inscrit</UButton>
          <UButton color="error" icon="i-lucide-user-x" loading-auto @click="confirmLeave">Me désinscrire</UButton>
        </div>
      </template>
    </UModal>
  </UCard>
</template>

<style scoped>
.kick {
  animation: kick .5s ease-out;
}
/* Appui, rebond, retour en place. */
@keyframes kick {
  0% { transform: scale(.92); }
  45% { transform: scale(1.06); }
  75% { transform: scale(.98); }
  100% { transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .kick { animation: none; }
}
</style>
