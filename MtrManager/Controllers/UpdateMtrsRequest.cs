namespace MtrManager.Controllers
{
    public class UpdateMtrsRequest
    {
        public string Cnpj { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public string Unity { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public DateTime InitialDate { get; set; }
        public DateTime FinalDate { get; set; }
        public string? FileType { get; set; }
        public bool? Headless { get; set; }
    }
}

