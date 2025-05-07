import { Model } from "../../../language/generated/ast.js"
import fs from "fs";

import { generate as springbootGenerate } from "./springboot/generator.js";


export function generate(model: Model, target_folder: string) : void {
    const target_folder_back = target_folder+"/backend"

    //creating folders
    fs.mkdirSync(target_folder_back, {recursive:true})
    
    springbootGenerate(model, target_folder_back)
    
}  