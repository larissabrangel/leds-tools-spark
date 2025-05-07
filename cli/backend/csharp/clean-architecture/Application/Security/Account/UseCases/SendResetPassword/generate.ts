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
using ${model.configuration?.name}.Application.Security.Interfaces;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword
{
    public class Handler : IRequestHandler<Request, Response>
    {
        private readonly IUserRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IService _service;

        public Handler(IUserRepository repository, IUnitOfWork unitOfWork, IService service)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _service = service;
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

            #region Buscar usuário pelo Email
            User? user;
            try
            {
                user = await _repository.GetUserByEmailAsync(request.Email, cancellationToken);
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

            await _unitOfWork.Commit(cancellationToken);

            #region Enviar o código de alteração de senha via email
            try
            {
                if (user != null)
                    await _service.SendResetPasswordAsync(user, cancellationToken);
                return new Response("Código de alteração de senha enviado por email com sucesso!");
            }
            catch (Exception ex)
            {
                return new Response("Ocorreu algum erro inesperado no servidor", 500);
            }
            #endregion

        }
    }
}`
}

function generateRequest(model: Model): string {
    return expandToString`
using MediatR;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword
{
    public record class Request(
        string Email
    ) : IRequest<Response>;
}`
}

function generateResponse(model: Model): string {
    return expandToString`
using Flunt.Notifications;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword
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


namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request) =>
           new Contract<Notification>()
               .Requires()
               .IsEmail(request.Email, "Email", "E-mail inválido");
    }
}`
}