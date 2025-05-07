import {Model } from "../../language/generated/ast.js"
import fs from "fs";
import { createPath } from "../util/generator-utils.js";
import { generateRego } from "./rego-generator.js"
import { generateCompose } from "./compose-generator.js"

export function generate(model: Model, target_folder: string) : void {

    const target_folder_opa = createPath(target_folder, "opa")
    const target_folder_policies = createPath(target_folder_opa, "policies")
    //creating folders
    fs.mkdirSync(target_folder_opa, {recursive:true})
    fs.mkdirSync(target_folder_policies, {recursive:true})

    generateRego(model, target_folder_policies)
    generateCompose(target_folder_opa)
}