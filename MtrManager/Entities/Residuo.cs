using System.Xml.Serialization;

public class Residuo
{
    [XmlElement("item")]
    public string Item { get; set; } = string.Empty;

    [XmlElement("codigoIbamaDenominacao")]
    public string CodigoIbamaDenominacao { get; set; } = string.Empty;

    [XmlElement("estadoFisico")]
    public string EstadoFisico { get; set; } = string.Empty;

    [XmlElement("classe")]
    public string Classe { get; set; } = string.Empty;

    [XmlElement("acondicionamento")]
    public string Acondicionamento { get; set; } = string.Empty;

    [XmlElement("quantidade")]
    public string Quantidade { get; set; } = string.Empty;

    [XmlElement("unidade")]
    public string Unidade { get; set; } = string.Empty;

    [XmlElement("tratamento")]
    public string Tratamento { get; set; } = string.Empty;

    [XmlElement("onu")]
    public string Onu { get; set; } = string.Empty;

    [XmlElement("codigoInterno")]
    public string CodigoInterno { get; set; } = string.Empty;

    [XmlElement("observacao")]
    public string Observacao { get; set; } = string.Empty;
}
