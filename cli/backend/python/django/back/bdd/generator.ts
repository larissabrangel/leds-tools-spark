import path from 'path'
import fs from 'fs'
import { LocalEntity, Model, isLocalEntity, isModule } from '../../../../../../language/generated/ast.js'
import { createPath } from '../../../../../util/generator-utils.js'
import { Generated, expandToStringWithNL, toString } from 'langium/generate'


export function generate(app: Model, target_folder: string) : void {
    const BASE_PATH = createPath(target_folder, "backend")
    const FEATURES_PATH = createPath(BASE_PATH, "features")
    const STEPS_PATH = createPath(FEATURES_PATH, "steps")

    fs.writeFileSync(path.join(STEPS_PATH, "README.md"), "")

    for(const m of app.abstractElements.filter(isModule)) {
        for(const e of m.elements.filter(isLocalEntity).filter(e => !e.is_abstract)) {
            fs.writeFileSync(path.join(FEATURES_PATH, `${m.name}_${e.name}.feature`), toString(generate_feature_file(e)))
            // fs.writeFileSync(path.join(STEPS_PATH, `${m.name}_${e.name}_steps.py`), generateSteps(e))
        }
    }
}

function generate_feature_file(e: LocalEntity) : Generated {
    return expandToStringWithNL`
        Feature: Gerenciar ${e.name}

        Scenario Outline: Eu, como Usuário Autenticado, quero cadastrar um(a) ${e.name}

        Given Eu sou Usuário Autenticado
        And preenchi os seguintes campos:
        |Campo 1|
        |Campo 2|
        |Campo 3|
        |Campo 4|

        When os dados foram enviados para backend
        Then o sistema responde com o <status> e a seguinte <mensagem>

        Example:
        |Status |mensagem                      |
        |Sucesso|Cadastro realizado com sucesso|
        |Error  |Cadastro Não Realizado        | 


        Scenario Outline: Eu, como Usuário Autenticado, quero atualizar a ${e.name}

        Given Eu sou Usuário Autenticado
        And selecionei uma instancia da entidade
        And atualizei um dos seguintes campos:
        |Campo 1|
        |Campo 2|
        |Campo 3|
        |Campo 4|

        When os dados foram enviados para backend
        Then o sistema responde com o <status> e a seguinte <mensagem>

        Example:
        |Status |mensagem                          |
        |Sucesso|Atualizado com sucesso com sucesso|
        |Error  |Não Atualizado                    |

        Scenario Outline: Eu, como Usuário Autenticado, quero deleter a <entidade>

        Given Eu sou Usuário Autenticado
        And selecionei uma instancia da entidade
        When os dados foram enviados para backend
        Then o sistema responde com o <status> e a seguinte <mensagem>

        Example:
        |Status |mensagem                        |
        |Sucesso|Deletado com sucesso com sucesso|
        |Error  |Não Deletado                    |


        Scenario Outline: Eu, como Usuário Autenticado, quero buscar a ${e.name}

        Given Eu sou Usuário Autenticado
        And selecionei uma instancia da entidade
        When os dados foram enviados para backend
        Then o sistema responde com o <status> e a seguinte <mensagem>

        Example:
        |Status |mensagem               |
        |Sucesso|Retorna a entidade     |
        |Error  |Entidade não encontrada|


        Scenario Outline: Eu, como Usuário Autenticado, quero buscar a ${e.name}

        Given Eu sou Usuário Autenticado
        And quero buscar todas as entidades
        When os dados foram enviados para backend
        Then o sistema responde com o <status> e a seguinte <mensagem>

        Example:
        |Status |mensagem          |
        |Sucesso|Retorna a entidade|
    `
}
