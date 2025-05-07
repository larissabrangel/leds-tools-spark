import { expandToString } from "langium/generate";
import { Model } from "../../../../../../language/generated/ast.js"
import fs from "fs";
import path from "path";
import { generateODataExtension } from "./generateODataExtension.js";

export function generate(model: Model, target_folder: string) : void {

    fs.writeFileSync(path.join(target_folder, "AccountContextExtension.cs"), generateAccountContext(model))
    fs.writeFileSync(path.join(target_folder, "BuilderExtension.cs"), generateBuilderExtension(model))
    fs.writeFileSync(path.join(target_folder, "ClaimsPrincipalExtension.cs"), generateClaimsPrincipalExtension(model))
    fs.writeFileSync(path.join(target_folder, "ConfigureCorsPolicy.cs"), generateCorsPolicyExtension(model))
    fs.writeFileSync(path.join(target_folder, "JwtExtension.cs"), generateJwtExtension(model))
    fs.writeFileSync(path.join(target_folder, "ODataExtension.cs"), generateODataExtension(model))

}

function generateAccountContext(model: Model): string {
    return expandToString`
using MediatR;
using Microsoft.AspNetCore.Mvc;
using RequestAuth = ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate.Request;
using RequestChangePassword = ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword.Request;
using RequestRefreshToken = ${model.configuration?.name}.Application.Security.Account.UseCases.RefreshToken.Request;
using RequestResetPasswordCode = ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword.Request;
using RequestSaveRefreshToken = ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken.Request;
using RequestToken = ${model.configuration?.name}.Application.Security.Account.UseCases.Verify.Request;
using RequestUser = ${model.configuration?.name}.Application.Security.Account.UseCases.Create.Request;
using ResponseAuth = ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate.Response;
using ResponseChangePassword = ${model.configuration?.name}.Application.Security.Account.UseCases.ChangePassword.Response;
using ResponseResetPasswordCode = ${model.configuration?.name}.Application.Security.Account.UseCases.SendResetPassword.Response;
using ResponseSaveRefreshToken = ${model.configuration?.name}.Application.Security.Account.UseCases.SaveRefreshToken.Response;
using ResponseUser = ${model.configuration?.name}.Application.Security.Account.UseCases.Create.Response;

namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class AccountContextExtension
    {
        // Registra os endpoints
        public static void MapAccountEndpoints(this WebApplication app)
        {
            #region Create
            app.MapPost("api/users", async ([FromBody] RequestUser request, IRequestHandler<RequestUser, ResponseUser> handler) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                return result.IsSuccess
                    ? Results.Created($"api/users/{result.Data?.id}", result)
                    : Results.Json(result, statusCode: result.Status);
            });
            #endregion

            #region Authenticate
            app.MapPost("api/authenticate", async ([FromBody] RequestAuth request, IRequestHandler<RequestAuth, ResponseAuth> handler,
                 IRequestHandler<RequestSaveRefreshToken, ResponseSaveRefreshToken> handlerRefreshToken) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                if (!result.IsSuccess)
                    return Results.Json(result, statusCode: result.Status);

                if (result.Data is null)
                    return Results.Json(result, statusCode: 500);

                result.Data.Token = JwtExtension.Generate(result.Data);
                result.Data.RefreshToken = JwtExtension.GenerateRefreshToken();
                result.Data.TokenExpires = DateTime.UtcNow.AddMinutes(110);

                var requestRefreshToken = new RequestSaveRefreshToken(result.Data.Id, result.Data.RefreshToken);
                handlerRefreshToken.Handle(requestRefreshToken, new CancellationToken());

                return Results.Ok(result);
            });
            #endregion

            #region Validate Token
            app.MapPost("api/validate", async ([FromBody] RequestToken request, IRequestHandler<RequestToken, ResponseAuth> handler) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                if (!result.IsSuccess)
                    return Results.Json(result, statusCode: result.Status);

                if (result.Data is null)
                    return Results.Json(result, statusCode: 500);

                result.Data.Token = JwtExtension.Generate(result.Data);
                return Results.Ok(result);
            });
            #endregion

            #region Refresh Token
            app.MapPost("api/refresh", async ([FromBody] RequestRefreshToken request, IRequestHandler<RequestRefreshToken, ResponseAuth> handler,
                IRequestHandler<RequestSaveRefreshToken, ResponseSaveRefreshToken> handlerRefreshToken) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                if (!result.IsSuccess)
                    return Results.Json(result, statusCode: result.Status);

                if (result.Data is null)
                    return Results.Json(result, statusCode: 500);

                result.Data.Token = JwtExtension.Generate(result.Data);
                result.Data.RefreshToken = JwtExtension.GenerateRefreshToken();
                result.Data.TokenExpires = DateTime.UtcNow.AddMinutes(110);

                var requestRefreshToken = new RequestSaveRefreshToken(result.Data.Id, result.Data.RefreshToken);
                handlerRefreshToken.Handle(requestRefreshToken, new CancellationToken());

                return Results.Ok(result);
            });
            #endregion

            #region Request Reset Password
            app.MapPost("api/reset/password", async ([FromBody] RequestResetPasswordCode request, IRequestHandler<RequestResetPasswordCode, ResponseResetPasswordCode> handler) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                return Results.Ok(result);
            });
            #endregion

            #region Change Password
            app.MapPost("api/change/password", async ([FromBody] RequestChangePassword request, IRequestHandler<RequestChangePassword, ResponseChangePassword> handler) =>
            {
                var result = await handler.Handle(request, new CancellationToken());
                return Results.Ok(result);
            });
            #endregion
        }

    }
}`
}

function generateBuilderExtension(model: Model): string {
    return expandToString`
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using ${model.configuration?.name}.Domain.Security.Account;
using System.Text;

namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class BuilderExtension
    {
        // Recuperação das Private Keys definidas no appsettings.json
        public async static void AddConfiguration(this WebApplicationBuilder builder)
        {
            bool prod = false;

            if (prod)
            {
                Configuration.Secrets.ApiKey = Environment.GetEnvironmentVariable("ApiKey");
                Configuration.Secrets.JwtPrivateKey = Environment.GetEnvironmentVariable("JwtPrivateKey");
                Configuration.Secrets.PasswordSaltKey = Environment.GetEnvironmentVariable("PasswordSaltKey");

                Configuration.Email.DefaultFromEmail = Environment.GetEnvironmentVariable("DefaultFromEmail");
                Configuration.Email.ApiKey = Environment.GetEnvironmentVariable("EmailApiKey");
            }
            else
            {
                Configuration.Secrets.ApiKey = Environment.GetEnvironmentVariable("ApiKey");
                Configuration.Secrets.JwtPrivateKey = Environment.GetEnvironmentVariable("JwtPrivateKey");
                Configuration.Secrets.PasswordSaltKey = Environment.GetEnvironmentVariable("PasswordSaltKey");

                Configuration.Email.DefaultFromEmail = Environment.GetEnvironmentVariable("DefaultFromEmail");
                Configuration.Email.ApiKey = Environment.GetEnvironmentVariable("EmailApiKey");
            }
        }
        // Configuraçãod do JWT na api
        public static void AddJwtAuthentication(this WebApplicationBuilder builder)
        {
            builder.Services
                .AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                }).AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.SaveToken = true;
                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Configuration.Secrets.JwtPrivateKey)),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };
                });
            builder.Services.AddAuthorization();
        }
    }
}`
}

function generateClaimsPrincipalExtension(model: Model): string {
    return expandToString`
using System.Security.Claims;

namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class ClaimsPrincipalExtension
    {
        public static string Id(this ClaimsPrincipal user)
        => user.Claims.FirstOrDefault(c => c.Type == "Id")?.Value ?? string.Empty;

        public static string Name(this ClaimsPrincipal user)
            => user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value ?? string.Empty;

        public static string Email(this ClaimsPrincipal user)
            => user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? string.Empty;
    }
}`
}

function generateJwtExtension(model: Model): string {
    return expandToString`
using Microsoft.IdentityModel.Tokens;
using ${model.configuration?.name}.Application.Security.Account.UseCases.Authenticate;
using ${model.configuration?.name}.Domain.Security.Account;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class JwtExtension
    {
        public static string Generate(ResponseData data)
        {
            var handler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(Configuration.Secrets.JwtPrivateKey);
            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = GenerateClaims(data),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = credentials,
            };
            var token = handler.CreateToken(tokenDescriptor);
            return handler.WriteToken(token);
        }

        private static ClaimsIdentity GenerateClaims(ResponseData user)
        {
            var ci = new ClaimsIdentity();
            ci.AddClaim(new Claim("Id", user.Id.ToString()));
            ci.AddClaim(new Claim(ClaimTypes.GivenName, user.Name));
            ci.AddClaim(new Claim(ClaimTypes.Name, user.Email));
            foreach (var role in user.Roles)
                ci.AddClaim(new Claim(ClaimTypes.Role, role));

            return ci;
        }

        public static Guid GenerateRefreshToken()
        {
            return Guid.NewGuid();
        }
    }
}`
}

function generateCorsPolicyExtension(model: Model): string {
    return expandToString`
﻿namespace ${model.configuration?.name}.WebApi.Extensions
{
    public static class CorsPolicyExtension
    {
        public static void ConfigureCorsPolicy(this IServiceCollection services)
        {
            services.AddCors(opt =>
            {
                opt.AddDefaultPolicy(builder => builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
            });
        }
    }
}
`
}