import { expandToString } from "langium/generate"
import { LocalEntity, Model } from "../../../../../../../language/generated/ast.js"

export function generate(model: Model, cls: LocalEntity): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Create;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Delete;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetAll;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.GetById;
using ${model.configuration?.name}.Application.UseCase.Entities.${cls.name}Case.Update;
using ${model.configuration?.name}.WebApi.Controllers.BaseControllers;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ${model.configuration?.name}.WebApi.Controllers.Entities
{
    [Route("api/${cls.name}")]
    [ApiController]
    public class ${cls.name}Controller : BaseController
        <GetAll${cls.name}Command, 
        GetById${cls.name}Command, 
        Create${cls.name}Command, 
        Update${cls.name}Command, 
        Delete${cls.name}Command, 
        ${cls.name}ResponseDTO>
    {
        public ${cls.name}Controller(IMediator mediator, IMapper mapper) : base(mediator, mapper)
        {
        }
    }
}`
}