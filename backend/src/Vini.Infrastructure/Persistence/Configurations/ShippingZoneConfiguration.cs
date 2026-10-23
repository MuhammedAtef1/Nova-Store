using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class ShippingZoneConfiguration : IEntityTypeConfiguration<ShippingZone>
{
    public void Configure(EntityTypeBuilder<ShippingZone> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Governorate).IsRequired().HasMaxLength(100);
        builder.HasIndex(s => s.Governorate).IsUnique();
        builder.Property(s => s.ShippingFee).HasColumnType("decimal(18,2)");
    }
}
