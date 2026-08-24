<script setup lang="ts">
import { computed } from 'vue';
import type { ProjectRef } from '~~/types/content';

type Entry = { projectRefs?: ProjectRef[] | null };

const props = defineProps<{
  /** Entries the filter draws its options from — only projects with content are offered. */
  items: Entry[] | null | undefined;
  /** Selected project slug; empty string means "All projects". */
  modelValue: string;
  label?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const options = computed(() => {
  const bySlug = new Map<string, ProjectRef>();
  for (const item of props.items ?? []) {
    for (const ref of item.projectRefs ?? []) {
      if (!bySlug.has(ref.slug)) bySlug.set(ref.slug, ref);
    }
  }
  return [...bySlug.values()].sort((a, b) => a.shortTitle.localeCompare(b.shortTitle));
});

const value = computed({
  get: () => props.modelValue,
  set: (next: string) => emit('update:modelValue', next),
});
</script>

<template>
  <div v-if="options.length" class="flex flex-wrap items-center justify-center gap-2">
    <label :for="'project-filter'" class="text-sm text-gray-600">
      {{ label || 'Filter by project' }}
    </label>
    <select
      id="project-filter"
      v-model="value"
      class="border border-gray-300 rounded-sm px-3 py-2 text-sm bg-white outline-none focus:border-green-600"
    >
      <option value="">All Projects &amp; Programmes</option>
      <option v-for="opt in options" :key="opt.slug" :value="opt.slug">
        {{ opt.shortTitle }}
      </option>
    </select>
  </div>
</template>
