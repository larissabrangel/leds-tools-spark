import { expandToString } from "langium/generate";
import { Model } from "../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder,"Program.cs"), generateProgram(model))

}
function generateProgram(model: Model) : string {
    return expandToString`
using ${model.configuration?.name}.Application.Services;
using ${model.configuration?.name}.Infrastructure;
using ${model.configuration?.name}.Infrastructure.Context;
using ${model.configuration?.name}.WebApi.Extensions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

//builder.AddServiceDefaults();
// Add services to the container.
builder.Services.ConfigurePersistenceApp(builder.Configuration);
builder.Services.ConfigureApplicationApp();

builder.Services.ConfigureCorsPolicy();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.ODataConfiguration();

#region Adição do Serilog
//Log.Logger = new LoggerConfiguration()
//            .MinimumLevel.Debug()
//            .WriteTo.Console()
//            .WriteTo.File("logs/myapp.txt", rollingInterval: RollingInterval.Day)
//            .CreateLogger();
//builder.Host.UseSerilog(Log.Logger);
#endregion

var app = builder.Build();

CreateDatabase(app);

//app.MapDefaultEndpoints();

// Configure the HTTP Command pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();


void CreateDatabase(WebApplication app)
{
    var serviceScope = app.Services.CreateScope();
    var dataContext = serviceScope.ServiceProvider.GetService<AppDbContext>();
    dataContext?.Database.EnsureCreated();
    dataContext?.Database.Migrate();

    // Carga no banco de dados
    //var sqlFile = "./Scripts/inserts.sql";
    //var sql = File.ReadAllText(sqlFile);
    //dataContext?.Database.ExecuteSqlRaw(sql);
}`
}