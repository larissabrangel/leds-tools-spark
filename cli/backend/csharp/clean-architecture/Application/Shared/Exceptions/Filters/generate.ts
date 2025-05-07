import { expandToStringWithNL } from "langium/generate"
import { Model } from "../../../../../../../../language/generated/ast.js"
import fs from "fs"
import path from "path"

export function generate(model: Model, target_folder: string) : void {
    
    fs.writeFileSync(path.join(target_folder,`BadExceptionFilter.cs`), generateBadExceptionFilter(model))
    fs.writeFileSync(path.join(target_folder,`ExceptionFilter.cs`), DatabaseExceptionFilter(model))
}

function generateBadExceptionFilter (model: Model): string {
    return expandToStringWithNL`
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using ${model.configuration?.name}.Domain.Validation;
using System.Linq;

namespace ${model.configuration?.name}.Application.Shared.Exceptions.Filters
{
    public class BadRequestExceptionFilter : IExceptionFilter
    {
        public BadRequestExceptionFilter() { }

        public void OnException(ExceptionContext context)
        {
            if (context.Exception is ValidationException validationException)
            {
                var errors = validationException.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
                var result = new ObjectResult(new { Errors = errors })
                {
                    StatusCode = 400
                };
                context.Result = result;
                context.ExceptionHandled = true;
            }
            else if (context.Exception is DomainValidationException domainValidationException)
            {
                var errors = domainValidationException.Message;
                var result = new ObjectResult(new { Errors = errors })
                {
                    StatusCode = 400
                };
                context.Result = result;
                context.ExceptionHandled = true;
            }
        }
    }
}`
}

function DatabaseExceptionFilter (model: Model): string {
    return expandToStringWithNL`
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ${model.configuration?.name}.Application.Shared.Exceptions.Filters
{
    public class DatabaseExceptionFilter : IExceptionFilter
    {
        public void OnException(ExceptionContext context)
        {
            if (context.Exception is DbUpdateException dbUpdateException)
            {
                var errors = dbUpdateException.GetBaseException().Message;
                var result = new ObjectResult(new { Errors = errors })
                {
                    StatusCode = 400
                };
                context.Result = result;
                context.ExceptionHandled = true;
            }
        }
    }
}`
}