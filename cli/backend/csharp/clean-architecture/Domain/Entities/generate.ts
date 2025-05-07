import path from "path";
import fs from "fs";
import { Attribute, ImportedEntity, LocalEntity, Model, Module, ModuleImport, isLocalEntity, isModule, isModuleImport } from "../../../../../../language/generated/ast.js";
import { RelationInfo, processRelations } from "../../../../../util/relations.js";
import { toString } from "langium/generate";
import { generateModel } from "./model-generator.js";

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);

    const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()

    const relation_maps = processRelations(all_entities)

    const imported_entities = processImportedEntities(model)

    for(const mod of modules) {

      const package_name      = `${model.configuration?.name}` 

      const supertype_classes = processSupertypes(mod)

      const mod_classes = mod.elements.filter(isLocalEntity)

      for(const cls of mod_classes) {
        const class_name = cls.name
        const {attributes, relations} = getAttrsAndRelations(cls, relation_maps)

        attributes
        fs.writeFileSync(path.join(target_folder,`${class_name}.cs`), toString(generateModel(cls, supertype_classes.has(cls), relations, package_name, imported_entities)))
        if (!cls.is_abstract){
        }

      }
    }
}

  function processImportedEntities (application: Model): Map<ImportedEntity, ModuleImport | undefined> {
    const map: Map<ImportedEntity, ModuleImport | undefined> = new Map()
  
    for (const moduleImport of application.abstractElements.filter(isModuleImport)){
      moduleImport.entities.map(importedEntity => map.set(importedEntity, moduleImport));
    }
  
    return map
}
  
  
  /**
   * Dado um módulo, retorna todos as classes dele que são usadas como Superclasses
   */
  function processSupertypes(mod: Module) : Set<LocalEntity | undefined> {
    const set: Set<LocalEntity | undefined> = new Set()
    for(const cls of mod.elements.filter(isLocalEntity)) {
      
      if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
        set.add(cls.superType?.ref)
      }
    }
    return set
}

/**
 * Retorna todos os atributos e relações de uma Class, incluindo a de seus supertipos
 */
function getAttrsAndRelations(cls: LocalEntity, relation_map: Map<LocalEntity, RelationInfo[]>) : {attributes: Attribute[], relations: RelationInfo[]} {
    // Se tem superclasse, puxa os atributos e relações da superclasse
    if(cls.superType?.ref != null && isLocalEntity(cls.superType?.ref)) {
      const parent =  cls.superType?.ref
      const {attributes, relations} = getAttrsAndRelations(parent, relation_map)
  
      return {
        attributes: attributes.concat(cls.attributes),
        relations: relations.concat(relation_map.get(cls) ?? [])
      }
    } else {
      return {
        attributes: cls.attributes,
        relations: relation_map.get(cls) ?? []
      }
    }
  }