const URL = 'http://localhost:5173/Entidade2/FormEntidade2';

const elements = {
    fieldEntidade2Nome: () => cy.get('input[name="Nome"]'),
    fieldEntidade2Verificacao: () => cy.get('input[name="Verificacao"]'),

    saveEntidade2Btn: () => cy.get('input[name="salvarEntidade2Btn"]'),
    cancelEntidade2Btn: () => cy.get('input[name="cancelarEntidade2Btn"]')
}

class FormEntidade2{
    static visitPage() {
      cy.visit(URL);
    };

    static fillAllFields(Nomevalue: string, Verificacaovalue: string) {
        this.fillFieldEntidade2Nome(Nomevalue);
        this.fillFieldEntidade2Verificacao(Verificacaovalue);

    };

    static editAllFields(Nomevalue: string, Verificacaovalue: string) {

        this.editFieldEntidade2Nome(Nomevalue);
        this.editFieldEntidade2Verificacao(Verificacaovalue);

    }


    static fillFieldEntidade2Nome(Nomevalue: string) {
        elements.fieldEntidade2Nome().type(Nomevalue);
    };

    static clearFieldEntidade2Nome() {
        elements.fieldEntidade2Nome().clear();
    };

    static editFieldEntidade2Nome(Nomevalue: string) {
        this.clearFieldEntidade2Nome();
        if (Nomevalue != '') {
            this.fillFieldEntidade2Nome(Nomevalue);
        };
    };

    static fillFieldEntidade2Verificacao(Verificacaovalue: string) {
        elements.fieldEntidade2Verificacao().type(Verificacaovalue);
    };

    static clearFieldEntidade2Verificacao() {
        elements.fieldEntidade2Verificacao().clear();
    };

    static editFieldEntidade2Verificacao(Verificacaovalue: string) {
        this.clearFieldEntidade2Verificacao();
        if (Verificacaovalue != '') {
            this.fillFieldEntidade2Verificacao(Verificacaovalue);
        };
    };


    static cancelEntidade2() {
        elements.cancelEntidade2Btn().click();
    }

    static saveEntidade2() {
        elements.saveEntidade2Btn().click();
    }

    static successMessage() {
        cy.contains('Salvo com sucesso');
    }

    static errorMessage() {
        cy.contains('Salvo com sucesso').should('not.exist');
    }
}

export default FormEntidade2