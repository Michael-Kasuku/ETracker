namespace etracker.Server.DTO
{
    public class DeviceUpdateRequest
    {
        public int Id { get; set; }
        public string? Name { get; set; } // Device Name
        public string? IMEI { get; set; } // The IMEI number
    }
}
