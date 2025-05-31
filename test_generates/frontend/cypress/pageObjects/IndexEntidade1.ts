const URL = 'http://localhost:5173/Entidade1/IndexEntidade1';

const elements = {
    addEntidade1Btn: () => cy.get('input[name="CreateButton"]'),
    editEntidade1Btn: () => cy.get(':nth-child(1) > :nth-child(5) > .mdi-pencil') // acho q nao tem q mudar esse, pega o lapizinho de editar que aparece na tela
}

class IndexEntidade1{
    static visitPage() {
        cy.visit(URL);
    }

    static addEntidade1() {
        elements.addEntidade1Btn().click();
    }

    static editEntidade1() {
        elements.editEntidade1Btn().click();
    }
}

export default IndexEntidade1