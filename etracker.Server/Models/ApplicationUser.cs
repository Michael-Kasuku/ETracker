using Microsoft.AspNetCore.Identity;

namespace etracker.Server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? FullName { get; set; }
        public byte[]? ProfilePicture { get; set; } // For storing profile pictures as a byte array
    }
}
