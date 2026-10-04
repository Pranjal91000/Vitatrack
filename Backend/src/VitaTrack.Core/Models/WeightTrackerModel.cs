namespace VitaTrack.Core.Models
{
    public class GetWeightByDate
    {
        public long Id { get; set; }
        public DateOnly RecordedOn { get; set; }
        public decimal Weight { get; set; }
    }
}
