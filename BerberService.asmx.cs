using System;
using System.Data;
using System.Web.Services;
using System.Web.Script.Services;
using helpDeskLib;

namespace helpDeskApp.service
{
    /// <summary>
    /// Summary description for BerberService
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [ScriptService]
    public class BerberService : System.Web.Services.WebService
    {
        private islem islemler = new islem();

        [WebMethod]
        [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
        public string GetHizmetPrice(int hizmetId)
        {
            try
            {
                DataTable dt = islemler.berberHizmetListesi();
                DataRow[] rows = dt.Select($"HIZMET_ID = {hizmetId}");
                
                if (rows.Length > 0 && rows[0]["UCRET"] != DBNull.Value)
                {
                    return rows[0]["UCRET"].ToString();
                }
                return "0";
            }
            catch (Exception ex)
            {
                // Log the error
                return "0";
            }
        }
    }
} 