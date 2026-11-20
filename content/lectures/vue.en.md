---
skill: vue
title: "Vue 3: reactivity, components and the Composition API"
summary: "Single-file components and <script setup>, ref vs reactive and how Proxy-based reactivity tracks dependencies, computed vs watch vs watchEffect, template directives (v-if, v-show, v-for with keys, v-model), props and emits, async DOM updates with nextTick, provide/inject and Pinia."
readingMinutes: 9
---

Vue is a progressive framework built around a **reactive state system**: you change plain-looking JavaScript values, and Vue re-renders exactly the components that used them. Vue 3 is usually written with **single-file components** (`.vue`) and the **Composition API** in `<script setup>`.

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
const props = defineProps<{ step: number }>();
const emit = defineEmits<{ change: [value: number] }>();
const count = ref(0);
const doubled = computed(() => count.value * 2);
function inc() { count.value += props.step; emit("change", count.value); }
</script>

<template>
  <button @click="inc">{{ count }} × 2 = {{ doubled }}</button>
</template>
```

## Reactivity: `ref` and `reactive`

- `ref(value)` wraps any value in an object with a `.value` property. In `<script>` you read and write `.value`; templates unwrap top-level refs automatically.
- `reactive(object)` returns a **Proxy** of the object. Reads are tracked and writes trigger updates, deeply (nested objects are wrapped lazily when accessed).

Under the hood, when an effect (a component render, a `computed`, a `watchEffect`) runs, every reactive property it **reads** is recorded as a dependency. Writing that property later re-runs exactly those effects. Consequences:

- Changes to the **original** object, bypassing the proxy, aren't seen.
- Destructuring a `reactive` object (`const { count } = state`) copies the current value and loses reactivity; use `toRefs(state)` or keep `state.count`.
- Replacing a whole `reactive` variable (`state = reactive({…})`) disconnects it from the template; that's one reason many teams prefer `ref` everywhere.

## `computed`, `watch` and `watchEffect`

- `computed(() => …)` derives a value. It's **cached** and only recomputes when one of its dependencies changes, unlike a method called in the template, which runs on every render. Keep computed getters free of side effects.
- `watch(source, callback)` runs a side effect when a specific source changes; it's lazy by default (`{ immediate: true }` to run at once) and gives you old and new values.
- `watchEffect(fn)` runs immediately and re-runs whenever anything it read changes, with automatic dependency tracking.

## Templates and directives

- `v-if` adds or removes elements (and runs component setup/teardown); `v-show` only toggles `display`. Use `v-show` for frequent toggles and `v-if` for rarely shown or expensive content.
- `v-for` needs a stable, unique `:key` (an id, not the index) so Vue can move existing DOM nodes and component state correctly when the list changes.
- `v-model` is two-way binding sugar: on a component it means a `modelValue` prop plus an `update:modelValue` event (`defineModel()` in Vue 3.4+).
- Props flow **down** and are read-only in the child; children communicate **up** with events. Mutating a prop triggers a warning and gets overwritten on the next parent render.

## Updates are asynchronous

Vue batches state changes and updates the DOM once, in a microtask. Right after `count.value++`, the DOM still shows the old value; `await nextTick()` waits for the update when you need to measure or focus an element.

## Sharing state

- `provide`/`inject` pass values down a component tree without prop drilling (a theme, a form context).
- **Pinia** is the official store: `defineStore` with state, getters and actions, DevTools support and SSR safety. It replaced Vuex.

## Interview checklist

- Explain `ref` vs `reactive`, `.value`, and why destructuring breaks reactivity.
- Describe how Proxy-based dependency tracking works.
- Compare `computed`, `watch` and `watchEffect`.
- Explain `v-if` vs `v-show` and why `v-for` needs keys.
- Explain one-way data flow with props and emits, `v-model` on components, and `nextTick`.
