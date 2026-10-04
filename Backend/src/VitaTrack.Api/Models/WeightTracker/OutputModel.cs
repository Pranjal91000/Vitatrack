namespace VitaTrack.Api.Models.WeightTracker
{
    public class WeightTrackerViewModel
    {
        public long Id { get; set; }
        public DateOnly RecordedOn { get; set; }
        public decimal Weight { get; set; }
    }
}
