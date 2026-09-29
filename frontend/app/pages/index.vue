<script setup lang="ts">
import { eventSchema, type EventDto, type EventInput, type SaveEventDto } from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

useHead({ title: 'Créneaux · Footix' })
const { demo } = useOnboardingTour()

const api = useApi()
const toast = useToast()
const { user } = useAuth()
const canRead = computed(() => !!user.value?.permissions.includes('events.read'))
const canCreate = computed(() => !!user.value?.permissions.includes('planning.create_event'))

const { data: events } = await useAsyncData('events', () => (canRead.value ? api<EventDto[]>('/events') : Promise.resolve([])), { default: () => [] })

const replace = (updated: EventDto) => {
  events.value = events.value.map((e) => (e.id === updated.id ? updated : e))
}

const fields: FormFieldConfig<EventInput>[] = [
  { name: 'title', label: 'Titre', placeholder: 'Foot du jeudi', half: true },
  { name: 'maxParticipants', label: 'Nombre de places', type: 'number', half: true },
  { name: 'startsAt', label: 'Date et heure', type: 'datetime-local', half: true },
  { name: 'durationMinutes', label: 'Durée (minutes)', type: 'number', half: true },
  { name: 'location', label: 'Lieu', placeholder: 'Urban Soccer, 12 rue du Stade', icon: 'i-lucide-map-pin' },
  { name: 'paymentUrl', label: 'Lien de paiement', type: 'url', placeholder: 'https://lydia-app.com/…', icon: 'i-lucide-credit-card', help: 'Facultatif.' },
  { name: 'description', label: 'Infos', type: 'textarea', placeholder: 'Prévoir des chaussures à crampons moulés…', help: 'Facultatif.' },
]

// Le champ datetime-local attend l'heure locale « AAAA-MM-JJTHH:MM », sans fuseau.
const toLocalInput = (iso: string) => {
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

// `id` absent : création ; présent : modification.
const form = ref<{ id?: string, state: EventInput }>()

function openCreate() {
  form.value = { state: { title: '', location: '', startsAt: '', durationMinutes: 60, maxParticipants: 10, paymentUrl: '', description: '' } }
}

function openEdit({ id, participants: _, startsAt, paymentUrl, description, ...rest }: EventDto) {
  form.value = { id, state: { ...rest, startsAt: toLocalInput(startsAt), paymentUrl: paymentUrl ?? '', description: description ?? '' } }
}

async function save(data: SaveEventDto) {
  const id = form.value?.id
  let saved: EventDto
  try {
    saved = await api<EventDto>(id ? `/events/${id}` : '/events', { method: id ? 'PUT' : 'POST', body: data })
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  events.value = [...events.value.filter((e) => e.id !== saved.id), saved].toSorted((a, b) => a.startsAt.localeCompare(b.startsAt))
  form.value = undefined
  toast.add({ title: id ? 'Créneau enregistré' : 'Créneau créé', description: `« ${saved.title} » est visible par tout le monde.`, color: 'success', icon: 'i-lucide-check' })
}

const cancelling = ref<EventDto>()

async function confirmCancel() {
  const target = cancelling.value!
  let updated: EventDto
  try {
    updated = await api<EventDto>(`/events/${target.id}/cancel`, { method: 'POST' })
  } catch (e) {
    toast.add({ title: 'Annulation impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  replace(updated)
  cancelling.value = undefined
  toast.add({ title: 'Créneau annulé', description: `« ${target.title} » reste affiché comme annulé, ceux qui venaient sont prévenus.`, color: 'success', icon: 'i-lucide-check' })
}

const deleting = ref<EventDto>()

async function confirmDelete() {
  const target = deleting.value!
  try {
    await api(`/events/${target.id}`, { method: 'DELETE' })
  } catch (e) {
    toast.add({ title: 'Suppression impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  events.value = events.value.filter((e) => e.id !== target.id)
  deleting.value = undefined
  toast.add({ title: 'Créneau supprimé', description: `« ${target.title} » n'apparaît plus.`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">
          Salut {{ user?.firstName }}
        </h1>
        <p class="text-muted mt-3">Choisis tes prochains matchs et réserve ta place.</p>
      </div>
      <UButton v-if="canCreate" icon="i-lucide-plus" size="lg" class="font-semibold" @click="openCreate">Créer un créneau</UButton>
    </div>

    <div v-if="events.length || demo" class="mt-10 grid gap-6 md:grid-cols-2">
      <EventCard v-if="demo" :event="demo" />
      <EventCard
        v-for="event in events"
        :key="event.id"
        :event="event"
        @updated="replace"
        @edit="openEdit(event)"
        @cancel="cancelling = event"
        @delete="deleting = event"
      />
    </div>
    <UEmpty
      v-else
      icon="i-lucide-calendar-days"
      title="Aucun créneau pour l'instant"
      :description="canCreate ? 'Crée le premier créneau, tout le monde pourra s’y inscrire.' : 'Dès qu’un créneau est proposé, tu pourras réserver ta place ici.'"
      class="mt-10"
    />

    <UModal
      :open="!!form"
      :title="form?.id ? 'Modifier le créneau' : 'Créer un créneau'"
      description="Date, durée, lieu et nombre de places, le lien de paiement est facultatif."
      @update:open="(open) => !open && (form = undefined)"
    >
      <template #body>
        <FormBuilder
          v-if="form"
          v-model:state="form.state"
          :schema="eventSchema"
          :fields="fields"
          :submit="save"
          :submit-label="form.id ? 'Enregistrer le créneau' : 'Créer le créneau'"
        />
      </template>
    </UModal>

    <UModal
      :open="!!cancelling"
      title="Annuler le créneau ?"
      :description="`« ${cancelling?.title} » restera affiché comme annulé, le sondage sera fermé et ceux qui venaient seront prévenus par email. Impossible de revenir en arrière.`"
      @update:open="(open) => !open && (cancelling = undefined)"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="cancelling = undefined">Garder le créneau</UButton>
          <UButton color="error" icon="i-lucide-ban" loading-auto @click="confirmCancel">Annuler le créneau</UButton>
        </div>
      </template>
    </UModal>

    <UModal
      :open="!!deleting"
      title="Supprimer le créneau ?"
      :description="`« ${deleting?.title} » et les réponses au sondage seront supprimés${deleting?.cancelledAt ? '' : ', ceux qui venaient seront prévenus par email'}.`"
      @update:open="(open) => !open && (deleting = undefined)"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="deleting = undefined">Garder le créneau</UButton>
          <UButton color="error" icon="i-lucide-trash-2" loading-auto @click="confirmDelete">Supprimer le créneau</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
