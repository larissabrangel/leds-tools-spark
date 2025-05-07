grammar SPARK

import 'config'
import 'entities'
import 'usescases'

entry Model:
    (configuration=Configuration)?
    (abstractElements+=(AbstractElement | ModuleImport | UseCasesModel))*
;

AbstractElement:
    Module | EnumX
;

UseCaseElements:
    UseCase | Actor
;

Module:
    (Comment)?
    'module' name=QualifiedName '{'
        (elements+=(AbstractElement | LocalEntity))*
    (Comment)?
    '}'
    (Comment)?
;

// Definição do Modelo de Casos de Uso
UseCasesModel:
    (Comment)?
    'usmodel' id=QualifiedName '{'
        (elements+=UseCaseElements)*
    '}'
    (Comment)?
;