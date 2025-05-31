cypress/e2e/step_definitions/deleteEntidade2.feature

Feature: Deletar Entidade2
    Background: Acessar a pagina de Entidade2
        Given Visito a pagina de Entidade2
        When Eu clico no botao de detalhes de Entidade2

    Scenario: Deletar Entidade2 corretamente
        And Clico para deletar Entidade2
        And Clico para confirmar
        Then A mensagem de sucesso aparece