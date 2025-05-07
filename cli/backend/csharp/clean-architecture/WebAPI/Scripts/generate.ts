import path from "path"
import { Model, isLocalEntity, isModule } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { expandToString } from "langium/generate";

export function generate(model: Model, target_folder: string) : void {

    const modules =  model.abstractElements.filter(isModule);
    let alternocheck = ""
    let deletefrom = ""
    let altercheck = ""
    
    for(const mod of modules) {
        for(const cls of mod.elements.filter(isLocalEntity)) {
            alternocheck += `ALTER TABLE ${cls.name} NOCHECK CONSTRAINT ALL;\n`
            deletefrom += `DELETE FROM ${cls.name};\n`
            altercheck += `ALTER TABLE ${cls.name} WITH CHECK CHECK CONSTRAINT ALL;\n`
        }
        
    }
    fs.writeFileSync(path.join(target_folder, "delete.sql"), generatedeletes(alternocheck, deletefrom, altercheck));
    fs.writeFileSync(path.join(target_folder, "killdataase.sql"), generateKillDatabase(model));

}

function generatedeletes(alternocheck: string, deletefrom: string, altercheck: string) : string {
    return expandToString`
-- Desabilitar constraints de chave estrangeira
${alternocheck}
-- Deletar dados das tabelas
${deletefrom}
-- Habilitar constraints de chave estrangeira
${altercheck}`
}

function generateKillDatabase(model: Model): string {
    return expandToString`
USE [master];

DECLARE @kill varchar(8000) = '';  
SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';'  
FROM sys.dm_exec_sessions
WHERE database_id  = db_id('${model.configuration?.database_name || "database_id"}')

EXEC(@kill);

DROP DATABASE [${model.configuration?.database_name || "database_id"}]`
}