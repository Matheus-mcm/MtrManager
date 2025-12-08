using System.Xml.Serialization;

public class Transportador
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

    [XmlElement("motorista")]
    public string Motorista { get; set; } = string.Empty;

    [XmlElement("placaVeiculo")]
    public string PlacaVeiculo { get; set; } = string.Empty;

    [XmlElement("dataTransporte")]
    public string DataTransporte { get; set; } = string.Empty;
}
