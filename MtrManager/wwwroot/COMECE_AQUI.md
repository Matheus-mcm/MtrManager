# ?? RESUMO EXECUTIVO - O QUE FAZER AGORA

## ?? Seu Objetivo

Quando o usuário clica em "Atualizar" e seleciona datas, fazer uma requisição ao backend com essas datas.

---

## ? O Que Já Está Pronto

No **FRONTEND** (JavaScript):
- ? Modal de seleção de datas
- ? Validação: máximo 30 dias
- ? Função `carregarManifestosComDatas()` pronta
- ? Função `atualizarManifesto()` pronta

---

## ? O Que Você Precisa Fazer

### PASSO 1: Atualizar seu Controller C#

Arquivo: `MtrManager\Controllers\ManifestoController.cs`

**Encontre este código:**
```csharp
[HttpGet("GetByCnpj/{cnpj}")]
public IEnumerable<Manifesto> Get(string cnpj)
{
    // ... seu código
}
```

**Substitua por isso:**
```csharp
[HttpGet("GetByCnpj/{cnpj}")]
public IEnumerable<Manifesto> Get(
    string cnpj, 
    [FromQuery] DateTime? startDate = null, 
    [FromQuery] DateTime? endDate = null)
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
            {
                // NOVO: Filtrar por datas
                if (startDate.HasValue && endDate.HasValue)
                {
                    if (DateTime.TryParse(manifesto.gerador.dataEmissao, out var emissao))
                    {
                        if (emissao >= startDate.Value && emissao <= endDate.Value)
                        {
                            manifestos.Add(manifesto);
                        }
                    }
                }
                else
                {
                    manifestos.Add(manifesto);
                }
            }
            else
                Console.WriteLine($"[WARN] Arquivo '{Path.GetFileName(arquivo)}' não gerou objeto.");
        }

        return manifestos;
    }
    return [];
}
```

**Mudanças principais:**
1. Adicionou `[FromQuery] DateTime? startDate` e `endDate`
2. Adicionou `if (startDate.HasValue && endDate.HasValue)` para filtrar
3. Se não houver datas, retorna TUDO (compatível com código antigo)

---

### PASSO 2: Criar o Endpoint Update (se não existir)

Se você NÃO tem um endpoint POST `/Manifesto/Update/{mtrNumber}`, adicione isto:

```csharp
[HttpPost("Update/{mtrNumero}")]
public IActionResult Update(string mtrNumero)
{
    try
    {
        // TODO: Seu código de lógica de negócio aqui
        // Exemplo: marcar como processado, salvar em database, mover arquivo, etc.

        return Ok(new
        {
            success = true,
            message = "Manifesto atualizado com sucesso",
            mtrNumero = mtrNumero,
            timestamp = DateTime.Now
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new
        {
            success = false,
            message = ex.Message
        });
    }
}
```

---

## ?? Como Testar

### Usando Postman

#### GET com datas:
```
URL: GET http://localhost:5000/Manifesto/GetByCnpj/12345678901234?startDate=2024-01-01&endDate=2024-01-31
```

Você deve receber um JSON com os manifestos desse período.

#### POST:
```
URL: POST http://localhost:5000/Manifesto/Update/MTR000001
Body: (vazio ou {})
```

Você deve receber:
```json
{
  "success": true,
  "message": "Manifesto atualizado com sucesso",
  "mtrNumero": "MTR000001"
}
```

---

### No Navegador

1. Abrir seu site
2. Selecionar uma empresa
3. Clicar em "Atualizar"
4. Selecionar datas
5. Clicar "Aplicar"
6. **Abrir F12 ? Aba Console**
7. Você verá:
   ```
   Chamando backend: /Manifesto/GetByCnpj/12345678901234?startDate=2024-01-01&endDate=2024-01-31
   ```
8. Na aba **Network**, você vê a requisição sendo feita

---

## ?? Estrutura do JavaScript Agora

```javascript
// Variáveis globais
let selectedDates = { startDate: null, endDate: null }

// Quando clicar em "Aplicar" no modal de datas:
handleApply() {
    selectedDates = { startDate: "2024-01-01", endDate: "2024-01-31" }
    carregarManifestosComDatas(cnpj)  // ? Chama o backend AQUI
}

// Esta função faz a requisição GET:
async function carregarManifestosComDatas(cnpj) {
    const url = `/Manifesto/GetByCnpj/${cnpj}?startDate=${selectedDates.startDate}&endDate=${selectedDates.endDate}`
    const response = await fetch(url)
    const manifestos = await response.json()
    atualizarTabelaManifestos(manifestos)  // ? Atualiza HTML
}

// Quando clicar em "Avançar":
async function atualizarManifesto() {
    const response = await fetch(`/Manifesto/Update/${mtrNumber}`, {
        method: 'POST'  // ? POST, não GET!
    })
    const result = await response.json()
    // ... mostrar sucesso/erro
}
```

---

## ?? Próximos Passos (Ordem)

1. **Editar ManifestoController.cs** - Adicionar parâmetros de data
2. **Editar ManifestoController.cs** - Adicionar método Update
3. **Compilar seu projeto** - Verificar se não há erros
4. **Testar no Postman** - Verificar as requisições HTTP
5. **Testar no Navegador** - Testar o fluxo completo
6. **Debugar com Console (F12)** - Ver logs e erros

---

## ?? Pontos Importantes

- As datas vêm do frontend no formato `YYYY-MM-DD` (ex: 2024-01-31)
- Seu backend deve comparar as datas corretamente
- Se não houver datas nos parâmetros, seu backend retorna TUDO (compatível)
- O filtro é `>=` startDate E `<=` endDate (inclusive nos dois extremos)

---

## ?? Se Você Não Souber C#

Copie e cole o código que preparei no arquivo:
`MtrManager\Controllers\ManifestoController.cs.exemplo`

Ele já tem tudo pronto, é só substituir no seu arquivo real.

---

## ? Dúvidas Frequentes

**P: Por que `DateTime?` com interrogação?**
R: Significa que é opcional (pode ser null). Se o usuário não enviar datas, é null.

**P: Por que `[FromQuery]`?**
R: Indica que o parâmetro vem na URL, não no body da requisição.

**P: O que é `TryParse`?**
R: Tenta converter uma string em DateTime. Se conseguir, retorna true; se não, false.

**P: Posso testar sem fazer todas essas mudanças?**
R: Não. O frontend está enviando as datas, o backend precisa saber receber.

---

## ?? Resumo Visual Final

```
Usuário seleciona empresa e clica "Atualizar"
                    ?
Modal de datas abre (já pronto)
                    ?
Usuário seleciona período e clica "Aplicar"
                    ?
JavaScript: carregarManifestosComDatas(cnpj) é chamada
                    ?
fetch(`/Manifesto/GetByCnpj/{cnpj}?startDate=X&endDate=Y`)
                    ?
C#: ManifestoController.Get() RECEBE startDate e endDate
                    ?
Backend filtra XMLs por data
                    ?
Retorna JSON com manifestos filtrados
                    ?
atualizarTabelaManifestos(json) atualiza HTML
                    ?
Tabela mostra apenas manifestos do período selecionado ?
```

---

**Qualquer dúvida, leia os outros arquivos .md criados! Eles têm mais detalhes.**

Bom código! ??
