using Microsoft.AspNetCore.Diagnostics;
using System.Net;
using System.Text.Json;
using Vini.Domain.Exceptions;

namespace Vini.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (status, title, detail) = exception switch
        {
            DomainException domainEx =>
                (HttpStatusCode.BadRequest, "Domain Rule Violation", domainEx.Message),

            UnauthorizedAccessException =>
                (HttpStatusCode.Forbidden, "Access Denied", "You do not have permission to perform this action."),

            KeyNotFoundException =>
                (HttpStatusCode.NotFound, "Resource Not Found", exception.Message),

            InvalidOperationException invalidOp =>
                (HttpStatusCode.BadRequest, "Invalid Operation", invalidOp.Message),

            _ => (HttpStatusCode.InternalServerError, "Server Error",
                  "An unexpected error occurred. Please try again later.")
        };

        // Log internal errors with full stack trace; client errors at Warning level
        if (status == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        else
            _logger.LogWarning(exception, "Handled exception [{Status}]: {Message}", (int)status, exception.Message);

        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/problem+json";

        var problem = new
        {
            type = $"https://httpstatuses.com/{(int)status}",
            title,
            status = (int)status,
            detail,
            instance = context.Request.Path.ToString()
        };

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
