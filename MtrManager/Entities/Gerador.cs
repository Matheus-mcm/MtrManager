using System.Xml.Serialization;

public class Gerador
{
    [XmlElement("razaoSocial")]
    public string RazaoSocial { get; set; } = string.Empty;

    [XmlElement("cpfCnpj")]
    public string CpfCnpj { get; set; } = string.Empty;

    [XmlElement("endereco")]
    public string Endereco { get; set; } = string.Empty;

    [XmlElement("telefone")]
    public string Telefone { get; set; } = string.Empty;

    [XmlElement("faxTel")]
    public string FaxTel { get; set; } = string.Empty;

    [XmlElement("municipio")]
    public string Municipio { get; set; } = string.Empty;

    [XmlElement("estado")]
    public string Estado { get; set; } = string.Empty;

    [XmlElement("responsavel")]
    public string Responsavel { get; set; } = string.Empty;

    [XmlElement("cargoResp")]
    public string CargoResp { get; set; } = string.Empty;

    [XmlElement("obsGerador")]
    public string ObsGerador { get; set; } = string.Empty;

    [XmlElement("dataEmissao")]
    public string DataEmissao { get; set; } = string.Empty;
}
