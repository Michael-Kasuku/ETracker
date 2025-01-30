namespace etracker.Server.DTO
{
    public class UpdateProfileRequest
    {
        public string? Email { get; set; }
        public IFormFile? ProfilePicture { get; set; } // For handling file uploads
    }
}
