import { Model } from "../../../../../language/generated/ast.js"
import { generate as projectGenerator} from "./project-generator.js"
import { generate as helpersGenerator } from "./helpers/generate.js"
import { generate as modelTestGenerator } from "./modeltest-generator.js"
import fs from "fs"

export function generate(model: Model, target_folder: string) : void {

    const helpers_folder = target_folder + "/Helpers"

    fs.mkdirSync(helpers_folder, {recursive: true})

    projectGenerator(model, target_folder)
    helpersGenerator(model, helpers_folder)
    modelTestGenerator(model, target_folder)

}