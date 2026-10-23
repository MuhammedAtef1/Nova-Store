using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Vini.Domain.Entities;

namespace Vini.Infrastructure.Persistence.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.ReviewerName).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Title).HasMaxLength(200);
        builder.Property(r => r.Body).HasMaxLength(2000);
        builder.Property(r => r.UserId).HasMaxLength(450);
        builder.HasIndex(r => r.ProductId);
    }
}
