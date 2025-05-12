import { isLocalEntity, isModule, LocalEntity, Model, Module } from "../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'auth.ts'), generateAuth(model, target_folder))
    fs.writeFileSync(path.join(target_folder, 'ui.ts'), generateUi(model, target_folder))
}

function generateAuth(model: Model, target_folder: string): string {
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
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookies } from '@vueuse/integrations/useCookies'



export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const usuario = ref('')

  const cookies = useCookies(['token'])
  const getSessionToken = () => {
    return cookies.get('token')
  }
  const setSessionToken = (newToken: boolean) => {
    return cookies.set('token', newToken,
      {
        path: '/',
        // 10 minutos, para que seja possivel ver a expiracao de sessao
        // em funcionamento
        maxAge:  600
      })
  }

  const login = async (novoUsuario: string, senha: string) => {
    // requisicao a api vai aqui
    // talvez validar de novo?
    usuario.value = novoUsuario
    setSessionToken(true)
    return await router.push({ name: '${classList[0].name.toLowerCase()}-home' })
  }
  const logout = async () => {
    usuario.value = ''
    setSessionToken(false)
    return await router.push({ name: 'login' })
  }
  const estaLogado = () => {
    return getSessionToken()
  }

  return {
    usuario,
    login,
    logout,
    estaLogado,
  }
})
`
}

function generateUi(model: Model, target_folder: string): string {
    return expandToString`
import { defineStore } from 'pinia'
import { computed, ref, type ComputedRef, type Ref } from 'vue'



// tipo ruim. esperar vuetify implementar e expor o tipo
type Snackbar = Record<string, any>

interface PrivateUIStore {
  mensagensAlerta: Ref<Snackbar[]>
}
// pinia reclama quando usa uma store dentro da outra, por algum motivo
interface PrivateUIStore_ {
  mensagensAlerta: Snackbar[]
}
// https://masteringpinia.com/blog/how-to-create-private-state-in-stores
const usePrivateState = defineStore('ui-private', () => {
  const mensagensAlerta = ref<Snackbar>([])
  return {
    mensagensAlerta,
  } as PrivateUIStore
})


interface UIStore {
  mensagensAlerta: ComputedRef<Snackbar[]>
  exibirAlertas: (novaMsgAlerta: Snackbar) => boolean
  exibirAlerta: (novaMsgAlerta: Snackbar) => boolean
  fecharAlerta: (mensagensRestantes: Snackbar[]) => boolean
  carregando: Ref<boolean>
  mostrarBarraLateral: Ref<boolean>
}
export const useUiStore = defineStore('ui', () => {
  const privado = usePrivateState() as unknown as PrivateUIStore_

  const mensagensAlerta = computed(() => privado.mensagensAlerta)

  const exibirAlertas = (
    novasMensagens: Snackbar[]
  ) => {
    privado.mensagensAlerta.splice(0, 0, ...novasMensagens)
    return true
  }
  const exibirAlerta = (
    novaMsgAlerta: Snackbar
  ) => {
    return exibirAlertas([novaMsgAlerta])
  }

  const fecharAlerta = (mensagensRestantes: Snackbar[]) => {
    privado.mensagensAlerta = mensagensRestantes
    return true
  }

  const carregando = ref(false)

  const mostrarBarraLateral = ref(true)

  return {
    mensagensAlerta,
    exibirAlertas,
    exibirAlerta,
    fecharAlerta,
    carregando,
    mostrarBarraLateral
  } as UIStore
})
`
}