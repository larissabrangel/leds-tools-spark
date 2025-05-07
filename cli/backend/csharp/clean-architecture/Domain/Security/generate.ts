import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateAccount } from "./Account/generate.js"
import { generate as generateShared } from "./Shared/generate.js"

export function generate(model: Model, target_folder: string) : void {
    
    const account_folder = target_folder + "/Account"
    const shared_folder = target_folder + "/Shared"

    fs.mkdirSync(account_folder, {recursive: true})
    fs.mkdirSync(shared_folder, {recursive: true})
    
    generateAccount(model, account_folder)
    generateShared(model, shared_folder)

}