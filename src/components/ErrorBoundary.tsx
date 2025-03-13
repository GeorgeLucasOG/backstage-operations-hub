import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary captura erros em componentes filhos e exibe uma interface de fallback
 * em vez de deixar que o erro derrube toda a aplicação.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4 rounded-md bg-red-50 border border-red-100">
          <h2 className="text-lg font-medium text-red-800 mb-2">Algo deu errado.</h2>
          <p className="text-sm text-red-700">
            Ocorreu um erro ao renderizar este componente.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-3 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md hover:bg-red-200"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
