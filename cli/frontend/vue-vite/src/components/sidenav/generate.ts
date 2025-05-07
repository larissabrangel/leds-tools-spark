import { isLocalEntity, isModule, LocalEntity, Model, Module } from "../../../../../../language/generated/ast.js";
import fs from "fs";
import { expandToString } from "langium/generate";
import path from "path";


export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'NavGroup.vue'), generateNavGroup());
    fs.writeFileSync(path.join(target_folder, 'NavItem.vue'), generateNavItem());
    fs.writeFileSync(path.join(target_folder, 'NavMenu.vue'), generateNavMenu(model));
}


function generateNavGroup(): string {
    return expandToString`
<script lang="ts" setup>
import { ref } from 'vue'
import IconNav from '../icons/IconNav.vue';

defineProps<{
  label: string
}>()

const open = ref(false)
</script>

<template>
  <div class="bg-white/5 rounded">
    <button
      class="flex items-center justify-between w-full px-3 py-2 gap-2 text-left transition hover:bg-white/10"
      @click="open = !open"
    >
      <span>{{ label }}</span>
      <IconNav :open="open" />
    </button>

    <div
      v-if="open"
      class="mt-2 p1-3 space-y-1"
    >
      <slot />
    </div>
  </div>
</template>
`
}


function generateNavItem(): string {
    return expandToString`
<script lang="ts" setup>
defineProps<{
  label: string
}>()
</script>

<template>
  <router-link
    class="block px-3 py-2 rounded hover:bg-gray-0/10 transition-colors"
    active-class="bg-white/20 font-semibold"
  >
    {{ label }}
  </router-link>
</template>
`
}

function generateNavMenu(model: Model): string {
    const classList : LocalEntity[] = []

    const modulesList : Module[] = []
    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) modulesList.push(absElem)
    }
    for (const mod of modulesList) {
        for (const elem of mod.elements) {
            if (isLocalEntity(elem)) classList.push(elem)
        }
    }    

    return expandToString`
<script lang="ts" setup>
import NavGroup from './NavGroup.vue'
import NavItem from './NavItem.vue'
</script>

<template>
  <aside class="flex flex-col h-full px-4 py-6 text-white lg:px-2">
    <section class="flex flex-col grow items-center w-full h-14 px-5 space-x-2 bg-gray-0 z-30 lg:static lg:flex-col lg:justify-start lg:px-0 lg:space-x-0 lg:space-y-2 lg:bg-transparent">
      <!-- <NavItem to="/" label="Página inicial" /> -->

${generateNav(classList)}

    </section>
  </aside>
</template>
`
}

function generateNav(clsList: LocalEntity[]): string {
    var str = ""

    for (const cls of clsList) {
        str = str.concat(expandToString`
      <NavGroup label="${cls.name}">
        <NavItem :to="{ name: '${cls.name.toLowerCase()}-home' }" label="Listar" />
        <NavItem :to="{ name: '${cls.name.toLowerCase()}-criar' }" label="Criar" />
      </NavGroup>
`)
    }

    return str
}