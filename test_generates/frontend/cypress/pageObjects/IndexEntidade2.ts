const URL = 'http://localhost:5173/Entidade2/IndexEntidade2';

const elements = {
    addEntidade2Btn: () => cy.get('input[name="CreateButton"]'),
    editEntidade2Btn: () => cy.get(':nth-child(1) > :nth-child(5) > .mdi-pencil') // acho q nao tem q mudar esse, pega o lapizinho de editar que aparece na tela
}

class IndexEntidade2{
    static visitPage() {
        cy.visit(URL);
    }

    static addEntidade2() {
        elements.addEntidade2Btn().click();
    }

    static editEntidade2() {
        elements.editEntidade2Btn().click();
    }
}

export default IndexEntidade2