import { expandToStringWithNL } from "langium/generate"
import { LocalEntity, Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
import { generate as GenerateSecurity} from "./Security/generate.js"

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);

    const common_folder = target_folder + '/Common'
    const entities_folder = target_folder + '/Entities'

    fs.mkdirSync(common_folder, {recursive: true})
    fs.mkdirSync(entities_folder, {recursive: true})

    for(const mod of modules) {
      
      const package_name      = `${model.configuration?.name}` 
  
      const mod_classes = mod.elements.filter(isLocalEntity)
      
  
      for(const cls of mod_classes) {
        const class_name = cls.name
        fs.writeFileSync(path.join(entities_folder,`I${class_name}Repository.cs`), generateRepository(model, cls, package_name))
        if (!cls.is_abstract){
        }
      }
    }

    fs.writeFileSync(path.join(common_folder,`IUnitOfWork.cs`), generateUnitOfWork(model))
    fs.writeFileSync(path.join(common_folder,`IBaseRepository.cs`), generateBaseRepository(model))

    const security_folder = target_folder + "/Security"
    fs.mkdirSync(security_folder, {recursive: true})
    GenerateSecurity(model, security_folder)
}

function generateRepository(model: Model, cls: LocalEntity, package_name: string) : string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Interfaces.Common;

namespace ${model.configuration?.name}.Domain.Interfaces.Entities
{
    public interface I${cls.name}Repository : IBaseRepository<${cls.name}>
    {
    }
}
`
}

function generateUnitOfWork(model: Model): string {
    return expandToStringWithNL`
namespace ${model.configuration?.name}.Domain.Interfaces.Common
{
    public interface IUnitOfWork
    {
        Task Commit(CancellationToken cancellationToken);
    }
}`
}

function generateBaseRepository(model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Common;

namespace ${model.configuration?.name}.Domain.Interfaces.Common
{
    public interface IBaseRepository<T> where T : BaseEntity
    {
        Task Create(T entity);
        Task Update(T entity);
        Task Delete(T entity);
        Task<bool> Any(Guid id);
        IQueryable<T> GetById(Guid id);
        IQueryable<T> GetAll();
        void AddRange(ICollection<T> entities);
        void DeleteRange(ICollection<T> entities);
    }
}`
}