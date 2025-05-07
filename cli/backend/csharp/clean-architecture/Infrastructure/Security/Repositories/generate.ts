import path from "path"
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import { expandToStringWithNL } from "langium/generate"

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, `BaseSecurityRepository.cs`), generateBaseSecurity(model))
    fs.writeFileSync(path.join(target_folder, `RoleRepository.cs`), generateRoleRepository(model))
    fs.writeFileSync(path.join(target_folder, `UserRepository.cs`), generateUserRepository(model))
}

function generateBaseSecurity(model: Model) : string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Shared.Entities;
using ${model.configuration?.name}.Infrastructure.Context;

namespace ${model.configuration?.name}.Infrastructure.Security.Repositories
{
    public class BaseSecurityRepository<T> : IBaseSecurityRepository<T> where T : Entity
    {
        protected readonly AppDbContext Context;

        public BaseSecurityRepository(AppDbContext context)
        {
            Context = context;
        }

        public void Create(T entity)
        {
            Context.Add(entity);
        }

        public void Update(T entity)
        {
            Context.Update(entity);
        }

        public void Delete(T entity)
        {
            Context.Remove(entity);
        }

        public IQueryable<T> GetById(Guid id)
        {
            return Context.Set<T>().Where(x => x.Id == id).AsQueryable();
        }

        public IQueryable<T> GetAll()
        {
            return Context.Set<T>().ToList().AsQueryable();
        }
    }
}`
}

function generateRoleRepository(model: Model) : string {
    return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Account.Entities;
using ${model.configuration?.name}.Infrastructure.Context;

namespace ${model.configuration?.name}.Infrastructure.Security.Repositories
{
    public class RoleRepository : BaseSecurityRepository<Role>, IRoleRepository
    {
        private readonly AppDbContext _context;
        public RoleRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<Role> GetRoleByName(string name, CancellationToken cancelationToken)
        {
            return _context.Roles.FirstOrDefaultAsync(x => x.Name == name, cancellationToken: cancelationToken);
        }
    }
}`
}

function generateUserRepository(model : Model) : string {
    return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Account.Entities;
using ${model.configuration?.name}.Infrastructure.Context;

namespace ${model.configuration?.name}.Infrastructure.Security.Repositories
{
    public class UserRepository : BaseSecurityRepository<User>, IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public Task<bool> AnyAsync(string email, CancellationToken cancelationToken)
        {
            return
                _context.Users
                        .AsNoTracking()
                        .AnyAsync(x => x.Email.Address == email);
        }

        public Task<User?> GetUserByCode(string code, CancellationToken cancellationToken)
        {
            return _context.Users
                        .Include(x => x.Roles)
                        .FirstOrDefaultAsync(x => x.Email.Verification.Code == code, cancellationToken: cancellationToken);
        }

        public Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken)
        {
            return _context.Users
                        .Include(x => x.Roles)
                        .FirstOrDefaultAsync(x => x.Email.Address == email);
        }

        public Task<User?> GetUserByPasswordCode(string code, CancellationToken cancellationToken)
        {
            return _context.Users
                        .Include(x => x.Roles)
                        .FirstOrDefaultAsync(x => x.Password.ResetCode == code, cancellationToken: cancellationToken);
        }

        public Task<User?> GetUserByRefreshCode(Guid refreshToken, CancellationToken cancellationToken)
        {
            return _context.Users
                        .Include(x => x.Roles)
                        .FirstOrDefaultAsync(x => x.RefreshToken == refreshToken, cancellationToken: cancellationToken);
        }
    }
}`
}