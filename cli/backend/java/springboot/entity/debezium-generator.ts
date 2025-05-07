import path from 'path'
import fs from 'fs'
import { Configuration, Model, isLocalEntity, isModule } from '../../../../../language/generated/ast.js'
import { createPath } from '../../../../util/generator-utils.js'
import { Generated, expandToStringWithNL, toString } from 'langium/generate'

export function generateDebezium(model: Model, target_folder: string) {

    if (model.configuration){
  
        const name = model.configuration?.name?.toLowerCase() ?? "nodefined"

        // criando a pasta que salva o SQL
        const SQL_PATH = createPath(target_folder, "sql")
        fs.writeFileSync(path.join(SQL_PATH, 'debezium.sql'), toString(generateDebeziumSQL(model)))

        const REGISTER_PATH = createPath(target_folder, "register")
        fs.writeFileSync(path.join(REGISTER_PATH, name+'-register.json'), toString(generateDebeziumRegister(model.configuration)))
    }
}

function generateDebeziumSQL(model: Model): Generated{
    return expandToStringWithNL`
    ${model.abstractElements.filter(isModule).map(module => module.elements.filter(isLocalEntity).map(entity => !entity.is_abstract? `ALTER TABLE public.${entity.name.toLowerCase()}  REPLICA IDENTITY FULL;`: undefined).join('\n')).join('\n')}  
    `
  }

  function generateDebeziumRegister (configuration: Configuration): Generated{

    const name = configuration?.name?.toLowerCase() ?? "nodefined"


    return expandToStringWithNL`
    {
      "name": "${name}-connector",
      "config": {
          "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
          "tasks.max": "1",
          "database.hostname": "db-pg",
          "database.port": "5432",
          "database.user": "postgres",
          "database.password": "postgres",
          "database.dbname" : "${name}",
          "topic.prefix": "databases.${name}",
          "topic.partitions": 3,
          "schema.include.list": "public"
      }
  }
    
    `
  
  }
  