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


namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken
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
            User? user;

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

            #region Buscar usuário no banco
            try
            {
                user = _repository.GetById(request.Id).Single();
                if (user == null)
                {
                    return new Response("Usuário não encontrado", 404);
                }
            }
            catch (Exception e)
            {
                return new Response("Não foi possível validar a sua requisição", 500);
            }
            #endregion

            #region Salva o Refresh Token no banco
            try
            {
                user.UpdateRefreshToken(request.RefreshToken);
            }
            catch (Exception e)
            {
                return new Response(e.Message, 500);
            }
            #endregion

            await _unitOfWork.Commit(cancellationToken);

            return new Response("Refresh Token salvo com sucesso", new ResponseData(user.Id, user.Name, user.Email.Address));
        }
    }
}`
}

function generateRequest(model: Model): string {
    return expandToString`
using MediatR;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken
{
    public record Request(
        Guid Id,
        Guid? RefreshToken
    ) : IRequest<Response>;
}`
}

function generateResponse(model: Model): string {
    return expandToString`
using Flunt.Notifications;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken
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

        public ResponseData? Data { get; set; }
    }

    public class ResponseData
    {
        private Guid id;
        private string address;

        public ResponseData(Guid id, string name, string address)
        {
            this.id = id;
            Name = name;
            this.address = address;
        }

        public string Token { get; set; } = string.Empty;
        public Guid RefreshToken { get; set; }
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string[] Roles { get; set; } = Array.Empty<string>();
    }
}`
}

function generateSpecification(model: Model): string {
    return expandToString`
using Flunt.Notifications;
using Flunt.Validations;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request)
              => new Contract<Notification>()
                    .Requires()
                    .IsNotNull(request.Id, "O Id de usuário não pode ser nulo")
                    .IsNotNull(request.RefreshToken, "O Refresh Token não pode ser nulo");
    }
}`
}