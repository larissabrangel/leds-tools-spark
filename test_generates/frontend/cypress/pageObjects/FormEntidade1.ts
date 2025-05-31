const URL = 'http://localhost:5173/Entidade1/FormEntidade1';

const elements = {
    fieldEntidade1Nome: () => cy.get('input[name="Nome"]'),
    fieldEntidade1Numero: () => cy.get('input[name="Numero"]'),

    saveEntidade1Btn: () => cy.get('input[name="salvarEntidade1Btn"]'),
    cancelEntidade1Btn: () => cy.get('input[name="cancelarEntidade1Btn"]')
}

class FormEntidade1{
    static visitPage() {
      cy.visit(URL);
    };

    static fillAllFields(Nomevalue: string, Numerovalue: number) {
        this.fillFieldEntidade1Nome(Nomevalue);
        this.fillFieldEntidade1Numero(Numerovalue);

    };

    static editAllFields(Nomevalue: string, Numerovalue: number) {

        this.editFieldEntidade1Nome(Nomevalue);
        this.editFieldEntidade1Numero(Numerovalue);

    }


    static fillFieldEntidade1Nome(Nomevalue: string) {
        elements.fieldEntidade1Nome().type(Nomevalue);
    };

    static clearFieldEntidade1Nome() {
        elements.fieldEntidade1Nome().clear();
    };

    static editFieldEntidade1Nome(Nomevalue: string) {
        this.clearFieldEntidade1Nome();
        if (Nomevalue != '') {
            this.fillFieldEntidade1Nome(Nomevalue);
        };
    };

    static fillFieldEntidade1Numero(Numerovalue: number) {
        elements.fieldEntidade1Numero().type(Numerovalue);
    };

    static clearFieldEntidade1Numero() {
        elements.fieldEntidade1Numero().clear();
    };

    static editFieldEntidade1Numero(Numerovalue: number) {
        this.clearFieldEntidade1Numero();
        if (Numerovalue != '') {
            this.fillFieldEntidade1Numero(Numerovalue);
        };
    };


    static cancelEntidade1() {
        elements.cancelEntidade1Btn().click();
    }

    static saveEntidade1() {
        elements.saveEntidade1Btn().click();
    }

    static successMessage() {
        cy.contains('Salvo com sucesso');
    }

    static errorMessage() {
        cy.contains('Salvo com sucesso').should('not.exist');
    }
}

export default FormEntidade1