import { expandToString } from "langium/generate";
import { EnumX } from "../../../../../language/generated/ast.js";

export function generateEnum(enumx: EnumX, package_name: string) : string {
  

  return expandToString`
    public enum ${enumx.name} {
        ${enumx.attributes.map(a => `${a.name.toUpperCase()}` ).join(",\n")}
    }
  `;
}