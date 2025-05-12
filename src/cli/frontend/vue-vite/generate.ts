import { isAttribute, isLocalEntity, isModule } from "../../../language/generated/ast.js";
import { Model } from "../../../language/generated/ast.js";
import fs from "fs";
import { createPath } from "../../util/generator-utils.js";
import { generate as helpersGenerator } from "./helpers-generator.js";
import { generate as publicGenerator } from "./public/generate.js";
import { generate as srcGenerator } from "./src/generate.js";
import SEON from "seon-lib-implementation";

export function generate(model: Model, target_folder: string) : void {

    // config
    const softwareName = model.configuration?.name ?? ""
    const softwareDescription = model.configuration?.description ?? ""
 
    // packages
    const listPkg = fileToPackages(model)
 
    // using the lib
    let project = new SEON.default.ProjectAbstraction(softwareName, softwareDescription, SEON.default.vueModularArchProjectSettings, listPkg);
    
    project.createProject();
    project.createProject();
    project.createProject();
    

    const target_folder_front = createPath(target_folder, "frontend")

    fs.mkdirSync(target_folder_front, {recursive:true})

    helpersGenerator(model, target_folder_front)

    publicGenerator(model, target_folder_front)
    
    srcGenerator(model, target_folder_front)
}

function fileToPackages(model: Model) {

    const listPackages = []

    // class
    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            for (const elem of absElem.elements) {
                if (isLocalEntity(elem)) {
                    const listAttr = []

                    for (const attr of elem.attributes) {
                        if (isAttribute(attr)) {
                            listAttr.push(new SEON.default.TypeScriptAttribute(attr.name, new SEON.default.PrimitiveTypeAbstraction(attr.type.toString())))
                        }
                    }

                    const cls = new SEON.default.ClassAbstraction(elem.name, [], listAttr)

                    listPackages.push(new SEON.default.PackageAbstraction(elem.name, [cls], []))
                }
            }
        }
    }

    return listPackages
}