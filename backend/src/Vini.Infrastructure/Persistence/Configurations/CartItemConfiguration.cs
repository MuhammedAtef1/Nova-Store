using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        builder.HasIndex(i => new { i.CartId, i.ProductVariantId }).IsUnique();

        builder.HasOne(i => i.ProductVariant)
            .WithMany(v => v.CartItems)
            .HasForeignKey(i => i.ProductVariantId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
