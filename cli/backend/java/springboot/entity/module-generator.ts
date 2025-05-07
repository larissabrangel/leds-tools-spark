import path from "path";
import fs from "fs";
import { Attribute, ImportedEntity, LocalEntity, Model, Module, ModuleImport, isEnumX, isLocalEntity, isModule, isModuleImport } from "../../../../../language/generated/ast.js";
import { createPath } from "../../../../util/generator-utils.js";
import { RelationInfo, processRelations } from "../../../../util/relations.js";
import { Generated, expandToStringWithNL, toString } from "langium/generate";
import { generateModel } from "./model-generator.js";
import { generateEnum } from "./enum-generator.js";

export function generateModules(model: Model, target_folder: string) : void {
  
  const package_path  = model.configuration?.package_path ?? 'base'

  const modules =  model.abstractElements.filter(isModule);

  const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()

  const relation_maps = processRelations(all_entities)

  const imported_entities = processImportedEntities(model)

  for(const mod of modules) {
    
    const package_name      = `${package_path}.entity.${model.configuration?.name}.${mod.name.toLowerCase()}`
    const MODULE_PATH       = createPath(target_folder, "src/main/java/", package_name.replaceAll(".","/"))
    const REPOSITORIES_PATH = createPath(MODULE_PATH, 'repositories')    
    const MODELS_PATH       = createPath(MODULE_PATH, 'models')    

    const supertype_classes = processSupertypes(mod)

    const mod_classes = mod.elements.filter(isLocalEntity)
    for(const cls of mod_classes) {
      const class_name = cls.name
      const {attributes, relations} = getAttrsAndRelations(cls, relation_maps)
      
      attributes

      fs.writeFileSync(path.join(MODELS_PATH,`${class_name}.java`), toString(generateModel(cls, supertype_classes.has(cls), relations, package_name, imported_entities)))
      if (!cls.is_abstract){
        fs.writeFileSync(path.join(REPOSITORIES_PATH, `${class_name}Repository.java`), toString(generateClassRepository(cls, package_name, imported_entities)))
      }
      
      
    }

    for (const enumx of mod.elements.filter(isEnumX)){
      fs.writeFileSync(path.join(MODELS_PATH,`${enumx.name}.java`), generateEnum(enumx,package_name))
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

function generateClassRepository(cls: LocalEntity, package_name: string, importedEntities: Map<ImportedEntity, ModuleImport | undefined>) : Generated {
  
   
  return expandToStringWithNL`
    package ${package_name}.repositories;

    import ${package_name}.models.${cls.name};
    import org.springframework.data.repository.PagingAndSortingRepository;
    import org.springframework.data.repository.ListCrudRepository;
    import java.util.Optional;
    import br.nemo.immigrant.ontology.entity.eo.teams.repositories.projections.IDProjection;

    public interface ${cls.name}Repository extends PagingAndSortingRepository<${cls.name}, Long>, ListCrudRepository<${cls.name}, Long> {

      Optional<IDProjection> findByExternalId(String externalId);

      Optional<IDProjection> findByInternalId(String internalId);

      Boolean existsByInternalId(String internalId);
    
    }
  `
}
