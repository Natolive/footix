<script setup lang="ts">
import { ROLE_LABELS, updateRoleSchema, type RoleDto, type UpdateRoleDto } from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

definePageMeta({ permission: 'roles.read' })
useHead({ title: 'Droits · Footix' })

const api = useApi()
const toast = useToast()
const { user, fetchUser } = useAuth()
const canUpdate = computed(() => !!user.value?.permissions.includes('roles.update'))

const fieldsFor = (role: RoleDto): FormFieldConfig<UpdateRoleDto>[] => [
  { name: 'permissions', label: '', type: 'checkbox-group', groups: permissionGroups, disabled: !role.editable || !canUpdate.value },
]

const { data: roles } = await useAsyncData('roles', () => api<RoleDto[]>('/roles'), { default: () => [] })

async function save(role: RoleDto, data: UpdateRoleDto) {
  try {
    await api(`/roles/${role.role}`, { method: 'PUT', body: data })
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  // Les droits de la personne connectée ont pu changer (lien « Droits » du menu).
  await fetchUser()
  toast.add({ title: 'Droits enregistrés', description: `Rôle ${ROLE_LABELS[role.role]} mis à jour.`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Droits</h1>
    <p class="text-muted mt-3">Choisis ce que chaque rôle peut faire.</p>

    <div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      <UCard v-for="role in roles" :key="role.role">
        <template #header>
          <h2 class="font-display text-highlighted text-lg font-bold tracking-tight">{{ ROLE_LABELS[role.role] }}</h2>
          <p v-if="!role.editable" class="text-muted mt-1 text-sm">À toujours tous les droits.</p>
        </template>
        <FormBuilder
          :state="role"
          :schema="updateRoleSchema"
          :fields="fieldsFor(role)"
          :submit="(data) => save(role, data)"
          :readonly="!role.editable || !canUpdate"
          submit-label="Enregistrer les droits"
        />
      </UCard>
    </div>
  </div>
</template>
