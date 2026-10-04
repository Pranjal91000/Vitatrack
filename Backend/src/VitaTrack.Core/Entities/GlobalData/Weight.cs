using System.ComponentModel.DataAnnotations.Schema;

namespace VitaTrack.Core.Entities.GlobalData
{
    [Table("Weight", Schema = "globaldata")]
    public class Weight
    {
        public short Id { get; set; }
        public string UnitName { get; set; } = string.Empty;
        public decimal ConversionUnitToKg { get; set; }
    }
}
