export const missions = [
    { id: 1, category: 'banana', label: 'Banana' },
    { id: 2, category: 'book', label: 'Livro' },
    { id: 3, category: 'bottle', label: 'Garrafa' },
    { id: 4, category: 'cup', label: 'Xícara' },
    { id: 5, category: 'spoon', label: 'Colher' },
    { id: 6, category: 'mouse', label: 'Mouse' },
    { id: 7, category: 'scissors', label: 'Tesoura' },
  ];
  
  export const getShuffledMissions = () => {
    const shuffled = [...missions].sort(() => Math.random() - 0.5);
    return shuffled;
  };