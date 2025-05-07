import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, "IService.cs"),genrateIservice(model))
}

function genrateIservice(model: Model) : string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Application.Security.Interfaces
{
    public interface IService
    {
        Task SendVerificationEmailAsync(User user, CancellationToken cancellationToken);
        Task SendResetPasswordAsync(User user, CancellationToken cancellationToken);
    }
}`
}