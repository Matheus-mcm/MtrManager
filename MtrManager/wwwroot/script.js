

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let manifestos = []
let allCompanies = []
let companySearch = null
let dateRangeSelector = null
let notificationManager = null
let loadingManager = null
let companyManager = null
let selectedDates = { startDate: null, endDate: null }

// ============================================
// CLASSE: CompanyManager
// Gerencia CRUD de empresas
// ============================================

class CompanyManager {
    constructor() {
        this.modal = document.getElementById('companyManagerModal')
        this.backdrop = document.getElementById('backdrop')
        this.btnOpen = document.getElementById('btnOpenCompanyManager')
        this.btnClose = document.getElementById('btnCloseCompanyManager')
        this.form = document.getElementById('companyForm')
        this.tableBody = document.getElementById('companyTableBody')

        // Form fields
        this.formCnpj = document.getElementById('formCnpj')
        this.formRazaoSocial = document.getElementById('formRazaoSocial')
        this.formUnidade = document.getElementById('formUnidade')
        this.formCpf = document.getElementById('formCpf')
        this.formSenha = document.getElementById('formSenha')
        this.formAtivo = document.getElementById('formAtivo')
        this.btnFormSubmit = document.getElementById('btnFormSubmit')
        this.btnFormCancel = document.getElementById('btnFormCancel')

        this.editingCnpj = null

        this.init()
    }

    init() {
        this.btnOpen.addEventListener('click', () => this.open())
        this.btnClose.addEventListener('click', () => this.close())
        this.form.addEventListener('submit', (e) => this.handleSubmit(e))
        this.btnFormCancel.addEventListener('click', () => this.resetForm())
    }

    open() {
        this.modal.classList.add('show')
        this.backdrop.classList.add('show')
        this.backdrop.setAttribute('aria-hidden', 'false')
        this.loadCompanies()
    }

    close() {
        this.modal.classList.remove('show')
        this.backdrop.classList.remove('show')
        this.backdrop.setAttribute('aria-hidden', 'true')
        this.resetForm()
    }

    async loadCompanies() {
        try {
            loadingManager.show('Carregando empresas...')

            const response = await fetch('/Company/GetAll', {
                headers: { 'Accept': 'application/json' }
            })

            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`)

            const companies = await response.json()
            console.log(companies);
            this.renderTable(companies)
        } catch (err) {
            console.error('Erro ao carregar empresas:', err)
            notificationManager.show('Erro', 'Erro ao carregar empresas', 'error')
        } finally {
            loadingManager.hide()
        }
    }

    renderTable(companies) {
        this.tableBody.innerHTML = ''
        if (companies.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--color-text-muted); padding: 20px;">Nenhuma empresa cadastrada</td></tr>'
            return
        }

        companies.forEach(company => {
            const tr = document.createElement('tr')
            const statusClass = company.ativo ? 'status-active' : 'status-inactive'
            const statusText = company.ativo ? 'Ativa' : 'Inativa'

            tr.innerHTML = `
                <td>${company.cnpj}</td>
                <td>${company.razaoSocial}</td>
                <td>${company.unidade}</td>
                <td>${company.cpf}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <div class="company-table-actions">
                        <button type="button" class="btn-edit" data-cnpj="${company.cnpj}">Editar</button>
                    </div>
                </td>
            `

            tr.querySelector('.btn-edit').addEventListener('click', () => this.loadCompanyForEdit(company.cnpj))

            this.tableBody.appendChild(tr)
        })
        console.log(this.tableBody);

    }

    async loadCompanyForEdit(cnpj) {
        try {

            const formEdit = document.getElementById('company-form-section');
            const companyTable = document.getElementById('company-list-section');

            companyTable.style.display = 'none';
            formEdit.style.display = 'flex';


            const company = allCompanies.find(c => c.cnpj == cnpj);

            this.populateForm(company)

            this.editingCnpj = cnpj
            this.btnFormSubmit.textContent = 'Atualizar'
            this.formCnpj.disabled = true

            // Scroll para o formulário
            document.querySelector('.company-form-section').scrollIntoView({ behavior: 'smooth' })
        } catch (err) {
            console.error('Erro ao carregar empresa:', err)
            notificationManager.show('Erro', 'Erro ao carregar empresa', 'error')
        }
    }

    populateForm(company) {
        this.formCnpj.value = company.cnpj
        this.formRazaoSocial.value = company.razaoSocial
        this.formUnidade.value = company.unidade
        this.formCpf.value = company.cpf
        this.formSenha.value = company.senha
        this.formAtivo.checked = company.ativo
    }

    resetForm() {
        this.form.reset()
        this.editingCnpj = null
        this.btnFormSubmit.textContent = 'Adicionar'
        this.formCnpj.disabled = false
        this.formAtivo.checked = true

        const formEdit = document.getElementById('company-form-section');
        const companyTable = document.getElementById('company-list-section');

        companyTable.style.display = 'flex';
        formEdit.style.display = 'none';
    }

    async handleSubmit(e) {
        e.preventDefault()

        const company = {
            cnpj: this.formCnpj.value,
            razaoSocial: this.formRazaoSocial.value,
            unidade: this.formUnidade.value,
            cpf: this.formCpf.value,
            senha: this.formSenha.value,
            ativo: this.formAtivo.checked
        }

        try {
            if (this.editingCnpj) {
                // Update
                loadingManager.show('Atualizando empresa...')

                const response = await fetch(`/Company/${this.editingCnpj}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(company)
                })

                if (!response.ok) throw new Error('Erro ao atualizar empresa')

                notificationManager.show('Sucesso!', 'Empresa atualizada com sucesso', 'success')
            } else {
                // Create
                loadingManager.show('Criando empresa...')

                const response = await fetch('/Company/Create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(company)
                })

                if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Erro ao criar empresa')
                }

                notificationManager.show('Sucesso!', 'Empresa criada com sucesso', 'success')
            }

            this.resetForm()
            await this.loadCompanies()
            await recarregarEmpresas()
        } catch (err) {
            console.error('Erro:', err)
            notificationManager.show('Erro', err.message, 'error')
        } finally {
            loadingManager.hide()
        }
    }
}

// ============================================
// CLASSE: LoadingManager
// Gerencia modal de loading
// ============================================

class LoadingManager {
    constructor() {
        this.modal = document.getElementById('loadingModal')
        this.message = document.getElementById('loadingMessage')
    }

    show(message = 'Carregando...') {
        this.message.textContent = message
        this.modal.classList.add('show')
    }

    hide() {
        this.modal.classList.remove('show')
    }
}

// ============================================
// CLASSE: NotificationManager
// Gerencia notificações em modal pop-up
// ============================================

class NotificationManager {
    constructor() {
        this.modal = document.getElementById('notificationModal')
        this.icon = document.getElementById('notificationIcon')
        this.title = document.getElementById('notificationTitle')
        this.message = document.getElementById('notificationMessage')
        this.btnOk = document.getElementById('btnNotificationOk')
        this.btnClose = document.getElementById('btnCloseNotification')
        this.backdrop = document.getElementById('backdrop')
        this.currentType = 'info'

        this.init()
    }

    init() {
        this.btnOk.addEventListener('click', () => this.close())
        this.btnClose.addEventListener('click', () => this.close())
    }

    show(title, message, type = 'info') {
        this.currentType = type
        this.title.textContent = title
        this.message.textContent = message

        // Remove all type classes
        this.modal.classList.remove('type-success', 'type-error', 'type-warning', 'type-info')

        // Set icon and type
        switch (type) {
            case 'success':
                this.icon.textContent = '✓'
                this.modal.classList.add('type-success')
                break
            case 'error':
                this.icon.textContent = '✕'
                this.modal.classList.add('type-error')
                break
            case 'warning':
                this.icon.textContent = '⚠'
                this.modal.classList.add('type-warning')
                break
            default:
                this.icon.textContent = 'ℹ'
                this.modal.classList.add('type-info')
        }

        this.modal.classList.add('show')
        this.backdrop.classList.add('show')
        this.backdrop.setAttribute('aria-hidden', 'false')
    }

    close() {
        this.modal.classList.remove('show')
        this.backdrop.classList.remove('show')
        this.backdrop.setAttribute('aria-hidden', 'true')
    }
}

// ============================================
// CLASSE: DateRangeSelector
// Gerencia o modal de seleção de datas
// ============================================

class DateRangeSelector {
    constructor() {
        this.modal = document.getElementById('dateRangeModal')
        this.dateStart = document.getElementById('dateStart')
        this.dateEnd = document.getElementById('dateEnd')
        this.dateInterval = document.getElementById('dateInterval')
        this.dateStartError = document.getElementById('dateStartError')
        this.dateEndError = document.getElementById('dateEndError')
        this.dateEndInfo = document.getElementById('dateEndInfo')
        this.btnApply = document.getElementById('btnApplyDateRange')
        this.btnCancel = document.getElementById('btnCancelDateModal')
        this.btnClose = document.getElementById('btnCloseDateModal')
        this.backdrop = document.getElementById('backdrop')

        this.selectedDateStart = null
        this.selectedDateEnd = null
        this.maxDays = 30

        this.init()
    }

    init() {
        this.dateStart.addEventListener('change', (e) => this.handleDateStartChange(e))
        this.dateEnd.addEventListener('change', (e) => this.handleDateEndChange(e))
        this.btnApply.addEventListener('click', () => this.handleApply())
        this.btnCancel.addEventListener('click', () => this.close())
        this.btnClose.addEventListener('click', () => this.close())
        this.backdrop.addEventListener('click', () => this.close())
    }

    open() {
        this.modal.classList.add('show')
        this.backdrop.classList.add('show')
        this.backdrop.setAttribute('aria-hidden', 'false')

        // Set default dates
        const today = new Date()
        const defaultStart = today.toISOString().split('T')[0]
        const defaultEnd = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        this.dateStart.value = defaultStart
        this.dateEnd.value = defaultEnd
        this.dateStart.min = ''
        this.dateEnd.min = defaultStart

        this.selectedDateStart = defaultStart
        this.selectedDateEnd = defaultEnd
        this.updateInterval()
    }

    close() {
        this.modal.classList.remove('show')
        this.backdrop.classList.remove('show')
        this.backdrop.setAttribute('aria-hidden', 'true')
        this.clearErrors()
    }

    handleDateStartChange(e) {
        const newStart = e.target.value

        if (!newStart) {
            this.showError('dateStartError', 'Data inicial é obrigatória')
            return
        }

        this.clearError('dateStartError')
        const startDate = new Date(newStart)

        // If end date is empty, add 30 days to start
        if (!this.selectedDateEnd || this.dateEnd.value === '') {
            const endDate = new Date(startDate.getTime() + this.maxDays * 24 * 60 * 60 * 1000)
            this.selectedDateEnd = endDate.toISOString().split('T')[0]
            this.dateEnd.value = this.selectedDateEnd
            this.showInfo('dateEndInfo', 'Data fim definida automaticamente em +30 dias')
        } else {
            // Maintain the interval
            const previousStart = this.selectedDateStart ? new Date(this.selectedDateStart) : null
            if (previousStart) {
                const currentInterval = Math.floor((new Date(this.selectedDateEnd).getTime() - previousStart.getTime()) / (24 * 60 * 60 * 1000))
                const newEndDate = new Date(startDate.getTime() + currentInterval * 24 * 60 * 60 * 1000)

                // Check if new end date exceeds max days
                if (currentInterval > this.maxDays) {
                    const maxEndDate = new Date(startDate.getTime() + this.maxDays * 24 * 60 * 60 * 1000)
                    this.selectedDateEnd = maxEndDate.toISOString().split('T')[0]
                    this.showError('dateEndError', 'Intervalo reduzido para máximo de 30 dias')
                } else {
                    this.selectedDateEnd = newEndDate.toISOString().split('T')[0]
                    this.clearError('dateEndError')
                }

                this.dateEnd.value = this.selectedDateEnd
            }
        }

        this.selectedDateStart = newStart
        this.dateEnd.min = newStart
        this.updateInterval()
    }

    handleDateEndChange(e) {
        const newEnd = e.target.value

        if (!newEnd) {
            // If end date is cleared, set to 30 days from start
            if (this.selectedDateStart) {
                const startDate = new Date(this.selectedDateStart)
                const endDate = new Date(startDate.getTime() + this.maxDays * 24 * 60 * 60 * 1000)
                this.selectedDateEnd = endDate.toISOString().split('T')[0]
                this.dateEnd.value = this.selectedDateEnd
                this.showInfo('dateEndInfo', 'Data fim definida automaticamente em +30 dias')
            }
        } else {
            const startDate = new Date(this.selectedDateStart)
            const endDate = new Date(newEnd)
            const diffDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))

            if (diffDays < 0) {
                this.showError('dateEndError', 'Data fim não pode ser anterior à data inicial')
                this.dateEnd.value = this.selectedDateEnd || ''
                return
            }

            if (diffDays > this.maxDays) {
                this.showError('dateEndError', `Intervalo máximo é ${this.maxDays} dias (selecionados ${diffDays})`)
                this.dateEnd.value = this.selectedDateEnd || ''
                return
            }

            this.clearError('dateEndError')
            this.selectedDateEnd = newEnd
            this.clearInfo('dateEndInfo')
        }

        this.updateInterval()
    }

    updateInterval() {
        if (this.selectedDateStart && this.selectedDateEnd) {
            const start = new Date(this.selectedDateStart)
            const end = new Date(this.selectedDateEnd)
            const diffDays = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
            this.dateInterval.textContent = diffDays
        } else {
            this.dateInterval.textContent = '-'
        }
    }

    handleApply() {
        if (!this.selectedDateStart) {
            this.showError('dateStartError', 'Data inicial é obrigatória')
            return
        }

        if (!this.selectedDateEnd) {
            this.showError('dateEndError', 'Data final é obrigatória')
            return
        }

        // Armazena as datas selecionadas na variável global
        selectedDates.startDate = this.selectedDateStart
        selectedDates.endDate = this.selectedDateEnd

        this.close()

        // Chama a função de carregamento de manifestos
        // Busca a empresa selecionada
        const selectedCompanyName = document.getElementById('companySearch').value
        const selectedCompany = allCompanies.find(c => `${c.unidade} - ${c.razaoSocial}` === selectedCompanyName)

        if (selectedCompany) {
            carregarManifestosComDatas(selectedCompany)
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId)
        element.textContent = message
        element.classList.add('show')
    }

    clearError(elementId) {
        const element = document.getElementById(elementId)
        element.textContent = ''
        element.classList.remove('show')
    }

    showInfo(elementId, message) {
        const element = document.getElementById(elementId)
        element.textContent = message
        element.classList.add('show')
    }

    clearInfo(elementId) {
        const element = document.getElementById(elementId)
        element.textContent = ''
        element.classList.remove('show')
    }

    clearErrors() {
        this.clearError('dateStartError')
        this.clearError('dateEndError')
        this.clearInfo('dateEndInfo')
    }
}

class CompanySearch {
    constructor() {
        this.searchInput = document.getElementById('companySearch')
        this.dropdown = document.getElementById('companyDropdown')
        this.dropdownList = this.dropdown.querySelector('.company-dropdown-list')
        this.selectedValue = null
        this.currentIndex = -1
        this.filteredCompanies = []

        this.init()
    }

    init() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e))
        this.searchInput.addEventListener('focus', () => this.showDropdown())
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyboard(e))
        document.addEventListener('click', (e) => this.handleClickOutside(e))
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim()

        if (!query) {
            this.filteredCompanies = allCompanies
        } else {
            this.filteredCompanies = allCompanies.filter(c => {
                const text = `${c.unidade} ${c.razaoSocial} ${c.cnpj}`.toLowerCase()
                return text.includes(query)
            })
        }

        this.currentIndex = -1
        this.renderDropdown()
        this.showDropdown()
    }

    renderDropdown() {
        this.dropdownList.innerHTML = ''

        if (this.filteredCompanies.length === 0) {
            this.dropdownList.innerHTML = '<div class="company-no-results">Nenhuma empresa encontrada</div>'
            return
        }

        this.filteredCompanies.forEach((company, index) => {
            const option = document.createElement('div')
            option.className = 'company-option'

            // Aplicar classe de inativo se ativo for false
            if (!company.ativo) {
                option.classList.add('inactive')
            }

            if (this.selectedValue === company.cnpj) {
                option.classList.add('selected')
            }

            option.innerHTML = `
                <div>${company.unidade} - ${company.razaoSocial}</div>
                <span class="company-option-meta">CNPJ: ${company.cnpj}</span>
            `
            option.addEventListener('click', () => this.selectCompany(company))
            this.dropdownList.appendChild(option)
        })
    }

    selectCompany(company) {
        this.selectedValue = company.cnpj
        this.searchInput.value = `${company.unidade} - ${company.razaoSocial}`
        this.hideDropdown()

        // Trigger company change handler
        const event = new CustomEvent('companySelected', { detail: { cnpj: company.cnpj } })
        document.dispatchEvent(event)
        handleCompanyChange({ target: { value: company.cnpj } })
    }

    handleKeyboard(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.currentIndex = Math.min(this.currentIndex + 1, this.filteredCompanies.length - 1)
            this.updateActiveOption()
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.currentIndex = Math.max(this.currentIndex - 1, -1)
            this.updateActiveOption()
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (this.currentIndex >= 0) {
                this.selectCompany(this.filteredCompanies[this.currentIndex])
            }
        } else if (e.key === 'Escape') {
            this.hideDropdown()
        }
    }

    updateActiveOption() {
        const options = this.dropdownList.querySelectorAll('.company-option')
        options.forEach((opt, idx) => {
            if (idx === this.currentIndex) {
                opt.classList.add('active')
                opt.scrollIntoView({ block: 'nearest' })
            } else {
                opt.classList.remove('active')
            }
        })
    }

    showDropdown() {
        if (this.filteredCompanies.length > 0) {
            this.dropdown.classList.add('show')
        }
    }

    hideDropdown() {
        this.dropdown.classList.remove('show')
    }

    handleClickOutside(e) {
        const isClickInside = e.target.closest('.company-search-wrapper')
        if (!isClickInside && this.dropdown.classList.contains('show')) {
            this.hideDropdown()
        }
    }

    setCompanies(companies) {
        allCompanies = companies
        this.filteredCompanies = companies
        this.renderDropdown()
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#manifestList tbody')
    window.tbody = tbody
    loadingManager = new LoadingManager()
    notificationManager = new NotificationManager()
    companyManager = new CompanyManager()
    companySearch = new CompanySearch()
    dateRangeSelector = new DateRangeSelector()

    // Setup modal elements
    window.modal = document.getElementById('pedidoModal')
    window.backdrop = document.getElementById('backdrop')
    window.btnClose = document.getElementById('btnClose')
    window.btnCancel = document.getElementById('btnCancel')
    window.btnAdvance = document.getElementById('btnAdvance')
    window.btnRefresh = document.getElementById('btnRefresh')
    window.currentMtr = null

    // Add click listener to table
    tbody.addEventListener('click', (e) => {
        const row = e.target.closest('tr')
        if (!row) return
        const dados = {
            mtr: row.dataset.mtr ?? (row.cells[0]?.textContent || '').trim(),
            gerador: row.dataset.gerador ?? (row.cells[1]?.textContent || '').trim(),
            transportador: row.dataset.transportador ?? (row.cells[2]?.textContent || '').trim(),
            destinador: row.dataset.destinador ?? (row.cells[3]?.textContent || '').trim(),
            emissao: row.dataset.emissao ?? (row.cells[4]?.textContent || '').trim()
        }
        document.getElementById('m-mtr').textContent = dados.mtr
        document.getElementById('m-gerador').textContent = dados.gerador
        document.getElementById('m-transportador').textContent = dados.transportador
        document.getElementById('m-destinador').textContent = dados.destinador
        document.getElementById('m-emissao').textContent = dados.emissao
        const manifesto = manifestos.find(m => m.mtrNumero === dados.mtr)
        const residuosArr = manifesto?.residuos ?? []
        renderResiduosGrouped(document.getElementById('m-residuos'), residuosArr)
        window.currentMtr = dados.mtr
        openModal()
    })

    // Add modal button listeners
    window.btnClose.addEventListener('click', closeModal)
    window.btnCancel.addEventListener('click', closeModal)
    window.backdrop.addEventListener('click', closeModal)
    window.btnAdvance.addEventListener('click', atualizarManifesto)
    window.btnRefresh.addEventListener('click', () => {
        // Verificar se empresa foi selecionada
        const selectedCompany = document.getElementById('companySearch').value
        if (!selectedCompany || selectedCompany === '0') {
            alert('Selecione uma empresa primeiro')
            return
        }
        // Abrir modal de datas
        dateRangeSelector.open()
    })

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.modal.classList.contains('show')) {
            closeModal()
        }
    })
})

window.handleCompanyChange = async function (event) {
    const selectedValue = event.target.value
    if (!selectedValue || selectedValue === '0') {
        window.tbody.innerHTML = ''
        return
    }
    try {
        const response = await fetch('/Manifesto/GetByCnpj/' + selectedValue, { headers: { 'Accept': 'application/json' } })
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`)
        const manifestosResponse = await response.json()
        if (manifestosResponse && manifestosResponse.length > 0) {
            window.tbody.innerHTML = ''
            manifestos = manifestosResponse
            manifestos.forEach(manifesto => {
                const tr = document.createElement('tr')
                const mtrNumero = manifesto.mtrNumero
                const gerador = manifesto.gerador?.razaoSocial
                const transportador = manifesto.transportador?.razaoSocial
                const destinador = manifesto.destinador?.razaoSocial
                const dataEmissao = manifesto.gerador?.dataEmissao
                const residuosQtde = manifesto.residuos?.length ?? 0

                tr.appendChild(tdText(mtrNumero))
                tr.appendChild(tdText(gerador))
                tr.appendChild(tdText(transportador))
                tr.appendChild(tdText(destinador))
                tr.appendChild(tdText(dataEmissao))
                tr.appendChild(tdText(residuosQtde))

                tr.dataset.mtr = mtrNumero ?? ''
                tr.dataset.gerador = gerador ?? ''
                tr.dataset.transportador = transportador ?? ''
                tr.dataset.destinador = destinador ?? ''
                tr.dataset.emissao = dataEmissao ?? ''

                window.tbody.appendChild(tr)
            })
        } else {
            window.tbody.innerHTML = '<tr><td colspan="6">Nenhum manifesto encontrado.</td></tr>'
        }
    } catch (err) {
        window.tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar manifestos.</td></tr>'
    }
}

function openModal() {
    window.modal.classList.add('show')
    window.backdrop.classList.add('show')
    window.backdrop.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'
    window.modal.focus()
}
function closeModal() {
    window.modal.classList.remove('show')
    window.backdrop.classList.remove('show')
    window.backdrop.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''
}

function parseQuantidade(q) {
    if (q == null) return 0
    const n = Number(q.toString().replace(',', '.'))
    return Number.isFinite(n) ? n : 0
}

function groupResiduos(residuos) {
    const map = new Map()
    residuos.forEach(r => {
        const nome = r.codigoIbamaDenominacao ?? ''
        const classe = r.classe ?? ''
        const unidade = r.unidade ?? ''
        const acond = r.acondicionamento ?? ''
        const key = `${nome}||${classe}||${unidade}||${acond}`
        if (!map.has(key)) {
            map.set(key, { nome, classe, unidade, acondicionamento: acond, itens: [], total: 0 })
        }
        const g = map.get(key)
        g.itens.push(r)
        g.total += parseQuantidade(r.quantidade)
    })
    return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome))
}

function renderResiduosGrouped(container, residuosArray) {
    container.innerHTML = ''
    if (!Array.isArray(residuosArray) || residuosArray.length === 0) {
        container.innerHTML = '<p class="muted">Nenhum resíduo informado.</p>'
        return
    }
    const groups = groupResiduos(residuosArray)
    const fragment = document.createDocumentFragment()
    groups.forEach(group => {
        const { nome, unidade, total, classe, acondicionamento, itens } = group
        const card = document.createElement('section')
        card.className = 'residuo-group-card'
        const header = document.createElement('header')
        header.className = 'residuo-group-title'
        header.innerHTML = `
      <div>
        <strong>${nome || 'Resíduo'}</strong>
        <span class="title-meta">
          <span class="pill">${classe || 'Classe N/A'}</span>
          <span class="pill">${acondicionamento || 'Acond. N/A'}</span>
        </span>
      </div>
      <span class="title-qty">${total.toFixed(3)} ${unidade || ''}</span>
    `
        card.appendChild(header)
        const table = document.createElement('table')
        table.className = 'residuo-table'
        const thead = document.createElement('thead')
        thead.innerHTML = `
          <tr>
            <th>Item</th>
            <th>Estado Físico</th>
            <th>ONU</th>
            <th>Tratamento</th>
            <th>Quantidade</th>
            <th>Observação</th>
          </tr>
        `
        table.appendChild(thead)
        const tbody = document.createElement('tbody')
        itens.forEach((r, idx) => {
            const row = document.createElement('tr')
            row.innerHTML = `
              <td class="cell-item">Item ${r.item ?? idx + 1}</td>
              <td>${r.estadoFisico ?? '—'}</td>
              <td>${r.onu ?? '—'}</td>
              <td>${r.tratamento ?? '—'}</td>
              <td>${parseQuantidade(r.quantidade).toFixed(3)} ${r.unidade ?? ''}</td>
              <td class="cell-obs">${r.observacao ?? ''}</td>
            `
            tbody.appendChild(row)
        })
        table.appendChild(tbody)
        card.appendChild(table)
        fragment.appendChild(card)
    })
    container.appendChild(fragment)
}

function tdText(texto) {
    const td = document.createElement('td')
    td.textContent = texto ?? '—'
    return td
}

// ============================================
// FUNÇÕES DE CARREGAMENTO DE MANIFESTOS
// ============================================

/**
 * Carrega manifestos do backend com as datas selecionadas
 * Chama o método UpdateMtrs que faz o download dos MTRs via Playwright
 * @param {Object} company - Objeto da empresa com cnpj, cpf, senha, unidade
 */
async function carregarManifestosComDatas(company) {
    try {
        loadingManager.show('Conectando ao SINIR e baixando manifestos...')
        window.btnRefresh.classList.add('loading')
        window.btnRefresh.disabled = true

        const requestData = {
            cnpj: company.cnpj,
            cpf: company.cpf,
            unity: company.unidade,
            password: company.senha,
            initialDate: selectedDates.startDate,
            finalDate: selectedDates.endDate,
            fileType: 'code',
            headless: true
        }

        console.log('Chamando UpdateMtrs com CNPJ:', company.cnpj)

        const response = await fetch('/Manifesto/UpdateMtrs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestData)
        })

        const data = await response.json()

        if (!response.ok) {
            // Capturar a mensagem de erro retornada e exibir no pop-up
            const errorMessage = data.error || `Erro HTTP: ${response.status}`
            console.error('Erro ao carregar manifestos:', errorMessage)

            // Se foi erro de login, atualizar o status da empresa para inativo
            if (data.loginFailed) {
                console.log('Login falhou para CNPJ:', company.cnpj)
                // Recarregar a lista de empresas para atualizar os status
                await recarregarEmpresas()
            }

            // Exibir mensagem de erro em notificação
            notificationManager.show('Erro ao baixar MTRs', errorMessage, 'error')
            return
        }

        console.log('Resultado do UpdateMtrs:', data)

        loadingManager.show('Processando manifestos...')

        // Após download bem-sucedido, carregar os manifestos
        await carregarManifestosLocal(company.cnpj)

        // Exibir mensagem de sucesso
        notificationManager.show('Sucesso!', data.message, 'success')

    } catch (err) {
        console.error('Erro ao carregar manifestos:', err)
        notificationManager.show('Erro ao carregar manifestos', err.message, 'error')
    } finally {
        loadingManager.hide()
        window.btnRefresh.classList.remove('loading')
        window.btnRefresh.disabled = false
    }
}

/**
 * Recarrega a lista de empresas do servidor
 */
async function recarregarEmpresas() {
    try {
        const response = await fetch('/Company/GetAll', {
            headers: { 'Accept': 'application/json' }
        })

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }

        const companies = await response.json()
        companySearch.setCompanies(companies)
        console.log(companies)
        console.log('Empresas recarregadas com sucesso')

    } catch (err) {
        console.error('Erro ao recarregar empresas:', err)
    }
}

/**
 * Carrega manifestos locais após o download via Playwright
 * @param {string} cnpj - CNPJ da empresa
 */
async function carregarManifestosLocal(cnpj) {
    try {
        const response = await fetch('/Manifesto/GetByCnpj/' + cnpj, {
            headers: { 'Accept': 'application/json' }
        })

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }

        const manifestosResponse = await response.json()
        atualizarTabelaManifestos(manifestosResponse)

    } catch (err) {
        console.error('Erro ao carregar manifestos locais:', err)
        notificationManager.show('Erro', 'Erro ao carregar manifestos locais.', 'error')
    }
}

/**
 * Atualiza a tabela de manifestos com os dados recebidos
 * @param {Array} manifestosData - Array de manifestos do backend
 */
function atualizarTabelaManifestos(manifestosData) {
    if (!manifestosData || manifestosData.length === 0) {
        window.tbody.innerHTML = '<tr><td colspan="6">Nenhum manifesto encontrado para o período selecionado.</td></tr>'
        return
    }

    window.tbody.innerHTML = ''
    manifestos = manifestosData

    manifestos.forEach(manifesto => {
        const tr = document.createElement('tr')
        const mtrNumero = manifesto.mtrNumero
        const gerador = manifesto.gerador?.razaoSocial
        const transportador = manifesto.transportador?.razaoSocial
        const destinador = manifesto.destinador?.razaoSocial
        const dataEmissao = manifesto.gerador?.dataEmissao
        const residuosQtde = manifesto.residuos?.length ?? 0

        tr.appendChild(tdText(mtrNumero))
        tr.appendChild(tdText(gerador))
        tr.appendChild(tdText(transportador))
        tr.appendChild(tdText(destinador))
        tr.appendChild(tdText(dataEmissao))
        tr.appendChild(tdText(residuosQtde))

        tr.dataset.mtr = mtrNumero ?? ''
        tr.dataset.gerador = gerador ?? ''
        tr.dataset.transportador = transportador ?? ''
        tr.dataset.destinador = destinador ?? ''
        tr.dataset.emissao = dataEmissao ?? ''

        window.tbody.appendChild(tr)
    })
}

// ============================================
// FUNÇÕES DE ATUALIZAÇÃO DE MANIFESTO
// ============================================

/**
 * Atualiza um manifesto específico no backend
 * Chamada quando o usuário clica no botão "Avançar"
 */
async function atualizarManifesto() {
    const mtrNumber = window.currentMtr

    if (!mtrNumber) {
        alert('Nenhum manifesto selecionado')
        return
    }

    try {
        window.btnAdvance.disabled = true
        window.btnAdvance.textContent = 'Processando...'

        console.log('Atualizando manifesto:', mtrNumber)

        const response = await fetch(`/Manifesto/Update/${mtrNumber}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }

        const result = await response.json()

        // Mostrar sucesso
        window.btnAdvance.textContent = '✓ Sucesso!'
        window.btnAdvance.style.background = 'var(--color-success)'

        setTimeout(() => {
            window.btnAdvance.textContent = 'Avançar'
            window.btnAdvance.style.background = ''
            window.btnAdvance.disabled = false
            closeModal()
            // Opcional: recarregar manifestos após atualizar
            // location.reload()
        }, 2000)

    } catch (err) {
        console.error('Erro ao atualizar manifesto:', err)

        window.btnAdvance.textContent = '✕ Erro'
        window.btnAdvance.style.background = '#e74c3c'

        setTimeout(() => {
            window.btnAdvance.textContent = 'Avançar'
            window.btnAdvance.style.background = ''
            window.btnAdvance.disabled = false
        }, 2000)
    }
}

