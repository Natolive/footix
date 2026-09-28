<script setup lang="ts">
import { emailDomainSchema, type EmailDomainDto, type SaveEmailDomainDto } from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

definePageMeta({ permission: 'email_domains.read' })
useHead({ title: 'Domaines · Footix' })

const api = useApi()
const toast = useToast()
const { user } = useAuth()
const canCreate = computed(() => !!user.value?.permissions.includes('email_domains.create'))
const canDelete = computed(() => !!user.value?.permissions.includes('email_domains.delete'))

const { data: domains } = await useAsyncData('email-domains', () => api<EmailDomainDto[]>('/email-domains'), { default: () => [] })

const state = ref<SaveEmailDomainDto>({ domain: '' })
const fields: FormFieldConfig<SaveEmailDomainDto>[] = [
  { name: 'domain', label: 'Domaine', placeholder: 'solem.fr', icon: 'i-lucide-at-sign', help: 'Sans @ : tout le domaine est autorisé, pas ses sous-domaines.' },
]

const error = (title: string, e: unknown) =>
  toast.add({ title, description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })

async function allow(data: SaveEmailDomainDto) {
  let created: EmailDomainDto
  try {
    created = await api<EmailDomainDto>('/email-domains', { method: 'POST', body: data })
  } catch (e) {
    return error('Autorisation impossible', e)
  }
  domains.value = [...domains.value, created].sort((a, b) => a.domain.localeCompare(b.domain))
  state.value = { domain: '' }
  toast.add({ title: 'Domaine autorisé', description: `Les adresses @${created.domain} peuvent créer un compte.`, color: 'success', icon: 'i-lucide-check' })
}

async function remove(d: EmailDomainDto) {
  try {
    await api(`/email-domains/${d.id}`, { method: 'DELETE' })
  } catch (e) {
    return error('Retrait impossible', e)
  }
  domains.value = domains.value.filter((x) => x.id !== d.id)
  toast.add({ title: 'Domaine retiré', description: `Les adresses @${d.domain} ne peuvent plus créer de compte.`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Domaines</h1>
    <p class="text-muted mt-3">Seules les adresses de ces domaines peuvent créer un compte. Les comptes existants ne changent pas.</p>

    <div class="mt-10 grid items-start gap-6 md:grid-cols-[1fr_22rem]">
      <UCard>
        <template #header>
          <h2 class="font-display text-highlighted text-lg font-bold tracking-tight">Autorisés</h2>
        </template>
        <ul v-if="domains.length" class="divide-default divide-y">
          <li v-for="d in domains" :key="d.id" class="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <span class="text-highlighted font-medium break-all">@{{ d.domain }}</span>
            <UButton
              v-if="canDelete"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              loading-auto
              :aria-label="`Retirer @${d.domain}`"
              @click="remove(d)"
            />
          </li>
        </ul>
        <p v-else class="text-muted">Aucun domaine : personne ne peut créer de compte.</p>
      </UCard>

      <UCard v-if="canCreate">
        <template #header>
          <h2 class="font-display text-highlighted text-lg font-bold tracking-tight">Ajouter</h2>
        </template>
        <FormBuilder v-model:state="state" :schema="emailDomainSchema" :fields="fields" :submit="allow" submit-label="Autoriser le domaine" />
      </UCard>
    </div>
  </div>
</template>
