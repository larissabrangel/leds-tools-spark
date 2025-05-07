import { isLocalEntity, isModule, LocalEntity, Model, Module } from "../../../../../language/generated/ast.js";
import { createPath } from "../../../../util/generator-utils.js";
import { generate as generateAPI} from "./api/generate.js"
import { generate as generateControllers} from "./controllers/generate.js"
import { generate as generateRoutes} from "./routes/generate.js"
import { generate as generateTypes} from "./types/generate.js"
import { generate as generateViews } from "./views/generate.js"

import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, target_folder: string) : void {
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

    fs.writeFileSync(path.join(target_folder, 'index.ts'), generateModulesIndex(classList));

    for (const cls of classList) {
        const folder = createPath(target_folder, `${cls.name}`)
        fs.mkdirSync(folder, {recursive:true})
        generateModule(model, cls, folder)
    }
}

function generateModulesIndex(clsList : LocalEntity[]) : string {
    return expandToString`
import { type RouteRecordRaw } from 'vue-router'

${generateImportClass(clsList)}

export const routes: RouteRecordRaw[] = [
  ${generateExportClass(clsList)}
]
`
}

function generateImportClass(clsList: LocalEntity[]) : string {
    var str = ""

    for (const cls of clsList) {
        str = str.concat(`import { routes as ${cls.name.toLowerCase()}Route } from './${cls.name}'\n`)
    }

    return str
}

function generateExportClass(clsList: LocalEntity[]) : string {
    var str = ""

    for (const cls of clsList) {
        str = str.concat(`...${cls.name.toLowerCase()}Route,\n`)
    }

    return str
}

function generateModule(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'index.ts'), generateModIndex(cls))

    const api_folder = createPath(target_folder, "api")
    const controllers_folder = createPath(target_folder, "controllers")
    const routes_folder = createPath(target_folder, "routes")
    const types_folder = createPath(target_folder, "types")
    const views_folder = createPath(target_folder, "views")

    fs.mkdirSync(api_folder, {recursive:true})
    fs.mkdirSync(controllers_folder, {recursive:true})
    fs.mkdirSync(routes_folder, {recursive:true})
    fs.mkdirSync(types_folder, {recursive:true})
    fs.mkdirSync(views_folder, {recursive:true})

    generateAPI(model, cls, api_folder)
    generateControllers(model, cls, controllers_folder)
    generateRoutes(model, cls, routes_folder)
    generateTypes(model, cls, types_folder)
    generateViews(model, cls, views_folder)
}

function generateModIndex(cls: LocalEntity) : string {
    return expandToString`
import { type RouteRecordRaw } from 'vue-router'
import { routes as _routes } from './routes'

export const routes: RouteRecordRaw[] = [
  {
    path: '/${cls.name}',
    children: _routes,
    meta: {
      requiresAuth: true
    }
  }
]
`
}