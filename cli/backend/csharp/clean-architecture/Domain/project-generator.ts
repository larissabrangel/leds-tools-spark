import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, model.configuration?.name + ".Domain.csproj"), generateProjectsln(model))

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
    <Compile Remove="Security\\Account\\UseCases\\**" />
    <EmbeddedResource Remove="Security\\Account\\UseCases\\**" />
    <None Remove="Security\\Account\\UseCases\\**" />
  </ItemGroup>

  <ItemGroup>
    <PackageReference Include="EmailValidation" Version="1.0.10" />
    <PackageReference Include="Flunt" Version="2.0.5" />
    <PackageReference Include="Microsoft.AspNetCore.OData" Version="8.2.5" />
    <PackageReference Include="Microsoft.AspNetCore.OData.NewtonsoftJson" Version="8.2.0" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Serilog" Version="3.1.1" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.1" />
    <PackageReference Include="Serilog.Extensions.Hosting" Version="8.0.0" />
  </ItemGroup>

</Project>
`
}