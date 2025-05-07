import { expandToString } from "langium/generate";
import { LocalEntity } from "../../../../../language/generated/ast.js";

export function generate(cls: LocalEntity): string {
    const index = generateIndexText(cls);
    return index
}

function generateIndexText(cls: LocalEntity): string {
    return expandToString`
const URL = 'http://localhost:5173/${cls.name}/Index${cls.name}';

const elements = {
    add${cls.name}Btn: () => cy.get('input[name="CreateButton"]'),
    edit${cls.name}Btn: () => cy.get(':nth-child(1) > :nth-child(5) > .mdi-pencil') // acho q nao tem q mudar esse, pega o lapizinho de editar que aparece na tela
}

class Index${cls.name}{
    static visitPage() {
        cy.visit(URL);
    }

    static add${cls.name}() {
        elements.add${cls.name}Btn().click();
    }

    static edit${cls.name}() {
        elements.edit${cls.name}Btn().click();
    }
}

export default Index${cls.name}`
}