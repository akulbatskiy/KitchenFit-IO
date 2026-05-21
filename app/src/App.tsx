import './App.css';
import { useReport } from './hooks/useReport';
import { Landing } from './components/Landing';
import { Import } from './components/Import';
import { Assumptions } from './components/Assumptions';
import { Generate } from './components/Generate';
import { Preview } from './components/Preview';

function Header({ label }: { label?: string }) {
  return (
    <header className="header">
      <div className="container">
        <div className="header__inner">
          <span className="header__brand">Akrive Consulting Ltd</span>
          {label && <span className="header__badge">{label}</span>}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const [state, dispatch] = useReport();

  switch (state.screen) {
    case 'landing':
      return (
        <>
          <Header />
          <Landing dispatch={dispatch} />
        </>
      );

    case 'import':
      return (
        <>
          <Header label="Import" />
          <Import state={state} dispatch={dispatch} />
        </>
      );

    case 'assumptions':
      return (
        <>
          <Header label="Assumptions" />
          <Assumptions state={state} dispatch={dispatch} />
        </>
      );

    case 'generate':
      return (
        <>
          <Header label="Generating" />
          <Generate state={state} dispatch={dispatch} />
        </>
      );

    case 'preview':
      return (
        <>
          <Header label="Preview" />
          <Preview state={state} dispatch={dispatch} />
        </>
      );
  }
}
