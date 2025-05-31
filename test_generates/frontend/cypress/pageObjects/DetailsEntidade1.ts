const URL = 'http://localhost:5173/Entidade1/DetailsEntidade1';

const elements = {
    deleteEntidade1Btn: () => cy.get('input[name="DeleteButton"]'),
    confirmDeleteEntidade1Btn: () => cy.get('input[name="confirmDeleteButton"]')
}

class FormEntidade1{
    static visitPage() {
      cy.visit(URL);
    };

    static deleteEntidade1() {
        elements.deleteEntidade1Btn().click();
    }

    static confirmDeleteEntidade1() {
        elements.confirmDeleteEntidade1Btn().click();
    }

    static completeDeleteEntidade1() {
        this.deleteEntidade1Btn();
        this.confirmDeleteEntidade1Btn();
    }

    static successMessage() {
        cy.contains('Deletado com sucesso');
    }
}

export default DetailsEntidade1