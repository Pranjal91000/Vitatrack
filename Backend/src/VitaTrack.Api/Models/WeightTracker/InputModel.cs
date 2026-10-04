namespace VitaTrack.Api.Models.WeightTracker
{
    public class WeightTrackerBaseInputModel
    {
        public DateOnly RecordedOn { get; set; }
        public decimal Weight { get; set; }
    }

    public class WeightTrackerSaveInputModel : WeightTrackerBaseInputModel
    { 
    }

    public class WeightTrackerUpdateInputModel : WeightTrackerBaseInputModel
    {
        public long Id { get; set; }
    }
}
