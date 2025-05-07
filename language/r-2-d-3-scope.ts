import { AstNode, AstNodeDescription, DefaultScopeComputation, LangiumDocument } from "langium";
import { CancellationToken } from "vscode-languageclient";
import { Model, isActor, isLocalEntity, isModule, isModuleImport, isUseCasesModel } from "./generated/ast.js";

/**
 * Gerador customizado para o escopo global do arquivo.
 * Por padrão, o escopo global só contém os filhos do nó raiz,
 * mas é do nosso interesse que as ImportedEntity (filhas de nós ModuleImport)
 * sejam acessíveis globalmente
 */
export class CustomScopeComputation extends DefaultScopeComputation {
    override async computeExports(document: LangiumDocument<AstNode>, cancelToken?: CancellationToken | undefined): Promise<AstNodeDescription[]> {
        // Nós que normalmente estariam no escopo global
        const default_global = await super.computeExports(document, cancelToken);

        // Obter o nó raiz do documento (esperado ser um Model)
        const root = document.parseResult.value as Model;

        // Colocar no escopo global todas as ImportedEntity de todos os ModuleImport
        root.abstractElements.filter(isModuleImport).map(k =>
            k.entities.map(e =>
                this.exportNode(e, default_global, document)
            )
        );

        // Colocar no escopo global todas as LocalEntity de todos os Module com o nome qualificado
        const entities = root.abstractElements.filter(isModule).flatMap(m =>
            m.elements.filter(isLocalEntity).map(e =>
                this.descriptions.createDescription(e, `${e.$container.name}.${e.name}`, document)
            )
        );

        // Colocar no escopo global todos os Actors de todos os UseCasesModel
        const actors = root.abstractElements.filter(isUseCasesModel).flatMap(ucm =>
            ucm.elements.filter(isActor).map(actor =>
                this.descriptions.createDescription(actor, `${ucm.id}.${actor.id}`, document)
            )
        );

        // Retornar o escopo global contendo as entidades e atores
        return default_global.concat(entities).concat(actors);
    }
}