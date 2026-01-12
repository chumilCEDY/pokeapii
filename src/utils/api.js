const API_URL = 'https://pokeapi.co/api/v2';

export async function obtenerListaPokemon(limite = 20, inicio = 0) {
  try {
    const respuesta = await fetch(`${API_URL}/pokemon?limit=${limite}&offset=${inicio}`);
    const datos = await respuesta.json();
    //dato para cada pokemon
    const listaPokemon = await Promise.all(
      datos.results.map(async (pokemon) => {
        const detalles = await obtenerDetallesPokemon(pokemon.name);
        return {
          id: detalles.id,
          nombre: detalles.name,
          imagen: detalles.sprites.front_default,
          tipos: detalles.types.map(t => t.type.name),
        };
      })
    );

    return {
      pokemon: listaPokemon,
      total: datos.count,
      siguiente: datos.next,
      anterior: datos.previous,
    };
  } catch (error) {
    console.error('Error al obtener lista de Pokémon:', error);
    return { pokemon: [], total: 0 };
  }
}

export async function obtenerDetallesPokemon(nombreOId) {
  try {
    const respuesta = await fetch(`${API_URL}/pokemon/${nombreOId}`);
    if (!respuesta.ok) throw new Error('Pokémon no encontrado');
    return await respuesta.json();
  } catch (error) {
    console.error('Error al obtener detalles:', error);
    return null;
  }
}
//buscar pokemon 
export async function buscarPokemon(busqueda) {
  try {
    const detalles = await obtenerDetallesPokemon(busqueda.toLowerCase());
    if (detalles) {
      return [{
        id: detalles.id,
        nombre: detalles.name,
        imagen: detalles.sprites.front_default,
        tipos: detalles.types.map(t => t.type.name),
      }];
    }
  } catch (error) {
    const todos = await obtenerListaPokemon(1000, 0);
    return todos.pokemon.filter(p => 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
  return [];
}