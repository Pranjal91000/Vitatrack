using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Models.WeightTracker;

namespace VitaTrack.Api.Controllers
{
    [ApiController]
    [Route("api/weight-tracker")]
    [Authorize]
    public class WeightTrackerController(IWeightTrackerService service) : ControllerBase
    {
        private readonly IWeightTrackerService _service = service;

        /// <summary>Log a weigh-in. Re-logging the same date replaces that day's entry.</summary>
        [HttpPost]
        public async Task<ActionResult<WeightTrackerViewModel>> SaveWeightAsync(WeightTrackerSaveInputModel input, CancellationToken ct)
        {
            return Ok(await _service.SaveWeightAsync(input, ct));
        }

        [HttpPut("{id:long}")]
        public async Task<ActionResult<WeightTrackerViewModel>> UpdateWeightAsync(long id, WeightTrackerUpdateInputModel input, CancellationToken ct)
        {
            input.Id = id;
            var result = await _service.UpdateWeightAsync(input, ct);
            return result is null ? NotFound() : Ok(result);
        }

        /// <summary>Legacy shape: id in the body.</summary>
        [HttpPut]
        public async Task<ActionResult<WeightTrackerViewModel>> UpdateWeightLegacyAsync(WeightTrackerUpdateInputModel input, CancellationToken ct)
        {
            var result = await _service.UpdateWeightAsync(input, ct);
            return result is null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> DeleteWeightAsync([FromRoute] long id, CancellationToken ct)
        {
            return await _service.DeleteWeightTrackedAsync(id, ct) ? NoContent() : NotFound();
        }

        [HttpGet("{id:long}")]
        public async Task<ActionResult<WeightTrackerViewModel>> GetWeightAsync(long id, CancellationToken ct)
        {
            var data = await _service.GetWeightTracked(id, ct);
            return data is null ? NotFound() : Ok(data);
        }

        [HttpGet("latest-record")]
        public async Task<ActionResult<WeightTrackerViewModel>> GetLatestAsync(CancellationToken ct)
        {
            var data = await _service.GetWeightTracked(null, ct);
            return data is null ? NotFound() : Ok(data);
        }

        [HttpGet("weight-history")]
        public async Task<ActionResult<List<WeightTrackerViewModel>>> GetWeightHistoryAsync([FromQuery] DateOnly? fromDate, [FromQuery] DateOnly? toDate, CancellationToken ct)
        {
            return Ok(await _service.GetWeightTrackedHistory(fromDate, toDate, ct));
        }
    }
}
