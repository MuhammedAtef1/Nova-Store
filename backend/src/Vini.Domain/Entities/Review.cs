using Vini.Domain.Common;

namespace Vini.Domain.Entities;

public class Review : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public string? UserId { get; set; }
    public string ReviewerName { get; set; } = string.Empty;
    public int Rating { get; set; }   // 1-5
    public string? Title { get; set; }
    public string? Body { get; set; }
    public bool IsApproved { get; set; } = true;
    public bool IsVerifiedPurchase { get; set; } = false;
}
