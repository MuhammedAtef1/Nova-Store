using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Slug).IsRequired().HasMaxLength(220);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.Description).HasMaxLength(5000);
        builder.Property(p => p.ShortDescription).HasMaxLength(500);
        builder.Property(p => p.FabricInfo).HasMaxLength(1000);
        builder.Property(p => p.CareInstructions).HasMaxLength(1000);
        builder.Property(p => p.BasePrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.SalePrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.CreatedBy).HasMaxLength(256);
        builder.Property(p => p.UpdatedBy).HasMaxLength(256);

        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Variants)
            .WithOne(v => v.Product)
            .HasForeignKey(v => v.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Reviews)
            .WithOne(r => r.Product)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(p => !p.IsDeleted);
        builder.HasIndex(p => p.IsPublished);
        builder.HasIndex(p => p.IsFeatured);
        builder.HasIndex(p => p.CategoryId);
    }
}
