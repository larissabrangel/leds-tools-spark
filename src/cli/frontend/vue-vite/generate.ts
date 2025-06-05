import { isAttribute, isLocalEntity, isModule } from "../../../language/generated/ast.js";
import { Model } from "../../../language/generated/ast.js";
import fs from "fs";
import { createPath } from "../../util/generator-utils.js";
import { generate as helpersGenerator } from "./helpers-generator.js";
import { generate as publicGenerator } from "./public/generate.js";
import { generate as srcGenerator } from "./src/generate.js";
import SEON from "seon-lib-implementation"

export function generate(model: Model, target_folder: string) : void {

    // config
    const softwareName = model.configuration?.name ?? ""
    const softwareDescription = model.configuration?.description ?? ""
 
    // packages
    const listPkg = fileToPackages(model)
 
    // using the lib
    let project = new SEON.ProjectAbstraction(softwareName, softwareDescription, SEON.vueModularArchProjectSettings, listPkg);

    project.createProject();

    // old generation (will be deleted and Spark will use the SparkLib)
    const target_folder_front = createPath(target_folder, "frontend")

    fs.mkdirSync(target_folder_front, {recursive:true})

    helpersGenerator(model, target_folder_front)

    publicGenerator(model, target_folder_front)
    
    srcGenerator(model, target_folder_front)
}

export function fileToPackages(model: Model) {

    const listPackages = []

    // class
    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            for (const elem of absElem.elements) {
                if (isLocalEntity(elem)) {
                    const listAttr = []

                    for (const attr of elem.attributes) {
                        if (isAttribute(attr)) {
                            listAttr.push(new SEON.TypeScriptAttribute(attr.name, new SEON.PrimitiveTypeAbstraction(attr.type.toString())))
                        }
                    }
                    const cls = new SEON.ClassAbstraction(elem.name, [], listAttr)

                    listPackages.push(new SEON.PackageAbstraction(elem.name, [cls], []))
                }
            }
        }
    }

    return listPackages
}