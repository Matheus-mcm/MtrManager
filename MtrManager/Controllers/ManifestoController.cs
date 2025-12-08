using Microsoft.AspNetCore.Mvc;
using MtrManager.Entities;
using MtrManager.Services;
using SinirIntegration;
using System.Text.RegularExpressions;
using System.Xml.Serialization;

namespace MtrManager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ManifestoController : ControllerBase
    {
        private static readonly Regex _regex = new Regex(@"\D");
        private readonly CompanyService _companyService;

        public ManifestoController(CompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet("GetByCnpj/{cnpj}")]
        public IEnumerable<Manifesto> Get(string cnpj)
        {
            if (cnpj.Length > 14)
                cnpj = _regex.Replace(cnpj, "");

            if (Directory.Exists($"C:\\Users\\act\\Desktop\\Mtrs\\{cnpj}"))
            {
                List<Manifesto> manifestos = new();
                string basePath = $@"C:\Users\act\Desktop\Mtrs\{cnpj}";
                string[] arquivos = Directory.GetFiles(basePath, "*.xml", SearchOption.TopDirectoryOnly);

                foreach (string arquivo in arquivos)
                {
                    var serializer = new XmlSerializer(typeof(Manifesto));
                    using var stream = System.IO.File.OpenRead(arquivo);

                    Manifesto? manifesto = (Manifesto?)serializer.Deserialize(stream);

                    if (manifesto != null)
                        manifestos.Add(manifesto);
                    else
                        Console.WriteLine($"[WARN] Arquivo '{Path.GetFileName(arquivo)}' não gerou objeto.");
                }

                return manifestos;
            }
            return [];
        }

        [HttpPost("UpdateMtrs")]
        public async Task<IActionResult> UpdateMtrAsync([FromBody] UpdateMtrsRequest request)
        {
            try
            {
                var folderPath = $@"C:\Users\act\Desktop\Mtrs\{request.Cnpj}";

                var result = await SinirService.DownloadMtrsAsync(
                    cnpj: request.Cnpj,
                    cpf: request.Cpf,
                    unity: request.Unity,
                    password: request.Password,
                    folderPath: folderPath,
                    initialDate: request.InitialDate,
                    finalDate: request.FinalDate,
                    fileType: request.FileType ?? "code",
                    headless: request.Headless ?? true
                );

                if (!result.Success)
                {
                    // Se o login falhou, marcar a empresa como inativa
                    if (!result.LoginSuccess)
                    {
                        _companyService.UpdateCompanyStatus(request.Cnpj, false);
                    }

                    return BadRequest(new { error = result.Message, loginFailed = !result.LoginSuccess });
                }

                // Se o login foi bem-sucedido, marcar a empresa como ativa
                _companyService.UpdateCompanyStatus(request.Cnpj, true);

                return Ok(new { message = result.Message, filesDownloaded = result.FilesDownloaded });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Erro ao baixar MTRs: {ex.Message}" });
            }
        }
    }
}


