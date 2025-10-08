
import { exec } from "../Shared/EpysaApi";
import { ChangeEvent } from "react";
import { keep } from "use-keep";



export class ActividadesHandler {
  public data = keep([] as Record<string, any>[]);
  public loading = keep(false);

  load = () => {
    this.loading(true);
    return exec('SAR_LISTA_CODIGOS_ACTIVIDAD', {programa  : 'ENT'})
      .then( r => { 
        this.loading(false);
        this.data( r?.data ?? [] )
      })
  }

  setProducto = ( e: ChangeEvent<HTMLInputElement>, id : string) => {
    const valor = e.target.value;
    this.data( this.data().map( e => {
      if (e.Id_Actividad_Entrega === id )
        return { ...e,  producto : valor  }
      else
        return e
    } ) )
  }
    
}

export const actividades = new ActividadesHandler();

