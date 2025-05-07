import path from "path"
import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs"
import { expandToStringWithNL } from "langium/generate"

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, `BaseEntity.cs`), generateBaseEntity(model))

}

function generateBaseEntity(model : Model) : string {
    return expandToStringWithNL`
﻿using System.Reflection;

namespace ${model.configuration?.name}.Domain.Common
{
    public class BaseEntity
    {
        public Guid Id { get; set; }
        public DateTimeOffset DateCreated { get; set; }
        public DateTimeOffset? DateUpdated { get; set; }
        public DateTimeOffset? DateDeleted { get; set; }

        public void Create()
        {
            this.DateCreated = DateTime.Now;
        }

        public void Update(BaseEntity entity)
        {
            foreach (PropertyInfo property in entity.GetType().GetProperties())
            {
                if (property.CanWrite && property.Name != nameof(Id) && property.Name != nameof(DateCreated))
                {
                    property.SetValue(this, property.GetValue(entity));
                }
            }

            this.DateUpdated = DateTime.Now;
        }

        public void Delete()
        {
            this.DateDeleted = DateTime.Now;
        }
    }
}`
}