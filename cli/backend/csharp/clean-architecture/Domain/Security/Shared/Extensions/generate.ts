import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`StringExtension.cs`), generateExtension(model))
}

function generateExtension (model: Model): string {
    return expandToStringWithNL`
using System.Text;

namespace ${model.configuration?.name}.Domain.Security.Shared.Extensions
{
    public static class StringExtension
    {
        public static string ToBase64(this string text) => Convert.ToBase64String(Encoding.ASCII.GetBytes(text));
    }
}`
}