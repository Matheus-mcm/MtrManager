using System.Xml.Serialization;

namespace MtrManager.Entities
{
    [XmlRoot("manifesto")]
    public class Manifesto
    {
        [XmlElement("mtrNumero")]
        public string MtrNumero { get; set; } = string.Empty;

        [XmlElement("codigoBarras")]
        public string CodigoBarras { get; set; } = string.Empty;

        [XmlElement("gerador")]
        public Gerador Gerador { get; set; } = new();

        [XmlElement("transportador")]
        public Transportador Transportador { get; set; } = new();

        [XmlElement("armazenador")]
        public Armazenador Armazenador { get; set; } = new();

        [XmlElement("destinador")]
        public Destinador Destinador { get; set; } = new();

        [XmlArray("residuos")]
        [XmlArrayItem("residuo")]
        public List<Residuo> Residuos { get; set; } = [];

        [XmlArray("obsevacoes")]
        [XmlArrayItem("observacao")]
        public List<Observacao> Obsevacoes { get; set; } = [];
    }
}
