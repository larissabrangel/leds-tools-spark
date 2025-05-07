import { expandToString } from "langium/generate";
import { Model } from "../../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, "Handler.cs"),generateHandler(model))
    fs.writeFileSync(path.join(target_folder, "Request.cs"),generateRequest(model))
    fs.writeFileSync(path.join(target_folder, "Specification.cs"),generateSpecification(model))
}

function generateHandler(model: Model): string {
    return expandToString`
using MediatR;
using ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate;
using ${model.configuration?.name}.Domain.Interfaces.Common;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Account.Entities;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Verify
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
                if (!res.IsValid)
                    return new Response("Requisição inválida", 400, res.Notifications);
            }
            catch
            {
                return new Response("Não foi possível validar sua requisição", 500);
            }
            #endregion

            #region Recuperar usuário pelo código
            User? user;
            try
            {
                user = await _repository.GetUserByCode(request.Code, cancellationToken);
                if (user is null)
                    return new Response("Usuário não encontrado", 404);
            }
            catch (Exception e)
            {
                return new Response("Não foi possível recuperar o usuário", 500);
            }
            #endregion

            #region Validar Código
            try
            {
                user.Email.Verification.Verify(request.Code);
            }
            catch (Exception ex)
            {
                return new Response(ex.Message, 400);
            }
            #endregion

            await _unitOfWork.Commit(cancellationToken);

            #region Construtor da resposta
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
using ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Verify
{
    public record Request(string Code) : IRequest<Response>;
}`
}

function generateSpecification(model: Model): string {
    return expandToString`
using Flunt.Notifications;
using Flunt.Validations;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Verify
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request)
              => new Contract<Notification>()
                    .Requires()
                    .IsGreaterThan(request.Code.Length, 5, "Código de verificação", "O código de verificação deve conter mais que 3 caracteres");
    }
}`
}