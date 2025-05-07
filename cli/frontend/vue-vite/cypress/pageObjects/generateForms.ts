import { expandToString } from "langium/generate";
import { Attribute, LocalEntity } from "../../../../../language/generated/ast.js";
import { capitalizeString } from "../../../../util/generator-utils.js";

export function generate(cls: LocalEntity): string {
    let fillFields = ""
    let editFields = ""
    let Fields =  ""
    let FieldFunctions = ""
    let attribute = ""

    for (const attr of cls.attributes) {
        fillFields += `this.fillField${cls.name}${capitalizeString(attr.name)}(${capitalizeString(attr.name)}value); \n`
        editFields += `this.editField${cls.name}${capitalizeString(attr.name)}(${capitalizeString(attr.name)}value); \n`
        Fields += `field${cls.name}${capitalizeString(attr.name)}: () => cy.get('input[name="${capitalizeString(attr.name)}"]'), \n`
        attribute += `${capitalizeString(attr.name)}value: ${generateTypeAttribute(attr)}, `
        FieldFunctions += `
static fillField${cls.name}${capitalizeString(attr.name)}(${capitalizeString(attr.name)}value: ${generateTypeAttribute(attr)}) {
    elements.field${cls.name}${capitalizeString(attr.name)}().type(${capitalizeString(attr.name)}value);
};

static clearField${cls.name}${capitalizeString(attr.name)}() {
    elements.field${cls.name}${capitalizeString(attr.name)}().clear();
};

static editField${cls.name}${capitalizeString(attr.name)}(${capitalizeString(attr.name)}value: ${generateTypeAttribute(attr)}) {
    this.clearField${cls.name}${capitalizeString(attr.name)}();
    if (${capitalizeString(attr.name)}value != '') {
        this.fillField${cls.name}${capitalizeString(attr.name)}(${capitalizeString(attr.name)}value);
    };
}; \n`
    }
    const attributes = attribute.slice(0, attribute.lastIndexOf(','))
    const index = generateIndexText(cls, fillFields, editFields, Fields, FieldFunctions, attributes);
    return index
}

function generateIndexText(cls: LocalEntity, fillFields: string, editFields: string, Fields: string, FieldFunctions: string, attributes: string): string {
    return expandToString`
const URL = 'http://localhost:5173/${cls.name}/Form${cls.name}';

const elements = {
    ${Fields}
    save${cls.name}Btn: () => cy.get('input[name="salvar${cls.name}Btn"]'),
    cancel${cls.name}Btn: () => cy.get('input[name="cancelar${cls.name}Btn"]')
}

class Form${cls.name}{
    static visitPage() {
      cy.visit(URL);
    };

    static fillAllFields(${attributes}) {
        ${fillFields}
    };

    static editAllFields(${attributes}) {

        ${editFields}
    }

    ${FieldFunctions}

    static cancel${cls.name}() {
        elements.cancel${cls.name}Btn().click();
    }

    static save${cls.name}() {
        elements.save${cls.name}Btn().click();
    }

    static successMessage() {
        cy.contains('Salvo com sucesso');
    }

    static errorMessage() {
        cy.contains('Salvo com sucesso').should('not.exist');
    }
}

export default Form${cls.name}`
}

function generateTypeAttribute(attribute:Attribute): string{

    if (attribute.type.toString().toLowerCase() === "date"){
        return "Date"
    }
    if (attribute.type.toString().toLowerCase() === "datetime"){
        return "Date"
    }
    if (attribute.type.toString().toLowerCase() === "integer"){
        return "number"
    }
    return "string"

}