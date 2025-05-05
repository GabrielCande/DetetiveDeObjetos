export const missions = [
    { id: 1, category: 'banana', label: 'Banana', image: '/src/assets/banana.png'},
    { id: 2, category: 'book', label: 'Livro', image: '/src/assets/book.png'},
    { id: 3, category: 'bottle', label: 'Garrafa', image: '/src/assets/bottle.png'},
    { id: 4, category: 'cup', label: 'Xícara', image: '/src/assets/cup.png'},
    { id: 5, category: 'spoon', label: 'Colher', image: '/src/assets/spoon.png'},
    { id: 6, category: 'mouse', label: 'Mouse', image: '/src/assets/mouse.png'},
    { id: 7, category: 'scissors', label: 'Tesoura', image: '/src/assets/scissors.png'},
  ];
  
  export const getShuffledMissions = () => {
    const shuffled = [...missions].sort(() => Math.random() - 0.5);
    return shuffled;
  };