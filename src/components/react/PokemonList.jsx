import { useState, useEffect } from "react";    
import PokemonCard from "./PokemonCard";
import "./PokemonList.css";

function PokemonList() {
    const [listaPokemon, setListaPokemon] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [orden, setOrden] = useState("nombre-asc"); 
    const [pagina, setPagina] = useState(0);
    const [totalPokemon, setTotalPokemon] = useState(0);
    const [todosPokemon, setTodosPokemon] = useState([]); // para todo los Pokémon
    
    const limitePorPagina = 20;

    // cargar los Pokémon una sola vez
    const cargarTodosLosPokemon = async () => {
        setCargando(true);
        try {
            // Primero se obtiene el total de Pokémon
            const respuestaTotal = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1`);
            const datosTotal = await respuestaTotal.json();
            const total = datosTotal.count;
            setTotalPokemon(total);
            const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${total}`);
            const datos = await respuesta.json();
            
            // Obtener detalles de cada Pokémon
            const pokemonconDetalles = await Promise.all(
                datos.results.map(async (pokemonBasico) => {
                    const res = await fetch(pokemonBasico.url);
                    const detalles = await res.json();
                    return {
                        id: detalles.id,
                        nombre: detalles.name,
                        imagen: detalles.sprites.front_default,
                        tipos: detalles.types.map(t => t.type.name)
                    };
                })
            );
            setTodosPokemon(pokemonconDetalles);
            
            // Aplicar orden inicial y paginación
            aplicarOrdenYPaginacion(pokemonconDetalles, orden, pagina);
        } catch (error) {
            console.error("Error al cargar los Pokémon:", error);
        } finally {
            setCargando(false);
        }
    };

    // aplicar orden y paginación
    const aplicarOrdenYPaginacion = (pokemonLista, ordenActual, paginaActual) => {
        const listaOrdenada = [...pokemonLista].sort((a, b) => {
            if (ordenActual === 'nombre-asc') {
                return a.nombre.localeCompare(b.nombre); // A-Z
            } else if (ordenActual === 'nombre-desc') {
                return b.nombre.localeCompare(a.nombre); // Z-A
            }
            return a.nombre.localeCompare(b.nombre); // Por defecto A-Z
        });
        const inicio = paginaActual * limitePorPagina;
        const fin = inicio + limitePorPagina;
        const pokemonPaginados = listaOrdenada.slice(inicio, fin);
        
        setListaPokemon(pokemonPaginados);
    };

    // manejar búsquedas
    const manejarBusqueda = async () => {
        if (!busqueda.trim()) {
            aplicarOrdenYPaginacion(todosPokemon, orden, pagina);
            return;
        }
        setCargando(true);
        try {
            // búsqueda en la API
            const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${busqueda.toLowerCase()}`);
            const datos = await respuesta.json();
            
            setListaPokemon([{
                id: datos.id,
                nombre: datos.name,
                imagen: datos.sprites.front_default,
                tipos: datos.types.map(t => t.type.name)
            }]);
            setTotalPokemon(1);
        } catch (error) {
            // Buscar en todos los Pokémon cargados
            const filtrados = todosPokemon.filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            
            // Ordenar los resultados filtrados
            const filtradosOrdenados = [...filtrados].sort((a, b) => {
                if (orden === 'nombre-asc') {
                    return a.nombre.localeCompare(b.nombre);
                } else {
                    return b.nombre.localeCompare(a.nombre);
                }
            });
            setListaPokemon(filtradosOrdenados);
            setTotalPokemon(filtradosOrdenados.length);
        } finally {
            setCargando(false);
        }
    };


    //  limpiar búsqueda
    const limpiarBusqueda = () => {
        setBusqueda('');
        aplicarOrdenYPaginacion(todosPokemon, orden, pagina);
    };

    // cargar todos los Pokémon al inicio
    useEffect(() => {
        cargarTodosLosPokemon();
    }, []);

    // Cambiar el orden
    useEffect(() => {
        if (todosPokemon.length > 0) {
            aplicarOrdenYPaginacion(todosPokemon, orden, pagina);
        }
    }, [orden, pagina]);

    // Usar enter para buscar
    const manejarTeclaEnter = (event) => {
        if (event.key === "Enter") {
            manejarBusqueda();
        }
    };

    return (
        <div className="contenedor-pokemon">
            
            {/* Controles de búsqueda y orden */}
            <div className="controles">
                <div className="busqueda">
                    <input 
                        type="text" 
                        value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                        onKeyDown={manejarTeclaEnter} 
                        placeholder="Buscar Pokémon" 
                    />
                    <button onClick={manejarBusqueda}>Buscar</button>
                    <button onClick={limpiarBusqueda} className="boton-limpiar">Limpiar</button>
                </div>
                
                <div className="controles-orden">
                    <span>Ordenar por:</span>
                    <select 
                        value={orden} 
                        onChange={(e) => setOrden(e.target.value)}
                        className="selector-orden"
                    >
                        <option value="nombre-asc">Nombre A-Z</option>
                        <option value="nombre-desc">Nombre Z-A</option>
                    </select>
                </div>
            </div>

            {/* Mensaje de carga */}
            {cargando && <div className="cargando">Cargando Pokémon...</div>}

            {/* Grid para Pokémon */}
            {!cargando && (
                <>
                    <div className="grid-pokemon">
                        {listaPokemon.map((pokemon) => (
                            <PokemonCard key={pokemon.id} pokemon={pokemon} />
                        ))}
                    </div>
                    
                    
                    {/* Paginación    cuando no hay búsqueda */}
                    {!busqueda && listaPokemon.length > 0 && (
                        <div className="paginacion">
                            <button 
                                onClick={() => setPagina(p => Math.max(0, p - 1))} 
                                disabled={pagina === 0}
                                className="boton-paginacion"
                            >
                                Anterior 
                            </button> 
                            <span className="info-pagina"> 
                                Página {pagina + 1} de {Math.ceil(totalPokemon / limitePorPagina)} 
                            </span>
                            <button 
                                onClick={() => setPagina(p => p + 1)} 
                                disabled={(pagina + 1) * limitePorPagina >= totalPokemon} 
                                className="boton-paginacion"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                    
                    {/* Sin resultados */}
                    {!cargando && listaPokemon.length === 0 && (
                        <div className="sin-resultados">
                            No se encontraron Pokémon. Intenta con otro nombre.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
export default PokemonList;