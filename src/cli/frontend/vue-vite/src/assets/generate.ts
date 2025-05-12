import { Model } from "../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'logo.png'), generatePng(model, target_folder))
    fs.writeFileSync(path.join(target_folder, 'logo.svg'), generateSvg(model, target_folder))

    fs.writeFileSync(path.join(target_folder, 'style.css'), generateStyle(model, target_folder))
}

function generatePng(model: Model, target_folder: string) : string {
    return expandToString`

`
}

function generateSvg(model: Model, target_folder: string) : string {
    return expandToString`

`
}

function generateStyle(model: Model, target_folder: string) : string {
    return expandToString`
@import "tailwindcss";
`
}