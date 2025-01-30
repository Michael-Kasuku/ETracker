namespace etracker.Server.DTO
{
    public class LoginResult
    {
        //True if login attempt is successful False otherwise
        public bool Success { get; set; }
        //Login attempt result message
        public required string Message { get; set; }
        public string? Token { get; set; }
    }
}
