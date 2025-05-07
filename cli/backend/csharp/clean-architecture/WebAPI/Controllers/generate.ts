import path from "path"
import { Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateBaseControllers } from "./BaseControllers/generate.js"
import { generate as generateEntities } from "./Entities/generate.js"

export function generate(model: Model, target_folder: string) : void {

    const basecontrollers_folder = target_folder + "/BaseControllers"
    const entities_folder = target_folder + "/Entities"

    fs.mkdirSync(entities_folder, {recursive: true})
    fs.mkdirSync(basecontrollers_folder, {recursive: true})
    
    generateBaseControllers(model, basecontrollers_folder)
    generateLoop(model,entities_folder)
}

function generateLoop(model: Model, tgt_folder: string) : void {
    
    const modules =  model.abstractElements.filter(isModule);
    
    for(const mod of modules) {
        for(const cls of mod.elements.filter(isLocalEntity)) {
            fs.writeFileSync(path.join(tgt_folder, `${cls.name}Controller.cs`), generateEntities(model, cls))
        }
        
    }
}