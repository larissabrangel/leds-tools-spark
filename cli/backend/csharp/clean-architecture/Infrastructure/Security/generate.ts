import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateRepositories } from "./Repositories/generate.js"

export function generate(model: Model, target_folder: string) : void {

    const repositories_folder = target_folder + "/Repositories"

    fs.mkdirSync(repositories_folder, {recursive: true})

    generateRepositories(model, repositories_folder)

}