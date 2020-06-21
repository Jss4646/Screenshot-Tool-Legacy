const menuContainer = document.querySelector('.menu-container');
const menu = document.querySelector('.menu');
const menuButton = document.querySelector('.menu-button');
const exitMenuButton = document.querySelector('.menu-exit-button');

menuButton.addEventListener('click', () => {
    menuContainer.style.display = 'grid';
    menuContainer.style.zIndex = '2';
});

exitMenuButton.addEventListener('click', () => {
    menuContainer.style.display = 'none';
    menuContainer.style.zIndex = '-1';
});

