import { CompositeGeneratorNode, Generated, expandToString, expandToStringWithNL, toString } from "langium/generate"
import { Attribute, Entity, EnumEntityAtribute, ImportedEntity, LocalEntity, ModuleImport, isLocalEntity } from "../../../../../../language/generated/ast.js"
import { RelationInfo } from "../../../../../util/relations.js"
import { capitalizeString } from "../../../../../util/generator-utils.js"

export function generateModel(cls: LocalEntity, is_supertype: boolean, relations: RelationInfo[], package_name: string, importedEntities: Map<ImportedEntity, ModuleImport | undefined>) : Generated {
  const supertype = cls.superType?.ref  
  const is_abstract = cls?.is_abstract

  const external_relations = relations.filter(relation => relation.tgt.$container != cls.$container)

  let AttParameters = `${cls.attributes.map(a => generateAttParameters(a,is_abstract))}, ${generateRelationsParameter(cls, relations)} ${generateEnumParameter(cls)}`
  AttParameters = AttParameters.slice(0, AttParameters.lastIndexOf(','))
  let AttSendParameters = `${cls.attributes.map(a => generateAttSendParameters(a,is_abstract))}, ${generateRelationsSendParameter(cls, relations)} ${generateEnumSendParameter(cls)}`
  AttSendParameters = AttSendParameters.slice(0, AttSendParameters.lastIndexOf(','))
  let AttClassParameters = `${cls.attributes.map(a => generateAttSendClassParameters(cls,a,is_abstract))}, ${generateRelationsSendClass(cls, relations)} ${generateEnumSendClass(cls)}`
  AttClassParameters = AttClassParameters.slice(0, AttClassParameters.lastIndexOf(','))

  return expandToStringWithNL`
using ${package_name}.Domain.Common;
using ${package_name}.Domain.Enums;
using ${package_name}.Domain.Validation;
using System.ComponentModel.DataAnnotations.Schema;


  namespace ${package_name}.Domain.Entities
    {
    ${external_relations.map(relation => `using ${package_name.replace(cls.$container.name,relation.tgt.$container.name)}.${relation.tgt.name};`).join('\n')}
    ${supertype ? generateImportSuperEntity(package_name, cls, supertype, importedEntities) : undefined}
    public ${is_abstract? `abstract` : undefined} class ${cls.name} ${supertype ? `extends ${supertype.name}` : ': BaseEntity'} {
      ${cls.attributes.map(a => generateAttribute(a,is_abstract)).join('')}
      ${generateRelations(cls, relations)}
      ${generateEnum(cls)}

    public ${cls.name}()
        {
        }
    public ${cls.name}(${AttParameters})
        {
          
          var validationErrors = ${cls.name}Validation(${AttSendParameters});

          if (validationErrors.Count > 0)
            {
              throw new DomainValidationException(validationErrors);
            }
            
          ${cls.attributes.map(a => generateSetAtt(a,is_abstract)).join('\n')}
          ${generateSetRelations(cls, relations)}
          ${generateSetEnum(cls)}

        }

    private List<string>${cls.name}Validation(${AttParameters})
      {
        var errors = new List<string>();

        // Validations

        return errors;
      }
    }
    }
  `
}

function generateImportSuperEntity (package_name: string, entity: Entity, supertype: Entity, importedEntities: Map<ImportedEntity, ModuleImport | undefined>):string {

  if (isLocalEntity(supertype)){
    return `using ${package_name.replace(entity.$container.name.toLowerCase(),generateImportEntity(supertype,importedEntities))}.${supertype.name};`
  }
  return `using ${generateImportEntity(supertype,importedEntities)}.${supertype.name};` 

} 

function generateImportEntity (entity: Entity, importedEntities: Map<ImportedEntity, ModuleImport | undefined>): string {
  if (isLocalEntity(entity)){
    return `${entity.$container.name.toLowerCase()}`
  }
  const moduleImport = importedEntities.get(entity)

  return `${moduleImport?.library.toLocaleLowerCase()}.${entity.$container.name.toLowerCase()}`
}

function generateAttribute(attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToString`
  ${generateUniqueCollumn(attribute)}
  ${is_abstract? `protected`: `public`} ${toString(generateTypeAttribute(attribute) ?? 'NOTYPE')} ${capitalizeString(attribute.name)} { get; set; }`
}

function generateAttParameters(attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToString`
${toString(generateTypeAttribute(attribute) ?? 'NOTYPE')} ${attribute.name.toLowerCase()}`
}

function generateAttSendParameters(attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToString`
${attribute.name.toLowerCase()}`
}

function generateAttSendClassParameters(cls: LocalEntity, attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToString`
${cls.name.toLowerCase()}.${capitalizeString(attribute.name)}`
}

function generateSetAtt(attribute:Attribute, is_abstract:Boolean): Generated{
  return expandToString`
${capitalizeString(attribute.name)} = ${attribute.name.toLowerCase()};`
}

function generateUniqueCollumn(attribute: Attribute): Generated{
  if (attribute?.unique){
    return ""
  }
  return ""
}

function generateTypeAttribute(attribute:Attribute): Generated{

  if (attribute.type.toString().toLowerCase() === "date"){
    return "DateTime"
  }
  if (attribute.type.toString().toLowerCase() === "boolean"){
    return "bool"
  }
  if (attribute.type.toString().toLowerCase() === "cpf"){
    return "String"
  }
  if (attribute.type.toString().toLowerCase() === "email"){
    return "String"
  }
  if (attribute.type.toString().toLowerCase() === "file"){
    return "Byte[]"
  }
  if (attribute.type.toString().toLowerCase() === "mobilephonenumber"){
    return "String"
  }
  if (attribute.type.toString().toLowerCase() === "zipcode"){
    return "String"
  }
  if (attribute.type.toString().toLowerCase() === "phonenumber"){
    return "String"
  }
  if (attribute.type.toString().toLowerCase() === "integer"){
    return "int"
  }
  return attribute.type

}

function generateRelations(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  const node = new CompositeGeneratorNode()

  for(const rel of relations) {
    node.append(generateRelation(cls, rel))
    node.appendNewLine()
  }
  return node
}

function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
  switch(card) {
  case "OneToOne":
    if(owner) {
      return `
public Guid ${cls.name}${tgt.name}Id {get; set; }
public ${tgt.name}? ${tgt.name} { get; set; }`
    } else {
      return `
public Guid ${cls.name}${tgt.name}Id {get; set; }
public ${tgt.name}? ${tgt.name} { get; set; }`
    }
  case "OneToMany":
    if(owner) {
      return ''
    } else {
      return expandToStringWithNL`
      //OneToMany
      public ICollection<${tgt.name}>? ${tgt.name}s { get; set;}
      `
    }
  case "ManyToOne":
    if(owner) {
      return expandToStringWithNL`
        //ManyToOne
        public ${tgt.name}? ${tgt.name} { get; set; }
        public Guid ${cls.name}${tgt.name}Id {get; set; }
      `
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToStringWithNL`
        //ManyToMany
        public ICollection<${tgt.name}>? ${tgt.name}s { get; set;}
      `
    } else {
      return ""
    }
  }
}

function createEnum(enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`
  public ${enumEntityAtribute.type.ref?.name} ${enumEntityAtribute.type.ref?.name} { get; set; }
  `
}

function generateEnum (cls: LocalEntity):string {
  return expandToStringWithNL`
  ${cls.enumentityatributes.map(enumEntityAtribute =>createEnum(enumEntityAtribute)).join("\n")}
  `
}

function generateRelationsParameter(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  let node = ""

  for(const rel of relations) {
    node += generateRelationParameterText(cls, rel)
  }
  return node
}


function generateRelationParameterText(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
  switch(card) {
  case "OneToOne":
    if(owner) {
      return expandToString`Guid ${tgt.name.toLowerCase()}Id,`
    } else {
      return ''
    }
  case "OneToMany":
    if(owner) {
      return expandToString`ICollection<${tgt.name}>? ${tgt.name.toLowerCase()}s,`
    } else {
      return ''
    }
  case "ManyToOne":
    if(owner) {
      return expandToString`Guid ${tgt.name.toLowerCase()}Id,`
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToString`ICollection<${tgt.name}>? ${tgt.name.toLowerCase()}s,`
    } else {
      return ''
    }
  }
}

function generateEnumParameter (cls: LocalEntity):string {
  return expandToString`${cls.enumentityatributes.map(enumEntityAtribute =>createEnumParameter(enumEntityAtribute)).join('')}`
}

function createEnumParameter(enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`${enumEntityAtribute.type.ref?.name} ${enumEntityAtribute.type.ref?.name.toLowerCase()},`
}

function generateRelationsSendParameter(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  let node = ""

  for(const rel of relations) {
    node += generateRelationSendParameterText(cls, rel)
  }
  return node
}


function generateRelationSendParameterText(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
  switch(card) {
  case "OneToOne":
    if(owner) {
      return expandToString`${tgt.name.toLowerCase()}Id,`
    } else {
      return ''
    }
  case "OneToMany":
    if(owner) {
      return expandToString`${tgt.name.toLowerCase()}s,`
    } else {
      return ''
    }
  case "ManyToOne":
    if(owner) {
      return expandToString`${tgt.name.toLowerCase()}Id,`
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToString`${tgt.name.toLowerCase()}s,`
    } else {
      return ''
    }
  }
}

function generateEnumSendParameter (cls: LocalEntity):string {
  return expandToString`${cls.enumentityatributes.map(enumEntityAtribute =>createEnumSendParameter(enumEntityAtribute)).join('')}`
}

function createEnumSendParameter(enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`${enumEntityAtribute.type.ref?.name.toLowerCase()},`
}

function generateRelationsSendClass(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  let node = ""

  for(const rel of relations) {
    node += generateRelationSendClassText(cls, rel)
  }
  return node
}


function generateRelationSendClassText(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
  switch(card) {
  case "OneToOne":
    if(owner) {
      return expandToString`${cls.name.toLowerCase()}.${tgt.name}Id,`
    } else {
      return ''
    }
  case "OneToMany":
    if(owner) {
      return expandToString`${cls.name.toLowerCase()}.${tgt.name}s,`
    } else {
      return ''
    }
  case "ManyToOne":
    if(owner) {
      return expandToString`${cls.name.toLowerCase()}.${tgt.name}Id,`
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToString`${cls.name.toLowerCase()}.${tgt.name}s,`
    } else {
      return ''
    }
  }
}

function generateEnumSendClass (cls: LocalEntity):string {
  return expandToString`${cls.enumentityatributes.map(enumEntityAtribute =>createEnumSendClass(cls, enumEntityAtribute))}`
}

function createEnumSendClass(cls: LocalEntity, enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`${cls.name.toLowerCase()}.${enumEntityAtribute.type.ref?.name},`
}

function generateSetRelations(cls: LocalEntity, relations: RelationInfo[]) : Generated {
  
  const node = new CompositeGeneratorNode()

  for(const rel of relations) {
    node.append(generateSetRelation(cls, rel))
    node.appendNewLine()
  }
  return node
}

function generateSetRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
  switch(card) {
  case "OneToOne":
    if(owner) {
      return expandToStringWithNL`${cls.name}${tgt.name}Id = ${tgt.name.toLowerCase()}Id;`
    } else {
      return ''
    }
  case "OneToMany":
    if(owner) {
      return expandToStringWithNL`${tgt.name}s = ${tgt.name.toLowerCase()}s;`
    } else {
      return ''
    }
  case "ManyToOne":
    if(owner) {
      return expandToStringWithNL`
        ${cls.name}${tgt.name}Id = ${tgt.name.toLowerCase()}Id;
      `
    } else {
      return ''
    }
  case "ManyToMany":
    if(owner) {
      return expandToStringWithNL`
        ${tgt.name}s = ${tgt.name.toLowerCase()}s;
      `
    } else {
      return ""
    }
  }
}

function createSetEnum(enumEntityAtribute: EnumEntityAtribute):string {
  return expandToString`
  ${enumEntityAtribute.type.ref?.name} = ${enumEntityAtribute.type.ref?.name.toLowerCase()};
  `
}

function generateSetEnum (cls: LocalEntity):string {
  return expandToStringWithNL`
  ${cls.enumentityatributes.map(enumEntityAtribute =>createSetEnum(enumEntityAtribute)).join("\n")}
  `
}