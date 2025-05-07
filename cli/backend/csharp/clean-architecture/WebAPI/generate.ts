import { Model } from "../../../../../language/generated/ast.js"
import { generate as projectGenerator} from "./project-generator.js"
import { generate as helperGenerator } from "./helpers-generator.js"
import { generate as programGenerator } from "./program-generator.js"
import { generate as configGenerator } from "./.config/generate.js"
import { generate as extensionsGenerator } from "./Extensions/generate.js"
import { generate as propertiesGenerator } from "./Properties/generate.js"
import { generate as generateControllers } from "./Controllers/generate.js"
import { generate as generateScripts } from "./Scripts/generate.js"
import fs from "fs"

export function generate(model: Model, target_folder: string) : void {

    const config_folder = target_folder + "/.config"
    const extensions_folder = target_folder + "/Extensions"
    const properties_folder = target_folder + "/Properties"
    const controllers_folder = target_folder + "/Controllers"
    const scripts_folder = target_folder + "/Scripts"
    const logs_folder = target_folder + "/logs"

    fs.mkdirSync(config_folder, {recursive: true})
    fs.mkdirSync(extensions_folder, {recursive: true})
    fs.mkdirSync(controllers_folder, { recursive: true })
    fs.mkdirSync(properties_folder, { recursive: true })
    fs.mkdirSync(scripts_folder, { recursive: true })
    fs.mkdirSync(logs_folder, { recursive: true })

    projectGenerator(model, target_folder)
    helperGenerator(model, target_folder)
    programGenerator(model, target_folder)
    configGenerator(model, config_folder)
    extensionsGenerator(model, extensions_folder)
    propertiesGenerator(model, properties_folder)
    generateControllers(model, controllers_folder)
    generateScripts(model, scripts_folder)

}