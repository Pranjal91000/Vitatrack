using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VitaTrack.Core.Entities.GlobalData
{
    [Table("Status", Schema = "globaldata")]
    public class Status
    {
        public string StatusName { get; set; } = string.Empty;
        [Key]
        public short StatusNo { get; set; }
    }
}
