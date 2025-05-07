import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`User.cs`), generateUser(model))
    fs.writeFileSync(path.join(target_folder,`Role.cs`), generateRole(model))
}

function generateUser (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Account.ValueObjects;
using ${model.configuration?.name}.Domain.Security.Shared.Entities;

namespace ${model.configuration?.name}.Domain.Security.Account.Entities
{
    public class User : Entity
    {
        public string Name { get; private set; } = string.Empty;
        public Email Email { get; private set; } = null!;
        public Password Password { get; private set; } = null!;
        public List<Role> Roles { get; set; } = [];
        public Guid? RefreshToken { get; set; }

        protected User() { }

        public User(string name, Email email, Password password, Guid? refreshToken)
        {
            Name = name;
            Email = email;
            Password = password;
            RefreshToken = refreshToken;
            Roles = new List<Role>();
        }

        public User(string name, Email email, Password password)
        {
            Name = name;
            Email = email;
            Password = password;
            Roles = new List<Role>();
        }

        public void UpdatePassword(string plainTextPassword, string code)
        {
            if (!string.Equals(code.Trim(), Password.ResetCode.Trim(), StringComparison.CurrentCultureIgnoreCase))
                throw new Exception("Código de restauração inválido");

            var password = new Password(plainTextPassword);
            Password = password;
        }

        public void UpdateEmail(Email email)
        {
            Email = email;
        }

        public void UpdateRefreshToken(Guid? token)
        {
            RefreshToken = token;
        }

        public void addRole(Role role)
        {
            Roles.Add(role);
        }
    }
}`
}

function generateRole (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Shared.Entities;

namespace ${model.configuration?.name}.Domain.Security.Account.Entities
{
    public class Role : Entity
    {
        public string Name { get; set; } = string.Empty;
        public List<User> Users { get; set; } = new();

        public Role(string name)
        {
            Name = name;
        }
    }
}`
}