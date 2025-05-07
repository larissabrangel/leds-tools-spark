import { Model } from "../../../../language/generated/ast.js";
import fs from "fs";
import path from "path";
import { generate as generateProperties} from "./properties/generator.js";
import { expandToStringWithNL } from "langium/generate";
import { capitalizeString } from "../../../util/generator-utils.js";

export function generate(model: Model, target_folder: string) : void {

    const target_folder_properties = target_folder + "/Properties"
    fs.mkdirSync(target_folder_properties, {recursive: true});

    generateProperties(model, target_folder_properties);
    fs.writeFileSync(path.join(target_folder, 'appsettings.json'), generateAppSettings(model))
    fs.writeFileSync(path.join(target_folder, 'appsettings.Development.json'), generateAppSettingsDevelopment())
    fs.writeFileSync(path.join(target_folder, model.configuration?.name + '.csproj'), generatecsproj())
    fs.writeFileSync(path.join(target_folder, model.configuration?.name + '.csproj.user'), generatecsprojuser())
}

function generateAppSettings (model: Model): string {

    return expandToStringWithNL`
{
  "ConnectionStrings": {
    "${capitalizeString(model.configuration?.name || "model")}Connection": "Server=sqlserver,1433;Database=${model.configuration?.database_name || "DefaultDB"};User Id=sa;Password=Senha@123;Trusted_Connection=False;TrustServerCertificate=True;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*"
}
`
}

function generateAppSettingsDevelopment() : string {

    return expandToStringWithNL`
    {
        "Logging": {
          "LogLevel": {
            "Default": "Information",
            "Microsoft.AspNetCore": "Warning"
          }
        }
      }
      `
}

function generatecsproj() : string {

    return expandToStringWithNL`
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <UserSecretsId>YOUR_SECRETS_USER_ID</UserSecretsId>
    <DockerDefaultTargetOS>Linux</DockerDefaultTargetOS>
    <StartupObject>Program</StartupObject>
    <DockerComposeProjectPath>../docker-compose.dcproj</DockerComposeProjectPath>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.6" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="8.0.6" />
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.6" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="8.0.6" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.6" />
    <PackageReference Include="Microsoft.OpenApi" Version="1.6.14" />
    <PackageReference Include="Microsoft.VisualStudio.Azure.Containers.Tools.Targets" Version="1.19.6" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.6">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.6">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <Folder Include="Migrations\" />
  </ItemGroup>

</Project>
`
}

function generatecsprojuser() : string {

    return expandToStringWithNL`
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="Current" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <ActiveDebugProfile>Container (Dockerfile)</ActiveDebugProfile>
  </PropertyGroup>
</Project>`
}