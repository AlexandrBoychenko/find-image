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
        //get JSON data from script, if error get random values from this.setInitialField()
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
        //min and max game field dimensions
        let minWidth = 3;
        let maxWidth = 8;

        let dimensionsDelta = maxWidth - minWidth;
        return this.getCorrectRandom(minWidth, maxWidth);
    }

    getCorrectRandom(minWidth, maxWidth) {
        //get random numbers in the range from min to max value
        let fieldWidth = this.getRandomNumber(minWidth, maxWidth);
        let fieldHeight = this.getRandomNumber(minWidth, maxWidth);

        //if multiplication of the field dimensions is'nt even run this method recursively
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
        //set game field width style attribute
        let cell = document.querySelector('.cell');
        let cellWidth = getComputedStyle(cell).width.replace('px', '');
        let fieldBorder = getComputedStyle(this.field).border;
        let calcFieldBorder = parseInt(fieldBorder.substring(0, fieldBorder.indexOf('px'))) * 2;

        let calculateCellWidth = parseInt(cellWidth) * widthCells + calcFieldBorder;
        this.field.setAttribute('style', `width: ${calculateCellWidth}px;`);
    }

    renderField(width, height) {
        let imagesLinks = this.getImages();
        let imagesSwap = this.swapArray(imagesLinks);
        let cellNumbers = width * height;
        let presentNumbers = [];

        for (let i = 0; i < cellNumbers; i = i + 2) {
            generateNumber.call(this);
        }
        presentNumbers = this.separateSameImages(presentNumbers);

        //use received array to draw cells in the game field
        presentNumbers.forEach((index) => {
            this.createElement(imagesSwap[index]);
        });

        function generateNumber() {
            //get random number and push two the same numbers in array to save even quantity for the elements
            let elementNumber = this.getRandomNumber(0, imagesSwap.length - 1);
            presentNumbers.push(elementNumber, elementNumber);
        }

        //get cells quantity value to calculate criteria for game end in the GameLogic object
        Game.cellsQuantity = presentNumbers.length;
    }

    separateSameImages(imgArray) {
        //check all numbers in array and their neighbors, if it has 2 the same numbers in a row do exchange it on other
        //numbers in the array
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

        div.addEventListener('click', Game.addEvent.bind(Game));
    }

    getImages() {
        //get array with images address
        let imagesNumber = 10;
        let imagesArray = [];
        for (let i = 1; i < imagesNumber; i++) {
            let imgName = `${i}.png`;
            i < 10 ?  imgName = 0 + imgName : null;
            imagesArray.push(`img/` + imgName);
        }
        return imagesArray;
    }

    swapArray(array) {
        for (let i = 0; i < array.length; i++) {
            let randomNumber = this.getRandomNumber(0, array.length - 1);
            let randomElement = array[randomNumber];
            array[randomNumber] = array[i];
            array[i] = randomElement;
        }
        return array;
    }

    getRandomNumber(min, max) {
        //Get random number based on the specified range
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

class GameLogic {
    constructor() {
        this.previousCell = [];
        this.winCells = 0;
    }

    addEvent(event) {
        let currentTarget = event.currentTarget;
        let target = event.target;

        //check is clicked cell is opened or closed
        if (target.className === 'cell') {
            if (this.previousCell[1] && this.checkChildSRC(currentTarget, this.previousCell[1])) {
                this.markTheSame(currentTarget);
                Control.addSound('.check-audio');
            } else {
                this.checkNextCell(currentTarget);
                this.hidePreviousCell();
            }
        } else if (currentTarget === this.previousCell[0]) {
            this.flipItems();
        }
        Control.addSound('.tap-audio');
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
        //hide the same images in the game-field
        let firstCell = this.previousCell.pop();
        firstCell.setAttribute('data-background-change', 'success');
        firstCell.firstElementChild.setAttribute('style', 'display: none');
        currentTarget.setAttribute('data-background-change', 'success');
        this.isFinish();
    }

    isFinish() {
        //check quantity of the opened cells to end a game
        this.winCells += 2;
        if (this.winCells >= this.cellsQuantity) {
            Control.showGameResult();
            Control.addSound('.result-audio');
        }
    }

    flipItems() {
        //flip currentCells values to handle case when opened cell is clicked
        let buffer = this.previousCell[0];
        this.previousCell[0] = this.previousCell[1];
        this.previousCell[1] = buffer;
    }
}

class GameControl {
    constructor() {
        this.gameField = document.querySelector('.game-field');
        this.contentStart = document.querySelector('.content-start');
        this.gameInfo = document.querySelector('.game-info');
        this.timer = document.querySelector('.timer');
        this.scores = document.querySelector('.scores');
        this.gameResult = document.querySelector('.game-result');
        this.startButton = document.querySelector('.btn-start');
        this.startButton.addEventListener('click', this.gameStart.bind(this));
    }

    gameStart() {
        //draw and show the game-field, prepare info elements
        new Field();
        this.showGameField();
        this.addSound('.open-audio');
        this.initialScores = 1000;
        this.currentScores = 1;

        this.startDate = new Date();
        this.timeAndScores = setInterval(() => {
            this.currentDate = (new Date() - this.startDate) / 1000;
            this.timer.innerText = `time: ${parseInt(this.currentDate)}`;
            this.scores.innerText = `scores: ${this.initialScores - this.currentScores}`;
            this.currentScores++;
        }, 950)
    }

    showGameField() {
        this.gameField.setAttribute('data-display', 'block');
        this.contentStart.setAttribute('data-display', 'none');
        this.gameInfo.setAttribute('data-display', 'block');
        this.gameResult.setAttribute('data-display', 'none');
        this.startButton.setAttribute('data-display', 'none');
    }

    showGameResult() {
        this.gameField.setAttribute('data-display', 'none');
        this.gameInfo.setAttribute('data-display', 'none');
        this.gameResult.setAttribute('data-display', 'block');
        this.gameResult.innerText = `You win! Total scores of the game: ${this.initialScores - this.currentScores}`;
        this.showStartButton();
        this.clearGameData();
    }

    clearGameData() {
        let gameCells = document.querySelectorAll('.cell');
        gameCells.forEach((cell) => {
            cell.remove();
        });
        clearInterval(this.timeAndScores);
        this.currentScores = 1;
        Game.winCells = 0;
        this.timer.innerText = `time: 0`;
        this.scores.innerText = `scores: 1000`;
    }

    showStartButton() {
        let fieldWrapper = document.querySelector('.field-wrapper');
        fieldWrapper.appendChild(this.startButton);
        this.startButton.setAttribute('style', 'position: absolute; margin-top: 20%;');
        this.startButton.setAttribute('data-display', 'block');
    }

    addSound(selector) {
        let openAudio = document.querySelector(selector);
        openAudio.play();
    }
}

let Control = new GameControl();
let Game = new GameLogic();
