using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using System.Threading.RateLimiting;
using Vini.Api;
using Vini.Api.Middleware;
using Vini.Application;
using Vini.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

// Bootstrap logger (before host is built)
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting VINI API...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog ─────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, config) =>
        config
            .ReadFrom.Configuration(ctx.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File("logs/vini-.log", rollingInterval: RollingInterval.Day));

    // ─── Application & Infrastructure layers ────────────────────────────────
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // ─── ASP.NET Core Identity ──────────────────────────────────────────────
    builder.Services.AddIdentity<Vini.Infrastructure.Identity.ApplicationUser, Vini.Infrastructure.Identity.ApplicationRole>(options =>
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 8;
            options.User.RequireUniqueEmail = true;
            options.SignIn.RequireConfirmedEmail = false;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
        })
        .AddEntityFrameworkStores<Vini.Infrastructure.Persistence.ApplicationDbContext>()
        .AddDefaultTokenProviders();

    builder.Services.AddHttpContextAccessor();


    // ─── Controllers ────────────────────────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        });
    builder.Services.AddEndpointsApiExplorer();

    // ─── Swagger / OpenAPI ──────────────────────────────────────────────────
    builder.Services.AddSwaggerGen();

    // ─── CORS ───────────────────────────────────────────────────────────────
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
        ?? ["http://localhost:3000"];

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ViniFrontend", policy =>
        {
            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    // ─── Cookie authentication ────────────────────────────────────────────
    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.HttpOnly = true;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.Name = "vini_auth";
        options.ExpireTimeSpan = TimeSpan.FromDays(14);
        options.SlidingExpiration = true;

        // Return 401/403 JSON instead of redirect for API
        options.Events.OnRedirectToLogin = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        };
        options.Events.OnRedirectToAccessDenied = ctx =>
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        };
    });

    // ─── Rate Limiting ──────────────────────────────────────────────────────
    builder.Services.AddRateLimiter(options =>
    {
        // Login: 5 attempts per minute per IP
        options.AddFixedWindowLimiter("login", limiterOptions =>
        {
            limiterOptions.PermitLimit = 5;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiterOptions.QueueLimit = 0;
        });

        // Order tracking: 10 requests per minute per IP
        options.AddFixedWindowLimiter("tracking", limiterOptions =>
        {
            limiterOptions.PermitLimit = 10;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueLimit = 0;
        });

        // Password reset: 3 per minute
        options.AddFixedWindowLimiter("passwordReset", limiterOptions =>
        {
            limiterOptions.PermitLimit = 3;
            limiterOptions.Window = TimeSpan.FromMinutes(1);
            limiterOptions.QueueLimit = 0;
        });

        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    });

    // ─── Health checks ───────────────────────────────────────────────────────
    builder.Services.AddHealthChecks()
        .AddDbContextCheck<Vini.Infrastructure.Persistence.ApplicationDbContext>();

    // ─── Static files (for locally stored images) ──────────────────────────
    builder.Services.AddDirectoryBrowser();

    builder.Services.AddTransient<Microsoft.AspNetCore.Identity.IEmailSender<Vini.Infrastructure.Identity.ApplicationUser>, Vini.Api.DummyEmailSender>();

    var app = builder.Build();

    // ─── Exception handling middleware ──────────────────────────────────────
    app.UseMiddleware<ExceptionHandlingMiddleware>();

    // ─── Dev tools ──────────────────────────────────────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "VINI API v1");
            c.RoutePrefix = "swagger";
        });
    }

    app.UseSerilogRequestLogging(opts =>
    {
        opts.EnrichDiagnosticContext = (diag, ctx) =>
        {
            diag.Set("RequestHost", ctx.Request.Host.Value);
            diag.Set("UserAgent", ctx.Request.Headers.UserAgent.ToString());
        };
    });

    app.UseHttpsRedirection();
    app.UseStaticFiles();
    app.UseCors("ViniFrontend");
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.MapGroup("/api").MapIdentityApi<Vini.Infrastructure.Identity.ApplicationUser>();
    app.MapHealthChecks("/health");

    // ─── Database migration on startup (dev / staging only) ─────────────────
    if (app.Environment.IsDevelopment())
    {
        await DatabaseInitializer.InitializeAsync(app.Services);
    }

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "VINI API terminated unexpectedly.");
}
finally
{
    Log.CloseAndFlush();
}

// Make the implicit Program class visible for integration tests
public partial class Program { }
