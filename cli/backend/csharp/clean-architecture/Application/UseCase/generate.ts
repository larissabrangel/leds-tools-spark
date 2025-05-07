import { expandToString } from "langium/generate";
import { Attribute, LocalEntity, Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { RelationInfo, processRelations } from "../../../../../util/relations.js";
import { generate as generateCreate } from "./Case/CreateCase/generate.js"
import { generate as generateDelete } from "./Case/DeleteCase/generate.js"
import { generate as generateUpdate } from "./Case/UpdateCase/generate.js"
import { generate as generateGetAll } from "./Case/GetAllCase/generate.js"
import { generate as generateGetById } from "./Case/GetByIdCase/generate.js"

export function generate(model: Model, target_folder: string) : void {

    const BaseCase_Folder = target_folder + "/BaseCase"
    fs.mkdirSync(BaseCase_Folder, {recursive: true})
    generateBaseCase(model, BaseCase_Folder)

    const modules =  model.abstractElements.filter(isModule);
    const entities_folder = target_folder + "/Entities"

    for(const mod of modules) {
        const modules =  model.abstractElements.filter(isModule);
        const all_entities = modules.map(module => module.elements.filter(isLocalEntity)).flat()
        const relation_maps = processRelations(all_entities)
        const mod_classes = mod.elements.filter(isLocalEntity)
        for(const cls of mod_classes) {

            const { relations } = getAttrsAndRelations(cls, relation_maps)
            
            const Class_Folder = entities_folder + `/${cls.name}Case`
            fs.mkdirSync(Class_Folder, {recursive: true})

            const Create_Folder = Class_Folder + `/Create${cls.name}`
            const Delete_Folder = Class_Folder + `/Delete${cls.name}`
            const Update_Folder = Class_Folder + `/Update${cls.name}`
            const GetAll_Folder = Class_Folder + `/GetAll${cls.name}`
            const GetById_Folder = Class_Folder + `/GetById${cls.name}`

            fs.mkdirSync(Create_Folder, {recursive: true})
            fs.mkdirSync(Delete_Folder, {recursive: true})
            fs.mkdirSync(Update_Folder, {recursive: true})
            fs.mkdirSync(GetAll_Folder, {recursive: true})
            fs.mkdirSync(GetById_Folder, {recursive: true})

            generateCreate(model, Create_Folder, cls, relations)
            generateDelete(model, Delete_Folder, cls, relations)
            generateUpdate(model, Update_Folder, cls, relations)
            generateGetAll(model, GetAll_Folder, cls, relations)
            generateGetById(model, GetById_Folder, cls, relations)
        }
    }
}

function generateBaseCase (model: Model, target_folder: string): void {
    fs.writeFileSync(path.join(target_folder,`CreateHandler.cs`), BaseCreateHandler(model))
    fs.writeFileSync(path.join(target_folder,`DeleteHandler.cs`), BaseDeleteHandler(model))
    fs.writeFileSync(path.join(target_folder,`UpdateHandler.cs`), BaseUpdateHandler(model))
    fs.writeFileSync(path.join(target_folder,`GetAllHandler.cs`), BaseGetAllHandler(model))
    fs.writeFileSync(path.join(target_folder,`GetByIdHandler.cs`), BaseGetbyIdHandler(model))
}

function BaseCreateHandler (model: Model): string {
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.BaseCase
{
    public class CreateHandler<IService, CreateRequest, Request, Response, Entity> : IRequestHandler<CreateRequest, ApiResponse>
        where Entity : BaseEntity
        where Response : BaseDTO
        where CreateRequest : IRequest<ApiResponse>
        where Request : IRequest<ApiResponse>
        where IService : IBaseService<Request, Response, Entity>
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IService _service;
        protected readonly IMapper _mapper;

        public CreateHandler(IUnitOfWork unitOfWork, IService service, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _service = service;
            _mapper = mapper;
        }

        public async Task<ApiResponse> Handle(CreateRequest createRequest, CancellationToken cancellationToken)
        {
            var request = _mapper.Map<Request>(createRequest);
            var response = await _service.Create(request, cancellationToken);
            await _unitOfWork.Commit(cancellationToken);
            return response;
        }
    }
}`
}

function BaseDeleteHandler (model: Model): string {
    return expandToString`
﻿using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.BaseCase
{
    public class DeleteHandler<IService, DeleteRequest, Request, Response, Entity> : IRequestHandler<DeleteRequest, ApiResponse>
        where Entity : BaseEntity
        where Response : BaseDTO
        where Request : IRequest<ApiResponse>
        where DeleteRequest : IRequest<ApiResponse>
        where IService : IBaseService<Request, Response, Entity>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IService _service;
        private readonly IMapper _mapper;

        public DeleteHandler(IUnitOfWork unitOfWork, IService service, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _service = service;
            _mapper = mapper;
        }

        public async Task<ApiResponse> Handle(DeleteRequest deleteRequest, CancellationToken cancellationToken)
        {
            var request = _mapper.Map<Entity>(deleteRequest);
            var response = await _service.Delete(request.Id, cancellationToken);
            await _unitOfWork.Commit(cancellationToken);
            return response;
        }
    }
}`
}

function BaseUpdateHandler (model: Model): string {
    return expandToString`
﻿using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.BaseCase
{
    public class UpdateHandler<IService, UpdateRequest, Request, Response, Entity> : IRequestHandler<UpdateRequest, ApiResponse>
        where Entity : BaseEntity
        where Response : BaseDTO
        where UpdateRequest : IRequest<ApiResponse>
        where Request : IRequest<ApiResponse>
        where IService : IBaseService<Request, Response, Entity>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IService _service;
        private readonly IMapper _mapper;

        public UpdateHandler(IUnitOfWork unitOfWork, IService service, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _service = service;
            _mapper = mapper;
        }

        public async Task<ApiResponse> Handle(UpdateRequest updateRequest, CancellationToken cancellationToken)
        {
            var request = _mapper.Map<Request>(updateRequest);
            var response = await _service.Update(request, cancellationToken);
            await _unitOfWork.Commit(cancellationToken);
            return response;
        }
    }
}`
}

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

function BaseGetAllHandler(model: Model){
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.BaseCase
{
    public class GetAllHandler<IService, GetRequest, Request, Response, Entity> : IRequestHandler<GetRequest, IQueryable<Response>>
        where Entity : BaseEntity
        where Response : BaseDTO
        where GetRequest : IRequest<IQueryable<Response>>
        where Request : IRequest<ApiResponse>
        where IService : IBaseService<Request, Response, Entity>
    {
        protected readonly IService _service;

        public GetAllHandler(IService service)
        {
            _service = service;
        }


        public async Task<IQueryable<Response>> Handle(GetRequest getRequest, CancellationToken cancellationToken)
        {
            return await _service.GetAll();
        }
    }
}`
}

function BaseGetbyIdHandler(model: Model){
    return expandToString`
using AutoMapper;
using ${model.configuration?.name}.Application.DTOs.Common;
using ${model.configuration?.name}.Application.Interfaces;
using ${model.configuration?.name}.Domain.Common;
using MediatR;

namespace ${model.configuration?.name}.Application.UseCase.BaseCase
{
    public class GetByIdHandler<IService, GetRequest, Request, Response, Entity> : IRequestHandler<GetRequest, IQueryable<Response>>
        where Entity : BaseEntity
        where Response : BaseDTO
        where GetRequest : IRequest<IQueryable<Response>>
        where Request : IRequest<ApiResponse>
        where IService : IBaseService<Request, Response, Entity>
    {

        protected readonly IService _service;
        protected readonly IMapper _mapper;

        public GetByIdHandler(IService service, IMapper mapper)
        {
            _service = service;
            _mapper = mapper;
        }

        public async Task<IQueryable<Response>> Handle(GetRequest request, CancellationToken cancellationToken)
        {
            var entity = _mapper.Map<Entity>(request);
            return await _service.GetById(entity.Id);
        }
    }
}`
}