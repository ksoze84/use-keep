
import './Styles/data.scss';
import { Input } from 'epysa-bulma';
import { actividades } from './Store/ActividadesHandler';
import { IdatoEpysa } from 'epysa-dataproc';
import { FaSave } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { ChangeEvent } from 'react';
import { useKeep } from 'use-keep';

App.loader = (  ) => {
  actividades.load();
  return null;
}

export default function App() {

  const [acts, isLoad, actsHandler] = [useKeep(actividades.data), useKeep(actividades.loading), actividades];

  return (
      <div className="section">
        <div className="container page">
          <div className="header">

            <Input
              label="Número o Nombre"
              type="text"
              value={(isLoad ?? 'undef' ).toString()}
            />

            <Link to="/appb" >Appb</Link>

            <div className="buttons is-right ">
              <button className="button is-danger" onClick={actsHandler.load}>
                Buscar
              </button>
            </div>

          </div>

          

          <div className="data-list">

            <div className="data-row bold">
              <div className="">
                ACTIVIDAD
              </div>
              <div className="">
                PRODUCTO
              </div>
              <div className="">
                GRABAR
              </div>
            </div>
          
            {acts
              .map( a => <Item key={a.Id_Actividad_Entrega} act={a} changeProducto={e => actsHandler.setProducto(e, a.Id_Actividad_Entrega)}/>)
            }
          </div>
        
        </div>
      </div>
  );
}


function Item({act, changeProducto}:Readonly<{act:IdatoEpysa, changeProducto:(e:ChangeEvent<HTMLInputElement>)=>void}>){
  return(
    <div className="data-row list-item">
      <div className="bold">
      [ {act.Id_Actividad_Entrega} ] {act.Nombre_Actividad_Entrega}
      </div>
      <div className="">
        <Input value={act.producto || ''} onChange={changeProducto}  />
      </div>
      <div className="">

        <button type='button' className='button is-success '  >
          <span className='icon-text'>
            <span className='icon'>
              <FaSave />
            </span>
            <span>Guardar</span>
          </span>
        </button>
        
      </div>
    </div>
  )
}

