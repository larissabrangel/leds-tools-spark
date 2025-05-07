import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, model.configuration?.name + ".WebAPI.csproj"), generateProjectsln(model))

}

function generateProjectsln(model: Model) : string {
    return expandToStringWithNL`
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
	 <!--por padrão é true, alterei para false para usar o CreateDatabase-->
    <InvariantGlobalization>false</InvariantGlobalization>
    <UserSecretsId></UserSecretsId>
    <DockerDefaultTargetOS>Linux</DockerDefaultTargetOS>
    <DockerComposeProjectPath>..\\docker-compose.dcproj</DockerComposeProjectPath>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="AWSSDK.Core" Version="3.7.303.23" />
    <PackageReference Include="AWSSDK.SecretsManager" Version="3.7.302.58" />
    <PackageReference Include="Microsoft.AspNet.WebApi.Cors" Version="5.3.0" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.3" />
    <PackageReference Include="Microsoft.AspNetCore.OData" Version="8.2.5" />
    <PackageReference Include="Microsoft.AspNetCore.OData.NewtonsoftJson" Version="8.2.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.2">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.VisualStudio.Azure.Containers.Tools.Targets" Version="1.19.5" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="Serilog" Version="3.1.1" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.1" />
    <PackageReference Include="Serilog.Extensions.Hosting" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.4.0" />
    <PackageReference Include="Swashbuckle.AspNetCore.SwaggerUI" Version="6.5.0" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\\${model.configuration?.name}.Application\\${model.configuration?.name}.Application.csproj" />
    <ProjectReference Include="..\\${model.configuration?.name}.Infrastructure\\${model.configuration?.name}.Infrastructure.csproj" />
  </ItemGroup>

</Project>

`
}