// Função para buscar caixas (adicionando recarregamento explícito)
const fetchCashRegistersList = async (forceReload = false) => {
  setLoading(true);
  try {
    const cashRegisters = await fetchCashRegisters(forceReload);
    setCashRegisters(cashRegisters);
  } catch (err) {
    console.error("Erro ao buscar caixas:", err);
    toast.error("Falha ao carregar a lista de caixas");
  } finally {
    setLoading(false);
  }
};

// Criar caixa (modificando para forçar atualização)
const handleCreateCashRegister = async (data) => {
  try {
    setCreating(true);
    await createCashRegister(
      data.name,
      parseFloat(data.initialAmount),
      DEFAULT_RESTAURANT_ID,
      data.openingDetails
    );

    // Forçar atualização imediata da lista
    await fetchCashRegistersList(true);

    toast.success("Caixa criado com sucesso!");
    onClose(); // Fechar modal
  } catch (err) {
    console.error("Erro ao criar caixa:", err);
    toast.error(err.message || "Falha ao criar caixa");
  } finally {
    setCreating(false);
  }
};
