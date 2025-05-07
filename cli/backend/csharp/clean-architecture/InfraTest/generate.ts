import { Model } from "../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as helpersGenerator } from "./helpers-generator.js"
import { generate as ProjectGenerator } from "./project-generator.js"
import { generate as repositoriesGenerator } from "./Repositories/generate.js"
export function generate(model: Model, target_folder: string) : void {

    const repositories_folder = target_folder + "/Repositories"

    fs.mkdirSync(repositories_folder, {recursive: true})

    ProjectGenerator(model, target_folder)
    helpersGenerator(target_folder)
    repositoriesGenerator(model, repositories_folder)

}