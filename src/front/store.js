export const initialStore = () => {
  return {
    restaurants: [
      { id: 1, name: "La Hacienda", score: 92, food_type: "Cortes", cuisine_origin: "Argentina", image_url: "https://placehold.co/600x400?text=Parrilla", description: "Las mejores brasas de Caracas." },
      { id: 2, name: "Sake House", score: 85, food_type: "Sushi", cuisine_origin: "Japonesa", image_url: "https://placehold.co/600x400?text=Sushi", description: "Fusión tradicional y moderna." },
      { id: 3, name: "El Ávila Burger", score: 78, food_type: "Hamburguesas", cuisine_origin: "Americana", image_url: "https://placehold.co/600x400?text=Burger", description: "Sabor urbano con vista al Ávila." },
      { id: 4, name: "Trattoria Mia", score: 88, food_type: "Pasta", cuisine_origin: "Italiana", image_url: "https://placehold.co/600x400?text=Pasta", description: "Recetas de la abuela directo de Roma." },
      { id: 5, name: "Arepa Factory", score: 95, food_type: "Rellena", cuisine_origin: "Venezolana", image_url: "https://placehold.co/600x400?text=Arepa", description: "Nuestra esencia en cada bocado." },
      { id: 6, name: "Taco Real", score: 55, food_type: "Tacos", cuisine_origin: "Mexicana", image_url: "https://placehold.co/600x400?text=Tacos", description: "Picante auténtico de CDMX." },
      { id: 7, name: "Chifa Express", score: 62, food_type: "Arroz", cuisine_origin: "China", image_url: "https://placehold.co/600x400?text=Chifa", description: "El mejor wok del centro." },
      { id: 8, name: "Paella & Olé", score: 81, food_type: "Arroz", cuisine_origin: "Española", image_url: "https://placehold.co/600x400?text=Paella", description: "Sabor a mar y azafrán." },
      { id: 9, name: "Bangkok Soul", score: 45, food_type: "Pad Thai", cuisine_origin: "Tailandesa", image_url: "https://placehold.co/600x400?text=Thai", description: "Especias exóticas y frescura." },
      { id: 10, name: "Lima 27", score: 90, food_type: "Ceviche", cuisine_origin: "Peruana", image_url: "https://placehold.co/600x400?text=Ceviche", description: "Alta cocina andina." }
    ]
  };
};

export default function storeReducer(store, action = {}) {
  switch(action.type){
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };
      
    case 'add_task':

      const { id,  color } = action.payload

      return {
        ...store,
        todos: store.todos.map((todo) => (todo.id === id ? { ...todo, background: color } : todo))
      };
    default:
      throw Error('Unknown action.');
  }    
}
