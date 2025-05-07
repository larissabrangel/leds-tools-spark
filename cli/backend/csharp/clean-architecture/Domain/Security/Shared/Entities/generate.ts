import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`Entity.cs`), generateEntity(model))
}

function generateEntity (model: Model): string {
    return expandToStringWithNL`
namespace ${model.configuration?.name}.Domain.Security.Shared.Entities
{
    public abstract class Entity : IEquatable<Guid>
    {
        public Guid Id { get; }
        protected Entity() => Id = Guid.NewGuid();

        public bool Equals(Guid id) => Id == id;

        public override int GetHashCode() => Id.GetHashCode();
    }
}`
}