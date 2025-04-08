import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erreur capturée :", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          maxWidth: '800px', 
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1 style={{ color: '#ff4d4f' }}>Une erreur est survenue</h1>
          <div style={{ 
            padding: '16px', 
            background: '#fff1f0', 
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <h3>Détails de l'erreur :</h3>
            <p>{this.state.error?.toString()}</p>
            
            {this.state.error?.stack && (
              <details style={{ marginTop: '10px' }}>
                <summary>Stack trace</summary>
                <pre style={{ 
                  overflowX: 'auto', 
                  padding: '10px', 
                  background: '#f5f5f5',
                  fontSize: '12px'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            {this.state.errorInfo && (
              <details style={{ marginTop: '10px' }}>
                <summary>Informations sur le composant</summary>
                <pre style={{ 
                  overflowX: 'auto', 
                  padding: '10px', 
                  background: '#f5f5f5',
                  fontSize: '12px'
                }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '8px 16px', 
              background: '#1890ff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Rafraîchir la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 