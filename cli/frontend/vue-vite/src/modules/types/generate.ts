import { LocalEntity, Model } from "../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, `${cls.name.toLowerCase()}.d.ts`), generateType(model, cls))
}

function generateType(model: Model, cls: LocalEntity) : string {
    return expandToString`
export type ${cls.name} = {
  ${generateAttributes(model, cls)}
}

export type ${cls.name}CreateReq = Pick<${cls.name}, ${generateAttributesToPick(model, cls)}>


export type ${cls.name}ListRes = {
  "@odata.context": string
  value: ${cls.name}[]
}

export type ${cls.name}CreateRes = {
  statusCode: number
  uri: string
  message: string
}

export type ${cls.name}GetRes = ${cls.name}ListRes


export type ${cls.name}UpdateRes = {
  statusCode: number
  message: string
}

export type ${cls.name}DeleteRes = ${cls.name}UpdateRes
`
}

function generateAttributes(model: Model, cls: LocalEntity) : string{
    var str = ""

    for (const attr of cls.attributes) {
        str = str.concat(`${attr.name} : ${attr.type}\n`)
    }

    str = str.concat(`Id : string\n`)

    return str
}

function generateAttributesToPick(model: Model, cls: LocalEntity) : string {
    var str = ""
    for (const attr of cls.attributes) {
        if (cls.attributes.indexOf(attr) + 1 == cls.attributes.length) {
            str = str.concat(`"${attr.name}"`)
        }
        else {
            str = str.concat(`"${attr.name}" | `)
        }
    }
    return str
}