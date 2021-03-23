using System.ComponentModel;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Belgrade.SqlClient;
using Iris.Controllers;


namespace services.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PageBuilderController : BaseController<PageBuilderController>
    {
        ICommand cmd = null;

        public PageBuilderController(ICommand sqlCommandService)
        {
            this.cmd = sqlCommandService;
        }

        [HttpGet("{id}")]
        public async Task Get(string id)
        {
            string SPName = string.Empty;
            if (id.Contains("Preview"))
            {
                SPName = "framework.Infra_PreviewPageBuilder_Get";
            }
            else
            {
                SPName = "framework.Infra_PageBuilder_Get";
            }

            await cmd.Proc(SPName).Param("@PageName", id).Param("@context", GetUserContext()).Stream(Response.Body);
        }
    }
}