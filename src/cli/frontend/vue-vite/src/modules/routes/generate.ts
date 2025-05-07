import { LocalEntity, Model } from "../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, `index.ts`), generateRoute(model, cls))
}

function generateRoute(model: Model, cls: LocalEntity) : string {
    return expandToString`
import type { RouteRecordRaw } from 'vue-router'
import Listar from '../views/Listar.vue'
import Criar from '../views/Criar.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: '${cls.name.toLowerCase()}-home',
    path: 'home',
    component: Listar,
  },
  {
    name: '${cls.name.toLowerCase()}-criar',
    path: 'criar/:id?',
    component: Criar,
  }
]
`
}