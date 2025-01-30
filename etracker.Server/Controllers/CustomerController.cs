using etracker.Server.DTO;
using etracker.Server.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.EntityFrameworkCore;

namespace etracker.Server.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;
        private readonly RoleManager<IdentityRole> _roleManager;

        public CustomerController(
            ApplicationDbContext context,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            JwtHandler jwtHandler)
        {
            _context = context;
            _roleManager = roleManager;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginRequest loginRequest)
        {
            var user = await _userManager.FindByNameAsync(loginRequest.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginRequest.Password))
            {
                return Unauthorized(new LoginResult()
                {
                    Success = false,
                    Message = "Invalid Email or Password."
                });
            }
            // Check if the user is in the "Customer" role
            var isCustomer = await _userManager.IsInRoleAsync(user, "Customer");
            if (!isCustomer)
            {
                return Unauthorized(new LoginResult()
                {
                    Success = false,
                    Message = "Access denied. You must be a Customer to log in."
                });
            }

            var secToken = await _jwtHandler.GetTokenAsync(user);
            var jwt = new JwtSecurityTokenHandler().WriteToken(secToken);
            return Ok(new LoginResult()
            {
                Success = true,
                Message = "Login successful",
                Token = jwt
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] ApplicationUser newUser)
        {
            string roleCustomer = "Customer";

            // Ensure the "Customer" role exists
            if (await _roleManager.FindByNameAsync(roleCustomer) == null)
            {
                await _roleManager.CreateAsync(new IdentityRole(roleCustomer));
            }

            // Check if the user already exists
            if (await _userManager.FindByNameAsync(newUser.Email) != null)
            {
                return Conflict(new { message = "User already exists!" });
            }

            // Create the new Customer user
            var userVet = new ApplicationUser
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                FullName = newUser.FullName,
                UserName = newUser.Email,
                Email = newUser.Email,
                EmailConfirmed = true,
                LockoutEnabled = false
            };

            //Assign  the Password to the User
            await _userManager.CreateAsync(userVet, newUser.PasswordHash);

            // Assign the "Customer" role
            await _userManager.AddToRoleAsync(userVet, roleCustomer);

            // Save changes again after role assignment
            await _context.SaveChangesAsync();

            return Ok(new { message = "Customer Account created successfully!" });
        }

        [HttpGet]
        public async Task<IActionResult> getDevices(string Email)
        {
            var devices = await _context.Devices
                .Where(d => d.Owner == Email) // Filter by owner email
                .Select(d => new
                {
                    Id = d.Id,
                    Name = d.Name,
                    IMEI = d.IMEI,
                    dateAdded = d.Timestamp,
                })
                .ToListAsync();

            return Ok(devices);
        }

        [HttpPost]
        public async Task<IActionResult> AddDevice([FromBody] Device device)
        {
            if (await _context.Devices.AnyAsync(d => d.IMEI == device.IMEI))
            {
                throw new Exception("A device with this IMEI already exists.");
            }

            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(AddDevice), new { id = device.Id }, device);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateDevice([FromBody] Device device)
        {
            var existingDevice = await _context.Devices.FindAsync(device.Id);
            if (existingDevice == null)
            {
                return NotFound();
            }

            // Update the existing device properties
            existingDevice.Name = device.Name;
            existingDevice.IMEI = device.IMEI;
            _context.Devices.Update(existingDevice);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")] // Accepts ID in the URL
        public async Task<IActionResult> DeleteDevice(int id)
        {
            var existingDevice = await _context.Devices.FindAsync(id);
            if (existingDevice == null)
            {
                return NotFound();
            }

            _context.Devices.Remove(existingDevice);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
