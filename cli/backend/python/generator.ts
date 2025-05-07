import { Model } from "../../../language/generated/ast.js"
import fs from "fs";

import {generate as djangoGenerate} from "./django/back/generator.js"
import { createPath } from "../../util/generator-utils.js";

export function generate(model: Model, target_folder: string) : void {

    const target_folder_back = createPath(target_folder, "backend")

    //creating folders
    fs.mkdirSync(target_folder_back, {recursive:true})


    djangoGenerate(model,target_folder_back)


}