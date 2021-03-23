using Newtonsoft.Json;

namespace Iris.Model
{
    public class SessionContext
    {
        public string ID { get; set; }
        public string UserID { get; set; }
        public string ActiveRoleID { get; set; }
        public string ActiveLobID { get; set; }
        public string ActiveRole { get; set; }
        public string ActiveLOB { get; set; }
        public string ActiveUserRoleID { get; set; }
        public string DistributionListID { get; set; }
    }
}
