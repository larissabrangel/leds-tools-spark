import { expandToString } from "langium/generate"
import { LocalEntity, Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {

    const entities_folder = target_folder + '/Entities'

    fs.mkdirSync(entities_folder, {recursive: true})
    
    fs.writeFileSync(path.join(target_folder,`IBaseService.cs`), generateBaseService(model))

    const modules =  model.abstractElements.filter(isModule);

    for(const mod of modules) {
        const mod_classes = mod.elements.filter(isLocalEntity)
        for(const cls of mod_classes) {
            fs.writeFileSync(path.join(entities_folder,`I${cls.name}Service.cs`), generateService(model, cls))
        }
    }
}

function generateBaseService (model: Model): string {
    return expandToString`
﻿using ${model.configuration?.name}.Application.DTOs.Common;

namespace ${model.configuration?.name}.Application.Interfaces
{
    public interface IBaseService<Request, Response, Entity>
    {
        Task<IQueryable<Response>> GetAll();
        Task<IQueryable<Response>> GetById(Guid id);
        Task<ApiResponse> Create(Request request, CancellationToken cancellationToken);
        Task<ApiResponse> Delete(Guid id, CancellationToken cancellationToken);
        Task<ApiResponse> Update(Request request, CancellationToken cancellationToken);
        abstract List<string> SaveValidation();

    }
}
`
}

function generateService(model: Model, cls: LocalEntity) : string {
    return expandToString`
using ${model.configuration?.name}.Application.DTOs.Entities.Request;
using ${model.configuration?.name}.Application.DTOs.Entities.Response;
using ${model.configuration?.name}.Domain.Entities;

namespace ${model.configuration?.name}.Application.Interfaces.Entities
{
    public interface I${cls.name}Service : IBaseService<${cls.name}RequestDTO, ${cls.name}ResponseDTO, ${cls.name}>
    {
    }
}

`
}