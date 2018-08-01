class Field {
    constructor() {
        this.field = document.querySelector('.game-field');
        this.setField();
    };

    setField() {
        let fieldDimensions = this.getDimensions();
        fieldDimensions.then((object) => {
            this.renderField(object.width, object.height);
            this.setFieldWidth(object.width);
        });
    }

    getDimensions() {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://kde.link/test/get_field_size.php', true);
        xhr.send();

        return new Promise ((res) => {
            xhr.onreadystatechange = function() {
                if (xhr.status !== 200) {
                    res(this.setInitialField());
                } else {
                    res(JSON.parse(xhr.responseText));
                }
            }.call(this);
        })
    }

    setInitialField() {
        let minWidth = 4;
        let maxWidth = 8;

        let dimensionsDelta = maxWidth - minWidth;
        let randomStep = 10 / dimensionsDelta;
        
        return this.getCorrectRandom(minWidth, maxWidth);
    }

    getCorrectRandom(minWidth, maxWidth) {
        let fieldWidth = this.getDecRandom(minWidth, maxWidth);
        let fieldHeight = this.getDecRandom(minWidth, maxWidth);
        if (fieldWidth * fieldHeight % 2) {
            return this.getCorrectRandom(minWidth, maxWidth)
        } else {
            return {
                width: fieldWidth,
                height: fieldHeight
            }
        }
    }


    setFieldWidth(widthCells) {
        let cell = document.querySelector('.cell');

        let cellWidth = getComputedStyle(cell).width.replace('px', '');
        let fieldBorder = getComputedStyle(this.field).border;
        let calcFieldBorder = parseInt(fieldBorder.substring(0, fieldBorder.indexOf('px'))) * 2;

        let calculateCellWidth = parseInt(cellWidth) * widthCells + calcFieldBorder;
        this.field.setAttribute('style', `width: ${calculateCellWidth}px; margin: ${-calculateCellWidth / 2}px`);
    }

    renderField(width, height) {
        let imagesLinks = this.getImages();
        let imagesSwap = this.swapArray(imagesLinks);
        let cellNumbers = width * height;
        let presentNumbers = [];

        for (let i = 0; i < cellNumbers; i = i + 2) {
            generateNumber.call(this);
        }

        presentNumbers = this.separateSameImages(presentNumbers, imagesSwap);

        presentNumbers.forEach((index) => {
            this.createElement(imagesSwap[index]);
        });

        function generateNumber() {
            let elementNumber = this.getDecRandom(0, imagesSwap.length - 1);
            presentNumbers.push(elementNumber, elementNumber);
        }
    }

    separateSameImages(imgArray) {
        for (let i = 0; i < imgArray.length; i++) {
            for (let j = 0; j < imgArray.length; j++) {
                if (imgArray[i] === imgArray[i + 1] || imgArray[i] === imgArray[i - 1]) {
                    if (imgArray[i] !== imgArray[j]
                    && imgArray[i] !== imgArray[j + 1]
                    && imgArray[i] !== imgArray[j - 1]) {
                        let change = imgArray[i];
                        imgArray[i] = imgArray[j];
                        imgArray[j] = change;
                    }
                }
            }
        }
        return imgArray;
    }

    createElement(image) {
        let div = document.createElement('div');
        let img = document.createElement('img');

        img.setAttribute('class', 'img');
        img.setAttribute('src', image);
        div.setAttribute('class', 'cell');
        div.setAttribute('data-background-change', 'default');

        div.appendChild(img);
        this.field.appendChild(div);

        div.addEventListener('click', game.addEvent.bind(game));
    }

    getImages() {
        let imagesNumber = 10;
        let imagesArray = [];
        let imagesAddress = 'https://kde.link/test/';
        for (let i = 0; i < imagesNumber; i++) {
            imagesArray.push(imagesAddress + `${i}.png`);
        }
        return imagesArray;
    }

    swapArray(array) {
        for (let i = 0; i < array.length; i++) {
            let randomNumber = this.getDecRandom(0, array.length - 1);
            let randomElement = array[randomNumber];
            array[randomNumber] = array[i];
            array[i] = randomElement;
        }
        return array;
    }

    getDecRandom(min, max) {
        let randomStep = 10 / (max - min);
        return min + Math.round(Math.random() * 10 / randomStep);
    }
}

class gameLogic {
    constructor() {
        this.previousCell = [];
    }

    addEvent(event) {
        let currentTarget = event.currentTarget;
        let target = event.target;

        if (target.className === 'cell') {
            if (this.previousCell[1] && this.checkChildSRC(currentTarget, this.previousCell[1])) {
                this.markTheSame(currentTarget);
            } else {
                this.checkNextCell(currentTarget);
                this.hidePreviousCell();
            }
        } else if (currentTarget === this.previousCell[0]) {
            this.flipItems();
        }
    }

    hidePreviousCell() {
        if (this.previousCell.length === 3) {
            let firstCell = this.previousCell.shift();
            firstCell.setAttribute('data-background-change', 'transparent');
        }
    }

    checkNextCell(currentTarget) {
        if (this.previousCell.length === 1 && this.checkChildSRC(currentTarget, this.previousCell[0])) {
            this.markTheSame(currentTarget)
        } else {
            this.previousCell.push(currentTarget);
            currentTarget.setAttribute('data-background-change', 'selected');
        }
    }

    checkChildSRC(currentTarget, sameElement) {
        return currentTarget.firstElementChild.getAttribute('src') === sameElement.firstElementChild.getAttribute('src');
    }

    markTheSame(currentTarget) {
        let firstCell = this.previousCell.pop();
        firstCell.setAttribute('data-background-change', 'success');
        firstCell.firstElementChild.setAttribute('style', 'display: none');
        currentTarget.setAttribute('data-background-change', 'success');
    }

    flipItems() {
        let buffer = this.previousCell[0];
        this.previousCell[0] = this.previousCell[1];
        this.previousCell[1] = buffer;
    }
}

class gameControl {
    constructor() {
        this.addStartEvent();
        this.gameField = document.querySelector('.game-field');
        this.contentStart = document.querySelector('.content-start')
    }
    addStartEvent() {
        let startButton = document.querySelector('.btn-start');
        startButton.addEventListener('click', this.gameStart.bind(this));
    }
    gameStart() {
        this.gameField.setAttribute('data-display', 'block');
        this.contentStart.setAttribute('data-display', 'none');
    }
}

new Field();
new gameControl();
let game = new gameLogic();