import { Model } from "../../../../language/generated/ast.js"
import fs from "fs";

import { generate as generateEntity } from "./entity/generator.js";
import { generate as generateWebservice} from "./webservice/generator.js";
import { generate as generateDocumentation } from "./documentation/generators.js"

export function generate(model: Model, target_folder: string) : void {
    const target_folder_entity = target_folder+"/entity"
    const target_folder_webservice = target_folder+"/webservice"

    //creating folders
    fs.mkdirSync(target_folder_entity, {recursive:true})
    fs.mkdirSync(target_folder_webservice, {recursive:true})
    
    //creating entity
    generateEntity(model, target_folder_entity)
    generateWebservice (model, target_folder_webservice)
    
    // Documentation
    generateDocumentation(model,target_folder)
}  