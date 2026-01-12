import { useState, useEffect } from "react";
import './PokemonCard.css';

function PokemonCard({ pokemon }) {
    const [detallesCompletos, setDetallesCompletos] = useState(null);
    useEffect(() => {   //hook para cargar detalles completos
        async function cargarDetalles() {
            if (pokemon.id) {
                const respuesta =await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
                const datos = await respuesta.json();
                setDetallesCompletos(datos);
            }
        }
        cargarDetalles();
    }, [pokemon.id]); //array alt
    return ( //nlace para ver detalles
        <a href= {`/pokemon/${pokemon.id}`} className="pokemon-card">
            <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
            <div className="pokemon-image">
                <img src={pokemon.imagen || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={pokemon.nombre} />
            </div>
            <h3 className="pokemon-nombre">{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <div className="pokemon-tipos">
                {pokemon.tipos?.map((tipo) => (
                    <span key={tipo} className={`tipo  tipo-${tipo}`}>{tipo}</span>
                ))}
            </div>
        </a>
    );
}

export default PokemonCard;
        
