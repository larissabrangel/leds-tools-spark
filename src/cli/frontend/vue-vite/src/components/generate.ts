import { Model } from "../../../../../language/generated/ast.js";
import fs from "fs";
import { expandToString } from "langium/generate";
import path from "path";

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'DataTable.vue'), generateDataTable());
    fs.writeFileSync(path.join(target_folder, 'Card.vue'), generateCard());
    fs.writeFileSync(path.join(target_folder, 'GenericTextInput.vue'), generateGenericTextInpput());
    fs.writeFileSync(path.join(target_folder, 'PButton.vue'), generatePButton());
    fs.writeFileSync(path.join(target_folder, 'TextInput.vue'), generateNoGenericTextInpput());
    fs.writeFileSync(path.join(target_folder, 'README.md'), generateREADME());
}

function generateDataTable() : string {
    return expandToString`
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface DataTableHeader {
  title: string; // titulo da coluna
  value: string; // valor da coluna
}

type DataTableItem = Record<string, string | number>

interface DataTableProps {
  items: DataTableItem[]
  headers?: DataTableHeader[]
}

const { items, headers } = defineProps<DataTableProps>()


const processedHeaders = computed(() => {
  if (headers) {
    return headers
  } else if (items.length > 0) {
    return Object.keys(items[0]).map((key) => {
      return { title: key, value: key }
    })
  }
})

/* pode ser exportado como v-model ou defineExpose. deixar sem exportar por enquanto */
const selectedItems = reactive<Record<number, DataTableItem>>({})

/* import { watch } from 'vue'
watch(selectedItems, (newValue) => console.log(newValue)) */

const updateSelected = (index: number, event: Event) => {
  const checked = (event.target as HTMLInputElement | null)?.checked
  if (checked) {
    selectedItems[index] = items[index]
  } else {
    delete selectedItems[index]
  }
}

const selectAll = ref(false)
const toggleSelectAll = (event: Event) => {
  selectAll.value = !!(event.target as HTMLInputElement | null)?.checked
  if (selectAll.value) {
    items.forEach((item, index) => {
      selectedItems[index] = item
    })
  } else {
    items.forEach((_, index) => {
      delete selectedItems[index]
    })
  }
}


const emit = defineEmits<{
  editar: [id: DataTableItem];
  excluir: [ids: DataTableItem[]];
}>()

const editarDesabilitado = computed(() => {
  return Object.keys(selectedItems).length !== 1
})
const editar = () => {
  emit('editar', Object.values(selectedItems)[0])
}

const excluirDesabilitado = computed(() => {
  return Object.keys(selectedItems).length === 0
})
const excluir = () => {
  emit('excluir', Object.values(selectedItems))
}
</script>

<template>
  <div>
    <p-button
      class="mr-2"
      :disabled="editarDesabilitado"
      @click="editar"
    >
      Editar
    </p-button>

    <p-button
      variant="error"
      :disabled="excluirDesabilitado"
      @click="excluir"
    >
      Excluir
    </p-button>

    <table class="w-full mb-2">
      <thead>
        <tr class="border-b border-gray-400">
          <th class="w-8 py-2">
            <input type="checkbox"
              :value="selectAll"
              @input="toggleSelectAll"
            />
          </th>

          <th v-for="header in processedHeaders" class="text-left font-medium">{{ header.title }}</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in items" class="border-b border-gray-300 text-gray-600">
          <td class="text-center py-2">
            <input type="checkbox"
              :checked="!!selectedItems[index]"
              :value="selectedItems[index]"
              @input="(evt: Event) => updateSelected(index, evt)"
            />
          </td>

          <td v-for="header in processedHeaders">{{ item[header.value] }}</td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-end gap-4">
      <div class="flex gap-1">
        <span>Itens por página</span>

        <select class="border rounded-md py-1 px-3">
          <option>5</option>
          
          <option>10</option>
          
          <option>15</option>
        </select>
      </div>

      <div>
        1-5 de 20
      </div>

      <div class="flex gap-2">
        <p-button>|<</p-button>

        <p-button class="border"><</p-button>

        <p-button class="border">></p-button>

        <p-button class="border">>|</p-button>
      </div>
    </div>
  </div>
</template>
`
}


function generateCard() : string {
    return expandToString`
<template>
  <div class="p-3 border-2 rounded-md border-zinc-500 shadow-md">
    <slot />
  </div>
</template>
`
}


function generateGenericTextInpput() : string {
    return expandToString`
<script setup lang="ts">
import { computed } from 'vue'

export interface GenericTextInputProps {
  type?: 'text' | 'password';
  placeholder?: string;
  variant?: 'error' | 'default';
}

const {
  type = 'text',
  placeholder,
  variant = 'default'
} = defineProps<GenericTextInputProps>()

const value = defineModel()

const baseClass = 'w-full py-2 px-3 border-2 border-gray-600 rounded-sm placeholder:text-gray-400 '
const inputClass = computed(() => {
  if (variant === 'error') {
    return baseClass + 'border-red-400'
  }
  return baseClass
})

const emit = defineEmits<{
  keyupEnter: []
}>()

const emitEnter = () => {
  emit('keyupEnter')
}
</script>


<template>
  <input
    v-model="value"
    :class="inputClass"
    :type="type"
    :placeholder="placeholder"
    @keyup.enter="emitEnter"
  />
</template>
`
}


function generatePButton(): string {
    return expandToString`
<!-- P de 'pretty', para ser curto e n conflitar com button nativo-->
<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  variant?: 'default' | 'error'
}>(), {
  variant: 'default'
})


const className = computed(() => {
  if (props.variant === 'default') {
    return 'py-1 px-3 rounded-md text-white cursor-pointer disabled:cursor-default bg-blue-800 disabled:bg-blue-800/50'
  } else {
    return 'py-1 px-3 rounded-md text-white cursor-pointer disabled:cursor-default bg-red-800 disabled:bg-red-800/50'
  }
})
</script>

<template>
  <button
    :class="className"
  >
    <slot />
  </button>
</template>
` 
}


function generateNoGenericTextInpput(): string { 
    return expandToString`
<script lang="ts">
import { computed, watch } from 'vue'
import type { GenericTextInputProps } from './GenericTextInput.vue'
import type { ValidationResult, ValidationResultFunction } from '@/utils/regras'

export interface TextInputProps extends Omit<GenericTextInputProps, 'variant'> {
  rules?: ValidationResultFunction[];
}
</script>

<script setup lang="ts">

const value = defineModel()

const {
  type,
  placeholder,
  rules,
} = defineProps<TextInputProps>()

const hasRules = computed(() => {
  return rules !== undefined && rules.length > 0
})

const validationMessages = computed<ValidationResult[]>(() => {
  if (!hasRules.value) {
    return []
  }
  return (rules as ((value: any) => ValidationResult)[]).map((validarRegra) => {
    return validarRegra(value.value)
  })
})

const validationMessage = computed<string>(() => {
  return validationMessages.value.find((message) => {
    return typeof message === 'string'
  }) || ''
})

const isValid = computed<boolean>(() => {
  return validationMessages.value.every((valid) => {
    return valid === true
  })
})

const variant = computed(() => {
  if (isValid.value) {
    return 'default'
  } else {
    return 'error'
  }
})

const emit = defineEmits<{
  validationUpdate: [valid: boolean];
  keyupEnter: [];
}>()

const emitEnter = () => {
  emit('keyupEnter')
}

// pode ser feito tbm como v-model, expose
watch(isValid, (newValue) => {
  emit('validationUpdate', newValue)
})
</script>

<template>
  <div class="w-[280px]">
    <div class="h-[19px] mb-[16px]">
      <label class="">
        <slot />
      </label>
    </div>
    <generic-text-input
      class="mb-[8px]"
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :variant="variant"
      @keyup-enter="emitEnter"
    />

    <div class="h-(--text-2xl) overflow-auto text-red-400">
      {{ validationMessage }}
    </div>
  </div>
</template>
`
}


function generateREADME(): string {
    return expandToString`
# Components

Vue template files in this folder are automatically imported.

## 🚀 Usage

Importing is handled by [unplugin-vue-components](https://github.com/unplugin/unplugin-vue-components). This plugin automatically imports ".vue" files created in the "src/components" directory, and registers them as global components. This means that you can use any component in your application without having to manually import it.

The following example assumes a component located at "src/components/MyComponent.vue":

vue
<template>
  <div>
    <MyComponent />
  </div>
</template>

<script lang="ts" setup>
  //
</script>


When your template is rendered, the component's import will automatically be inlined, which renders to this:

vue
<template>
  <div>
    <MyComponent />
  </div>
</template>

<script lang="ts" setup>
  import MyComponent from '@/components/MyComponent.vue'
</script>
`;
}
