using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Vini.Domain.Entities;
using Vini.Infrastructure.Identity;
using Vini.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace Vini.Api;

/// <summary>
/// Applies EF Core migrations and seeds development data.
/// NEVER seed production databases with fake data.
/// Admin creation in production uses environment variables via the separate admin-seed utility.
/// </summary>
public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Applying database migrations...");
            await db.Database.MigrateAsync();
            logger.LogInformation("Migrations applied.");

            await SeedRolesAsync(roleManager, logger);
            await SeedAdminAsync(userManager, logger);
            await SeedStoreSettingsAsync(db, logger);
            await SeedDevelopmentDataAsync(db, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database initialization failed.");
            throw;
        }
    }

    private static async Task SeedAdminAsync(UserManager<ApplicationUser> userManager, ILogger logger)
    {
        string[] adminEmails = ["admin@nova.store", "admin@vini.com"];
        foreach (var adminEmail in adminEmails)
        {
            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                logger.LogInformation("Seeding admin user: {Email}", adminEmail);
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "Store",
                    LastName = "Owner"
                };
                
                var result = await userManager.CreateAsync(adminUser, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    logger.LogInformation("Admin user created: {Email} / Admin123!", adminEmail);
                }
            }
        }
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager, ILogger logger)
    {
        string[] roles = ["Admin", "Customer"];

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new ApplicationRole(role)
                {
                    Description = $"{role} role"
                });
                logger.LogInformation("Created role: {Role}", role);
            }
        }
    }

    private static async Task SeedStoreSettingsAsync(ApplicationDbContext db, ILogger logger)
    {
        var defaults = new List<StoreSettings>
        {
            new() { Key = "DefaultShippingFee", Value = "50", Description = "Default shipping fee in EGP", Group = "Shipping" },
            new() { Key = "FreeShippingThreshold", Value = "500", Description = "Order subtotal in EGP for free shipping", Group = "Shipping" },
            new() { Key = "StoreName", Value = "NØVA", Description = "Store display name", Group = "General" },
            new() { Key = "SupportEmail", Value = "support@nova.store", Description = "Customer support email", Group = "General" },
            new() { Key = "SupportPhone", Value = "+201000000000", Description = "Customer support phone", Group = "General" },
            new() { Key = "WhatsAppNumber", Value = "+201000000000", Description = "Brand WhatsApp contact phone", Group = "General" },
            new() { Key = "WhatsAppGreeting", Value = "مرحبا NØVA، أود الاستفسار عن تفاصيل الطلب والمنتجات", Description = "Default greeting for WhatsApp chat", Group = "General" },
            new() { 
                Key = "Landing_HeroSlides", 
                Value = "[{\"id\":\"1\",\"imageUrl\":\"/images/categories/winter.jpg\",\"title\":\"NEW COLLECTION WINTER\",\"subtitle\":\"Elevated winter essentials designed for the modern lifestyle.\",\"buttonText\":\"SHOP NOW\",\"linkUrl\":\"/products?category=winter-collection\",\"textPosition\":\"right\"}]", 
                Description = "Landing page hero carousel slides JSON", 
                Group = "LandingPage" 
            },
            new() { 
                Key = "Landing_FeaturedCards", 
                Value = "[{\"id\":\"1\",\"title\":\"WINTER COLLECTION\",\"buttonText\":\"SHOP NOW\",\"linkUrl\":\"/products?category=winter-collection\",\"imageUrl\":\"/images/categories/winter.jpg\"},{\"id\":\"2\",\"title\":\"SUMMER COLLECTION\",\"buttonText\":\"SHOP NOW\",\"linkUrl\":\"/products?category=summer-collection\",\"imageUrl\":\"/images/categories/summer.jpg\"},{\"id\":\"3\",\"title\":\"OFFERS & SALE\",\"buttonText\":\"SHOP NOW\",\"linkUrl\":\"/products?sale=true\",\"imageUrl\":\"/images/categories/sale.jpg\"}]", 
                Description = "Landing page 3 featured cards JSON", 
                Group = "LandingPage" 
            }
        };

        foreach (var def in defaults)
        {
            if (!await db.StoreSettings.AnyAsync(s => s.Key == def.Key))
            {
                await db.StoreSettings.AddAsync(def);
            }
        }

        await db.SaveChangesAsync();
        logger.LogInformation("Store settings checked and updated.");
    }

    private static async Task SeedDevelopmentDataAsync(ApplicationDbContext db, ILogger logger)
    {
        if (await db.Categories.AnyAsync()) return;

        logger.LogInformation("Seeding development catalog data...");

        // Categories
        var categories = new List<Category>
        {
            new() { Name = "T-Shirts", Slug = "t-shirts", Description = "Classic and graphic tees", DisplayOrder = 1, IsActive = true, IsFeatured = true },
            new() { Name = "Shirts", Slug = "shirts", Description = "Casual and formal shirts", DisplayOrder = 2, IsActive = true, IsFeatured = true },
            new() { Name = "Jeans", Slug = "jeans", Description = "Premium denim collection", DisplayOrder = 3, IsActive = true, IsFeatured = true },
            new() { Name = "Sweatpants", Slug = "sweatpants", Description = "Comfortable loungewear", DisplayOrder = 4, IsActive = true },
            new() { Name = "Sweatshirts", Slug = "sweatshirts", Description = "Cozy sweatshirts and hoodies", DisplayOrder = 5, IsActive = true },
            new() { Name = "Summer Collection", Slug = "summer-collection", Description = "Light and breezy summer styles", DisplayOrder = 6, IsActive = true },
            new() { Name = "Winter Collection", Slug = "winter-collection", Description = "Warm winter essentials", DisplayOrder = 7, IsActive = true },
        };

        await db.Categories.AddRangeAsync(categories);
        await db.SaveChangesAsync();

        // Shipping zones (major Egyptian governorates)
        if (!await db.ShippingZones.AnyAsync())
        {
            var zones = new List<ShippingZone>
            {
                new() { Governorate = "Cairo", ShippingFee = 30, EstimatedDaysMin = 1, EstimatedDaysMax = 2 },
                new() { Governorate = "Giza", ShippingFee = 30, EstimatedDaysMin = 1, EstimatedDaysMax = 2 },
                new() { Governorate = "Alexandria", ShippingFee = 40, EstimatedDaysMin = 2, EstimatedDaysMax = 3 },
                new() { Governorate = "Sharm El-Sheikh", ShippingFee = 60, EstimatedDaysMin = 3, EstimatedDaysMax = 5 },
                new() { Governorate = "Hurghada", ShippingFee = 60, EstimatedDaysMin = 3, EstimatedDaysMax = 5 },
                new() { Governorate = "Aswan", ShippingFee = 70, EstimatedDaysMin = 3, EstimatedDaysMax = 6 },
            };
            await db.ShippingZones.AddRangeAsync(zones);
            await db.SaveChangesAsync();
        }

        // Sample products (development seed only — not production data)
        var tShirtCategory = categories.First(c => c.Slug == "t-shirts");
        var jeansCategory = categories.First(c => c.Slug == "jeans");
        var sweatshirtCategory = categories.First(c => c.Slug == "sweatshirts");

        var products = new List<Product>
        {
            new()
            {
                Name = "Essential White Tee",
                Slug = "essential-white-tee",
                ShortDescription = "A wardrobe staple. Clean, minimal, everyday.",
                Description = "Our Essential Tee is crafted from 100% combed cotton for a soft, breathable fit. A go-to piece for any casual look.",
                FabricInfo = "100% Combed Cotton, 180 GSM",
                CareInstructions = "Machine wash cold, tumble dry low.",
                BasePrice = 299,
                IsFeatured = true,
                IsPublished = true,
                CategoryId = tShirtCategory.Id,
                Variants = new List<ProductVariant>
                {
                    new() { SKU = "TEE-WHT-S", Color = "White", ColorHex = "#FFFFFF", Size = "S", StockQuantity = 20 },
                    new() { SKU = "TEE-WHT-M", Color = "White", ColorHex = "#FFFFFF", Size = "M", StockQuantity = 30 },
                    new() { SKU = "TEE-WHT-L", Color = "White", ColorHex = "#FFFFFF", Size = "L", StockQuantity = 25 },
                    new() { SKU = "TEE-WHT-XL", Color = "White", ColorHex = "#FFFFFF", Size = "XL", StockQuantity = 15 },
                    new() { SKU = "TEE-BLK-S", Color = "Black", ColorHex = "#000000", Size = "S", StockQuantity = 18 },
                    new() { SKU = "TEE-BLK-M", Color = "Black", ColorHex = "#000000", Size = "M", StockQuantity = 28 },
                    new() { SKU = "TEE-BLK-L", Color = "Black", ColorHex = "#000000", Size = "L", StockQuantity = 22 },
                    new() { SKU = "TEE-BLK-XL", Color = "Black", ColorHex = "#000000", Size = "XL", StockQuantity = 12 },
                }
            },
            new()
            {
                Name = "Slim Straight Jeans",
                Slug = "slim-straight-jeans",
                ShortDescription = "Versatile denim for the modern wardrobe.",
                Description = "Slim straight cut denim with a comfortable stretch fabric. Suitable for casual and smart-casual occasions.",
                FabricInfo = "98% Cotton, 2% Elastane",
                CareInstructions = "Machine wash cold, hang to dry. Do not bleach.",
                BasePrice = 799,
                SalePrice = 649,
                IsFeatured = true,
                IsPublished = true,
                CategoryId = jeansCategory.Id,
                Variants = new List<ProductVariant>
                {
                    new() { SKU = "JNS-INDIGO-S", Color = "Indigo", ColorHex = "#3B5998", Size = "S", StockQuantity = 10 },
                    new() { SKU = "JNS-INDIGO-M", Color = "Indigo", ColorHex = "#3B5998", Size = "M", StockQuantity = 15 },
                    new() { SKU = "JNS-INDIGO-L", Color = "Indigo", ColorHex = "#3B5998", Size = "L", StockQuantity = 12 },
                    new() { SKU = "JNS-INDIGO-XL", Color = "Indigo", ColorHex = "#3B5998", Size = "XL", StockQuantity = 8 },
                    new() { SKU = "JNS-BLACK-S", Color = "Black", ColorHex = "#1A1A1A", Size = "S", StockQuantity = 10 },
                    new() { SKU = "JNS-BLACK-M", Color = "Black", ColorHex = "#1A1A1A", Size = "M", StockQuantity = 14 },
                    new() { SKU = "JNS-BLACK-L", Color = "Black", ColorHex = "#1A1A1A", Size = "L", StockQuantity = 11 },
                }
            },
            new()
            {
                Name = "Heavy Fleece Sweatshirt",
                Slug = "heavy-fleece-sweatshirt",
                ShortDescription = "Premium winter comfort.",
                Description = "A heavyweight fleece sweatshirt designed for cold days. Features a brushed inner lining for exceptional warmth.",
                FabricInfo = "80% Cotton, 20% Polyester Fleece, 380 GSM",
                CareInstructions = "Machine wash warm, tumble dry medium.",
                BasePrice = 649,
                IsFeatured = true,
                IsPublished = true,
                CategoryId = sweatshirtCategory.Id,
                Variants = new List<ProductVariant>
                {
                    new() { SKU = "SWS-GREY-S", Color = "Heather Grey", ColorHex = "#9E9E9E", Size = "S", StockQuantity = 12 },
                    new() { SKU = "SWS-GREY-M", Color = "Heather Grey", ColorHex = "#9E9E9E", Size = "M", StockQuantity = 20 },
                    new() { SKU = "SWS-GREY-L", Color = "Heather Grey", ColorHex = "#9E9E9E", Size = "L", StockQuantity = 18 },
                    new() { SKU = "SWS-GREY-XL", Color = "Heather Grey", ColorHex = "#9E9E9E", Size = "XL", StockQuantity = 10 },
                    new() { SKU = "SWS-NAVY-M", Color = "Navy", ColorHex = "#1B2A4A", Size = "M", StockQuantity = 15 },
                    new() { SKU = "SWS-NAVY-L", Color = "Navy", ColorHex = "#1B2A4A", Size = "L", StockQuantity = 12 },
                }
            },
        };

        await db.Products.AddRangeAsync(products);
        await db.SaveChangesAsync();

        logger.LogInformation("Development seed data applied. {ProductCount} products seeded.", products.Count);
    }
}
