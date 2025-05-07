import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, model.configuration?.name + ".Application.csproj"), generateProjectsln(model))

}

function generateProjectsln(model: Model) : string {
    return expandToStringWithNL`
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="AutoMapper" Version="13.0.1" />
    <PackageReference Include="DocsBRValidator" Version="1.3.2" />
    <PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.9.0" />
    <PackageReference Include="Flunt" Version="2.0.5" />
    <PackageReference Include="MailKit" Version="4.4.0" />
    <PackageReference Include="MediatR" Version="12.2.0" />
    <PackageReference Include="Microsoft.AspNetCore.OData" Version="8.2.5" />
    <PackageReference Include="Microsoft.AspNetCore.OData.NewtonsoftJson" Version="8.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.2" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Serilog" Version="3.1.1" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.1" />
    <PackageReference Include="Serilog.Extensions.Hosting" Version="8.0.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${model.configuration?.name}.Domain\\${model.configuration?.name}.Domain.csproj" />
  </ItemGroup>

</Project>
`
}