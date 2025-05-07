import { Model } from "../../../../language/generated/ast.js";
import fs from "fs";
import path from "path";
import { expandToStringWithNL } from "langium/generate";

export function generate(model: Model, target_folder: string) : void { 
    generateDockerCompose(model, target_folder);
    fs.writeFileSync(path.join(`${target_folder}/${model.configuration?.name}/`, 'Dockerfile'), generateDockerfile(model));
    fs.writeFileSync(path.join(target_folder, '.dockerignore'),generateDockerIgnore());
    fs.writeFileSync(path.join(target_folder, 'launchSettings.json'), generateLaunchSettings(model));
}
function generateDockerfile(model : Model) : string {
    return expandToStringWithNL`

  FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
  USER app
  WORKDIR /app
  EXPOSE 8080
  EXPOSE 8081

  FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
  ARG BUILD_CONFIGURATION=Release
  WORKDIR /src
  COPY ["${model.configuration?.name}/${model.configuration?.name}.csproj", "${model.configuration?.name}/"]
  RUN dotnet restore "./${model.configuration?.name}/${model.configuration?.name}.csproj"
  COPY . .
  WORKDIR "/src/${model.configuration?.name}"
  RUN dotnet build "./${model.configuration?.name}.csproj" -c $BUILD_CONFIGURATION -o /app/build

  FROM build AS publish
  ARG BUILD_CONFIGURATION=Release
  RUN dotnet publish "./${model.configuration?.name}.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

  FROM base AS final
  WORKDIR /app
  COPY --from=publish /app/publish .
  ENTRYPOINT ["dotnet", "${model.configuration?.name}.dll"]`
  }

  function generateDockerCompose(model: Model, target_folder: string): void {
    fs.writeFileSync(path.join(target_folder,'docker-compose.dcproj'), generatedockercomposedcproj(model));
    fs.writeFileSync(path.join(target_folder, 'docker-compose.yml'), generatedockercomposeyml(model));
    fs.writeFileSync(path.join(target_folder, 'docker-compose.override.yml'), generateDockerComposeOverride(model));
  }

  function generatedockercomposedcproj(model: Model): string {
    return expandToStringWithNL`
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="15.0" Sdk="Microsoft.Docker.Sdk">
  <PropertyGroup Label="Globals">
    <ProjectVersion>2.1</ProjectVersion>
    <DockerTargetOS>Linux</DockerTargetOS>
    <DockerPublishLocally>False</DockerPublishLocally>
    <ProjectGuid></ProjectGuid>
    <DockerLaunchAction>LaunchBrowser</DockerLaunchAction>
    <DockerServiceUrl>{Scheme}://localhost:{ServicePort}/swagger</DockerServiceUrl>
    <DockerServiceName>${model.configuration?.name?.toLowerCase()}</DockerServiceName>
  </PropertyGroup>
  <ItemGroup>
    <None Include="docker-compose.override.yml">
      <DependentUpon>docker-compose.yml</DependentUpon>
    </None>
    <None Include="docker-compose.yml" />
    <None Include=".dockerignore" />
  </ItemGroup>
</Project>`
  }

  function generateDockerIgnore(): string {
    return expandToStringWithNL`
**/.classpath
**/.dockerignore
**/.env
**/.git
**/.gitignore
**/.project
**/.settings
**/.toolstarget
**/.vs
**/.vscode
**/*.*proj.user
**/*.dbmdl
**/*.jfm
**/azds.yaml
**/bin
**/charts
**/docker-compose*
**/Dockerfile*
**/node_modules
**/npm-debug.log
**/obj
**/secrets.dev.yaml
**/values.dev.yaml
LICENSE
README.md
!**/.gitignore
!.git/HEAD
!.git/config
!.git/packed-refs
!.git/refs/heads/**`
  }

function generatedockercomposeyml(model: Model): string {
    return expandToStringWithNL`
networks:
  backend:
services:
  sqlserver:
    container_name: sqlserver
    image: mcr.microsoft.com/mssql/server
    environment:
      - ACCEPT_EULA=Y
      - MSSQL_SA_PASSWORD=Senha@123
    networks:
      - backend
    ports:
      - "1433:1433"
  ${model.configuration?.name?.toLowerCase()}:
    build:
      context: .
      dockerfile: ${model.configuration?.name}/Dockerfile
    networks:
      - backend
    ports:
      - "8080:8080"
      - "8081:8081"
    depends_on:
      - sqlserver`
}

function generateLaunchSettings(model: Model): string {
    return expandToStringWithNL`
{
  "profiles": {
    "Docker Compose": {
      "commandName": "DockerCompose",
      "commandVersion": "1.0",
      "serviceActions": {
        "${model.configuration?.name}": "StartDebugging"
      }
    }
  }
}`
}

function generateDockerComposeOverride(model: Model): string{
  return expandToStringWithNL`
version: '3.4'

services:
  ${model.configuration?.name?.toLowerCase()}:
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_HTTP_PORTS=8080
      - ASPNETCORE_HTTPS_PORTS=8081
    ports:
      - "8080"
      - "8081"
    volumes:
      - \${APPDATA}/Microsoft/UserSecrets:/home/app/.microsoft/usersecrets:ro
      - \${APPDATA}/ASP.NET/Https:/home/app/.aspnet/https:ro`
}