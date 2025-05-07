import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`Email.cs`), generateEmail(model))
    fs.writeFileSync(path.join(target_folder,`Password.cs`), generatePassword(model))
    fs.writeFileSync(path.join(target_folder,`Verification.cs`), generateVerification(model))
}

function generateEmail (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Shared.Extensions;
using ${model.configuration?.name}.Domain.Security.Shared.ValueObjects;
using System.Text.RegularExpressions;

namespace ${model.configuration?.name}.Domain.Security.Account.ValueObjects
{
    public partial class Email : ValueObject
    {
        private const string Pattern = @"^\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*$";
        public string Address { get; }
        public string Hash => Address.ToBase64();
        public Verification Verification { get; private set; } = new();

        public void ResendVerification() => Verification = new Verification();


        [GeneratedRegex(Pattern)]
        private static partial Regex EmailRegex();

        protected Email() { }

        public Email(string address)
        {
            // Validações
            if (string.IsNullOrEmpty(address))
                throw new Exception("E-mail inválido");

            Address = address.Trim().ToLower();

            if (Address.Length < 5)
                throw new Exception("E-mail inválido");

            if (!EmailRegex().IsMatch(Address))
                throw new Exception("E-mail inválido");
        }

        // Conversão implicita de email para string
        public static implicit operator string(Email email) => email.ToString();
        // Conversão implicita de string para email
        public static implicit operator Email(string address) => new(address);
    }
}`
}

function generatePassword (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Shared.ValueObjects;
using System.Security.Cryptography;

namespace ${model.configuration?.name}.Domain.Security.Account.ValueObjects
{
    public class Password : ValueObject
    {
        private const string Valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        private const string Special = "!@#$%ˆ&*(){}[];";

        protected Password() { }

        public Password(string? text = null)
        {
            if (string.IsNullOrEmpty(text) || string.IsNullOrWhiteSpace(text))
                text = Generate();

            Hash = Hashing(text);
        }

        public string Hash { get; } = string.Empty;
        public string ResetCode { get; } = Guid.NewGuid().ToString("N")[..8].ToUpper();

        #region Gerador de senha
        private static string Generate(
            short length = 16,
            bool includeSpecialChars = true,
            bool upperCase = false)
        {
            var chars = includeSpecialChars ? (Valid + Special) : Valid;
            var startRandom = upperCase ? 26 : 0;
            var index = 0;
            var res = new char[length];
            var rnd = new Random();

            while (index < length)
                res[index++] = chars[rnd.Next(startRandom, chars.Length)];

            return new string(res);
        }
        #endregion

        #region Gerador de Hash
        private static string Hashing(
            string password,
            short saltSize = 16,
            short keySize = 32,
            int iterations = 10000,
            char splitChar = '.')
        {
            if (string.IsNullOrEmpty(password))
                throw new Exception("Password should not be null or empty");

            password += Configuration.Secrets.PasswordSaltKey;

            using var algorithm = new Rfc2898DeriveBytes(
                password,
                saltSize,
                iterations,
                HashAlgorithmName.SHA256);
            var key = Convert.ToBase64String(algorithm.GetBytes(keySize));
            var salt = Convert.ToBase64String(algorithm.Salt);

            return $"{iterations}{splitChar}{salt}{splitChar}{key}";
        }
        #endregion

        #region Verificador de Hash
        private static bool Verify(
            string hash,
        string password,
        short keySize = 32,
            int iterations = 10000,
            char splitChar = '.')
        {
            password += Configuration.Secrets.PasswordSaltKey;

            var parts = hash.Split(splitChar, 3);
            if (parts.Length != 3)
                return false;

            var hashIterations = Convert.ToInt32(parts[0]);
            var salt = Convert.FromBase64String(parts[1]);
            var key = Convert.FromBase64String(parts[2]);

            if (hashIterations != iterations)
                return false;

            using var algorithm = new Rfc2898DeriveBytes(
                password,
                salt,
                iterations,
                HashAlgorithmName.SHA256);
            var keyToCheck = algorithm.GetBytes(keySize);

            return keyToCheck.SequenceEqual(key);
        }
        #endregion
        public bool Challenge(string plainTextPassword) => Verify(Hash, plainTextPassword);
    }
}`
}

function generateVerification (model: Model): string {
    return expandToStringWithNL`
using ${model.configuration?.name}.Domain.Security.Shared.ValueObjects;

namespace ${model.configuration?.name}.Domain.Security.Account.ValueObjects
{
    public class Verification : ValueObject
    {
        // Gera um Guid sem o simbolo (-) e e retorna apenas os 6 primeiros dígitos
        public string Code { get; } = Guid.NewGuid().ToString("N")[0..6].ToUpper();
        public DateTime? ExpiresAt { get; private set; } = DateTime.UtcNow.AddMinutes(10);
        public DateTime? VerifiedAt { get; private set; } = null;
        public bool IsActive => VerifiedAt != null && ExpiresAt == null;

        public Verification() { }

        public void Verify(string code)
        {
            if (IsActive)
            {
                throw new Exception("Esse código já foi ativado");
            }

            if (ExpiresAt < DateTime.UtcNow)
            {
                throw new Exception("Esse código está expirado");
            }

            if (!string.Equals(code.Trim(), Code.Trim(), StringComparison.CurrentCultureIgnoreCase))
            {
                throw new Exception("Código de verificação inválido");
            }

            ExpiresAt = null;
            VerifiedAt = DateTime.UtcNow;
        }
    }
}`
}