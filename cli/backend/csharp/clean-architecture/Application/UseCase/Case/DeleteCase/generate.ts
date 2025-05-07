import { expandToString } from "langium/generate";
import { LocalEntity, Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate(model: Model, target_folder: string, cls: LocalEntity, relations: RelationInfo[]) : void {
    fs.writeFileSync(path.join(target_folder,`Delete${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder,`Delete${cls.name}Command.cs`), generateCommand(model, cls, relations))
    fs.writeFileSync(path.join(target_folder,`Delete${cls.name}Validator.cs`), generateValidator(model, cls))
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
using ${model.configuration?.name}.Domain.Enums;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Delete
{
    public class Delete${cls.name}Handler : DeleteHandler<I${cls.name}Service, Delete${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public Delete${cls.name}Handler(IUnitOfWork unitOfWork, I${cls.name}Service service, IMapper mapper) : base(unitOfWork, service, mapper)
        {
        }
    }
}`
}

function generateValidator (model: Model, cls: LocalEntity): string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Delete
{
    public class Delete${cls.name}Validator : AbstractValidator<Delete${cls.name}Command>
    {
        public Delete${cls.name}Validator()
        {
        
        }
    }
}`
}

function generateCommand (model: Model, cls: LocalEntity, relations : RelationInfo[]): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Delete
{
    public record Delete${cls.name}Command(Guid Id) : IRequest<ApiResponse>
    {
    }
}
`
}