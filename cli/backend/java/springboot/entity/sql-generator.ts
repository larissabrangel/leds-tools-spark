import path from 'path'
import fs from 'fs'
import { createPath } from '../../../../util/generator-utils.js';
import { Attribute, LocalEntity, Model, isLocalEntity, isModule } from '../../../../../language/generated/ast.js';
import { Generated, expandToString, expandToStringWithNL, toString } from 'langium/generate';

export function generateSchemaSQLHelper(model: Model, target_folder: string) {

    if (model.configuration){
        // criando a pasta que salva o SQL
        const SQL_PATH = createPath(target_folder, "sql")
        fs.writeFileSync(path.join(SQL_PATH, 'sql_unique_constrains.sql'), toString(generateSQL(model)))
        
    }
}

function generateSQLCommand (entity: LocalEntity ): Generated {
  
  var atributesUnique: Array<Attribute> = [];
  
  for (const attribute of entity.attributes){
    if (attribute?.unique && !entity.is_abstract){
      atributesUnique.push (attribute);
    }
  }
  if (atributesUnique.length ){
    return  expandToString`
  ALTER TABLE public.${entity.name.toLowerCase()} ADD CONSTRAINT ${entity.name.toLowerCase()}_unique_constrain UNIQUE (${atributesUnique.map(a => `${a.name}`).join(`,`)});
  `
  }
  return undefined
  
}



function generateSQL(model:Model): Generated{
    return expandToStringWithNL`
    ${model.abstractElements.filter(isModule).map(module => module.elements.filter(isLocalEntity).map(entity => generateSQLCommand(entity)).join('\n')).join('\n')}  
    `
}

  