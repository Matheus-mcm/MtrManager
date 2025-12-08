using System.Xml.Serialization;

public class Observacao
{
    [XmlElement("resCodigoIbama")]
    public string ResCodigoIbama { get; set; } = string.Empty;

    [XmlElement("resDescricao")]
    public string ResDescricao { get; set; } = string.Empty;

    [XmlElement("marJustificativa")]
    public string MarJustificativa { get; set; } = string.Empty;

    [XmlElement("descricao")]
    public string Descricao { get; set; } = string.Empty;
}
