import { Attribute, isLocalEntity, isModule, LocalEntity, Model } from "../../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";
//import { createPath } from "../../../../../util/generator-utils.js";
import { processRelations, RelationInfo } from "../../../../../util/relations.js";
import { generateDeleteFeature, generateDelete } from "./generateDelete.js"
import { createPath } from "../../../../../util/generator-utils.js";

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);
  
    const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()
  
    const relation_maps = processRelations(all_entities)

    for(const mod of modules) {
      //const enumx = mod.elements.filter(isEnumX)
      for(const cls of mod.elements.filter(isLocalEntity)) {
          const {} = getAttrsAndRelations(cls, relation_maps)
          const cls_folder = createPath(target_folder, `${cls.name}`)
          fs.writeFileSync(path.join(target_folder, `delete${cls.name}.feature`), generateDeleteFeature(cls))
          fs.writeFileSync(path.join(cls_folder, `delete${cls.name}.ts`), generateDelete(cls))
      }
        
    }
}  

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