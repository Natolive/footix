<script setup lang="ts" generic="T extends Record<string, any>, O = T">
import type { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { FormFieldConfig } from '~/types/form'

// Formulaire généré depuis une liste de champs, validé par un schéma Zod (partagé avec l'API).
// Le bouton passe en chargement tant que la promesse de `submit` n'est pas résolue.
// Slot `hint-<nom du champ>` pour ajouter un lien à droite du label.
// `T` : l'état saisi, `O` : ce que le schéma en fait (dates et nombres convertis), reçu par `submit`.
defineProps<{
  schema: z.ZodType<O, T>
  fields: FormFieldConfig<T>[]
  submitLabel: string
  submit: (data: O) => Promise<unknown>
  /** Affiche les valeurs sans bouton d'envoi. */
  readonly?: boolean
}>()
const state = defineModel<T>('state', { required: true })

// Secousse quand l'envoi est refusé par la validation.
const shaking = ref(false)
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-6"
    :class="{ shake: shaking }"
    @submit="(e: FormSubmitEvent<O>) => submit(e.data)"
    @error="shaking = true"
    @animationend.self="shaking = false"
  >
    <div class="grid gap-5 sm:grid-cols-2">
      <template v-for="(field, i) in fields" :key="field.name">
        <UCheckbox
          v-if="field.type === 'checkbox'"
          v-model="state[field.name]"
          :name="field.name"
          :label="field.label"
          class="enter sm:col-span-2"
          :style="{ '--i': i }"
        />
        <UFormField
          v-else
          :label="field.label"
          :name="field.name"
          :help="field.help"
          class="enter"
          :class="{ 'sm:col-span-2': !field.half }"
          :style="{ '--i': i }"
          :ui="{ error: 'error-in' }"
        >
          <template v-if="$slots[`hint-${field.name}`]" #hint>
            <slot :name="`hint-${field.name}`" />
          </template>
          <div v-if="field.type === 'checkbox-group'" class="space-y-4">
            <UCheckboxGroup
              v-for="group in field.groups"
              :key="group.label"
              v-model="state[field.name]"
              :legend="group.label"
              :items="group.items"
              :disabled="field.disabled"
            />
          </div>
          <USelect
            v-else-if="field.type === 'select'"
            v-model="state[field.name]"
            :items="field.options"
            :disabled="field.disabled"
            size="xl"
            class="w-full"
          />
          <UTextarea
            v-else-if="field.type === 'textarea'"
            v-model="state[field.name]"
            :placeholder="field.placeholder"
            :rows="3"
            autoresize
            size="xl"
            class="w-full"
          />
          <FormPasswordInput v-else-if="field.type === 'password'" v-model="state[field.name]" :autocomplete="field.autocomplete" />
          <UInput
            v-else
            v-model="state[field.name]"
            :type="field.type ?? 'text'"
            :autocomplete="field.autocomplete"
            :placeholder="field.placeholder"
            :icon="field.icon"
            :disabled="field.disabled"
            size="xl"
            class="w-full"
          />
        </UFormField>
      </template>
    </div>

    <UButton v-if="!readonly" type="submit" size="xl" block loading-auto class="enter font-semibold" :style="{ '--i': fields.length }">
      {{ submitLabel }}
    </UButton>
  </UForm>
</template>

<style scoped>
/* Entrée en cascade des champs, à l'affichage de la page. */
.enter {
  animation: enter .5s cubic-bezier(.2, .8, .2, 1) both;
  animation-delay: calc(var(--i) * 60ms + 120ms);
}
@keyframes enter {
  from { opacity: 0; transform: translateY(12px); }
}

.shake {
  animation: shake .4s cubic-bezier(.36, .07, .19, .97);
}
@keyframes shake {
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

:deep(.error-in) {
  animation: error-in .2s ease-out;
}
@keyframes error-in {
  from { opacity: 0; transform: translateY(-4px); }
}

@media (prefers-reduced-motion: reduce) {
  .enter, .shake, :deep(.error-in) { animation: none; }
}
</style>
