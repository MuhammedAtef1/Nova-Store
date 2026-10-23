using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.OrderNumber).IsRequired().HasMaxLength(30);
        builder.HasIndex(o => o.OrderNumber).IsUnique();
        builder.Property(o => o.IdempotencyKey).HasMaxLength(100);
        builder.HasIndex(o => o.IdempotencyKey);
        builder.Property(o => o.CustomerName).IsRequired().HasMaxLength(200);
        builder.Property(o => o.PrimaryPhone).IsRequired().HasMaxLength(20);
        builder.Property(o => o.SecondaryPhone).HasMaxLength(20);
        builder.Property(o => o.CustomerEmail).HasMaxLength(256);
        builder.Property(o => o.Governorate).IsRequired().HasMaxLength(100);
        builder.Property(o => o.City).IsRequired().HasMaxLength(100);
        builder.Property(o => o.AddressLine).IsRequired().HasMaxLength(500);
        builder.Property(o => o.DeliveryNotes).HasMaxLength(1000);
        builder.Property(o => o.Subtotal).HasColumnType("decimal(18,2)");
        builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.Property(o => o.ShippingFee).HasColumnType("decimal(18,2)");
        builder.Property(o => o.Total).HasColumnType("decimal(18,2)");
        builder.Property(o => o.InternalNotes).HasMaxLength(2000);
        builder.Property(o => o.UserId).HasMaxLength(450);
        builder.Property(o => o.CreatedBy).HasMaxLength(256);

        builder.HasMany(o => o.Items)
            .WithOne(i => i.Order)
            .HasForeignKey(i => i.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.StatusHistory)
            .WithOne(h => h.Order)
            .HasForeignKey(h => h.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(o => o.PrimaryPhone);
        builder.HasIndex(o => o.Status);
        builder.HasIndex(o => o.CreatedAt);
        builder.HasIndex(o => o.UserId);
    }
}
