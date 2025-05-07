import path from 'path'
import fs from 'fs'
import { createPath } from '../../../../util/generator-utils.js'
import { LocalEntity, Model, isLocalEntity, isModule } from '../../../../../language/generated/ast.js'
import { Generated, expandToStringWithNL, toString } from 'langium/generate'
//Relation


export function generateGraphQL(application: Model, target_folder: string) {
    if (application.configuration){

        const RESOURCE_PATH = createPath(target_folder, "src/main/resources")
        const GRAPHQL_PATH = createPath(RESOURCE_PATH, "graphql")

        fs.writeFileSync(path.join(GRAPHQL_PATH, 'schema.graphqls'), toString(generateSchemaGraphQL(application)))
        
        
    }
}
/*
function generateRelationSchemaGraphQL(relation: Relation): Generated{
    switch(relation.$type) {
      case "OneToMany": return `[${relation.type.ref?.name}]`
      default: return `${relation.type.ref?.name}`
    }
    return ""
  }
  */
  function generateTypeSchemaGraphQL (entity: LocalEntity): Generated{

    var att = entity.attributes;
    if (isLocalEntity(entity.superType?.ref)) {
      att = entity.attributes.concat(entity.superType?.ref?.attributes ?? [] )
    }
    
    //var relation = entity.relations.concat(entity.superType?.ref?.relations ?? [] )
    //${relation.map(relation => `${relation.name}:${generateRelationSchemaGraphQL(relation)}`).join("\n")}
    return expandToStringWithNL`
    type ${entity.name}{
        id: ID!
        ${att.map(atribute => `${atribute.name}:String!`).join("\n")}
    }
    `
  }
  
  function generateInputTypeSchemaGraphQL(entity: LocalEntity): Generated{
    var att = entity.attributes;  
    if (isLocalEntity(entity.superType?.ref)){
      att = entity.attributes.concat(entity.superType?.ref?.attributes ?? [] )
    }
    
    //var relation = entity.relations.concat(entity.superType?.ref?.relations ?? [] )
    //${relation.map(relation => `${relation.name}ID:String`).join("\n")}
    return expandToStringWithNL`
    input ${entity.name}Input{
      ${att.map(atribute => `${atribute.name}:String!`).join("\n")}
    }
    `
  }
  
  function generateSchemaGraphQL (application: Model): Generated{

    const modules = application.abstractElements.filter(isModule);
    const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat();

    return expandToStringWithNL`
    
    ${all_entities.map(entity => entity.is_abstract ? "": toString(generateTypeSchemaGraphQL(entity))).join("\n")}
    
    ${all_entities.map(entity => entity.is_abstract ? "":  toString(generateInputTypeSchemaGraphQL(entity))).join("\n")}
  
    type Query{
      ${all_entities.map(entity => entity.is_abstract ? "": `findAll${entity.name}s:[${entity.name}]`).join("\n")}
      ${all_entities.map(entity => entity.is_abstract ? "": `findByID${entity.name} (id: ID!):${entity.name}`).join("\n")}
    }
    
    type Mutation{
      ${all_entities.map(entity => entity.is_abstract ? "": `create${entity.name}(input: ${entity.name}Input):${entity.name}`).join("\n")}
      ${all_entities.map(entity => entity.is_abstract ? "": `delete${entity.name} (id: ID!):${entity.name}`).join("\n")}
      ${all_entities.map(entity => entity.is_abstract ? "": `update${entity.name} (id: ID!, input: ${entity.name}Input):${entity.name}`).join("\n")}
    }`
  }