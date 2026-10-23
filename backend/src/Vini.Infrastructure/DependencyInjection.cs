using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vini.Application.Interfaces;
using Vini.Infrastructure.Identity;
using Vini.Infrastructure.Persistence;
using Vini.Infrastructure.Services;

namespace Vini.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Database
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sqlOptions => sqlOptions.EnableRetryOnFailure(3)));

        // Register IApplicationDbContext by resolving ApplicationDbContext
        services.AddScoped<IApplicationDbContext>(sp =>
            sp.GetRequiredService<ApplicationDbContext>());

        // Application services
        services.AddScoped<IOrderNumberGenerator, OrderNumberGenerator>();
        services.AddScoped<IShippingCalculator, ShippingCalculator>();
        services.AddScoped<IImageStorageService, LocalImageStorageService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
