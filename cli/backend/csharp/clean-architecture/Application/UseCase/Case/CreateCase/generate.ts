import { Generated, expandToString } from "langium/generate";
import { Attribute, EnumEntityAtribute, LocalEntity, Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { capitalizeString } from "../../../../../../../util/generator-utils.js";
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate(model: Model, target_folder: string, cls: LocalEntity, relations: RelationInfo[]) : void {
    fs.writeFileSync(path.join(target_folder,`Create${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder,`Create${cls.name}Command.cs`), generateCommand(model, cls, relations))
    fs.writeFileSync(path.join(target_folder,`Create${cls.name}Validator.cs`), generateValidator(model, cls))
}

function generateHandler (model: Model, cls: LocalEntity): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.UseCase.BaseCase;
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Common;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Create
{
    public class Create${cls.name}Handler : CreateHandler<I${cls.name}Service, Create${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public Create${cls.name}Handler(IUnitOfWork unitOfWork, I${cls.name}Service service, IMapper mapper) : base(unitOfWork, service, mapper)
        {
        }
    }
}`
}

function generateValidator (model: Model, cls: LocalEntity): string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Create
{
    public class Create${cls.name}Validator : AbstractValidator<Create${cls.name}Command>
    {
        public Create${cls.name}Validator()
        {
        }
    }
}`
}

function generateCommand (model: Model, cls: LocalEntity, relations : RelationInfo[]): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Common;
using MediatR;
using ${model.configuration?.name}.Domain.Enums;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Create
{
    public record Create${cls.name}Command(
      ${slicer(cls, relations).slice(0, slicer(cls, relations).lastIndexOf(','))}
    ) : IRequest<ApiResponse>;
}

`
}

function slicer(cls: LocalEntity, relations: RelationInfo[]): string {
    return expandToString`
    ${cls.attributes.map(a => generateAttribute(a)).join('\n')}
    ${generateEnum(cls)}
    ${generateRelationsRequest(cls, relations)}`
}

function generateAttribute(attribute:Attribute): string{
    return expandToString`
    ${generateTypeAttribute(attribute) ?? 'NOTYPE'}? ${capitalizeString(attribute.name)},
    `
}

function generateTypeAttribute(attribute:Attribute): string | undefined {

    if (attribute.type.toString().toLowerCase() === "date"){
        return "DateTime"
    }
    if (attribute.type.toString().toLowerCase() === "cpf"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "email"){
        return "String"
    }
    if (attribute.type.toString().toLowerCase() === "boolean"){
      return "bool"
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

function generateRelationsRequest(cls: LocalEntity, relations: RelationInfo[]) : string {
  
    let node = ''
  
    for(const rel of relations) {
      node += (generateRelation(cls, rel)) + '\n'
    }
    return node
  }

  function generateRelation(cls: LocalEntity, {tgt, card, owner}: RelationInfo) : Generated {
    switch(card) {
    case "OneToOne":
      if(owner) {
        return expandToString`
            Guid ${capitalizeString(tgt.name)}Id,`
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
            Guid ${capitalizeString(tgt.name)}Id,`
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

  function generateEnum(cls: LocalEntity): string {
    return expandToString`
${cls.enumentityatributes.map(enumEntityAtribute => createEnum(enumEntityAtribute)).join("\n")}
`;
}


  function createEnum(enumEntityAtribute: EnumEntityAtribute):string {
    return expandToString`
    ${enumEntityAtribute.type.ref?.name} ${enumEntityAtribute.type.ref?.name.toLowerCase()},
    `
  }