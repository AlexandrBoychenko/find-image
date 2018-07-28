let cells = document.querySelectorAll('.cell');
let cellWidth = getComputedStyle(cells[0]).getPropertyValue('width');
let field = document.querySelector('.wrapper');

let cellNumbers = cells.length / 2;
field.setAttribute('style', `width: ${parseInt(cellWidth.replace('px', '')) * cellNumbers}px`);