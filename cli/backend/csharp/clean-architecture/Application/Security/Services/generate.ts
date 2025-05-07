import { expandToStringWithNL } from "langium/generate";
import { Model } from "../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path";
export function generate(model: Model, target_folder: string) : void {
    fs.writeFileSync(path.join(target_folder, "BaseSecurityService.cs"),generateBaseSecurity(model))
    fs.writeFileSync(path.join(target_folder, "EmailService.cs"),generateEmailService(model))
}

function generateBaseSecurity(model: Model) : string {
    return expandToStringWithNL`
using MediatR;
using ${model.configuration?.name}.Domain.Interfaces.Security;
using ${model.configuration?.name}.Domain.Security.Shared.Entities;

namespace ${model.configuration?.name}.Application.Security.Services
{
    public class BaseSecurityService<Repository> : IBaseSecurityRepository<Entity>
        where Repository : IBaseSecurityRepository<Entity>
    {
        private readonly IMediator _mediator;
        private readonly Repository _repository;

        public BaseSecurityService(IMediator mediator, Repository repository)
        {
            _mediator = mediator;
            _repository = repository;
        }

        public void Create(Entity entity)
        {
            throw new NotImplementedException();
        }

        public void Delete(Entity entity)
        {
            throw new NotImplementedException();
        }

        public IQueryable<Entity> GetAll()
        {
            throw new NotImplementedException();
        }

        public IQueryable<Entity> GetById(Guid id)
        {
            throw new NotImplementedException();
        }

        public void Update(Entity entity)
        {
            throw new NotImplementedException();
        }
    }
}`
}

function generateEmailService(model: Model) : string {
    return expandToStringWithNL`
using MimeKit;
using ${model.configuration?.name}.Application.Security.Interfaces;
using ${model.configuration?.name}.Domain.Security.Account;
using ${model.configuration?.name}.Domain.Security.Account.Entities;
using SmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace ${model.configuration?.name}.Application.Security.Services
{
    public class EmailService : IService
    {
        public async Task SendVerificationEmailAsync(User user, CancellationToken cancellationToken)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("Sender Name", Configuration.Email.DefaultFromEmail));
            email.To.Add(new MailboxAddress("Receiver Name", user.Email.Address));

            email.Subject = "Verifique sua conta";
            email.Body = new TextPart(MimeKit.Text.TextFormat.Text)
            {
                Text = $"Código de verificação de email: {user.Email.Verification.Code}"
            };

            using (var smtp = new SmtpClient())
            {
                smtp.Connect("smtp.gmail.com", 587, false);

                // Note: only needed if the SMTP server requires authentication
                smtp.Authenticate(Configuration.Email.DefaultFromEmail, Configuration.Email.ApiKey);

                smtp.Send(email);
                smtp.Disconnect(true);
            }

        }

        public async Task SendResetPasswordAsync(User user, CancellationToken cancellationToken)
        {
            var email = new MimeMessage();

            email.From.Add(new MailboxAddress("Sender Name", Configuration.Email.DefaultFromEmail));
            email.To.Add(new MailboxAddress("Receiver Name", user.Email.Address));

            email.Subject = "Alterar Senha";
            email.Body = new TextPart(MimeKit.Text.TextFormat.Text)
            {
                Text = $"Código de alteração de senha: {user.Password.ResetCode}"
            };

            using (var smtp = new SmtpClient())
            {
                smtp.Connect("smtp.gmail.com", 587, false);

                // Note: only needed if the SMTP server requires authentication
                smtp.Authenticate(Configuration.Email.DefaultFromEmail, Configuration.Email.ApiKey);

                smtp.Send(email);
                smtp.Disconnect(true);
            }

        }
    }
}`
}