import { Model } from "../../../../../language/generated/ast.js";
import fs from "fs";
import { generateConfigs } from "./config-generator.js";
import { generateModules } from "./module-generator.js";
import { generateGraphQL } from "./graphql-generator.js";

export function generate(model: Model, target_folder: string) : void {
    fs.mkdirSync(target_folder, {recursive:true})
    
     generateConfigs(model, target_folder);
     generateModules(model, target_folder);
     generateGraphQL(model, target_folder);

}
  