using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using etracker.Server.DTO;
using etracker.Server.Models;

namespace etracker.Server.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JwtHandler _jwtHandler;

        public AccountController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, JwtHandler jwtHandler)
        {
            _context = context;
            _userManager = userManager;
            _jwtHandler = jwtHandler;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Email))
            {
                return BadRequest(new { message = "Invalid user data." });
            }

            // Retrieve the user by email
            var currentUser = await _userManager.FindByEmailAsync(request.Email);

            if (currentUser == null)
            {
                return NotFound(new { message = "User not found." });
            }

            // Process the profile picture
            if (request.ProfilePicture != null)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await request.ProfilePicture.CopyToAsync(memoryStream);
                    currentUser.ProfilePicture = memoryStream.ToArray();
                }
            }

            // Save changes to the database
            var result = await _userManager.UpdateAsync(currentUser);

            if (!result.Succeeded)
            {
                // Include detailed errors from the result
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"Error updating user profile: {errors}" });
            }

            return Ok(new { message = "Profile updated successfully." });
        }


        [HttpGet]
        public async Task<IActionResult> getProfileImage(string Email)
        {
            if (string.IsNullOrEmpty(Email))
            {
                return BadRequest("Invalid user data.");
            }

            // Retrieve the user by email
            var currentUser = await _userManager.FindByEmailAsync(Email);

            if (currentUser == null)
            {
                return NotFound("User not found.");
            }

            // Check if the user has a profile picture
            if (currentUser.ProfilePicture == null || currentUser.ProfilePicture.Length == 0)
            {
                return NotFound("Profile picture not found.");
            }

            // Return the profile picture
            return File(currentUser.ProfilePicture, "image/png");
        }
    }
}
