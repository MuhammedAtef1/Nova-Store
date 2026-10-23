using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class StoreSettingsConfiguration : IEntityTypeConfiguration<StoreSettings>
{
    public void Configure(EntityTypeBuilder<StoreSettings> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Key).IsRequired().HasMaxLength(100);
        builder.HasIndex(s => s.Key).IsUnique();
        builder.Property(s => s.Value).IsRequired().HasMaxLength(2000);
        builder.Property(s => s.Description).HasMaxLength(500);
        builder.Property(s => s.Group).HasMaxLength(50);
    }
}
