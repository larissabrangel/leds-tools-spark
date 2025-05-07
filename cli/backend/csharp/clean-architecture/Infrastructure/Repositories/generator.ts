import { expandToStringWithNL } from "langium/generate"
import { LocalEntity, Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    const common_folder = target_folder + '/Common'
    const entities_folder = target_folder + '/Entities'


    fs.mkdirSync(common_folder, {recursive: true})
    fs.mkdirSync(entities_folder, {recursive: true})

    fs.writeFileSync(path.join(common_folder, `BaseRepository.cs`), generateBase(model))
    fs.writeFileSync(path.join(common_folder, `UnitOfWork.cs`), generateUnitOfWork(model))
    const modules =  model.abstractElements.filter(isModule);
  
    for(const mod of modules) {
        for(const cls of mod.elements.filter(isLocalEntity)) {
            fs.writeFileSync(path.join(entities_folder,`${cls.name}Repository.cs`), generateEntityRepository(model, cls))
        }
    }
}

function generateBase (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Common;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Infrastructure.Repositories.Common
{
    public class BaseRepository<T> : IBaseRepository<T> where T : BaseEntity
    {
        protected readonly AppDbContext Context;
        protected readonly DbSet<T> DbSet;

        public BaseRepository(AppDbContext context)
        {
            Context = context;
            DbSet =  Context.Set<T>();
        }

        public async Task Create(T entity)
        {
            await Context.AddAsync(entity);
        }

        public async Task Delete(T entity)
        {
            entity.Delete();
            await Task.Run(() => Context.Remove(entity), new CancellationToken());
        }

        public async Task Update(T entity)
        {
            await Task.Run(() => Context.Update(entity), new CancellationToken());
        }

        public IQueryable<T> GetAll()
        {
            return Context.Set<T>()
                 .AsSplitQuery().AsQueryable();
        }

        public IQueryable<T> GetById(Guid id)
        {
            return Context.Set<T>().Where(x => x.Id == id).AsNoTracking().AsQueryable();
        }

        public async Task<bool> Any(Guid id)
        {
            return await Context.Set<T>().AnyAsync(x => x.Id.Equals(id));
        }

        public void DeleteRange(ICollection<T> entities)
        {
            Context.Set<T>().RemoveRange(entities);
        }

        public void AddRange(ICollection<T> entities)
        {
            Context.Set<T>().AddRange(entities);
        }
    }
}`
}

function generateUnitOfWork(model: Model) : string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Infrastructure.Context;

namespace ${model.configuration?.name}.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }
        public async Task Commit(CancellationToken cancellationToken)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
`
}

function generateEntityRepository(model: Model, cls: LocalEntity): string {
    return expandToStringWithNL`
﻿using ${model.configuration?.name}.Domain.Entities;
using ${model.configuration?.name}.Domain.Enums;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using ${model.configuration?.name}.Infrastructure.Context;
using ${model.configuration?.name}.Infrastructure.Repositories.Common;
using Microsoft.EntityFrameworkCore;

namespace ${model.configuration?.name}.Infrastructure.Repositories.Entities
{
    public class ${cls.name}Repository : BaseRepository<${cls.name}>, I${cls.name}Repository
    {
        public ${cls.name}Repository(AppDbContext context) : base(context) { }

    }
}`
}

