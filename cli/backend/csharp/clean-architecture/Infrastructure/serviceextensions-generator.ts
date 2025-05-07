import path from "path"
import { Model, isLocalEntity, isModule } from "../../../../../language/generated/ast.js"
import fs from "fs"
import { expandToStringWithNL } from "langium/generate"

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, `ServiceExtensions.cs`), generateServiceExtensions(model))
}

function generateServiceExtensions(model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Interfaces;
using ${model.configuration?.name}.Infrastructure.Context;
using ${model.configuration?.name}.Infrastructure.Repositories;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Domain.Interfaces.Entities;
using ${model.configuration?.name}.Infrastructure.Repositories.Entities;
using ${model.configuration?.name}.Infrastructure.Security.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;


namespace ${model.configuration?.name}.Infrastructure
{
    public static class ServiceExtensions
    {
        public static void ConfigurePersistenceApp(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = Environment.GetEnvironmentVariable("SqlServer");
            IServiceCollection serviceCollection = services.AddDbContext<AppDbContext>(opt => opt.UseSqlServer(connectionString, x => x.MigrationsAssembly("${model.configuration?.name}.Infrastructure")), ServiceLifetime.Scoped);

            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IRoleRepository, RoleRepository>();
            ${generateAddScoped(model)}
        }
    }
}`
}

function generateAddScoped(model: Model): string{
    const modules =  model.abstractElements.filter(isModule);
    let addscopeds = ""
    for(const mod of modules) {
        const mod_classes = mod.elements.filter(isLocalEntity)

        for(const cls of mod_classes) {
            addscopeds += `services.AddScoped<I${cls.name}Repository, ${cls.name}Repository>(); \n`
        }
    }
    return addscopeds
}