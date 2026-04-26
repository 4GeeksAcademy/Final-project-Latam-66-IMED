export const initialStore = () => {
  return {
    // Iniciamos el arreglo vacío. Se llenará cuando hagamos el GET al backend.
    restaurants: [],

    searchQuery: ""
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    // 0. Guarda lo que el usuario escribe en el buscador
    case 'set_search_query':
      return {
        ...store,
        searchQuery: action.payload
      };

    // 1. CARGAR TODOS: Reemplaza la lista entera con la que viene del backend
    case 'set_restaurants':
      return {
        ...store,
        restaurants: action.payload
      };

    // 2. CREAR: Toma la lista actual y le agrega el restaurante nuevo al final
    case 'add_restaurant':
      return {
        ...store,
        restaurants: [...store.restaurants, action.payload]
      };

    // 3. ACTUALIZAR: Busca el restaurante por ID y lo reemplaza con los datos nuevos
    case 'update_restaurant':
      return {
        ...store,
        restaurants: store.restaurants.map((restaurant) =>
          restaurant.id === action.payload.id ? action.payload : restaurant
        )
      };

    // 4. ELIMINAR: Filtra la lista quitando el restaurante que coincida con el ID
    case 'delete_restaurant':
      return {
        ...store,
        restaurants: store.restaurants.filter((restaurant) => restaurant.id !== action.payload)
      };

    // Dejo tu set_hello por si lo usas en otro lado
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
    
    // Guarda los comentarios de un restaurante en específico
    case 'set_restaurant_comments':
      return {
        ...store,
        currentRestaurantComments: action.payload
      };

    // Guarda los comentarios del usuario logueado para su perfil
    case 'set_user_comments':
      return {
        ...store,
        userProfileComments: action.payload
      };

    default:
      throw Error('Acción desconocida: ' + action.type);
  }
}