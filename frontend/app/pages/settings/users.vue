<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import {
  PERMISSION_LABELS,
  ROLE_LABELS,
  ROLES,
  updateUserPermissionsSchema,
  updateUserRoleSchema,
  updateUserSchema,
  USER_PAGE_SIZES,
  type FindUsersQuery,
  type ManagedUserDto,
  type Permission,
  type Role,
  type UpdateUserDto,
  type UpdateUserPermissionsDto,
  type UpdateUserRoleDto,
  type UserPageDto,
  type UserSort,
} from '@footix/shared'
import type { FormFieldConfig } from '~/types/form'

definePageMeta({ permission: 'users.read' })
useHead({ title: 'Utilisateurs · Footix' })

const api = useApi()
const toast = useToast()
const { user: me, fetchUser } = useAuth()
const can = (p: Permission) => !!me.value?.permissions.includes(p)
const isSuperAdmin = computed(() => me.value?.role === 'super_admin')

// En-tête cliquable : croissant, décroissant, puis ordre par défaut (nom).
const UButton = resolveComponent('UButton')
const sortable = (label: string): TableColumn<ManagedUserDto>['header'] => ({ column }) => {
  const dir = column.getIsSorted()
  return h(UButton, {
    label,
    color: 'neutral',
    variant: 'ghost',
    class: '-mx-2.5',
    icon: dir === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : dir === 'desc' ? 'i-lucide-arrow-down-wide-narrow' : 'i-lucide-arrow-up-down',
    onClick: () => column.toggleSorting(dir === 'asc'),
  })
}

// Colonne secondaire masquée sur petit écran (l'email passe alors sous le nom).
// Classes écrites en entier : Tailwind ne génère pas une classe construite par interpolation.
const shown = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }
const from = (bp: keyof typeof shown) => ({ class: { th: shown[bp], td: shown[bp] } })
const columns: TableColumn<ManagedUserDto>[] = [
  { id: 'name', header: sortable('Nom'), enableHiding: false },
  { accessorKey: 'email', header: sortable('Email'), meta: from('sm') },
  { accessorKey: 'emailVerified', header: sortable('Email confirmé'), meta: from('md') },
  { accessorKey: 'role', header: sortable('Rôle') },
  { accessorKey: 'extraPermissions', header: sortable('Droits en plus'), meta: from('lg') },
  { accessorKey: 'createdAt', header: sortable('Inscrit le'), meta: from('md') },
  { id: 'actions', enableHiding: false },
]
const columnLabels: Record<string, string> = {
  email: 'Email',
  emailVerified: 'Email confirmé',
  role: 'Rôle',
  extraPermissions: 'Droits en plus',
  createdAt: 'Inscrit le',
}
const columnVisibility = ref<Record<string, boolean>>({})
const columnItems = computed(() =>
  Object.entries(columnLabels).map(([id, label]) => ({
    type: 'checkbox' as const,
    label,
    checked: columnVisibility.value[id] !== false,
    onUpdateChecked: (checked: boolean) => (columnVisibility.value = { ...columnVisibility.value, [id]: checked }),
    onSelect: (e: Event) => e.preventDefault(),
  })),
)

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

// Filtres
const search = ref('')
const roleFilter = ref<Role[]>([])
const statusFilter = ref<'all' | 'verified' | 'pending'>('all')
const extraFilter = ref<'all' | 'with' | 'without'>('all')
const roleItems = ROLES.map((value) => ({ value, label: ROLE_LABELS[value] }))
const statusItems = [
  { value: 'all', label: 'Tous les emails' },
  { value: 'verified', label: 'Email confirmé' },
  { value: 'pending', label: 'Email en attente' },
]
const extraItems = [
  { value: 'all', label: 'Tous les droits' },
  { value: 'with', label: 'Avec droits en plus' },
  { value: 'without', label: 'Sans droit en plus' },
]

const filtering = computed(
  () => !!search.value.trim() || !!roleFilter.value.length || statusFilter.value !== 'all' || extraFilter.value !== 'all',
)
function resetFilters() {
  search.value = ''
  roleFilter.value = []
  statusFilter.value = 'all'
  extraFilter.value = 'all'
}

// Recherche envoyée une fois la frappe finie, pas à chaque lettre.
const q = ref('')
let typing: ReturnType<typeof setTimeout> | undefined
watch(search, (value) => {
  clearTimeout(typing)
  typing = setTimeout(() => (q.value = value), 300)
})

// Le tableau ne fait qu'afficher l'état du tri (`manualSorting`) : recherche, filtres, tri et page se font côté API.
const sorting = ref<{ id: string; desc: boolean }[]>([])
const pageSize = ref<(typeof USER_PAGE_SIZES)[number]>(25)
const page = ref(1)
watch([q, roleFilter, statusFilter, extraFilter, sorting, pageSize], () => (page.value = 1), { deep: true })

const query = computed<Partial<FindUsersQuery>>(() => ({
  q: q.value,
  roles: roleFilter.value,
  emailVerified: statusFilter.value,
  extraPermissions: extraFilter.value,
  sort: sorting.value[0]?.id as UserSort | undefined,
  desc: sorting.value[0]?.desc,
  page: page.value,
  pageSize: pageSize.value,
}))
const { data: users, status, refresh } = await useAsyncData('users', () => api<UserPageDto>('/users', { query: query.value }), {
  watch: [query],
  default: () => ({ items: [], total: 0, overall: 0, page: 1 }),
})
const range = computed(() => {
  if (!users.value.items.length) return '0'
  const from = (users.value.page - 1) * pageSize.value + 1
  return `${from}–${from + users.value.items.length - 1}`
})

// Mêmes règles que l'API : seul un super admin touche à un super admin, et son propre accès ne se modifie pas.
const manageable = (u: ManagedUserDto) => isSuperAdmin.value || u.role !== 'super_admin'
const sections = (u: ManagedUserDto) => ({
  profile: manageable(u) && can('users.update'),
  role: manageable(u) && u.id !== me.value?.id && can('users.update_role'),
  permissions: manageable(u) && u.id !== me.value?.id && can('users.update_permissions'),
})
const canEdit = (u: ManagedUserDto) => Object.values(sections(u)).some(Boolean)
const canDelete = (u: ManagedUserDto) => manageable(u) && u.id !== me.value?.id && can('users.delete')

const profileFields: FormFieldConfig<UpdateUserDto>[] = [
  { name: 'lastName', label: 'Nom', half: true },
  { name: 'firstName', label: 'Prénom', half: true },
  { name: 'email', label: 'Email', type: 'email', icon: 'i-lucide-mail' },
]
const roleFields: FormFieldConfig<UpdateUserRoleDto>[] = [
  {
    name: 'role',
    label: 'Rôle',
    type: 'select',
    options: ROLES.filter((r) => isSuperAdmin.value || r !== 'super_admin').map((value) => ({ value, label: ROLE_LABELS[value] })),
  },
]
const permissionFields: FormFieldConfig<UpdateUserPermissionsDto>[] = [
  {
    name: 'extraPermissions',
    label: 'Droits en plus du rôle',
    type: 'checkbox-group',
    groups: permissionGroups,
    help: 'Les droits du rôle restent acquis, coche seulement ce qui s’ajoute.',
  },
]

const editing = ref<ManagedUserDto>()
const profile = ref<UpdateUserDto>({ lastName: '', firstName: '', email: '' })
const role = ref<UpdateUserRoleDto>({ role: 'user' })
const permissions = ref<UpdateUserPermissionsDto>({ extraPermissions: [] })

function edit(u: ManagedUserDto) {
  editing.value = u
  profile.value = { lastName: u.lastName, firstName: u.firstName, email: u.email }
  role.value = { role: u.role }
  permissions.value = { extraPermissions: [...u.extraPermissions] }
}

// Chaque partie s'enregistre seule, derrière son propre droit.
async function save(path: string, method: 'PATCH' | 'PUT', body: object, title: string) {
  const target = editing.value!
  let updated: ManagedUserDto
  try {
    updated = await api<ManagedUserDto>(`/users/${target.id}${path}`, { method, body })
  } catch (e) {
    toast.add({ title: 'Enregistrement impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  editing.value = updated
  await refresh()
  if (updated.id === me.value?.id) await fetchUser()
  toast.add({ title, description: `${updated.firstName} ${updated.lastName} est à jour.`, color: 'success', icon: 'i-lucide-check' })
}

const deleting = ref<ManagedUserDto>()

async function confirmDelete() {
  const target = deleting.value!
  try {
    await api(`/users/${target.id}`, { method: 'DELETE' })
  } catch (e) {
    toast.add({ title: 'Suppression impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  deleting.value = undefined
  await refresh()
  toast.add({ title: 'Utilisateur supprimé', description: `${target.firstName} ${target.lastName} n’a plus de compte.`, color: 'success', icon: 'i-lucide-check' })
}
</script>

<template>
  <div>
    <h1 class="font-display text-highlighted text-4xl font-bold tracking-tight leading-[1.05] sm:text-5xl">Utilisateurs</h1>
    <p class="text-muted mt-3">Modifie une personne, change son rôle ou ajoute-lui des droits.</p>

    <div class="mt-10 grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        placeholder="Nom, email, rôle, droit…"
        aria-label="Rechercher un utilisateur"
        class="col-span-2 lg:w-72"
      >
        <template v-if="search" #trailing>
          <UButton color="neutral" variant="link" size="sm" icon="i-lucide-x" aria-label="Effacer la recherche" @click="search = ''" />
        </template>
      </UInput>
      <USelect v-model="roleFilter" :items="roleItems" multiple placeholder="Tous les rôles" aria-label="Filtrer par rôle" class="lg:w-44" />
      <USelect v-model="statusFilter" :items="statusItems" aria-label="Filtrer par email" class="lg:w-44" />
      <USelect v-model="extraFilter" :items="extraItems" aria-label="Filtrer par droits en plus" class="col-span-2 sm:col-span-1 lg:w-48" />
      <UButton v-if="filtering" color="neutral" variant="ghost" icon="i-lucide-x" class="col-span-2 justify-center sm:col-span-1" @click="resetFilters">Effacer les filtres</UButton>
      <UDropdownMenu :items="columnItems" :content="{ align: 'end' }">
        <UButton color="neutral" variant="outline" icon="i-lucide-columns-3" trailing-icon="i-lucide-chevron-down" class="hidden md:flex lg:ml-auto">
          Colonnes
        </UButton>
      </UDropdownMenu>
    </div>

    <UTable
      v-model:sorting="sorting"
      v-model:column-visibility="columnVisibility"
      :sorting-options="{ manualSorting: true }"
      :data="users.items"
      :columns="columns"
      :loading="status === 'pending'"
      :empty="filtering ? 'Personne ne correspond à ces filtres.' : 'Aucun utilisateur.'"
      class="bg-default border-default mt-4 rounded-lg border"
    >
      <template #name-cell="{ row }">
        <span class="text-highlighted font-medium">{{ row.original.firstName }} {{ row.original.lastName }}</span>
        <span class="text-muted block text-sm break-all sm:hidden">{{ row.original.email }}</span>
      </template>
      <template #emailVerified-cell="{ row }">
        <UBadge v-if="row.original.emailVerified" color="success" variant="subtle" icon="i-lucide-check">Confirmé</UBadge>
        <UBadge v-else color="warning" variant="subtle" icon="i-lucide-clock">En attente</UBadge>
      </template>
      <template #role-cell="{ row }">
        <UBadge :color="row.original.role === 'super_admin' ? 'primary' : 'neutral'" variant="subtle">
          {{ ROLE_LABELS[row.original.role] }}
        </UBadge>
      </template>
      <template #createdAt-cell="{ row }">
        <span class="text-muted whitespace-nowrap">{{ formatDate(row.original.createdAt) }}</span>
      </template>
      <template #extraPermissions-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge v-for="p in row.original.extraPermissions" :key="p" color="neutral" variant="outline">
            {{ PERMISSION_LABELS[p] }}
          </UBadge>
          <span v-if="!row.original.extraPermissions.length" class="text-muted">Aucun</span>
        </div>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton
            v-if="canEdit(row.original)"
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            :aria-label="`Modifier ${row.original.firstName} ${row.original.lastName}`"
            @click="edit(row.original)"
          />
          <UButton
            v-if="canDelete(row.original)"
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            :aria-label="`Supprimer ${row.original.firstName} ${row.original.lastName}`"
            @click="deleting = row.original"
          />
        </div>
      </template>
    </UTable>

    <div class="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      <p class="text-muted text-sm">
        {{ range }} sur {{ users.total }} utilisateur{{ users.total > 1 ? 's' : '' }}
        <template v-if="filtering"> ({{ users.overall }} au total)</template>
      </p>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <USelect
          v-model="pageSize"
          :items="USER_PAGE_SIZES.map((value) => ({ value, label: `${value} par page` }))"
          aria-label="Lignes par page"
          class="w-36"
        />
        <UPagination
          v-if="users.total > pageSize"
          :page="users.page"
          :items-per-page="pageSize"
          :total="users.total"
          :sibling-count="0"
          @update:page="(p) => (page = p)"
        />
      </div>
    </div>

    <UModal
      :open="!!editing"
      :title="`${editing?.firstName} ${editing?.lastName}`"
      description="Chaque partie s’enregistre séparément."
      @update:open="(open) => !open && (editing = undefined)"
    >
      <template #body>
        <div v-if="editing" class="divide-default space-y-8 divide-y">
          <section v-if="sections(editing).profile" class="pb-8">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Infos</h2>
            <FormBuilder
              v-model:state="profile"
              :schema="updateUserSchema"
              :fields="profileFields"
              :submit="(data) => save('', 'PATCH', data, 'Infos enregistrées')"
              submit-label="Enregistrer les infos"
            />
          </section>
          <section v-if="sections(editing).role" class="pb-8">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Rôle</h2>
            <FormBuilder
              v-model:state="role"
              :schema="updateUserRoleSchema"
              :fields="roleFields"
              :submit="(data) => save('/role', 'PUT', data, 'Rôle enregistré')"
              submit-label="Enregistrer le rôle"
            />
          </section>
          <section v-if="sections(editing).permissions" class="pb-8 last:pb-0">
            <h2 class="font-display text-highlighted mb-4 text-base font-bold tracking-tight">Droits en plus</h2>
            <FormBuilder
              v-model:state="permissions"
              :schema="updateUserPermissionsSchema"
              :fields="permissionFields"
              :submit="(data) => save('/permissions', 'PUT', data, 'Droits enregistrés')"
              submit-label="Enregistrer les droits"
            />
          </section>
        </div>
      </template>
    </UModal>

    <UModal
      :open="!!deleting"
      title="Supprimer l’utilisateur ?"
      :description="`${deleting?.firstName} ${deleting?.lastName} perd son compte, ses réponses aux sondages et ses invités. Ses places se libèrent.`"
      @update:open="(open) => !open && (deleting = undefined)"
    >
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="deleting = undefined">Annuler</UButton>
          <UButton color="error" icon="i-lucide-trash-2" loading-auto @click="confirmDelete">Supprimer l’utilisateur</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
