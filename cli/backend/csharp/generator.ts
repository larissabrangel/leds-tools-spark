import { Model } from "../../../language/generated/ast.js"
import fs from "fs";

import { generate as minimalApiGenerate } from "./minimal-api/generator.js";
import { generate as minimalprojectGenerate} from "./minimal-api/project-generator.js"
import { generate as minimalgenerateDocker } from "./minimal-api/docker-generator.js"
import { generate as cleanArchGenerate} from "./clean-architecture/generator.js"
import { generate as cleanprojectGenerate} from "./clean-architecture/project-generator.js"
import { generate as cleangenerateDocker } from "./clean-architecture/docker-generator.js"

export function generate(model: Model, target_folder: string) : void {
    const target_folder_back = target_folder+"/backend"
    const target_folder_projname = target_folder_back + "/" + model.configuration?.name

    //creating folders

    fs.mkdirSync(target_folder_back, {recursive:true})
    //minimal or clean-archi
    if (model.configuration?.language == 'csharp-minimal-api'){
        minimalApiGenerate(model,target_folder_projname )
        minimalprojectGenerate(model, target_folder_back)
        minimalgenerateDocker(model, target_folder_back)
    }
    else{
        cleanArchGenerate(model, target_folder_projname)
        cleanprojectGenerate(model, target_folder_back)
        cleangenerateDocker(model, target_folder_back)
    }
}