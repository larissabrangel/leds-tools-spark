cypress/e2e/step_definitions/deleteEntidade1.feature

Feature: Deletar Entidade1
    Background: Acessar a pagina de Entidade1
        Given Visito a pagina de Entidade1
        When Eu clico no botao de detalhes de Entidade1

    Scenario: Deletar Entidade1 corretamente
        And Clico para deletar Entidade1
        And Clico para confirmar
        Then A mensagem de sucesso aparece