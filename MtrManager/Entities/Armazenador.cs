using System.Xml.Serialization;

public class Armazenador
{
    [XmlElement("razaoSocial")]
    public string RazaoSocial { get; set; } = string.Empty;

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

    [XmlElement("dataRecebimento")]
    public string DataRecebimento { get; set; } = string.Empty;
}
