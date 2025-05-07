import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder,`DomainExceptionValidation.cs`), generateDomainException(model))
}

function generateDomainException(model: Model): string {
    return expandToStringWithNL`
namespace ${model.configuration?.name}.Domain.Validation
{
    public class DomainValidationException : Exception
    {
        public List<string> Errors { get; }

        public DomainValidationException(List<string> validationsErrors)
        {
            Errors = validationsErrors;
        }

        public override string ToString()
        {
            return string.Join(Environment.NewLine, Errors);
        }
    }
}`
}