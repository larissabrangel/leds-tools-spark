import fs from "fs";
import {  Attribute, LocalEntity, Model, Module, isLocalEntity, isModule,  } from "../../../../../language/generated/ast.js";
import { createPath } from "../../../../util/generator-utils.js";
import { Generated, expandToString, expandToStringWithNL } from "langium/generate";
import path from "path";
import { RelationInfo, processRelations } from "../../../../util/relations.js";

export function generateModules(model: Model, target_folder: string) : void {
    
    const modules = model.abstractElements.filter(isModule);
    const imported_entities = processImportedEntities(model)

    for(const mod of modules) {
        const MODULE_PATH = createPath(target_folder, mod.name.toLowerCase())
        const supertype_classes = processSupertypes(mod)
        const mod_classes = mod.elements.filter(isLocalEntity)
        const relation_maps = processRelations(mod_classes);

        console.log(relation_maps);
        for(const cls of mod_classes) {
            const class_name = cls.name
            const {attributes, relations} = getAttrsAndRelations(cls, relation_maps)

            if(!cls.is_abstract){
                fs.writeFileSync(path.join(MODULE_PATH, `${class_name}.cs`), generateClassEnt(cls, mod.name))
                fs.writeFileSync(path.join(MODULE_PATH, `ContextDb.cs`), generateClassDB(mod))
            }
        }
    }

}

function generateClassEnt(cls: LocalEntity, mod_name: string) : string {
    return expandToStringWithNL`
    namespace ${mod_name}
    {

        public class ${cls.name}
        {
            public int Id { get; set; }
            ${cls.attributes.map(attribute => generateAttribute(attribute)).join("\n")}
            
        }
    }
    `

}

function generateClassDB(mod : Module) : string {
    return expandToStringWithNL`
    namespace ${mod.name}
    {
        using Microsoft.EntityFrameworkCore;
        ${generateClassDb(mod)}

    }
    `

}

function generateClassDb(mod : Module) : string {
    const mod_classes = mod.elements.filter(isLocalEntity)
    let classDb = '';
    for(const cls of mod_classes) {
        classDb += `
        internal class ${cls.name}Db
        {
            public DbSet<${cls.name}> ${cls.name}s { get; set; }

            public ${cls.name}Db(DbContextOptions<${cls.name}Db> options) 
                : base(options) { }
            public DbSet<${cls.name}> ${cls.name.toLowerCase()}s => Set<${cls.name}>();
        }
        `
    }
    return classDb;
}

function generateAttribute(attribute: Attribute): Generated{
    return expandToString`
    public ${attribute.type} ${attribute.name} { get; set; }
    `
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