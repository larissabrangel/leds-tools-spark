import { expandToString } from "langium/generate"
import { Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder,"ServiceExtensions.cs"), generateServiceExtensions(model))
}

function generateAdd(model: Model) : string {
    const modules =  model.abstractElements.filter(isModule);
    let adds = ""
    for(const mod of modules) {
        const mod_classes = mod.elements.filter(isLocalEntity)
        for(const cls of mod_classes) {
            adds += `services.AddScoped<I${cls.name}Service, ${cls.name}Service>();\n`
        }
    }
    return adds
}

function generateServiceExtensions(model: Model) : string {
    return expandToString`
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using ${model.configuration?.name}.Application.Interfaces.Entities;
using ${model.configuration?.name}.Application.Services.Entities;
using ${model.configuration?.name}.Application.Security.Interfaces;
using ${model.configuration?.name}.Application.Security.Services;
using ${model.configuration?.name}.Application.Shared.Behavior;
using System.Reflection;

namespace ${model.configuration?.name}.Application.Services
{
    public static class ServiceExtensions
    {
        public static void ConfigureApplicationApp(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

            services.AddTransient<IService, EmailService>();
            ${generateAdd(model)}
        }
    }
}`
}