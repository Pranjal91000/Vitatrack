using Microsoft.AspNetCore.Mvc;
using VitaTrack.Api.Abstractions;
using VitaTrack.Api.Models.WeightTracker;

namespace VitaTrack.Api.Controllers
{
    [ApiController]
    [Route("api/weight-tracker")]
    public class WeightTrackerController(IWeightTrackerService service) : ControllerBase
    {
        private readonly IWeightTrackerService _weightTrackerService = service;

        [HttpPost]
        public async Task<ActionResult<bool>> SaveWeightAsync(WeightTrackerSaveInputModel input)
        {
            return await _weightTrackerService.SaveWeightAsync(input);
        }

        [HttpPut]
        public async Task<ActionResult<bool>> UpdateWeightAsync(WeightTrackerUpdateInputModel input)
        {
            return await _weightTrackerService.UpdateWeightAsync(input);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteWeightAsync([FromRoute] long id)
        {
            return await _weightTrackerService.DeleteWeightTrackedAsync(id);
        }

        [HttpGet]
        public async Task<ActionResult<WeightTrackerViewModel>> GetWeightAsync([FromQuery] long id)
        {
            var data = await _weightTrackerService.GetWeightTracked(id);

            if (data is null)
                return NotFound();

            return Ok(data);
        }

        [HttpGet("latest-record")]
        public async Task<ActionResult<WeightTrackerViewModel>> GetWeightAsync()
        {
            var data = await _weightTrackerService.GetWeightTracked(null);

            if (data is null)
                return NotFound();

            return Ok(data);
        }

        [HttpGet("weight-history")]
        public async Task<ActionResult<List<WeightTrackerViewModel>>> GetWeightHistoryAsync([FromQuery] DateOnly fromDate, DateOnly toDate)
        {
            var data = await _weightTrackerService.GetWeightTrackedHistory(fromDate, toDate);
            return Ok(data);
        }
    }
}
