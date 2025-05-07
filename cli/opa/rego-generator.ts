import { expandToString } from "langium/generate";
import { isUseCase, isUseCasesModel, Model, UseCase } from "../../language/generated/ast.js"
import fs from "fs";
import path from "path";

export function generateRego(model: Model, target_folder: string) : void {

    const useCaseModels = model.abstractElements.filter(isUseCasesModel);
    const useCases = useCaseModels.flatMap(useCasemodel => useCasemodel.elements.filter(isUseCase))
    useCases.forEach(useCase => fs.writeFileSync(path.join(target_folder, `${useCase.id?.toLocaleLowerCase()}.rego`), generatePolicy(useCase)));

}

function generatePolicy(useCase: UseCase) : string {
    return expandToString`
package ${useCase.id?.toLocaleLowerCase()}.authz

default allow = false

allow {
    startswith(input.path, "/swagger")
}

allow {
    startswith(input.path, "/auth")
}

allow {
    startswith(input.path, "/${useCase.id?.toLocaleLowerCase()}")
    ${useCase.events.map(event => `startswith(input.path, "/${event.id.toLocaleLowerCase()}")`).join('\n')}
    ${useCase.actors.map(actor => `input.user.role == "${actor.ref?.id}"`).join('\n')}
}
`
}