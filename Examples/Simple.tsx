
import { keep, useKeep, useKeeper } from "use-keep"



const lamparasKo = (lamp = keep(0)) => {
  return {
    useL: () => useKeep(lamp),
    add : () => lamp( lamp() + 1 ),
    sub : () => lamp( l => --l ),
    reset : () => lamp(0)
  }

}

const lamps = lamparasKo();

const sillas = keep(0);

const increment = () => sillas( s => s + 1 );
const decrement = () => sillas( s => s - 1 );
const reset = () => sillas(0);

export function Simple() {

  return <div className="section">
    <br /><br />

    <Total />

    <br />
    <Triangulos />
    <br />
    <Cuadrados />
    <br />
    <Circulos />
    <br /><br />
    <Cubos />
    <br /><br />
    <Lamparas />
    <br /><br />
    <Sillas />
    <br /><br />

  </div>;
}


function Lamparas() {
  const lamparasCount = lamps.useL();

  return <>
    <span>Lámparas: {lamparasCount}</span>
    <button className="button" type="button" onClick={lamps.add}>+</button>
    <button className="button" type="button" onClick={lamps.sub}>-</button>
    <button className="button" type="button" onClick={lamps.reset}>Reset</button>
  </> 
}

function Sillas() {
  const sillasCount = useKeep(sillas);
  return <>
    <span>Sillas: {sillasCount}</span>
    <button className="button" type="button" onClick={increment}>+</button>
    <button className="button" type="button" onClick={decrement}>-</button>
    <button className="button" type="button" onClick={reset}>Reset</button>
  </> 
}


const figures = () => {
  const triangulos = keep(0);
  const cuadrados = keep(0);
  const circulos = keep(0);

  const triangulosHandler = {
    increment: () => triangulos( t => t + 1 ),
    decrement: () => triangulos( t => t - 1 ),
    reset: () => triangulos(0)
  };
  const cuadradosHandler = {
    increment: () => cuadrados( c => c + 1 ),
    decrement: () => cuadrados( c => c - 1 ),
    reset: () => cuadrados(0)
  };
  const circulosHandler = {
    increment: () => circulos( c => c + 1 ),
    decrement: () => circulos( c => c - 1 ),
    reset: () => circulos(0)
  };

  return {
    useTriangulos : () => [useKeep(triangulos), triangulosHandler] as const,
    useCuadrados : () => [useKeep(cuadrados), cuadradosHandler] as const,
    useCirculos : () => [useKeep(circulos), circulosHandler] as const,
    useTotal : function () {
      return useKeep(triangulos) + useKeep(cuadrados) + useKeep(circulos);
    }
  };
}

const formasStore = figures();

function Total() {
  const total = formasStore.useTotal();
  console.log("Render Total");
  return <h1>Total: {total}</h1>
}

function Triangulos() {
  const [triangulosCount, { increment, decrement, reset }] = formasStore.useTriangulos();
  console.log("Render Triangulos");
  return <>
    <span>Triángulos: {triangulosCount}</span>
    <button className="button" type="button" onClick={increment}>+</button>
    <button className="button" type="button" onClick={decrement}>-</button>
    <button className="button" type="button" onClick={reset}>Reset</button>
  </> 
}

function Cuadrados() {
  const [cuadradosCount, { increment, decrement, reset }] = formasStore.useCuadrados();
  console.log("Render Cuadrados");
  return <>
    <span>Cuadrados: {cuadradosCount}</span>
    <button className="button" type="button" onClick={increment}>+</button>
    <button className="button" type="button" onClick={decrement}>-</button>
    <button className="button" type="button" onClick={reset}>Reset</button>
  </> 
}

function Circulos() {
  const [circulosCount, { increment, decrement, reset }] = formasStore.useCirculos();
  console.log("Render Circulos");
  return <>
    <span>Círculos: {circulosCount}</span>
    <button className="button" type="button" onClick={increment}>+</button>
    <button className="button" type="button" onClick={decrement}>-</button>
    <button className="button" type="button" onClick={reset}>Reset</button>
  </> 
}

function Cubos () {
  const cubos = useKeeper( () => cubosCounter(3) );
  const [ cubosCount, {  increment, decrement,  reset } ] = [ cubos.use(), cubos ];
  console.log("Render Cubos");
  return <>
    <span>Cubos: {cubosCount}</span>
    <button className="button" type="button" onClick={increment}>+</button>
    <button className="button" type="button" onClick={decrement}>-</button>
    <button className="button" type="button" onClick={reset}>Reset</button>
  </>
}



function cubosCounter ( initial = 0 ) {
  const cubos = keep(initial);
  return {
    use : () => useKeep(cubos),
    increment: () => cubos( c => c + 1 ),
    decrement: () => cubos( c => c - 1 ),
    reset: () => cubos(initial)
  }
}