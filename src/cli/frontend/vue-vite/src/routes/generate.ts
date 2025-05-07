import { isLocalEntity, isModule, LocalEntity, Model, Module } from "../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'index.ts'), generateIndex(model, target_folder))
}

function generateIndex(model: Model, target_folder: string): string {
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
import { type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/views/Login.vue'



export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/',
    // impedindo que o usuario navege para a pagina de login
    // se estiver logado
    beforeEnter: () => {
      const auth = useAuthStore()
      if (auth.estaLogado()) {
        return { name: '${classList[0].name.toLowerCase()}-home' }
      }
      return true

    },
    component: Login
  }
]
`
}