cypress/e2e/step_definitions/deleteEntidade2/deleteEntidade2.ts

import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import IndexEntidade2 from '../../../pageObjects/IndexEntidade2';
import DetailsEntidade2 from '../../../pageObjects/DetailsEntidade2';

Given('Visito a pagina de Entidade2', () => {
    IndexEntidade2.visitPage();
});

When('Eu clico no botao de detalhes de Entidade2', () => {
    IndexEntidade2.detailsEntidade2();
});

And('Clico para deletar Entidade2', () => {
    DetailsEntidade2.deleteEntidade2();
});

And('Clico para confirmar', () => {
    DetailsEntidade2.confirmDeleteEntidade2();
});

Then('A mensagem de sucesso aparece', () => {
    DetailsEntidade2.successMessage();
});