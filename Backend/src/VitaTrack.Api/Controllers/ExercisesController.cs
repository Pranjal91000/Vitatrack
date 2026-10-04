using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Common.Models;
using VitaTrack.Api.Workouts.DTOs;

namespace VitaTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ExercisesController(IExerciseService exerciseService, IWebHostEnvironment env) : ControllerBase
{
    private readonly IExerciseService _exerciseService = exerciseService;
    private readonly IWebHostEnvironment _env = env;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ExerciseDto>>>> GetExercises([FromQuery] string search = "", [FromQuery] int page = 1, [FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        var response = await _exerciseService.GetExercisesAsync(search, page, limit, cancellationToken);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseDto>> CreateExercise([FromBody] CreateExerciseRequest request, CancellationToken cancellationToken)
    {
        var dto = await _exerciseService.CreateExerciseAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetExercises), new { id = dto.Id }, dto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExerciseDto>> UpdateExercise(long id, [FromBody] UpdateExerciseRequest request, CancellationToken cancellationToken)
    {
        var (dto, error) = await _exerciseService.UpdateExerciseAsync(id, request, cancellationToken);
        if (error == "NotFound") return NotFound("Exercise not found");
        if (error == "Forbid") return Forbid();

        return Ok(dto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExercise(long id, CancellationToken cancellationToken)
    {
        var (success, error) = await _exerciseService.DeleteExerciseAsync(id, _env.ContentRootPath, cancellationToken);
        if (error == "NotFound") return NotFound("Exercise not found");
        if (error == "Forbid") return Forbid();

        return NoContent();
    }

    [HttpPost("{id}/demo-media")]
    [RequestSizeLimit(100_000_000)]
    [RequestFormLimits(MultipartBodyLengthLimit = 100_000_000)]
    public async Task<ActionResult<ExerciseDto>> UploadDemoMedia(long id, IFormFile file, CancellationToken cancellationToken)
    {
        var (dto, error) = await _exerciseService.UploadDemoMediaAsync(id, file, _env.ContentRootPath, cancellationToken);
        if (error == "FileRequired") return BadRequest("File required");
        if (error == "InvalidFileType") return BadRequest("Allowed types: video/mp4, video/webm, video/quicktime");
        if (error == "NotFound") return NotFound("Exercise not found");
        if (error == "Forbid") return Forbid();

        return Ok(dto);
    }

    [HttpGet("{id}/demo-media")]
    public async Task<IActionResult> GetDemoMedia(long id, CancellationToken cancellationToken)
    {
        var (path, contentType, error) = await _exerciseService.GetDemoMediaAsync(id, _env.ContentRootPath, cancellationToken);
        if (error != null) return NotFound();

        var stream = System.IO.File.OpenRead(path!);
        return File(stream, contentType!, enableRangeProcessing: true);
    }

    [HttpDelete("{id}/demo-media")]
    public async Task<ActionResult<ExerciseDto>> DeleteDemoMedia(long id, CancellationToken cancellationToken)
    {
        var (dto, error) = await _exerciseService.DeleteDemoMediaAsync(id, _env.ContentRootPath, cancellationToken);
        if (error == "NotFound") return NotFound("Exercise not found");
        if (error == "Forbid") return Forbid();

        return Ok(dto);
    }
}
