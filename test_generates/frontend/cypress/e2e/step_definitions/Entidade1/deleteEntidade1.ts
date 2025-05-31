cypress/e2e/step_definitions/deleteEntidade1/deleteEntidade1.ts

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import IndexEntidade1 from '../../../pageObjects/IndexEntidade1';
import DetailsEntidade1 from '../../../pageObjects/DetailsEntidade1';

Given('Visito a pagina de Entidade1', () => {
    IndexEntidade1.visitPage();
});

When('Eu clico no botao de detalhes de Entidade1', () => {
    IndexEntidade1.detailsEntidade1();
});

And('Clico para deletar Entidade1', () => {
    DetailsEntidade1.deleteEntidade1();
});

And('Clico para confirmar', () => {
    DetailsEntidade1.confirmDeleteEntidade1();
});

Then('A mensagem de sucesso aparece', () => {
    DetailsEntidade1.successMessage();
});