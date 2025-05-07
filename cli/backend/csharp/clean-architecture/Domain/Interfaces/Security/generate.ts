import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder,`IBaseSecurityRepository.cs`), generateBaseSecurity(model))
    fs.writeFileSync(path.join(target_folder,`IRoleRepository.cs`), generateRoleRepository(model))
    fs.writeFileSync(path.join(target_folder,`IUserRepository.cs`), generateUserRepository(model))
    
}

function generateUserRepository(model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Domain.Interfaces.Security
{
    public interface IUserRepository : IBaseSecurityRepository<User>
    {
        Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken);
        Task<User?> GetUserByCode(string code, CancellationToken cancellationToken);
        Task<User?> GetUserByPasswordCode(string code, CancellationToken cancellationToken);
        public Task<User?> GetUserByRefreshCode(Guid refreshToken, CancellationToken cancellationToken);
        Task<bool> AnyAsync(string email, CancellationToken cancelationToken);
    }
}
`
}

function generateRoleRepository(model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Domain.Interfaces.Security
{
    public interface IRoleRepository : IBaseSecurityRepository<Role>
    {
        Task<Role> GetRoleByName(string name, CancellationToken cancelationToken);
    }
}
`
}

function generateBaseSecurity(model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Shared.Entities;

namespace ${model.configuration?.name}.Domain.Interfaces.Security
{
    public interface IBaseSecurityRepository<T> where T : Entity
    {
        void Create(T entity);
        void Update(T entity);
        void Delete(T entity);
        IQueryable<T> GetById(Guid id);
        IQueryable<T> GetAll();
    }
}
`
}