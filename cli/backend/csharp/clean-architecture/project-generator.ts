import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, model.configuration?.name + ".sln"), generateProjectsln(model))

}

function generateProjectsln(model: Model) : string {
    return expandToStringWithNL`

	Microsoft Visual Studio Solution File, Format Version 12.00
	# Visual Studio Version 17
	VisualStudioVersion = 17.8.34525.116
	MinimumVisualStudioVersion = 10.0.40219.1
	Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "${model.configuration?.name}.Domain", "${model.configuration?.name}\\${model.configuration?.name}.Domain\\${model.configuration?.name}.Domain.csproj", "{DOMAIN-GUID}"
	EndProject
	Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "${model.configuration?.name}.Application", "${model.configuration?.name}\\${model.configuration?.name}.Application\\${model.configuration?.name}.Application.csproj", "{APP-GUID}"
	EndProject
	Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "${model.configuration?.name}.Infrastructure", "${model.configuration?.name}\\${model.configuration?.name}.Infrastructure\\${model.configuration?.name}.Infrastructure.csproj", "{INFRA-GUID}"
	EndProject
	Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "${model.configuration?.name}.WebAPI", "${model.configuration?.name}\\${model.configuration?.name}.WebAPI\\${model.configuration?.name}.WebAPI.csproj", "{WEB-GUID}"
	EndProject
	Project("{E53339B2-1760-4266-BCC7-CA923CBCF16C}") = "docker-compose", "docker-compose.dcproj", "{COMPOSE-GUID}"
	EndProject
	Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "${model.configuration?.name}.Domain.Test", "${model.configuration?.name}\\${model.configuration?.name}.Domain.Test\\${model.configuration?.name}.Domain.Test.csproj", "{TEST-GUID}"
	EndProject
	Project("{9A19103F-16F7-4668-BE54-9A1E7A4F7556}") = "${model.configuration?.name}.Infrastructure.Test", "${model.configuration?.name}\\${model.configuration?.name}.Infrastructure.Test\\${model.configuration?.name}.Infrastructure.Test.csproj", "{38820998-E6BD-479C-8BAE-36871A33F323}"
	EndProject
	Global
		GlobalSection(SolutionConfigurationPlatforms) = preSolution
			Debug|Any CPU = Debug|Any CPU
			Release|Any CPU = Release|Any CPU
		EndGlobalSection
		GlobalSection(ProjectConfigurationPlatforms) = postSolution
			{DOMAIN-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{DOMAIN-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{DOMAIN-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{DOMAIN-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
			{APP-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{APP-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{APP-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{APP-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
			{INFRA-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{INFRA-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{INFRA-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{INFRA-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
			{WEB-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{WEB-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{WEB-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{WEB-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
			{7964FDCD-F692-4B1B-9FB7-C8281A41717D}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{7964FDCD-F692-4B1B-9FB7-C8281A41717D}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{7964FDCD-F692-4B1B-9FB7-C8281A41717D}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{7964FDCD-F692-4B1B-9FB7-C8281A41717D}.Release|Any CPU.Build.0 = Release|Any CPU
			{TEST-GUID}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{TEST-GUID}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{TEST-GUID}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{TEST-GUID}.Release|Any CPU.Build.0 = Release|Any CPU
			{38820998-E6BD-479C-8BAE-36871A33F323}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
			{38820998-E6BD-479C-8BAE-36871A33F323}.Debug|Any CPU.Build.0 = Debug|Any CPU
			{38820998-E6BD-479C-8BAE-36871A33F323}.Release|Any CPU.ActiveCfg = Release|Any CPU
			{38820998-E6BD-479C-8BAE-36871A33F323}.Release|Any CPU.Build.0 = Release|Any CPU
		EndGlobalSection
		GlobalSection(SolutionProperties) = preSolution
			HideSolutionNode = FALSE
		EndGlobalSection
		GlobalSection(NestedProjects) = preSolution
			{DOMAIN-GUID} = {B024BF5F-C15B-4445-8ADE-D1D9F21FB574}
			{APP-GUID} = {B024BF5F-C15B-4445-8ADE-D1D9F21FB574}
			{INFRA-GUID} = {10EB714F-63BC-4DF0-81AD-0216171485C4}
			{WEB-GUID} = {3D77C2E3-8755-49BB-941B-B21BDE25353C}
			{TEST-GUID} = {2BC11362-6CBD-4D52-A2D9-B5AEF5A8463C}
			{38820998-E6BD-479C-8BAE-36871A33F323} = {A7563191-8193-43B7-A771-525297E3D95C}
		EndGlobalSection
		GlobalSection(ExtensibilityGlobals) = postSolution
			SolutionGuid = {69766354-AE61-479C-B6D7-C8FFA3931E1F}
		EndGlobalSection
	EndGlobal
`
}