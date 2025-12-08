using MtrManager.Entities;
using System.Text.Json;

namespace MtrManager.Services
{
    public class CompanyService
    {
        private readonly string _companyFilePath;
        private readonly ILogger<CompanyService> _logger;

        public CompanyService(ILogger<CompanyService> logger)
        {
            _logger = logger;
            _companyFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "companies.json");
        }

        /// <summary>
        /// Carrega todas as empresas do arquivo JSON
        /// </summary>
        public List<Company> GetAllCompanies()
        {
            try
            {
                if (!File.Exists(_companyFilePath))
                {
                    _logger.LogWarning($"Arquivo de empresas não encontrado em {_companyFilePath}");
                    return new List<Company>();
                }

                var json = File.ReadAllText(_companyFilePath);
                List<Company> companies = JsonSerializer.Deserialize<List<Company>>(json, options: new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }) ?? [];
                
                return companies;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao carregar empresas: {ex.Message}");
                return new List<Company>();
            }
        }

        /// <summary>
        /// Obtém uma empresa específica pelo CNPJ
        /// </summary>
        public Company? GetCompanyByCnpj(string cnpj)
        {
            var companies = GetAllCompanies();
            return companies.FirstOrDefault(c => c.Cnpj == cnpj);
        }

        /// <summary>
        /// Atualiza o status ativo de uma empresa
        /// </summary>
        public bool UpdateCompanyStatus(string cnpj, bool ativo)
        {
            try
            {
                var companies = GetAllCompanies();
                var company = companies.FirstOrDefault(c => c.Cnpj == cnpj);

                if (company == null)
                {
                    _logger.LogWarning($"Empresa com CNPJ {cnpj} não encontrada");
                    return false;
                }

                company.Ativo = ativo;

                SaveCompanies(companies);
                _logger.LogInformation($"Status da empresa {cnpj} atualizado para {ativo}");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao atualizar status da empresa: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Cria uma nova empresa
        /// </summary>
        public bool CreateCompany(Company company)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(company.Cnpj))
                {
                    _logger.LogWarning("CNPJ é obrigatório para criar uma empresa");
                    return false;
                }

                var companies = GetAllCompanies();

                // Verificar se já existe empresa com esse CNPJ
                if (companies.Any(c => c.Cnpj == company.Cnpj))
                {
                    _logger.LogWarning($"Empresa com CNPJ {company.Cnpj} já existe");
                    return false;
                }

                // Definir ativo como true por padrão
                company.Ativo = true;

                companies.Add(company);
                SaveCompanies(companies);

                _logger.LogInformation($"Empresa {company.RazaoSocial} criada com sucesso");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao criar empresa: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Atualiza uma empresa existente
        /// </summary>
        public bool UpdateCompany(string cnpj, Company updatedCompany)
        {
            try
            {
                var companies = GetAllCompanies();
                var company = companies.FirstOrDefault(c => c.Cnpj == cnpj);

                if (company == null)
                {
                    _logger.LogWarning($"Empresa com CNPJ {cnpj} não encontrada");
                    return false;
                }

                // Atualizar propriedades (mantém o CNPJ como chave)
                company.RazaoSocial = updatedCompany.RazaoSocial;
                company.Unidade = updatedCompany.Unidade;
                company.Cpf = updatedCompany.Cpf;
                company.Senha = updatedCompany.Senha;
                company.Ativo = updatedCompany.Ativo;

                SaveCompanies(companies);

                _logger.LogInformation($"Empresa {cnpj} atualizada com sucesso");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao atualizar empresa: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Deleta uma empresa
        /// </summary>
        public bool DeleteCompany(string cnpj)
        {
            try
            {
                var companies = GetAllCompanies();
                var company = companies.FirstOrDefault(c => c.Cnpj == cnpj);

                if (company == null)
                {
                    _logger.LogWarning($"Empresa com CNPJ {cnpj} não encontrada");
                    return false;
                }

                companies.Remove(company);
                SaveCompanies(companies);

                _logger.LogInformation($"Empresa {cnpj} deletada com sucesso");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao deletar empresa: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Salva as empresas no arquivo JSON
        /// </summary>
        private void SaveCompanies(List<Company> companies)
        {
            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = false
                };

                var json = JsonSerializer.Serialize(companies, options);
                File.WriteAllText(_companyFilePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Erro ao salvar empresas: {ex.Message}");
                throw;
            }
        }
    }
}
