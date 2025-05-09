import { EnumX, isAttribute, isEnumX, isLocalEntity, isModule, isRelation, LocalEntity, type Model, type Module } from '../language/generated/ast.js';
import { GenerateOptions } from './main.js';
import { generate as pythonGenerate } from './backend/python/generator.js';
import { generate as javaGenerate } from './backend/java/generator.js';
import { generate as docGenerate} from './documentation/generator.js';
import { generate as vueVitegenerate} from './frontend/vue-vite/generate.js';
import { generate as csharpGenerator} from './backend/csharp/generator.js';
import { generate as opaGenerate } from './opa/generator.js'

import path from 'path';
import chalk from 'chalk';

export function generate(model: Model, filePath: string, destination: string | undefined, opts: GenerateOptions): string {
    const final_destination = extractDestination(filePath, destination);

    if (opts.only_back) {
        // Backend generation
        if (model.configuration?.language === 'python') {
            pythonGenerate(model, final_destination);
        } else if (model.configuration?.language?.startsWith("csharp")) {
            csharpGenerator(model, final_destination);
        } else if (model.configuration?.language === "java") {
            javaGenerate(model, final_destination);
        }
    } else if (opts.only_front) {
        // Frontend generation
        vueVitegenerate(model, final_destination);
    } else if (opts.only_Documentation) {
        // Documentation generation
        docGenerate(model, final_destination);
    } else if (opts.only_Backlog) {
        // Backlog generation
        console.log(chalk.yellow(`Not implemented yet`));
    } else if (opts.only_opa) {
        // OPA generation
        opaGenerate(model, final_destination);
    } else {
        // Generate All
        if (model.configuration?.language === 'python') {
            pythonGenerate(model, final_destination);
        } else if (model.configuration?.language?.startsWith("csharp")) {
            csharpGenerator(model, final_destination);
        } else if (model.configuration?.language === 'java') {
            javaGenerate(model, final_destination);
        }

        docGenerate(model, final_destination);
        vueVitegenerate(model, final_destination);
        opaGenerate(model, final_destination);
    }

    return final_destination;
}

function fileToSparkProject(model: Model) : void {
    // config
    const softwarename: string = model.configuration?.name ?? ""
    const about: string = model.configuration?.description ?? ""
    var language: string = ""

    switch(model.configuration?.language) {
        case('python'): 
            language = "python"

        case('java'):
            language = "java"

        case('csharp-minimal-api'):
            language = "csharp-minimal-api"

        case('csharp-clean-architecture'):
            language = "csharp-clean-architecture"
    }

    const artifacts: (LocalEntity | EnumX)[] = []
    
    for (const absElem of model.abstractElements) {
        if (isModule(absElem)) {
            // module
            const modName: string = absElem.name

            // artefacts
            for (const elem of absElem.elements) {
                // class
                if (isLocalEntity(elem)) {
                    const clsName = elem.name

                    // attribute
                    for (const attr of elem.attributes) {
                        if (isAttribute(attr)) {
                            const attrName: string = attr.name
                            const attrType: string = attr.type.toString() 
                        }
                    }

                    // relation
                    for (const rel of elem.relations) {
                        if (isRelation(rel)) {
                            const owner: LocalEntity = elem
                            const relType = rel.$type
                            const target = rel.type.ref
                        }
                    }
                }

                // enum
                if (isEnumX(elem)) {
                    const enumName: string = elem.name
                    const enumValues: string[] = []
                    for (const value of elem.attributes) {
                        enumValues.push(value.name)
                    }
                }

                artifacts.push(elem as LocalEntity | EnumX)
            }
        }
    }
}

function extractDestination(filePath: string, destination?: string) : string {
    const path_ext = new RegExp(path.extname(filePath)+'$', 'g')
    filePath = filePath.replace(path_ext, '')

    return destination ?? path.join(path.dirname(filePath))
}

