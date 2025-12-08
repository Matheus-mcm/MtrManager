# ?? VISUAL RÁPIDO - ENTENDA EM 2 MINUTOS

## O que você tinha antes ?

```
Usuário clica "Atualizar"
         ?
Carrega TODOS os manifestos (sem filtrar por data)
         ?
Mostra tudo na tela
```

---

## O que você tem agora ?

```
Usuário clica "Atualizar"
         ?
NOVO: Abre modal de datas ? Você seleciona um período
         ?
Frontend envia as datas para o Backend
         ?
Backend filtra manifestos por data
         ?
Mostra apenas manifestos do período selecionado
```

---

## As 3 Partes Principais

### 1?? Modal de Datas (PRONTO ?)

```
???????????????????????????????????
?  Selecionar Período             ?
???????????????????????????????????
?  Data Início: [01/01/2024]      ?
?  Data Fim:    [31/01/2024]      ?
?                                 ?
?  Intervalo: 30 dias (máximo)    ?
?                                 ?
?  [Cancelar]  [Aplicar]          ?
???????????????????????????????????
```

### 2?? Requisição ao Backend (PRONTO ?)

```
JavaScript envia para C#:

GET /Manifesto/GetByCnpj/12345678901234
    ?startDate=2024-01-01
    &endDate=2024-01-31
```

### 3?? Backend Filtra (PRECISA FAZER ?)

```csharp
// Seu C# recebe:
startDate = "2024-01-01"
endDate = "2024-01-31"

// Seu C# retorna:
[ 
  { mtrNumero: "MTR001", dataEmissao: "2024-01-05" },
  { mtrNumero: "MTR002", dataEmissao: "2024-01-15" },
  // Só de janeiro!
]
```

---

## Mudanças no C# (1 função)

**Encontre:**
```csharp
public IEnumerable<Manifesto> Get(string cnpj)
```

**Troque por:**
```csharp
public IEnumerable<Manifesto> Get(
    string cnpj, 
    [FromQuery] DateTime? startDate = null, 
    [FromQuery] DateTime? endDate = null)
```

**Adicione no meio da função:**
```csharp
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
```

Pronto! ?

---

## Verificação Rápida

```
Frontend pronto?         ? SIM (o JavaScript já envia as datas)
Modal de datas pronto?   ? SIM (modal está funcionando)
Backend recebe datas?    ? NÃO (precisa editar Controller)
Backend filtra por data? ? NÃO (precisa editar Controller)
Retorna JSON filtrado?   ? NÃO (quando editar Controller)
```

---

## Fluxo em 3 Linhas

1. Usuário seleciona datas no modal
2. JavaScript manda: `/Manifesto/GetByCnpj/CNPJ?startDate=X&endDate=Y`
3. C# retorna: `[manifesto1, manifesto2, ...]` (filtrado)

FIM! ??

---

## Analogia com C#

**Antes** (seu código antigo):
```csharp
var manifestos = repositorio.GetAll(); // Retorna TUDO
```

**Depois** (o que você precisa fazer):
```csharp
var manifestos = repositorio
    .GetAll()
    .Where(m => m.DataEmissao >= startDate && m.DataEmissao <= endDate)
    .ToList(); // Retorna FILTRADO
```

É basicamente isto! ??

---

## Checklist Final

- [ ] Li o arquivo `COMECE_AQUI.md`
- [ ] Entendi que preciso editar só 1 método do Controller
- [ ] Copiei o código de filtro de datas
- [ ] Editei meu `ManifestoController.cs`
- [ ] Compilei (sem erros)
- [ ] Testei no Postman
- [ ] Testei no Navegador
- [ ] Funcionou! ??

---

**Dúvida? Releia os outros .md files, eles têm mais detalhes!**
