using FluentValidation;

namespace VitaTrack.Api.Models.WeightTracker
{
    public class WeightTrackerBaseInputModel
    {
        public DateOnly RecordedOn { get; set; }
        public decimal Weight { get; set; }
        public decimal? BodyFatPercent { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>Creating an entry for a date that already has one updates it (one weigh-in per day).</summary>
    public class WeightTrackerSaveInputModel : WeightTrackerBaseInputModel
    {
    }

    public class WeightTrackerUpdateInputModel : WeightTrackerBaseInputModel
    {
        public long Id { get; set; }
    }

    public class WeightTrackerSaveValidator : AbstractValidator<WeightTrackerSaveInputModel>
    {
        public WeightTrackerSaveValidator()
        {
            RuleFor(x => x.Weight).InclusiveBetween(20, 400);
            RuleFor(x => x.BodyFatPercent).InclusiveBetween(2, 70).When(x => x.BodyFatPercent.HasValue);
            RuleFor(x => x.Notes).MaximumLength(500);
        }
    }

    public class WeightTrackerUpdateValidator : AbstractValidator<WeightTrackerUpdateInputModel>
    {
        public WeightTrackerUpdateValidator()
        {
            RuleFor(x => x.Weight).InclusiveBetween(20, 400);
            RuleFor(x => x.BodyFatPercent).InclusiveBetween(2, 70).When(x => x.BodyFatPercent.HasValue);
            RuleFor(x => x.Notes).MaximumLength(500);
        }
    }
}
