import { expandToString } from "langium/generate";
import { LocalEntity } from "../../../../../../language/generated/ast.js";

export function generateDeleteFeature(cls: LocalEntity): string {
    return expandToString`
cypress/e2e/step_definitions/delete${cls.name}.feature

Feature: Deletar ${cls.name}
    Background: Acessar a pagina de ${cls.name}
        Given Visito a pagina de ${cls.name}
        When Eu clico no botao de detalhes de ${cls.name}

    Scenario: Deletar ${cls.name} corretamente
        And Clico para deletar ${cls.name}
        And Clico para confirmar
        Then A mensagem de sucesso aparece
`
}

export function generateDelete(cls: LocalEntity): string {
    return expandToString`
cypress/e2e/step_definitions/delete${cls.name}/delete${cls.name}.ts

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import Index${cls.name} from '../../../pageObjects/Index${cls.name}';
import Details${cls.name} from '../../../pageObjects/Details${cls.name}';

Given('Visito a pagina de ${cls.name}', () => {
    Index${cls.name}.visitPage();
});

When('Eu clico no botao de detalhes de ${cls.name}', () => {
    Index${cls.name}.details${cls.name}();
});

And('Clico para deletar ${cls.name}', () => {
    Details${cls.name}.delete${cls.name}();
});

And('Clico para confirmar', () => {
    Details${cls.name}.confirmDelete${cls.name}();
});

Then('A mensagem de sucesso aparece', () => {
    Details${cls.name}.successMessage();
});`
}