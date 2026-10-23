using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.SKU).IsRequired().HasMaxLength(100);
        builder.HasIndex(v => v.SKU).IsUnique();
        builder.Property(v => v.Color).IsRequired().HasMaxLength(50);
        builder.Property(v => v.ColorHex).HasMaxLength(10);
        builder.Property(v => v.Size).IsRequired().HasMaxLength(20);
        builder.Property(v => v.PriceOverride).HasColumnType("decimal(18,2)");
        builder.Property(v => v.RowVersion).IsRowVersion();
        builder.HasIndex(v => new { v.ProductId, v.Color, v.Size }).IsUnique();
    }
}
