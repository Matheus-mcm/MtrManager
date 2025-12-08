using Microsoft.AspNetCore.Mvc;
using MtrManager.Entities;
using MtrManager.Services;

namespace MtrManager.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly CompanyService _companyService;

        public CompanyController(CompanyService companyService)
        {
            _companyService = companyService;
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAllAsync()
        {
            var companies = _companyService.GetAllCompanies();
            return Ok(companies);
        }

        [HttpGet("{cnpj}")]
        public IActionResult GetByCnpj(string cnpj)
        {
            var company = _companyService.GetCompanyByCnpj(cnpj);
            if (company == null)
            {
                return NotFound(new { error = $"Empresa com CNPJ {cnpj} não encontrada" });
            }
            return Ok(company);
        }

        [HttpPost("Create")]
        public IActionResult Create([FromBody] Company company)
        {
            if (company == null || string.IsNullOrWhiteSpace(company.Cnpj))
            {
                return BadRequest(new { error = "CNPJ é obrigatório" });
            }

            // Verificar se já existe
            var existing = _companyService.GetCompanyByCnpj(company.Cnpj);
            if (existing != null)
            {
                return Conflict(new { error = $"Empresa com CNPJ {company.Cnpj} já existe" });
            }

            var success = _companyService.CreateCompany(company);
            if (!success)
            {
                return BadRequest(new { error = "Erro ao criar empresa" });
            }

            return Created($"/Company/{company.Cnpj}", company);
        }

        [HttpPut("{cnpj}")]
        public IActionResult Update(string cnpj, [FromBody] Company company)
        {
            if (string.IsNullOrWhiteSpace(cnpj))
            {
                return BadRequest(new { error = "CNPJ é obrigatório" });
            }

            // Verificar se existe
            var existing = _companyService.GetCompanyByCnpj(cnpj);
            if (existing == null)
            {
                return NotFound(new { error = $"Empresa com CNPJ {cnpj} não encontrada" });
            }

            var success = _companyService.UpdateCompany(cnpj, company);
            if (!success)
            {
                return BadRequest(new { error = "Erro ao atualizar empresa" });
            }

            return Ok(new { message = "Empresa atualizada com sucesso" });
        }

        [HttpDelete("{cnpj}")]
        public IActionResult Delete(string cnpj)
        {
            if (string.IsNullOrWhiteSpace(cnpj))
            {
                return BadRequest(new { error = "CNPJ é obrigatório" });
            }

            var success = _companyService.DeleteCompany(cnpj);
            if (!success)
            {
                return NotFound(new { error = $"Empresa com CNPJ {cnpj} não encontrada" });
            }

            return Ok(new { message = "Empresa deletada com sucesso" });
        }

        [HttpPut("UpdateStatus/{cnpj}")]
        public IActionResult UpdateStatus(string cnpj, [FromBody] UpdateCompanyStatusRequest request)
        {
            if (string.IsNullOrWhiteSpace(cnpj))
            {
                return BadRequest(new { error = "CNPJ é obrigatório" });
            }

            var success = _companyService.UpdateCompanyStatus(cnpj, request.Ativo);

            if (!success)
            {
                return NotFound(new { error = $"Empresa com CNPJ {cnpj} não encontrada" });
            }

            return Ok(new { message = $"Status da empresa {cnpj} atualizado para {request.Ativo}" });
        }
    }

    public class UpdateCompanyStatusRequest
    {
        public bool Ativo { get; set; }
    }
}


