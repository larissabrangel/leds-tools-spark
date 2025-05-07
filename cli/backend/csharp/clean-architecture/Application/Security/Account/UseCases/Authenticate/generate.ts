import { expandToString } from "langium/generate";
import { Model } from "../../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, "Handler.cs"),generateHandler(model))
    fs.writeFileSync(path.join(target_folder, "Request.cs"),generateRequest(model))
    fs.writeFileSync(path.join(target_folder, "Response.cs"),generateResponse(model))
    fs.writeFileSync(path.join(target_folder, "Specification.cs"),generateSpecification(model))
}

function generateHandler(model: Model): string {
    return expandToString`
using MediatR;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate
{
    public class Handler : IRequestHandler<Request, Response>
    {
        private readonly IUserRepository _repository;
        private readonly IUnitOfWork _unitOfWork;

        public Handler(IUserRepository repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Response> Handle(Request request, CancellationToken cancellationToken)
        {
            #region Valida a requisição

            try
            {
                var res = Specification.Ensure(request);
                if (!res.IsValid)
                    return new Response("Requisição inválida", 400, res.Notifications);
            }
            catch
            {
                return new Response("Não foi possível validar sua requisição", 500);
            }

            #endregion

            #region Recupera o perfil

            User? user;
            try
            {
                user = await _repository.GetUserByEmailAsync(request.Email, cancellationToken);
                if (user is null)
                    return new Response("Perfil não encontrado", 404);
            }
            catch (Exception e)
            {
                return new Response("Não foi possível recuperar seu perfil", 500);
            }

            #endregion

            #region Verifica se a senha é válida

            if (!user.Password.Challenge(request.Password))
                return new Response("Usuário ou senha inválidos", 400);

            #endregion

            #region Verifica se a conta está verificada

            try
            {
                if (!user.Email.Verification.IsActive)
                    return new Response("Conta inativa", 400);
            }
            catch
            {
                return new Response("Não foi possível verificar seu perfil", 500);
            }

            #endregion

            await _unitOfWork.Commit(cancellationToken);

            #region Retorna os dados

            try
            {
                var data = new ResponseData
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email.Address,
                    Roles = user.Roles.Select(x => x.Name).ToArray(),
                };

                return new Response(string.Empty, data);
            }
            catch
            {
                return new Response("Não foi possível obter os dados do perfil", 500);
            }
            #endregion
        }
    }
}`
}

function generateRequest(model: Model): string {
    return expandToString`
using MediatR;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate
{

    public record Request(
        string Email,
        string Password
    ) : IRequest<Response>;
}`
}
function generateResponse(model: Model): string {
    return expandToString`
using Flunt.Notifications;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate
{
    public class Response : Shared.UseCases.Response
    {
        protected Response() { }

        public Response(
            string message,
            int status,
            IEnumerable<Notification>? notifications = null)
        {
            Message = message;
            Status = status;
            Notifications = notifications;
        }

        public Response(string message, ResponseData data)
        {
            Message = message;
            Status = 201;
            Notifications = null;
            Data = data;
        }

        public Response(string message)
        {
            Message = message;
            Status = 200;
        }

        public ResponseData? Data { get; set; }
    }

    public class ResponseData
    {
        public string Token { get; set; } = string.Empty;
        public DateTime? TokenExpires { get; set; }
        public Guid? RefreshToken { get; set; }
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string[] Roles { get; set; } = Array.Empty<string>();
    }
}`
}

function generateSpecification(model: Model): string | NodeJS.ArrayBufferView {
    return expandToString`
using Flunt.Notifications;
using Flunt.Validations;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request) =>
            new Contract<Notification>()
                .Requires()
                .IsLowerThan(request.Password.Length, 40, "Password", "A senha deve conter menos que 40 caracteres")
                .IsGreaterThan(request.Password.Length, 5, "Password", "A senha deve conter mais que 5 caracteres")
                .IsEmail(request.Email, "Email", "E-mail inválido");
    }
}`
}

