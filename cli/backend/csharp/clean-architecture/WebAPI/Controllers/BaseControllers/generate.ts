import { expandToString } from "langium/generate"
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, "BaseController.cs"), generateBaseController(model))

}

function generateBaseController(model: Model): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;

namespace ${model.configuration?.name}.WebApi.Controllers.BaseControllers
{
    public class BaseController<GetAllCommand, GetByIdCommand, CreateCommand, UpdateCommand, DeleteCommand, Response> : ODataController
        where Response : BaseDTO
        where GetAllCommand : IRequest<IQueryable<Response>>, new()
        where GetByIdCommand : IRequest<IQueryable<Response>>
        where CreateCommand : IRequest<ApiResponse>
        where UpdateCommand : IRequest<ApiResponse>
        where DeleteCommand : IRequest<ApiResponse>
    {
        protected readonly IMediator _mediator;
        protected readonly IMapper _mapper;
        public BaseController(IMediator mediator, IMapper mapper)
        {
            _mediator = mediator;
            _mapper = mapper;
        }

        [HttpGet]
        [EnableQuery(PageSize = 25, MaxExpansionDepth = 3)]
        public async Task<IQueryable<Response>> GetAll()
        {
            var response = await _mediator.Send(new GetAllCommand(), new CancellationToken());
            return response;
        }

        [HttpGet("{id}")]
        [EnableQuery(MaxExpansionDepth = 3)]
        public async Task<IQueryable<Response>> GetById(Guid id)
        {

            return await _mediator.Send(_mapper.Map<GetByIdCommand>(id), new CancellationToken());
        }

        [HttpPost]
        public async Task<ActionResult> Create(CreateCommand Command, CancellationToken cancellationToken)
        {
            if (Command == null)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(Command, cancellationToken);

            if (response.StatusCode != 201)
            {
                return ApiBadRequestResult(response);
            }

            return ApiResult(response);

        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
        {
            if (id == Guid.Empty) return BadRequest();

            var command = _mapper.Map<DeleteCommand>(id);
            var response = await _mediator.Send(command, cancellationToken);

            if (response != null) { }

            if (response.StatusCode != 200)
            {
                return ApiBadRequestResult(response);
            }

            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(Guid id, UpdateCommand Command, CancellationToken cancellationToken)
        {
            if (id == Guid.Empty)
            {
                return BadRequest();
            }
            var response = await _mediator.Send(Command, cancellationToken);

            if (response.StatusCode != 200)
            {
                return ApiBadRequestResult(response);
            }

            return ApiResult(response);
        }

        internal OkObjectResult ApiResult(ApiResponse? apiResponse)
        {
            if (apiResponse != null)
            {
                adicionarURI(apiResponse.StatusCode);
                //this.Response.StatusCode = apiResponse.StatusCode;
                var objectResult = new OkObjectResult(apiResponse);
                objectResult.StatusCode = apiResponse.StatusCode;
                return objectResult;
            }

            void adicionarURI(int statusCode)
            {
                apiResponse.Uri = statusCode == 201 ? string.Concat(Request.Path, "/", apiResponse.Uri) : Request.Path;
            }
            return Ok(apiResponse);
        }

        internal BadRequestObjectResult ApiBadRequestResult(ResponseBase? apiResponse)
        {

            this.Response.StatusCode = apiResponse.StatusCode;
            var badRequest = new BadRequestObjectResult(apiResponse);
            badRequest.StatusCode = apiResponse.StatusCode;
            return badRequest;
        }
    }
}`
}