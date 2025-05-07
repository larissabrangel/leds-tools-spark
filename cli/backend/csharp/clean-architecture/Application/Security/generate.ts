import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import {generate as generateInterfaces} from "./Interfaces/generate.js"
import {generate as generateServices} from "./Services/generate.js"
import {generate as generateShared} from "./Shared/UseCases/generate.js"
import {generate as generateAccount} from "./Account/UseCases/generate.js"
export function generate(model: Model, target_folder: string) : void {
    
    const Account_folder = target_folder + "/Account/UseCases"
    const Interface_folder = target_folder + "/Interfaces"
    const Services_folder = target_folder + "/Services"
    const Shared_folder = target_folder + "/Shared/UseCases"

    fs.mkdirSync(Account_folder, {recursive: true})
    fs.mkdirSync(Interface_folder, {recursive: true})
    fs.mkdirSync(Services_folder, {recursive: true})
    fs.mkdirSync(Shared_folder, {recursive: true})

    generateInterfaces(model, Interface_folder)
    generateServices(model, Services_folder)
    generateShared(model, Shared_folder)
    generateAccount(model, Account_folder)

}