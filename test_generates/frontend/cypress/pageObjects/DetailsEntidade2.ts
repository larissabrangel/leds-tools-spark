const URL = 'http://localhost:5173/Entidade2/DetailsEntidade2';

const elements = {
    deleteEntidade2Btn: () => cy.get('input[name="DeleteButton"]'),
    confirmDeleteEntidade2Btn: () => cy.get('input[name="confirmDeleteButton"]')
}

class FormEntidade2{
    static visitPage() {
      cy.visit(URL);
    };

    static deleteEntidade2() {
        elements.deleteEntidade2Btn().click();
    }

    static confirmDeleteEntidade2() {
        elements.confirmDeleteEntidade2Btn().click();
    }

    static completeDeleteEntidade2() {
        this.deleteEntidade2Btn();
        this.confirmDeleteEntidade2Btn();
    }

    static successMessage() {
        cy.contains('Deletado com sucesso');
    }
}

export default DetailsEntidade2