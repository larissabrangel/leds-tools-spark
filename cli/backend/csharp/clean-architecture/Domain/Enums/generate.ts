import { expandToString } from "langium/generate";
import { EnumX, Model, isEnumX, isModule } from "../../../../../../language/generated/ast.js";
import path from "path";
import fs from "fs";
import { capitalizeString } from "../../../../../util/generator-utils.js";

export function generate(model: Model, target_folder: string) {
    const modules =  model.abstractElements.filter(isModule);
    const package_name = model.configuration?.name || "default"
    fs.writeFileSync(path.join(target_folder,`baseEnum.cs`), createBaseEnum(package_name))
    for(const mod of modules) {
        for (const enumx of mod.elements.filter(isEnumX)){
            fs.writeFileSync(path.join(target_folder,`${enumx.name}.cs`), createEnum(enumx,package_name))
        }
    }
}

function createEnum(enumx:EnumX, package_name: string) : string {
    return expandToString`
namespace ${package_name}.Domain.Enums
{
    public enum ${enumx.name} {
        ${enumx.attributes.map(a => `${capitalizeString(a.name)}` ).join(",\n")}
    }
}
`
}

function createBaseEnum(package_name: string) : string {
    return expandToString`
namespace ${package_name}.Domain.Enums
{
    public enum Base {}
}`
}