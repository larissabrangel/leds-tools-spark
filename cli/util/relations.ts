import { LocalEntity, isLocalEntity } from "../../language/generated/ast.js"


export type RelationInfo = {
  tgt: LocalEntity,
  card: RelationType,
  owner: boolean
}
type RelationType = 'OneToMany' | 'OneToOne' | 'ManyToOne' | 'ManyToMany'
 
function revert_card(card: RelationType) : RelationType {
  switch(card) {
  case 'OneToOne':
    return 'OneToOne'
  case 'OneToMany':
    return 'ManyToOne'
  case 'ManyToOne':
    return 'OneToMany'
  case 'ManyToMany':
    return 'ManyToMany'
  }
}

/**
 * Dado um módulo, lê todas as relações internas dele,
 * retornando um mapa que mapeia um Class para a lista
 * de {alvo, cardinalidade e ownership} de suas relações
 */
export function processRelations(
  localEntities: LocalEntity[]
) : Map<LocalEntity, RelationInfo[]> {
  // Inicializa o mapa com listas vazias
  const map: Map<LocalEntity, RelationInfo[]> = new Map()

  for(const cls of localEntities) {
    map.set(cls, new Array())
  }
  
  const add_relation = (owner: LocalEntity, non_owner: LocalEntity, card_name: RelationType) => {
    map.get(owner)?.push({
      tgt: non_owner,
      card: card_name,
      owner: true
    })
    map.get(non_owner)?.push({
      tgt: owner,
      card: revert_card(card_name),
      owner: false
    })
  }
   
  for(const entity of localEntities) {
    
    
    for (const relationship of entity.relations){
        
        if (isLocalEntity(relationship.type.ref)){
          if(relationship.$type === "OneToMany") {
            add_relation(relationship.type.ref, entity, "ManyToOne")
          } else {
            add_relation(entity, relationship.type.ref, relationship.$type)
          }
        }
    }
  }

  return map
}
