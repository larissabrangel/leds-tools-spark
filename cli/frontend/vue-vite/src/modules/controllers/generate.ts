import { LocalEntity, Model } from "../../../../../../language/generated/ast.js";
import fs from "fs"
import { expandToString } from "langium/generate";
import path from "path"

export function generate(model: Model, cls: LocalEntity, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, `${cls.name.toLowerCase()}.ts`), generateController(model, cls))
}

function generateController(model: Model, cls: LocalEntity) : string {
    return expandToString`
/**
 * arquivo controller trata da parte de erros e interface de usuario
 */
import {
  criar${cls.name} as _criar${cls.name},
  listar${cls.name} as _listar${cls.name},
  obter${cls.name} as _obter${cls.name},
  atualizar${cls.name} as _atualizar${cls.name},
  excluir${cls.name} as _excluir${cls.name},
} from '../api/${cls.name.toLowerCase()}'
import type { ${cls.name}, ${cls.name}CreateReq } from '../types/${cls.name.toLowerCase()}'
import { useUiStore } from '@/stores/ui'
import { AxiosError } from 'axios'

export const listar${cls.name} = async () => {
  try {
    const { data } = await _listar${cls.name}()
    return data.value
  } catch (error) {
    throw error
  }
}

export const criar${cls.name} = async (${cls.name.toLowerCase()}: ${cls.name}CreateReq) => {
  const ui = useUiStore()

  try {
    const { data } = await _criar${cls.name}(${cls.name.toLowerCase()})

    ui.exibirAlerta({
      text: data.message,
      color: 'success'
    })

    return true

  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.status === 400 &&
      error.response.data.errors
    ) {
      ui.exibirAlertas(
        error.response.data.errors
          .map((err: { mensagem: string }) => ({ text: err.mensagem, color: 'error' }))
      )

      return false

    } else {
      throw error
    }
  }
}

export const obter${cls.name} = async (id: string) => {
  try {
    const data = await _obter${cls.name}(id)
    return data
  } catch (error) {
    throw error
  }
}

export const atualizar${cls.name} = async (${cls.name.toLowerCase()}: ${cls.name}) => {
  try {
    const { data } = await _atualizar${cls.name}(${cls.name.toLowerCase()})
    return true
  } catch (error) {
    throw error
  }
}

export const excluir${cls.name} = async (id: string) => {
  try {
    const { data } = await _excluir${cls.name}(id)
    return true
  } catch (error) {
    throw error
  }
}

export const excluir${cls.name}s = async (ids: string[]) => {
  try {
    for (const id of ids) {
      const sucesso = await excluir${cls.name}(id)
    }
    return true
  } catch (error) {
    throw error
  }
}    
`
}