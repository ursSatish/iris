using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Newtonsoft.Json;

using Iris.Model;

namespace Iris.Controllers
{
    public class BaseController<T> : Controller where T : BaseController<T>
    {
        public string GetUserContext()
        {
            var identity = HttpContext.User.Identity as ClaimsIdentity;
            SessionContext sessionContext = new SessionContext();
            sessionContext.UserID = identity.FindFirst("UserID").Value;
            if (identity.FindFirst("ActiveRole") != null && identity.FindFirst("ActiveRoleID") != null)
            {
                sessionContext.ActiveRole = identity.FindFirst("ActiveRole").Value;
                sessionContext.ActiveRoleID = identity.FindFirst("ActiveRoleID")?.Value;
            }
            if (identity.FindFirst("ActiveLobID") != null)
            {
                sessionContext.ActiveLobID = identity.FindFirst("ActiveLobID")?.Value;
            }

            return JsonConvert.SerializeObject(sessionContext);
        }
        // need to verify to remove
        protected IActionResult HandleException(Exception ex, string msg)
        {
            IActionResult ret;

            ret = StatusCode(
                StatusCodes.Status500InternalServerError, new Exception(msg, ex));
            return ret;
        }
    }
}