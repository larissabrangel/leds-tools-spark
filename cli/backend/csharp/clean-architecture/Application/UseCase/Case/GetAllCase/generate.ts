import { expandToString } from "langium/generate";
import { LocalEntity, Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate(model: Model, target_folder: string, cls: LocalEntity, relations: RelationInfo[]) : void {
    fs.writeFileSync(path.join(target_folder,`GetAll${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder,`GetAll${cls.name}Command.cs`), generateCommand(model, cls, relations))
    fs.writeFileSync(path.join(target_folder,`GetAll${cls.name}Validator.cs`), generateValidator(model, cls))
}

function generateHandler (model: Model, cls: LocalEntity): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.UseCase.BaseCase;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetAll
{
    public class GetAll${cls.name}Handler : GetAllHandler<I${cls.name}Service, GetAll${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public GetAll${cls.name}Handler(I${cls.name}Service service) : base(service)
        {
        }
    }
}`
}

function generateValidator (model: Model, cls: LocalEntity): string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetAll
{
    public class GetAll${cls.name}Validator : AbstractValidator<GetAll${cls.name}Command>
    {
        public GetAll${cls.name}Validator()
        {
        }
    }
}
`
}

function generateCommand (model: Model, cls: LocalEntity, relations : RelationInfo[]): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetAll
{
    public record GetAll${cls.name}Command() : IRequest<IQueryable<${cls.name}ResponseDTO>>;
}
`
}