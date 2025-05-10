// import { isAttribute, isLocalEntity, isModule } from "../../../language/generated/ast.js";
import { Model } from "../../../language/generated/ast.js";
import fs from "fs";
import { createPath } from "../../util/generator-utils.js";
import { generate as helpersGenerator } from "./helpers-generator.js";
import { generate as publicGenerator } from "./public/generate.js";
import { generate as srcGenerator } from "./src/generate.js";

export function generate(model: Model, target_folder: string) : void {

    const target_folder_front = createPath(target_folder, "frontend")

    fs.mkdirSync(target_folder_front, {recursive:true})

    helpersGenerator(model, target_folder_front)

    publicGenerator(model, target_folder_front)
    
    srcGenerator(model, target_folder_front)

    
    /*
    // config
    const softwareName = model.configuration?.name ?? ""
    const softwareDescription = model.configuration?.description ?? ""

    // packages
    const listPkg = fileToPackages(model)

    // using the lib
    const project = new ProjectAbstraction(softwareName, softwareDescription, vueModularArchProjectSettings, listPkg);
    project.createProject();
    */
}

/*
function fileToPackages(model: Model) : PackageAbstraction[] {

    const listPackages = []

    // class
    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            for (const elem of absElem.elements) {
                if (isLocalEntity(elem)) {
                    const listAttr = []

                    for (const attr of elem.attributes) {
                        if (isAttribute(attr)) {
                            listAttr.push(new AttributeAbstraction(attr.name, new PrimitiveTypeAbstraction(attr.type.toString)))
                        }
                    }

                    const cls = new ClassAbstraction(elem.name, [], listAttr)

                    listPackages.push(new PackageAbstraction(elem.name, [cls], []))
                }
            }
        }
    }

    return listPackages
}
*/