import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"
import { generate as generateEntities } from "./Entities/generate.js"
import { generate as generateValueObjects } from "./ValueObjects/generate.js"

export function generate(model: Model, target_folder: string) : void {
    
    const Entities_folder = target_folder + "/Entities"
    const ValueObjects_folder = target_folder + "/ValueObjects"

    fs.mkdirSync(Entities_folder, {recursive: true})
    fs.mkdirSync(ValueObjects_folder, {recursive: true})
    
    fs.writeFileSync(path.join(target_folder,`Configuration.cs`), generateConfiguration(model))
    generateEntities(model, Entities_folder)
    generateValueObjects(model, ValueObjects_folder)
}

function generateConfiguration(model: Model): string {
    return expandToStringWithNL`
namespace ${model.configuration?.name}.Domain.Security.Account
{
    public static class Configuration
    {
        public static SecretsConfiguration Secrets { get; set; } = new();
        public static EmailConfiguration Email { get; set; } = new();

        public class EmailConfiguration
        {
            public string DefaultFromEmail { get; set; } = string.Empty;
            public string ApiKey { get; set; } = string.Empty;
        }

        public class SecretsConfiguration
        {
            public string ApiKey { get; set; } = string.Empty;
            public string JwtPrivateKey { get; set; } = string.Empty;
            public string PasswordSaltKey { get; set; } = string.Empty;
        }
    }
}`
}