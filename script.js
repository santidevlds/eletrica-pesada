document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();

    // ==========================================
    // 1. SUPABASE (COLOQUE SUAS CHAVES AQUI)
    // ==========================================
    const SUPABASE_URL = 'https://awijcwyoejcnmgjaiqtk.supabase.co'; 
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3aWpjd3lvZWpjbm1namFpcXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNzU2NjYsImV4cCI6MjA4ODg1MTY2Nn0.6MNvTaQkT8oYR88hR9u4xqt-BgD_DJrydaiHVGdRb98'; 
    
    let supabase;
    try {
        if(SUPABASE_URL.startsWith('http')) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (e) { console.error(e); }

    async function checarAutenticacao() {
        if(!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) window.location.href = 'login.html';
    }
    await checarAutenticacao();

    function showModal(title, msg, type = 'alert') {
        return new Promise((resolve) => {
            const overlay = document.getElementById('customModal');
            document.getElementById('modalTitle').innerText = title;
            document.getElementById('modalMessage').innerText = msg;
            
            const btnCancel = document.getElementById('modalBtnCancel');
            const btnConfirm = document.getElementById('modalBtnConfirm');

            if (type === 'alert') {
                btnCancel.style.display = 'none';
                btnConfirm.innerText = 'OK';
            } else {
                btnCancel.style.display = 'block';
                btnConfirm.innerText = 'Confirmar';
            }

            overlay.style.display = 'flex';
            btnConfirm.onclick = () => { overlay.style.display = 'none'; resolve(true); };
            btnCancel.onclick = () => { overlay.style.display = 'none'; resolve(false); };
        });
    }

    // ==========================================
    // MAPEAMENTO DOS ELEMENTOS
    // ==========================================
    let allReports = []; 
    
    const inputPlaca = document.getElementById('placa');
    const inputServico = document.getElementById('servico');
    const inputPecas = document.getElementById('pecas');
    const inputNotas = document.getElementById('notas');
    const inputEditId = document.getElementById('edit-id');

    const btnSave = document.getElementById('btnSave');
    const btnCancelEdit = document.getElementById('btnCancelEdit');
    const btnRefresh = document.getElementById('btnRefresh');
    
    const bulkButtons = document.getElementById('bulkButtons'); 
    const selectedCount = document.getElementById('selectedCount');
    const checkSelectAll = document.getElementById('checkSelectAll');

    // Filtros
    const searchPlaca = document.getElementById('searchPlaca');
    const filterData = document.getElementById('filterData');
    const btnClearFilters = document.getElementById('btnClearFilters');

    // ==========================================
    // LÓGICA DE SALVAR / ATUALIZAR
    // ==========================================
    btnSave.addEventListener('click', async () => {
        if(!supabase) return showModal("Aviso", "Banco não configurado.");

        const dados = {
            placa: inputPlaca.value.trim(),
            servico: inputServico.value.trim(),
            pecas: inputPecas.value.trim(),
            notas: inputNotas.value.trim()
        };

        if (!dados.placa || dados.placa.length < 7) {
            await showModal("Placa Inválida", "A placa ou prefixo deve ter pelo menos 7 caracteres.", "alert");
            inputPlaca.focus();
            return;
        }

        if (!dados.servico || dados.servico.length < 8) {
            await showModal("Serviço Obrigatório", "Descreva o serviço realizado (mínimo de 8 letras).", "alert");
            inputServico.focus();
            return;
        }

        const editId = inputEditId.value;
        const isEditing = editId !== "";

        btnSave.disabled = true;
        btnSave.querySelector('span').innerText = isEditing ? 'Atualizando...' : 'Salvando...';

        let error;
        if (isEditing) {
            const result = await supabase.from('relatorios').update(dados).eq('id', editId);
            error = result.error;
        } else {
            const result = await supabase.from('relatorios').insert([dados]);
            error = result.error;
        }

        if (error) {
            await showModal("Erro", error.message);
        } else {
            await showModal("Sucesso", isEditing ? "Relatório atualizado!" : "Relatório salvo!");
            cancelarEdicao();
            carregarDados();
        }
        
        btnSave.disabled = false;
        btnSave.innerHTML = `<i data-lucide="save"></i> <span>Salvar Relatório</span>`;
        lucide.createIcons();
    });

    btnCancelEdit.addEventListener('click', cancelarEdicao);

    function cancelarEdicao() {
        inputEditId.value = '';
        inputPlaca.value = '';
        inputServico.value = '';
        inputPecas.value = '';
        inputNotas.value = '';
        btnSave.innerHTML = `<i data-lucide="save"></i> <span>Salvar Relatório</span>`;
        btnCancelEdit.style.display = 'none';
        lucide.createIcons();
    }

    // ==========================================
    // CARREGAR DADOS
    // ==========================================
    async function carregarDados() {
        const container = document.getElementById('lista-historico');
        if(!supabase) return;

        container.innerHTML = '<p class="loading-text">Atualizando lista...</p>';
        fecharBulkActions();

        const { data, error } = await supabase.from('relatorios').select('*').order('created_at', { ascending: false });

        if (error) return container.innerHTML = `<p class="error-text">Erro: ${error.message}</p>`;
        
        allReports = data; // Guarda o original na memória
        aplicarFiltros(); // Desenha na tela usando a função de filtros
    }

    // ==========================================
    // LÓGICA DE FILTROS E PESQUISA
    // ==========================================
    searchPlaca.addEventListener('input', aplicarFiltros);
    filterData.addEventListener('change', aplicarFiltros);
    
    btnClearFilters.addEventListener('click', () => {
        searchPlaca.value = '';
        filterData.value = '';
        aplicarFiltros();
    });

    function aplicarFiltros() {
        const termoBusca = searchPlaca.value.toLowerCase();
        const dataSelecionada = filterData.value; // Formato YYYY-MM-DD

        // Filtra a lista da memória
        const relatoriosFiltrados = allReports.filter(item => {
            const placaMatch = item.placa.toLowerCase().includes(termoBusca);
            
            let dataMatch = true;
            if (dataSelecionada) {
                // Converte a data do banco para comparar com o input type="date"
                const itemDate = new Date(item.created_at).toLocaleDateString('en-CA'); 
                dataMatch = (itemDate === dataSelecionada);
            }

            return placaMatch && dataMatch;
        });

        desenharLista(relatoriosFiltrados);
    }

    function desenharLista(dados) {
        const container = document.getElementById('lista-historico');
        fecharBulkActions(); // Reseta os checkboxes ao buscar

        if (dados.length === 0) {
            container.innerHTML = '<p class="loading-text">Nenhum relatório encontrado para este filtro.</p>';
            return;
        }

        container.innerHTML = dados.map(item => `
            <div class="card-historico">
                <input type="checkbox" class="card-checkbox item-checkbox" value="${item.id}">
                <div class="card-content-wrap">
                    <div class="card-title">
                        <strong class="card-placa">${item.placa}</strong>
                        <span class="card-data">${new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div class="card-content">
                        <p><strong>Serviço:</strong> ${item.servico || '-'}</p>
                        ${item.pecas ? `<p><strong>Peças:</strong> ${item.pecas}</p>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.item-checkbox').forEach(box => {
            box.addEventListener('change', verificarSelecao);
        });
    }

    // ==========================================
    // GERENCIAR CHECKBOXES EM LOTE
    // ==========================================
    checkSelectAll.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        document.querySelectorAll('.item-checkbox').forEach(cb => {
            cb.checked = isChecked;
        });
        verificarSelecao();
    });

    function verificarSelecao() {
        const selecionados = document.querySelectorAll('.item-checkbox:checked');
        const total = document.querySelectorAll('.item-checkbox').length;
        
        selectedCount.innerText = `${selecionados.length} selecionado(s)`;

        if (selecionados.length > 0) {
            bulkButtons.classList.add('active');
        } else {
            bulkButtons.classList.remove('active');
        }

        if(total > 0 && selecionados.length === total) {
            checkSelectAll.checked = true;
        } else {
            checkSelectAll.checked = false;
        }
    }

    function fecharBulkActions() {
        bulkButtons.classList.remove('active');
        checkSelectAll.checked = false;
        selectedCount.innerText = "0 selecionados";
        document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = false);
    }

    function getSelectedIds() {
        return Array.from(document.querySelectorAll('.item-checkbox:checked')).map(cb => cb.value);
    }

    if (btnRefresh) btnRefresh.addEventListener('click', carregarDados);

    // ==========================================
    // AÇÕES EM LOTE (BULK ACTIONS)
    // ==========================================
    document.getElementById('btnBulkDelete').addEventListener('click', async () => {
        const ids = getSelectedIds();
        if(ids.length === 0) return;

        const confirmou = await showModal("Excluir", `Tem certeza que deseja excluir ${ids.length} relatório(s)? Essa ação não pode ser desfeita.`, "confirm");
        
        if (confirmou) {
            const { error } = await supabase.from('relatorios').delete().in('id', ids);
            if (error) await showModal("Erro", error.message);
            else {
                await showModal("Sucesso", "Relatórios excluídos.");
                carregarDados();
            }
        }
    });

    document.getElementById('btnBulkEdit').addEventListener('click', async () => {
        const ids = getSelectedIds();
        if (ids.length > 1) {
            await showModal("Aviso", "Por favor, selecione apenas UM relatório por vez para editar.", "alert");
            return;
        }

        const reportToEdit = allReports.find(r => r.id === ids[0]);
        if (reportToEdit) {
            inputEditId.value = reportToEdit.id;
            inputPlaca.value = reportToEdit.placa;
            inputServico.value = reportToEdit.servico;
            inputPecas.value = reportToEdit.pecas;
            inputNotas.value = reportToEdit.notas;
            
            btnSave.innerHTML = `<i data-lucide="edit"></i> <span>Atualizar Relatório</span>`;
            btnCancelEdit.style.display = 'flex';
            lucide.createIcons();
            
            fecharBulkActions();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('btnBulkPdf').addEventListener('click', () => {
        const ids = getSelectedIds();
        const selectedData = allReports.filter(r => ids.includes(r.id));
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        selectedData.forEach((item, index) => {
            if (index > 0) doc.addPage();
            
            doc.setFont("helvetica", "bold");
            doc.setFontSize(20);
            doc.text("ORDEM DE SERVIÇO", 105, 20, null, null, "center");
            
            doc.setLineWidth(0.5);
            doc.line(20, 25, 190, 25);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("DADOS DO VEÍCULO / MÁQUINA", 20, 35);
            
            doc.setFont("helvetica", "normal");
            doc.text(`Placa / Prefixo: ${item.placa}`, 20, 43);
            doc.text(`Data do Registro: ${new Date(item.created_at).toLocaleString('pt-BR')}`, 20, 50);
            
            doc.line(20, 55, 190, 55); 
            
            doc.setFont("helvetica", "bold");
            doc.text("SERVIÇO EXECUTADO:", 20, 65);
            doc.setFont("helvetica", "normal");
            doc.text(doc.splitTextToSize(item.servico || "Não detalhado.", 170), 20, 72);
            
            doc.setFont("helvetica", "bold");
            doc.text("PEÇAS UTILIZADAS:", 20, 110);
            doc.setFont("helvetica", "normal");
            doc.text(doc.splitTextToSize(item.pecas || "Nenhuma peça informada.", 170), 20, 117);
            
            doc.setFont("helvetica", "bold");
            doc.text("OBSERVAÇÕES:", 20, 155);
            doc.setFont("helvetica", "normal");
            doc.text(doc.splitTextToSize(item.notas || "Nenhuma observação.", 170), 20, 162);
            
            doc.line(55, 250, 155, 250);
            doc.setFontSize(10);
            doc.text("Assinatura do Responsável", 105, 255, null, null, "center");
        });
        
        const nomeArquivo = ids.length === 1 ? `OS_${selectedData[0].placa}.pdf` : `Lote_OS_${ids.length}.pdf`;
        doc.save(nomeArquivo);
        fecharBulkActions();
    });

    // ==========================================
    // BOTÕES DO CABEÇALHO
    // ==========================================
    document.getElementById('btnLogout').addEventListener('click', async () => {
        const confirmou = await showModal("Sair", "Deseja realmente sair do sistema?", "confirm");
        if(confirmou) {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        }
    });

    const body = document.getElementById('body');
    const btnTheme = document.getElementById('btnTheme');
    btnTheme.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            btnTheme.innerHTML = '<i data-lucide="moon"></i>';
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            btnTheme.innerHTML = '<i data-lucide="sun"></i>';
        }
        lucide.createIcons();
    });

    carregarDados();
});