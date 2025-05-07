import { expandToString, Generated } from "langium/generate"
import { Attribute, LocalEntity, Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"
import { processRelations, RelationInfo } from "../../../../../util/relations.js"

export function generate(model: Model, target_folder: string) : void {

    const entities_folder = target_folder + '/Entities'

    const modules =  model.abstractElements.filter(isModule);
  
    const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()
  
    const relation_maps = processRelations(all_entities)

    fs.mkdirSync(entities_folder, {recursive: true})

    for(const mod of modules) {
        const mod_classes = mod.elements.filter(isLocalEntity)
        for(const cls of mod_classes) {
            let relationsMapping = ""
            const {relations} = getAttrsAndRelations(cls, relation_maps)
            relationsMapping += generateRelationsParameter(cls, relations)
            relationsMapping += ";"
            fs.writeFileSync(path.join(entities_folder,`${cls.name}Mapper.cs`), generateMappers(model, cls, relationsMapping))
        }
    }
}

function generateMappers(model: Model, cls: LocalEntity, RelationsMapping: string) : string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Create;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Delete;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetById;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Update;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.Mappers.Entities
{
    public class ${cls.name}Mapper : Profile
    {
        public ${cls.name}Mapper()
        {
            #region Entidade para DTO's
            CreateMap<${cls.name}, ${cls.name}ResponseDTO>().ReverseMap();
            CreateMap<${cls.name}, ${cls.name}RequestDTO>().ReverseMap();
                
            #endregion

            #region Entidade para Commads de Caso de Uso
            CreateMap<${cls.name}, Create${cls.name}Command>().ReverseMap();
            CreateMap<${cls.name}, Update${cls.name}Command>().ReverseMap();
            CreateMap<${cls.name}, GetById${cls.name}Command>().ReverseMap();
            CreateMap<${cls.name}, Delete${cls.name}Command>().ReverseMap();
            #endregion

            #region DTO's para Commads de Caso de Uso
            CreateMap<${cls.name}RequestDTO, Create${cls.name}Command>().ReverseMap() ${RelationsMapping}
            CreateMap<${cls.name}RequestDTO, Update${cls.name}Command>().ReverseMap() ${RelationsMapping}
            CreateMap<${cls.name}RequestDTO, Delete${cls.name}Command>().ReverseMap();
            #endregion

            #region Conversão para api response
            CreateMap<ApiResponse, ${cls.name}RequestDTO>().ReverseMap();
            CreateMap<ApiResponse, Create${cls.name}Command>().ReverseMap();
            CreateMap<ApiResponse, Update${cls.name}Command>().ReverseMap();
            CreateMap<ApiResponse, Delete${cls.name}Command>().ReverseMap();
            #endregion
        }
    }
}`
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
        return expandToString`
\n.ForMember(dest => dest.${cls.name}${tgt.name}Id, opt => opt.MapFrom(src => src.${tgt.name}Id))`
      } else {
        return ''
      }
    case "OneToMany":
      if(owner) {
        return ''
      } else {
        return ''
      }
    case "ManyToOne":
      if(owner) {
        return expandToString`
\n.ForMember(dest => dest.${cls.name}${tgt.name}Id, opt => opt.MapFrom(src => src.${tgt.name}Id))`
      } else {
        return ''
      }
    case "ManyToMany":
      if(owner) {
        return ''
      } else {
        return ''
      }
    }
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