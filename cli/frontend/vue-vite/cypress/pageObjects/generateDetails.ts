import { expandToString } from "langium/generate";
import { LocalEntity } from "../../../../../language/generated/ast.js";

export function generate(cls: LocalEntity): string {
    const details = generateDetails(cls);
    return details
}

function generateDetails(cls: LocalEntity): string {
    return expandToString`
const URL = 'http://localhost:5173/${cls.name}/Details${cls.name}';

const elements = {
    delete${cls.name}Btn: () => cy.get('input[name="DeleteButton"]'),
    confirmDelete${cls.name}Btn: () => cy.get('input[name="confirmDeleteButton"]')
}

class Form${cls.name}{
    static visitPage() {
      cy.visit(URL);
    };

    static delete${cls.name}() {
        elements.delete${cls.name}Btn().click();
    }

    static confirmDelete${cls.name}() {
        elements.confirmDelete${cls.name}Btn().click();
    }

    static completeDelete${cls.name}() {
        this.delete${cls.name}Btn();
        this.confirmDelete${cls.name}Btn();
    }

    static successMessage() {
        cy.contains('Deletado com sucesso');
    }
}

export default Details${cls.name}`
}