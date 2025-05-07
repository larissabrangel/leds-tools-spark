import { Model } from "../../../../language/generated/ast.js"
import fs from "fs";
import { createPath } from "../../../util/generator-utils.js";
import { generate as generatePageObjects } from "./pageObjects/generate.js";
import { generate as generatee2e } from "./e2e/generate.js";

export function generate(model: Model, target_folder: string) : void {

    const cypress_folder = createPath(target_folder, "cypress")
    const pageObjects_folder = createPath(cypress_folder, "pageObjects")
    const e2e_folder = createPath(cypress_folder, "e2e")

    fs.mkdirSync(cypress_folder, {recursive:true})
    fs.mkdirSync(pageObjects_folder, {recursive:true})
    fs.mkdirSync(e2e_folder, {recursive:true})

    generatePageObjects(model, pageObjects_folder);
    generatee2e(model, e2e_folder);
}

