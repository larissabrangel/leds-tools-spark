import { LocalEntity, Model } from "../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"
import { generateAttributesAsParameters } from "./generateAttributes.js"
import { generateAttributesValue } from "./generateAttributes.js"
import { generateValuesEqualsAttributes } from "./generateAttributes.js"
import { generateAttributesAsHeader } from "./generateAttributes.js"

export function generate(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, "Criar.vue"), generateCriar(model, cls))
    fs.writeFileSync(path.join(target_folder, "Listar.vue"), generateListar(model, cls))
}

function generateCriar(model: Model, cls: LocalEntity) : string {
    return expandToString`
<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import { useRoute } from 'vue-router'
import {
  criar${cls.name},
  obter${cls.name},
  atualizar${cls.name}
} from '../controllers/${cls.name.toLowerCase()}'
import { useUiStore } from '@/stores/ui'
import type { ValidationResultFunction } from '@/utils/regras'

const route = useRoute()

const modo = computed<'criar' | 'editar'>(() => {
  if (route.params.id) {
    return 'editar'
  }
  return 'criar'
})

const ui = useUiStore()

const id = ref('')

const nome = ref('')

const primeiraMaiuscula: ValidationResultFunction = (novoNome: string) => {
  if (/^[A-Z].*$/.test(novoNome)) {
    return true
  }
  return 'O nome deve começar com uma letra maiúscula'
}

const regrasNome = [primeiraMaiuscula]

const nomeValido = ref(false)

const updateNomeValido = (novoValor: boolean) => {
  nomeValido.value = novoValor
}

const descricao = ref('')

const criar = async () => {
  if (!nomeValido.value) {
    ui.exibirAlerta({
      text: 'Por favor, corrija os campos incorretos.',
      color: 'error'
    })
    return false
  }
  const sucesso = await criar${cls.name}({
    ${generateAttributesAsParameters(cls)}
  })
  if (sucesso) {
    ${generateAttributesValue(cls)}
  }
  return true
}

const atualizar = async () => {
  if (!nomeValido.value) {
    ui.exibirAlerta({
      text: 'Por favor, corrija os campos incorretos.',
      color: 'error'
    })
    return false
  }

  const sucesso = await atualizar${cls.name}({
    Id: id.value,
    ${generateAttributesAsParameters(cls)}
  })
  return true
}

const dispatchBotao = async () => {
  if (modo.value === 'criar') {
    return await criar()
  }
  return await atualizar()
}

onBeforeMount(async () => {
  if (modo.value === 'editar') {
    const routeId: string = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    const cls = await obter${cls.name}(routeId)
    id.value = cls.Id
    ${generateValuesEqualsAttributes(cls)}
  }
})
</script>

<template>
  <card class="w-md">
    <text-input
      class="w-full"
      placeholder="Nome"
      v-model="nome"
      :rules="regrasNome"
      @validationUpdate="updateNomeValido"
    />

    <text-input
      class="w-full"
      placeholder="Descrição"
      v-model="descricao"
    />

    <div class="flex justify-end">
      <p-button
        @click="dispatchBotao"
      >
        {{ modo === 'criar' ? 'Registrar' : 'Atualizar' }}
      </p-button>
    </div>
  </card>
</template>
`
}

function generateListar(model: Model, cls: LocalEntity) : string {
    return expandToString`
<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import {
  listar${cls.name},
  excluir${cls.name}s,
} from '../controllers/${cls.name.toLowerCase()}'
import type { ${cls.name} } from '../types/${cls.name.toLowerCase()}'



const ui = useUiStore()
const headers = [
   ${generateAttributesAsHeader(cls)}
]
const items = ref<${cls.name}[]>([])

const carregar${cls.name}s = async () => {
  const ${cls.name.toLowerCase()} = await listar${cls.name}()
  items.value = ${cls.name.toLowerCase()}
}

const router = useRouter()
const editar${cls.name} = (cls: ${cls.name}) => {
  router.push({ name: '${cls.name.toLowerCase()}-criar', params: { id: cls.Id }})
}

const excluir${cls.name.toLowerCase()} = async (cls: ${cls.name}[]) => {
  const ids = cls.map((a) => a.Id)
  await excluir${cls.name}s(ids)
  await carregar${cls.name}s()
}

onBeforeMount(carregar${cls.name}s)
</script>

<template>
  <data-table
    :headers="headers"
    :items="items"
    @editar="editar${cls.name}"
    @excluir="excluir${cls.name.toLowerCase()}"
  />
</template>
`
}