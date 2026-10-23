using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.ProductName).IsRequired().HasMaxLength(200);
        builder.Property(i => i.SKU).IsRequired().HasMaxLength(100);
        builder.Property(i => i.Color).IsRequired().HasMaxLength(50);
        builder.Property(i => i.Size).IsRequired().HasMaxLength(20);
        builder.Property(i => i.ProductImageUrl).HasMaxLength(500);
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Property(i => i.LineTotal).HasColumnType("decimal(18,2)");

        // Soft FK — preserves history when variant is deleted
        builder.HasOne(i => i.ProductVariant)
            .WithMany()
            .HasForeignKey(i => i.ProductVariantId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
