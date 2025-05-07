import path from "path";
import fs from "fs";
import { Model, Module, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js";
import { Generated, expandToStringWithNL, toString } from "langium/generate";

export function generateContext(model: Model, target_folder: string) : void {

  const modules =  model.abstractElements.filter(isModule);
  const name = `${model.configuration?.name}`

  fs.writeFileSync(path.join(target_folder, `AppDbContext.cs`), toString(generateAppDbContext(modules, name)))


}

function generateAppDbContext(modules: Module[], name: string) : Generated {
  return expandToStringWithNL`
using Microsoft.EntityFrameworkCore;
using ${name}.Domain.Entities;
using ${name}.Domain.Security.Account.Entities;

namespace ${name}.Infrastructure.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; } = null!;
        ${generateDbSet(modules)}
    }
}`
}

function generateDbSet (modules : Module[]) : string {
  let dbsets = "";
  for(const mod of modules) {
    for(const cls of mod.elements.filter(isLocalEntity)) {
        dbsets += `public DbSet<${cls.name}> ${cls.name}s { get; set; } \n`
    }
  }
  return dbsets
}