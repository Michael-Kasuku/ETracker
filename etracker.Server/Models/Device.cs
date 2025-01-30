namespace etracker.Server.Models
{
    public class Device
    {
        public int Id { get; set; }
        public string? Name { get; set; } // Device Name
        public string? IMEI { get; set; } // The IMEI number
        public string? Owner { get; set; } // The email address of the owner
        public DateTime Timestamp { get; set; } = DateTime.UtcNow; // Time added to the system
    }
}
