import type { NamedAstNode, ValidationAcceptor, ValidationChecks } from 'langium';
import { isLocalEntity, type LocalEntity, type SPARKAstType } from './generated/ast.js';
import type { SPARKServices } from './s-p-a-r-k-module.js';
import { cycleFinder } from '../cli/util/generator-utils.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SPARKServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SPARKValidator;
    const checks: ValidationChecks<SPARKAstType> = {
        Module: validator.checkNameIsCamelCase,
        LocalEntity: [
            validator.checkNameIsCamelCase,
            validator.checkAbstractEntityExtendsAbstract,
            validator.checkCyclicExtensions
        ],
        Attribute: validator.checkBoth,
        AttributeEnum: validator.checkNameIsCamelCase
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SPARKValidator {

    // Não consegui encontrar o elemento pra definir a verificação por linguagem
    checkBoth(n: NamedAstNode, accept: ValidationAcceptor) : void {
        const isCamelCase = /^[A-Z]\w*$/.test(n.name);
        const isSnakeCase = /^[a-z_][a-z0-9_]*$/.test(n.name);
    
        if (!isCamelCase && !isSnakeCase) {
            accept('warning', "This name should be in CamelCase or snake_case", { node: n, property: 'name' });
        }
    }
    

    checkNameIsCamelCase(n: NamedAstNode, accept: ValidationAcceptor) : void {
        if(!n.name.match(/^[A-Z]\w*$/)) {
            accept('warning', "This name should be in CamelCase", { node: n, property: 'name' })
        }
    }

    checkNameIsSnakeCase(n: NamedAstNode, accept: ValidationAcceptor) : void {
        if(!n.name.match(/^[a-z_][a-z0-9_]*$/)) {
            accept('warning', "This name should be in snake_case", { node: n, property: 'name' })
        }
    }

    checkAbstractEntityExtendsAbstract(e: LocalEntity, accept: ValidationAcceptor) : void {
        if(e.is_abstract) {
            const supertype = e.superType?.ref
            if(isLocalEntity(supertype) && !supertype.is_abstract) {
                accept('error', "An abstract entity can only extend another abstract entity", { node: e, property: 'superType' })
            }
        }
    }

    checkCyclicExtensions(e: LocalEntity, accept: ValidationAcceptor) : void {
        const callback = (n: LocalEntity) => {
            const supertype = n.superType?.ref
            if(isLocalEntity(supertype)) {
                return supertype
            } else {
                return undefined
            }
        }
        if(cycleFinder(e, callback)) {
            accept('error', "Cyclic extension detected", { node: e, property: 'superType' })
        }
    }

}
