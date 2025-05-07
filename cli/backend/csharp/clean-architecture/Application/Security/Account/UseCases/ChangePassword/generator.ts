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

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword
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
            #region Validar Requisição
            try
            {
                var res = Specification.Ensure(request);
                if (!res.IsValid) return new Response("Requisição inválida", 400, res.Notifications);
            }
            catch
            {
                return new Response("Não foi possível validar a sua requisição", 500);
            }
            #endregion

            #region Buscar usuário pelo código
            User? user;
            try
            {
                user = await _repository.GetUserByPasswordCode(request.Code, cancellationToken);
                if (user is null)
                {
                    return new Response("Usuário não encontrado", 404);
                }
            }
            catch
            {
                return new Response("Ocorreu algum erro inesperado no servidor", 500);
            }
            #endregion

            #region Alterar senha do usuário
            try
            {
                user.UpdatePassword(request.Password, request.Code);
            }
            catch
            {
                return new Response("Não foi possível realizar a alteração de senha", 404);
            }
            #endregion

            await _unitOfWork.Commit(cancellationToken);

            return new Response("Senha alterada com sucesso!");
        }
    }
}`
}

function generateRequest(model: Model): string {
    return expandToString`
using MediatR;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword
{
    public record class Request
    (
        string Code,
        string Password
    ) : IRequest<Response>;
}`
}

function generateResponse(model: Model): string {
    return expandToString`
using Flunt.Notifications;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword
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

        public Response(string message)
        {
            Message = message;
            Status = 200;
        }
    }
}`
}

function generateSpecification(model: Model): string {
    return expandToString`
using Flunt.Notifications;
using Flunt.Validations;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request) =>
           new Contract<Notification>()
               .Requires()
               .IsNotEmpty(request.Code, "Código não pode estar vazio")
               .IsLowerThan(request.Password.Length, 40, "Password", "A senha deve conter menos que 40 caracteres")
               .IsGreaterThan(request.Password.Length, 5, "Password", "A senha deve conter mais que 5 caracteres");
    }
}`
}