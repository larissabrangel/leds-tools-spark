import { Model } from "../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, 'ui.ts'), generateUi(model, target_folder))
}

function generateUi(model: Model, target_folder: string) : string {
    return expandToString`
import type { InjectionKey, Ref } from "vue";



export const chaveModal = Symbol() as InjectionKey<{
  estaAberto: Readonly<Ref<boolean, boolean>>;
  abrirModal: (novoTexto?: string) => void;
  fecharModal: () => void;
}>
`
}