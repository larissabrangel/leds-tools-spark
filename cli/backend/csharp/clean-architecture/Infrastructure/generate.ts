import { Model } from "../../../../../language/generated/ast.js"
import { generate as GenerateProject} from "./project-generator.js"
import { generateContext } from "./Context/generateContext.js"
import { generate as GenerateMigrations } from "./Migrations/generate.js"
import { generate as GenerateRepository } from  "./Repositories/generator.js"
import { generate as GenerateEntitiesConfig } from "./EntitiesConfiguration/generate.js"
import { generate as GenerateSecurity } from "./Security/generate.js"
import { generate as generateServiceExtensions } from "./serviceextensions-generator.js"
import fs from "fs"

export function generate(model: Model, target_folder: string) : void {
    
    const context_folder = target_folder + "/Context"
    const migrations_folder = target_folder + "/Migrations"
    const repositories_folder = target_folder + "/Repositories"
    const entitiesconfig_folder = target_folder + "/EntitiesConfiguration"
    const security_folder = target_folder + "/Security"

    fs.mkdirSync(context_folder, {recursive: true})
    fs.mkdirSync(migrations_folder, {recursive: true})
    fs.mkdirSync(repositories_folder, {recursive: true})
    fs.mkdirSync(entitiesconfig_folder, {recursive: true})
    fs.mkdirSync(security_folder, {recursive: true})
    
    GenerateProject(model, target_folder)
    generateContext(model, context_folder)
    GenerateMigrations(model, migrations_folder)
    GenerateRepository(model, repositories_folder)
    GenerateEntitiesConfig(model, entitiesconfig_folder)
    GenerateSecurity(model, security_folder)
    generateServiceExtensions(model, target_folder)

}