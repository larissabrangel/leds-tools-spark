import { expandToString } from "langium/generate";
import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, "dotnet-tools.json"), generateDotNetTools(model))

}

function generateDotNetTools(model: Model): string {
    return expandToString`
{
  "version": 1,
  "isRoot": true,
  "tools": {
    "dotnet-ef": {
      "version": "8.0.4",
      "commands": [
        "dotnet-ef"
      ]
    }
  }
}`
}
