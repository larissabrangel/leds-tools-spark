import fs from "fs";
import path from 'path'
import { LocalEntity, Model, Module, Relation, isEnumX, isImportedEntity, isLocalEntity, isManyToMany, isManyToOne, isModule, isOneToOne } from "../../language/generated/ast.js";
import { base_ident, createPath } from "../util/generator-utils.js";
import { expandToStringWithNL } from "langium/generate";

const ident = base_ident

export function generate(model: Model, target_folder: string) : void {
    fs.mkdirSync(target_folder, {recursive:true})
  
    
    const DOCS_PATH = createPath(target_folder, "docs")
    const modules = model.abstractElements.filter(isModule)
    
    fs.writeFileSync(path.join(DOCS_PATH, "README.md"), generalREADME(modules))
    fs.writeFileSync(path.join(DOCS_PATH, "packagediagram.puml"), createPackageDiagram(modules, model.configuration?.name))

    for (const m of modules) {
        const MODULE_PATH = createPath(DOCS_PATH, m.name.toLowerCase())
        fs.writeFileSync(path.join(MODULE_PATH, "/README.md"), moduleREADME(m))
        fs.writeFileSync(path.join(MODULE_PATH, "/classdiagram.puml"), createClassDiagram(m))
    }

  
}

function createPackageDiagram(modules: Module[], name?: string) : string {
    return expandToStringWithNL`
    @startuml ${name ?? ''}
    ${modules.flatMap(m => `namespace ${m.name}{}`).join('\n')}
    @enduml`
}


function createClassDiagram(m: Module) : string {
    const enums = m.elements.filter(isEnumX)
    const entities = m.elements.filter(isLocalEntity)

    return expandToStringWithNL`
    @startuml ${m.name}
        ${enums.flatMap(e =>[`enum ${e.name} { \n ${e.attributes.map(a => `${ident}${a.name}`).join(`\n`)}\n}`]).join(`\n`)}
        ${entities.map (e => entityClassDiagram(e, m)).join(`\n`)}
    @enduml`    

}

function entityClassDiagram(e: LocalEntity, m: Module) : string {
    const lines = [
        `class ${e.name} ${e.superType ? isImportedEntity (e.superType.ref) ? `<< ${e.superType.ref.name}>>`: `` : ``}{`,
        ...e.attributes.map(a =>
            `${a.type}: ${a.name}`
        ),
        ``,
        ...e.relations.filter(r => !isManyToMany(r)).map(r =>
            `${r.type.ref?.name}: ${r.name.toLowerCase()}`
        ),
        `}`,
        e.superType?.ref ? `\n${e.superType.ref.name} <|-- ${e.name}\n` : '',
        e.enumentityatributes.map(a =>
            `${e.name} "1" -- "1" ${a.type.ref?.name} : ${a.name.toLowerCase()}>`,
        ),
        ...e.relations.filter(r => !isManyToOne(r)).map(r => relationDiagram(r, e, m)),
        ``
    ]

    return lines.join('\n')
}

function relationDiagram(r: Relation, e: LocalEntity, m: Module) : string {
    // Cardinalidades
    const tgt_card = isOneToOne(r)   ? "1" : "0..*"
    const src_card = isManyToMany(r) ? "0..*" : "1"
    // Módulo de origem da entidade destino
    const origin_module = r.type.ref?.$container.name.toLowerCase() !== m.name.toLowerCase() ?
        `${r.type.ref?.$container.name}.` :
        ""

    return `${e.name} "${src_card}" -- "${tgt_card}" ${origin_module}${r.type.ref?.name} : ${r.name.toLowerCase()} >`
}


function moduleREADME(m: Module) : string {
    const lines = [
        `# 📕Documentation: ${m.name}`,
        ``,
        `${m.comment ?? ''}`,
        ``,
        `## 🌀 Package's Data Model`,
        ``,
        `![Domain Diagram](classdiagram.png)`,
        ``,
        `### ⚡Entities`,
        ``,
        ...m.elements.filter(isLocalEntity).map(e =>
            `* **${e.name}** : ${e.comment ?? '-'}`
        ),
        ``
    ]

    return lines.join('\n')
}


function generalREADME(modules: Module[]) : string {
    return expandToStringWithNL`
    # 📕Documentation

    ## 🌀 Project's Package Model
    ![Domain Diagram](packagediagram.png)

    ### 📲 Modules
    ${modules.map(m => `* **[${m.name}](./${m.name.toLocaleLowerCase()}/)** :${m.comment ?? '-'}`).join("\n")}

    `
}
