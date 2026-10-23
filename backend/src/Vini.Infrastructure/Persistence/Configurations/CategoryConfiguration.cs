using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Name).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Slug).IsRequired().HasMaxLength(120);
        builder.HasIndex(c => c.Slug).IsUnique();
        builder.Property(c => c.Description).HasMaxLength(1000);
        builder.Property(c => c.ImageUrl).HasMaxLength(500);
        builder.Property(c => c.CreatedBy).HasMaxLength(256);
        builder.Property(c => c.UpdatedBy).HasMaxLength(256);
        builder.HasQueryFilter(c => !c.IsDeleted);
    }
}
