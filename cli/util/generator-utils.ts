import path from "path";
import fs from 'fs'
import { AstNode } from "langium";
import { Entity, Model, Module, ModuleImport, isModel } from "../../language/generated/ast.js";

/**
 * Capitaliza uma string
 * 
 * @param str - String a ser capitalizada
 * @returns A string capitalizada
 */
export function capitalizeString(str: string) : string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Aplica `path.join` nos argumentos passados, e cria o caminho gerado caso não exista
 * 
 * @param args - Caminho para ser construído
 * @returns O caminho construído e normalizado, o mesmo retorno que `path.join(args)`
 */

export const ident_size = 4;
export const base_ident = ' '.repeat(ident_size);

export function createPath(...args: string[]) : string {
  const PATH = path.join(...args)
  if(!fs.existsSync(PATH)) {
    fs.mkdirSync(PATH, { recursive: true })
  }
  return PATH
}

/**
 * Ordena topologicamente um DAG.
 * 
 * Referência: https://en.wikipedia.org/wiki/Topological_sorting#Depth-first_search
 * @param nodes - Conjuntos de nós que denotam um grafo
 * @param fn - Função que recebe um nó `N` e retorna um iterável dos nós que PRECEDEM `N`.
 * Se a função for dos nós que devem suceder `N`, passe `reverse=true`
 * @param reverse - Booleano que define se a ordenação deve ser feita ao contrário.
 * Passe `reverse=true` se sua função `fn` retorna os sucessores do nó, ao invés dos antecessores
 * 
 * @returns Um array, contendo os nós de `nodes` ordenados topologicamente
 * 
 * @throws {Error} Se houver um ciclo em `nodes`, tornando a ordenação impossível
 */
export function topologicalSort<T extends AstNode>(nodes: Iterable<T>, fn: (a: T) => Iterable<T>, reverse?: boolean) : T[] {
  const permantent_marked = new Set<T>()
  const temporary_marked = new Set<T>()
  const ordering: T[] = []
  const visit = (node: T) => {
      if(permantent_marked.has(node)) {
          return
      }
      if(temporary_marked.has(node)) {
          throw new Error("Não foi possível ordenar topologicamente. Ciclo encontrado");
      }

      temporary_marked.add(node)
      for(const n of fn(node)) {
          visit(n)
      }
      temporary_marked.delete(node)

      permantent_marked.add(node)
      ordering.push(node)
  }

  for(const n of nodes) {
      visit(n)
  }

  return reverse ? ordering.reverse() : ordering
}

/**
* Checa se o nó de um grafo é parte de um ciclo.
* Apenas para grafos com grau de saída 1 ou menor em cada nó
* 
* Usando o algoritmo da Lebre e da Tartaruga (Floyd)
* 
* @param start_node Nó inicial
* @param sucessor_function Função que recebe um nó e retorna o nó sucessor, ou undefined caso não haja sucessor.
* Sempre que um nó não houver sucessor, não existe ciclo envolvendo esse nó
* @returns Um booleano, dizendo se foi encontrado ciclo
*/
export function cycleFinder<T extends AstNode>(
  start_node: T,
  sucessor_function: (node: T) => T | undefined
) : boolean {
  let hare:   T | undefined = start_node
  let turtle: T | undefined = start_node
  while(hare !== undefined && turtle !== undefined) {
      hare = sucessor_function(hare)
      if(hare === undefined) {
          break
      }
      hare   = sucessor_function(hare)
      turtle = sucessor_function(turtle)
      if(turtle === hare) {
          return true
      }
  }
  return false
}

/**
* Dado um Entity que tenha nome, retorna o qualified name completo
*/
export function getQualifiedName(e: Entity) : string {
  let qualified_name = e.name
  let parent: Module | ModuleImport | Model = e.$container
  while(!isModel(parent)) {
      qualified_name = `${parent.name}.${qualified_name}`
      parent = parent.$container
  }
  return qualified_name
}
