import { LocalEntity, Model } from "../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, `${cls.name.toLowerCase()}.ts`), generateApi(model, cls))
}

function generateApi(model: Model, cls: LocalEntity) : string {
    return expandToString`
/**
 * arquivo de api trata da parte de requisicao e suas configuracoes
 */
import adminApi, { adminApiConfig } from '@/api/admin'
import type {
  ${cls.name},
  ${cls.name}CreateReq,
  ${cls.name}ListRes,
  ${cls.name}CreateRes,
  ${cls.name}GetRes,
  ${cls.name}UpdateRes,
  ${cls.name}DeleteRes,
} from '../types/${cls.name.toLowerCase()}.d.ts'

const ${cls.name.toLowerCase()}ReqConf = {
  baseURL: adminApiConfig.baseURL + '${cls.name.toLowerCase()}',
}

export const listar${cls.name} = async () => {
  return await adminApi.get<${cls.name}ListRes>('/', ${cls.name.toLowerCase()}ReqConf)
}

export const criar${cls.name} = async (${cls.name.toLowerCase()}: ${cls.name}CreateReq) => {
  return await adminApi.post<${cls.name}CreateRes>('/', ${cls.name.toLowerCase()}, ${cls.name.toLowerCase()}ReqConf)
}

export const obter${cls.name} = async (id: string) => {
  const { data } = await adminApi.get<${cls.name}GetRes>('/' + id, ${cls.name.toLowerCase()}ReqConf)
  return data.value[0]
}

export const atualizar${cls.name} = async (${cls.name.toLowerCase()}: ${cls.name}) => {
  return await adminApi.put<${cls.name}UpdateRes>('/' + ${cls.name.toLowerCase()}.Id, ${cls.name.toLowerCase()}, ${cls.name.toLowerCase()}ReqConf)
}

export const excluir${cls.name} = async (id: string) => {
  return await adminApi.delete<${cls.name}DeleteRes>('/' + id, ${cls.name.toLowerCase()}ReqConf)
}    
`
}