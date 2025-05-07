import { Model } from "../../../language/generated/ast.js";
import fs from "fs";
import { createPath } from "../../util/generator-utils.js";
import { generate as helpersGenerator } from "./helpers-generator.js";
import { generate as publicGenerator } from "./public/generate.js";
import { generate as srcGenerator } from "./src/generate.js";
// import { generate as generateCypress } from "./cypress/generate.js";

export function generate(model: Model, target_folder: string) : void {

    const target_folder_front = createPath(target_folder, "frontend")

    fs.mkdirSync(target_folder_front, {recursive:true})

    helpersGenerator(model, target_folder_front)

    publicGenerator(model, target_folder_front)
    
    srcGenerator(model, target_folder_front)
    
    // generateCypress(model,target_folder_front)
}  