using Microsoft.Playwright;
using System.Globalization;

namespace SinirIntegration
{
    public class SinirService
    {
        public static async Task<SinirDownloadResult> DownloadMtrsAsync(
            string cnpj,
            string cpf,
            string unity,
            string password,
            string folderPath,
            DateTime initialDate,
            DateTime finalDate,
            string fileType = "code",
            bool headless = true)
        {
            CultureInfo brazilProvider = new("pt-BR");
            const string sinirUrl = "https://mtr.sinir.gov.br";
            IPage page = null;
            IBrowser browser = null;

            try
            {
                Console.WriteLine("Iniciando Playwright...");
                using var playwright = await Playwright.CreateAsync();
                browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
                {
                    Headless = headless
                });

                var context = await browser.NewContextAsync(new BrowserNewContextOptions
                {
                    AcceptDownloads = true
                });

                page = await context.NewPageAsync();

                Console.WriteLine("Abrindo site do SINIR.");
                await page.GotoAsync(sinirUrl);
                Console.WriteLine("Site carregado.");

                var closeButton = page.Locator("a.ui-dialog-titlebar-close");
                if (await closeButton.IsVisibleAsync())
                {
                    await closeButton.ClickAsync();
                }

                Console.WriteLine("Inserindo CNPJ.");
                await page.FillAsync("#mat-input-0", cnpj);

                await (await page.QuerySelectorAsync("#mat-input-1")).FocusAsync();

                await page.WaitForSelectorAsync("#mat-input-3", new PageWaitForSelectorOptions { State = WaitForSelectorState.Visible });

                var input = await page.QuerySelectorAsync("#mat-input-3");
                await page.EvaluateAsync("(input) => input.removeAttribute('readonly');", input);

                Console.WriteLine("Inserindo Unidade.");
                await page.FillAsync("#mat-input-3", unity);
                Console.WriteLine("Inserindo CPF.");
                await page.FillAsync("#mat-input-1", cpf);
                Console.WriteLine("Inserindo Senha.");
                await page.FillAsync("#mat-input-2", password);

                Console.WriteLine("Fazendo login...");
                await page.ClickAsync("button[type='submit']");

                // Aguardar pela resposta do login
                await Task.Delay(3000);

                // Verificar se houve erro de autenticação
                var errorMessage = await CheckForAuthenticationError(page);
                if (!string.IsNullOrEmpty(errorMessage))
                {
                    return new SinirDownloadResult
                    {
                        Success = false,
                        LoginSuccess = false,
                        Message = errorMessage,
                        FilesDownloaded = 0
                    };
                }

                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);
                Console.WriteLine("Login realizado com sucesso!");

                Console.WriteLine("Acessando lista de MTR.");
                await page.GotoAsync(sinirUrl + "/navegacao/meusmtrs");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                // Inserir datas
                await page.FillAsync("#mat-input-18", initialDate.ToString("d"));
                await page.FillAsync("#mat-input-19", finalDate.ToString("d"));

                await page.ClickAsync("button[type='submit']");
                await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

                Thread.Sleep(2000);

                Console.WriteLine("Iniciando processo de download de arquivos.");
                int filesDownloaded = await DownloadFilesForPage(page, folderPath, fileType);

                Console.WriteLine("Finalizando processo.");
                await browser.CloseAsync();

                return new SinirDownloadResult
                {
                    Success = true,
                    LoginSuccess = true,
                    Message = $"Download realizado com sucesso! {filesDownloaded} arquivo(s) baixado(s).",
                    FilesDownloaded = filesDownloaded
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro durante o processo: {ex.Message}");
                return new SinirDownloadResult
                {
                    Success = false,
                    LoginSuccess = false,
                    Message = $"Erro ao baixar MTRs: {ex.Message}",
                    FilesDownloaded = 0
                };
            }
            finally
            {
                if (browser != null)
                {
                    await browser.CloseAsync();
                }
            }
        }

        /// <summary>
        /// Verifica se há mensagem de erro de autenticação na página
        /// </summary>
        private static async Task<string> CheckForAuthenticationError(IPage page)
        {
            try
            {
                // Procurar pelo elemento de toast de erro
                var toastElements = await page.QuerySelectorAllAsync("ngx-toast .toast-text");

                foreach (var toastElement in toastElements)
                {
                    var toastText = await toastElement.InnerTextAsync();

                    // Verificar se contém a mensagem de erro de autenticação
                    if (toastText.Contains("Usuário ou Senha incorretos", StringComparison.OrdinalIgnoreCase) ||
                        toastText.Contains("Usuário ou Senha inválidos", StringComparison.OrdinalIgnoreCase))
                    {
                        return toastText.Trim();
                    }
                }

                // Também verificar por mensagens diretas no span
                var errorSpans = await page.QuerySelectorAllAsync(".toast-msg");
                foreach (var errorSpan in errorSpans)
                {
                    var errorText = await errorSpan.InnerTextAsync();
                    if (errorText.Contains("Usuário ou Senha", StringComparison.OrdinalIgnoreCase))
                    {
                        return errorText.Trim();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao verificar mensagem de erro: {ex.Message}");
            }

            return null;
        }

        private static async Task<int> DownloadFilesForPage(IPage page, string folderPath, string fileType)
        {
            IReadOnlyList<IElementHandle> allPrintButtons = await page.QuerySelectorAllAsync("a[title='Imprimir MTR']");
            var pdfButtons = new List<IElementHandle>();

            foreach (var button in allPrintButtons)
            {
                var iconElement = await button.QuerySelectorAsync("i.material-icons");
                if (iconElement != null)
                {
                    string iconText = await iconElement.InnerTextAsync();
                    if (iconText.Trim() == fileType)
                    {
                        pdfButtons.Add(button);
                    }
                }
            }

            Console.WriteLine($"Encontrado {pdfButtons.Count} arquivo(s) para download.");

            int downloadedCount = 0;
            int i = 1;
            foreach (var pdfButton in pdfButtons)
            {
                try
                {
                    Console.WriteLine($"Iniciando download {i} de {pdfButtons.Count}...");
                    var download = await page.RunAndWaitForDownloadAsync(async () => await pdfButton.ClickAsync());

                    if (!Directory.Exists(folderPath))
                    {
                        Console.WriteLine($"Criando pasta: {folderPath}");
                        Directory.CreateDirectory(folderPath);
                    }

                    string filePath = Path.Combine(folderPath, download.SuggestedFilename);
                    await download.SaveAsAsync(filePath);
                    Console.WriteLine($"Download salvo: {filePath}");
                    downloadedCount++;
                    i++;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro durante download: {ex.Message}");
                }
            }

            return downloadedCount;
        }
    }

    /// <summary>
    /// Resultado do download de MTRs do SINIR
    /// </summary>
    public class SinirDownloadResult
    {
        public bool Success { get; set; }
        public bool LoginSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public int FilesDownloaded { get; set; }
    }
}