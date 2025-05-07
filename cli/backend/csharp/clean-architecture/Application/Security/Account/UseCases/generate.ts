import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import { generate as generateAuthenticate } from "./Authenticate/generate.js"
import { generate as generateChangePassword } from "./ChangePassword/generator.js"
import { generate as generateCreate } from "./Create/generate.js"
import { generate as generateRefreshToken } from "./RefreshToken/generate.js"
import { generate as generateSaveRefreshToken } from "./SaveRefreshToken/generate.js"
import { generate as generateSendResetPassword } from "./SendResetPassword/generate.js"
import { generate as generateVerify } from "./Verify/generate.js"

export function generate(model: Model, target_folder: string) : void {
    
    const Authenticate_folder = target_folder + "/Authenticate"
    const ChangePassword_folder = target_folder + "/ChangePassword"
    const Create_folder = target_folder + "/Create"
    const RefreshToken_folder = target_folder + "/RefreshToken"
    const SaveRefreshToken_folder = target_folder + "/SaveRefreshToken"
    const SendResetPassword_folder = target_folder + "/SendResetPassword"
    const Verify_folder = target_folder + "/Verify"

    fs.mkdirSync(Authenticate_folder, {recursive: true})
    fs.mkdirSync(ChangePassword_folder, {recursive: true})
    fs.mkdirSync(Create_folder, {recursive: true})
    fs.mkdirSync(RefreshToken_folder, {recursive: true})
    fs.mkdirSync(SaveRefreshToken_folder, {recursive: true})
    fs.mkdirSync(SendResetPassword_folder, {recursive: true})
    fs.mkdirSync(Verify_folder, {recursive: true})

    generateAuthenticate(model, Authenticate_folder)
    generateChangePassword(model, ChangePassword_folder)
    generateCreate(model, Create_folder)
    generateRefreshToken(model, RefreshToken_folder)
    generateSaveRefreshToken(model, SaveRefreshToken_folder)
    generateSendResetPassword(model, SendResetPassword_folder)
    generateVerify(model, Verify_folder)

}