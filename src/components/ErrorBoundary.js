import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError:false, error:null };
  }
  static getDerivedStateFromError(error){
    return { hasError:true, error };
  }
  componentDidCatch(error, info){
    // Podríamos enviar a un log centralizado en el futuro
    console.error('Error UI capturado:', error, info);
  }
  render(){
    if(this.state.hasError){
      return (
        <div style={{padding:'32px', fontFamily:'sans-serif'}}>
          <h2 style={{marginTop:0}}>Ha ocurrido un error en la interfaz</h2>
          <p style={{opacity:.7, fontSize:14}}>Intenta volver atrás o recargar. Detalle técnico:</p>
          <pre style={{background:'#f5f5f7', padding:'12px 14px', borderRadius:12, maxWidth:600, overflow:'auto', fontSize:12}}>{String(this.state.error)}</pre>
          <button onClick={()=>this.setState({hasError:false, error:null})} style={{marginTop:10, padding:'8px 14px', borderRadius:8, border:'1px solid #ccc', cursor:'pointer'}}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;