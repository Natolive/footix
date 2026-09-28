<script setup lang="ts">
import { ROLE_LABELS } from '@footix/shared'
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, logout } = useAuth()
const toast = useToast()

async function onLogout() {
  try {
    await logout()
  } catch (e) {
    toast.add({ title: 'Déconnexion impossible', description: apiErrorMessage(e), color: 'error', icon: 'i-lucide-circle-alert' })
    return
  }
  await navigateTo('/login')
}

// Paramètres regroupés dans un seul menu ; sans droit, l'entrée n'apparaît pas (ni le menu s'il est vide).
const settings = computed(() => allowedSettingsLinks(user.value?.permissions))
const route = useRoute()
// Les pages d'administration (tableaux) prennent toute la largeur, le reste reste centré.
const width = computed(() => (route.path.startsWith('/settings') ? 'max-w-none' : 'max-w-5xl'))

const fullName = computed(() => `${user.value?.firstName ?? ''} ${user.value?.lastName ?? ''}`.trim())

const menu = computed<DropdownMenuItem[][]>(() => [
  [{ type: 'label', label: fullName.value, description: user.value?.email }],
  [{ label: 'Mon profil', icon: 'i-lucide-user-round', to: '/profile' }],
  [{ label: 'Se déconnecter', icon: 'i-lucide-log-out', color: 'error', onSelect: onLogout }],
])
</script>

<template>
  <div class="min-h-dvh">
    <header class="bg-default/75 border-default sticky top-0 z-40 border-b backdrop-blur-lg">
      <div :class="width" class="mx-auto flex h-16 items-center gap-2 px-4 sm:gap-6 sm:px-6">
        <NuxtLink to="/" class="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4" aria-label="Accueil">
          <BrandLogo class="text-highlighted w-20 sm:w-24" />
        </NuxtLink>

        <nav aria-label="Navigation principale" class="flex flex-1 items-center gap-1 sm:justify-center">
          <UButton
            to="/"
            icon="i-lucide-calendar-days"
            aria-label="Créneaux"
            exact
            color="neutral"
            variant="ghost"
            class="font-medium"
            active-class="text-highlighted bg-elevated"
            inactive-class="text-muted"
          >
            <span class="hidden sm:inline">Créneaux</span>
          </UButton>
          <UButton
            v-if="user?.permissions.includes('planning.read_availability')"
            to="/availability"
            icon="i-lucide-calendar-check"
            aria-label="Dispos"
            color="neutral"
            variant="ghost"
            class="font-medium"
            active-class="text-highlighted bg-elevated"
            inactive-class="text-muted"
          >
            <span class="hidden sm:inline">Dispos</span>
          </UButton>
          <UDropdownMenu v-if="settings.length" :items="settings">
            <UButton
              icon="i-lucide-settings"
              trailing-icon="i-lucide-chevron-down"
              aria-label="Paramètres"
              color="neutral"
              variant="ghost"
              class="font-medium"
              :class="route.path.startsWith('/settings') ? 'text-highlighted bg-elevated' : 'text-muted'"
            >
              <span class="hidden sm:inline">Paramètres</span>
            </UButton>
          </UDropdownMenu>
        </nav>

        <UDropdownMenu :items="menu" :content="{ align: 'end' }">
          <UButton
            data-tour="account"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-chevron-down"
            class="shrink-0 gap-2 px-1.5 sm:px-2"
            :aria-label="`Compte de ${fullName}`"
          >
            <UAvatar :alt="fullName" size="sm" class="bg-primary text-white" :ui="{ fallback: 'text-white font-semibold' }" />
            <span class="hidden text-left leading-tight md:block">
              <span class="text-highlighted block text-sm font-semibold">{{ user?.firstName }}</span>
              <span v-if="user" class="text-muted block text-xs">{{ ROLE_LABELS[user.role] }}</span>
            </span>
          </UButton>
        </UDropdownMenu>
      </div>
    </header>
    <main :class="width" class="mx-auto px-4 py-10 sm:px-6">
      <slot />
    </main>
  </div>
</template>

