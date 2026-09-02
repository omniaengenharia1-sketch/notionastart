import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './componentes/Layout';
import { Entrada } from './paginas/Entrada';
import { Inicio } from './paginas/Inicio';
import { Clientes } from './paginas/Clientes';
import { ClienteDetalhe } from './paginas/ClienteDetalhe';
import { AFazer } from './paginas/AFazer';
import type { Perfil } from './dados/tipos';

const A_FAZER = ['calendario', 'editor', 'fila', 'aprovacao', 'financeiro', 'contratos', 'crm'];

export default function App() {
  const [operador, setOperador] = useState<Perfil | null>(null);

  if (!operador) return <Entrada aoEntrar={setOperador} />;

  return (
    <Routes>
      <Route element={<Layout operador={operador} aoTrocarOperador={() => setOperador(null)} />}>
        <Route index element={<Inicio operador={operador} />} />
        <Route path="clientes" element={<Clientes operador={operador} />} />
        <Route path="clientes/:id" element={<ClienteDetalhe operador={operador} />} />
        {A_FAZER.map((k) => (
          <Route key={k} path={k} element={<AFazer chave={k} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
