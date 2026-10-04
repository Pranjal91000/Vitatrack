namespace VitaTrack.Api.Options
{
    public class JwtOption
    {
		public const string SectionName = "JwtSettings";

		public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; }
        public short ExpiryMinutes { get; set; }
        public string Audience { get; set; }
	}
}
