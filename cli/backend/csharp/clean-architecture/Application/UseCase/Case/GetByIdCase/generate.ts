import { expandToString } from "langium/generate";
import { LocalEntity, Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { RelationInfo } from "../../../../../../../util/relations.js";

export function generate(model: Model, target_folder: string, cls: LocalEntity, relations: RelationInfo[]) : void {
    fs.writeFileSync(path.join(target_folder,`GetById${cls.name}Handler.cs`), generateHandler(model, cls))
    fs.writeFileSync(path.join(target_folder,`GetById${cls.name}Command.cs`), generateCommand(model, cls, relations))
    fs.writeFileSync(path.join(target_folder,`GetById${cls.name}Validator.cs`), generateValidator(model, cls))
}

function generateHandler (model: Model, cls: LocalEntity): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.UseCase.BaseCase;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetById
{
    internal class GetById${cls.name}Handler : GetByIdHandler<I${cls.name}Service, GetById${cls.name}Command, ${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
        public GetById${cls.name}Handler(I${cls.name}Service service, IMapper mapper) : base(service, mapper)
        {
        }
    }
}
`
}

function generateValidator (model: Model, cls: LocalEntity): string {
    return expandToString`
using FluentValidation;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetById
{
    public class GetById${cls.name}Validator : AbstractValidator<GetById${cls.name}Command>
    {
        public GetById${cls.name}Validator()
        {

        }
    }
}`
}

function generateCommand (model: Model, cls: LocalEntity, relations : RelationInfo[]): string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetById
{
    public record GetById${cls.name}Command(Guid Id) : IRequest<IQueryable<${cls.name}ResponseDTO>>
    {
    }
}`
}