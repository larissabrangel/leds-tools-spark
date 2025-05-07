import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`ValueObject.cs`), generateValueObject(model))
}

function generateValueObject (model: Model): string {
    return expandToStringWithNL`
namespace ${model.configuration?.name}.Domain.Security.Shared.ValueObjects
{
    public abstract class ValueObject
    {

    }
}`
}