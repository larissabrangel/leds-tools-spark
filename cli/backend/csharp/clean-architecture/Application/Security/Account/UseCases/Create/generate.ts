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
using ${model.configuration?.name}.Domain.Security.Account.ValueObjects;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Create
{
    public class Handler : IRequestHandler<Request, Response>
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        private readonly IService _service;
        private readonly IUnitOfWork _unitOfWork;

        public Handler(IUserRepository userRepository, IRoleRepository roleRepository, IService service, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _service = service;
            _unitOfWork = unitOfWork;
        }

        public async Task<Response> Handle(
            Request request,
            CancellationToken cancelationToken)
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

            #region Gerar os objetos
            Email email;
            Password password;
            User user;

            try
            {
                email = new Email(request.Email);
                password = new Password(request.Password);
                user = new User(request.Name, email, password);
            }
            catch (Exception ex)
            {
                return new Response(ex.Message, 400);
            }
            #endregion

            #region Verificar existência do usuário no banco
            try
            {
                var exists = await _userRepository.AnyAsync(request.Email, cancelationToken);

                if (exists)
                    return new Response("Este email já está em uso", 400);

            }
            catch
            {
                return new Response("Falha ao verificar o email cadastrado", 500);
            }
            #endregion

            #region Persistência os dados
            try
            {
                _userRepository.Create(user);
            }
            catch
            {
                return new Response("Falha ao persistir dados", 500);
            }
            #endregion

            #region Enviar email de ativação
            try
            {
                await _service.SendVerificationEmailAsync(user, cancelationToken);
            }
            catch
            {
                // faça nada
            }
            #endregion

            await _unitOfWork.Commit(cancelationToken);

            return new Response("Conta criada com sucesso", new ResponseData(user.Id, user.Name, user.Email.Address));
        }
    }
}`
}

function generateRequest(model: Model): string {
    return expandToString`
using MediatR;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Create
{
    public record Request(
        string Name,
        string Email,
        string Password
    ) : IRequest<Response>;
}`
}

function generateResponse(model: Model): string {
    return expandToString`
using Flunt.Notifications;

namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Create
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

    public record ResponseData(Guid id, string name, string email);
}`
}

function generateSpecification(model: Model): string {
    return expandToString`
using Flunt.Notifications;
using Flunt.Validations;


namespace ${model.configuration?.name}.Application.Security.Account.UseCases.Create
{
    public static class Specification
    {
        public static Contract<Notification> Ensure(Request request)
              => new Contract<Notification>()
                    .Requires()
                    .IsLowerThan(request.Name.Length, 100, "Name", "O nome deve conter menos que 100 caracteres")
                    .IsGreaterThan(request.Name.Length, 3, "Name", "O nome deve conter mais que 3 caracteres")
                    .IsLowerThan(request.Password.Length, 40, "Password", "A senha deve conter menos que 40 caracteres")
                    .IsGreaterThan(request.Password.Length, 5, "Password", "A senha deve conter mais que 5 caracteres")
                    .IsEmail(request.Email, "Email", "E-mail inválido");
    }
}`
}