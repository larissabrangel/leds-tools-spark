import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateEntities } from "./Entities/generate.js"
import { generate as generateValueObjects } from "./ValueObjects/generate.js"
import { generate as generateUseCases } from "./UseCases/generate.js"
import { generate as generateExtensions } from "./Extensions/generate.js"

export function generate(model: Model, target_folder: string) : void {
    
    const Entities_folder = target_folder + "/Entities"
    const ValueObjects_folder = target_folder + "/ValueObjects"
    const UseCases_folder = target_folder + "/UseCases"
    const Extensions_folder = target_folder + "/Extensions"

    fs.mkdirSync(Entities_folder, {recursive: true})
    fs.mkdirSync(ValueObjects_folder, {recursive: true})
    fs.mkdirSync(UseCases_folder, {recursive: true})
    fs.mkdirSync(Extensions_folder, {recursive: true})

    generateEntities(model, Entities_folder)
    generateValueObjects(model, ValueObjects_folder)
    generateUseCases(model, UseCases_folder)
    generateExtensions(model, Extensions_folder)
    
}