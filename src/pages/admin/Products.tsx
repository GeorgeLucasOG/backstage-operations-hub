
  // Função para lidar com a submissão do formulário de edição
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingProduct) return;

    setIsSubmitting(true);

    try {
      // Validações básicas
      if (!editingProduct.name.trim()) {
        throw new Error("O nome do produto é obrigatório");
      }

      if (isNaN(editingProduct.price) || editingProduct.price <= 0) {
        throw new Error("O preço deve ser um número válido maior que zero");
      }

      // Atualizar o produto
      updateMutation.mutate({
        id: editingProduct.id,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl || "https://via.placeholder.com/150",
        menuCategoryId: editingProduct.menuCategoryId,
        ingredients: editingProduct.ingredients,
      });
    } catch (error) {
      console.error("Erro ao processar edição:", error);
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Erro ao atualizar produto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
