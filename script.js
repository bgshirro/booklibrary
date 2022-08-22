document.addEventListener("DOMContentLoaded", function () {

    const formInput = document.getElementById("inputBook");
    const formSearch = document.getElementById("searchBook");

    formInput.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();

        document.getElementById("inputBookTitle").value = "";
        document.getElementById("inputBookAuthor").value = "";
        document.getElementById("inputBookYear").value = "";
        document.getElementById("inputBookIsComplete").checked = false;
    });

    formSearch.addEventListener("submit", function (event) {
        event.preventDefault();

        const inputSearch = document.getElementById("searchBookTitle").value;
        bookSearch(inputSearch);
    })

    if (isStorageSupported()) {
        fetchJson();
    }
});

document.addEventListener("onjsonfetched", function () {
    renderFromBooks();
});

const BOOKS_KEY = "BOOKSHELF_APPS";

let books = [];

function isStorageSupported() {
    if (typeof Storage === "undefined") {
        alert("browser anda tidak mendukung web storage!");
        return false;
    } else {
        return true;
    }
}

function updateJson() {
    if (isStorageSupported()) {
        localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
    }
}

function fetchJson() {
    let data = JSON.parse(localStorage.getItem(BOOKS_KEY));

    if (data !== null) {
        books = data;
    }

    document.dispatchEvent(new Event("onjsonfetched"));
}

function composeBookObject(id, year, title, author, isComplete) {
    return {
        id, year, title, author, isComplete,
    };
}

function renderFromBooks() {
    for (book of books) {
        const newBook = createBook(book.id, book.year, book.title, book.author, book.isComplete);

        if (book.isComplete) {
            document.getElementById(COMPLETE_BOOK).append(newBook);
        } else {
            document.getElementById(INCOMPLETE_BOOK).append(newBook);
        }
    }
}

function deleteBookFromJson(idBook) {
    for (let arrayPosition = 0; arrayPosition < books.length; arrayPosition++) {
        if (books[arrayPosition].id == idBook) {
            books.splice(arrayPosition, 1);
            break;
        }
    }
}

const INCOMPLETE_BOOK = "incompleteBookshelfList";
const COMPLETE_BOOK = "completeBookshelfList";

function addBook() {
    const idBook = +new Date();
     const inputBookYear = document.getElementById("inputBookYear").value;
    const inputBookTitle = document.getElementById("inputBookTitle").value;
    const inputBookAuthor = document.getElementById("inputBookAuthor").value;
    const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked;

    const book = createBook(idBook, inputBookYear, inputBookTitle, inputBookAuthor, inputBookIsComplete);
    const bookObject = composeBookObject(idBook, inputBookYear, inputBookTitle, inputBookAuthor, inputBookIsComplete);

    books.push(bookObject);

    if (inputBookIsComplete) {
        document.getElementById(COMPLETE_BOOK).append(book);
    } else {
        document.getElementById(INCOMPLETE_BOOK).append(book);
    }

    updateJson();
}

function createBook(idBook, inputBookYear, inputBookTitle, inputBookAuthor, inputBookIsComplete) {
    const book = document.createElement("article");
    book.setAttribute("id", idBook)
    book.classList.add("card");

    const bookTitle = document.createElement("h5");
    bookTitle.style.maxWidth = "174px";
    bookTitle.innerText = inputBookTitle;

    const bookAuthor = document.createElement("span");
    bookAuthor.classList.add("Author");
    bookAuthor.style.maxWidth = "200px";
    bookAuthor.innerText = inputBookAuthor;

    const bookYear = document.createElement("span");
    bookYear.classList.add("Year")
    bookYear.innerText = inputBookYear;

    const br = document.createElement("br");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-body");

    const cardContent = document.createElement("div");
    cardContent.classList.add("card-content");

    const cardAction = addAction(inputBookIsComplete, idBook);

    cardContent.append(bookYear, bookTitle, bookAuthor);
    cardContainer.append(cardContent);
    cardContainer.append(cardAction);
    book.append(cardContainer);

    return book;
}

function addAction(inputBookIsComplete, idBook) {
    const cardActions = document.createElement("div");
    cardActions.classList.add("button")

    const actionDelete = createActionDelete(idBook);
    const actionRead = createActionRead(idBook);
    const actionUndo = createActionUndo(idBook);

    cardActions.append(actionDelete);

    if (inputBookIsComplete) {
        cardActions.append(actionUndo);
    } else {
        cardActions.append(actionRead);
    }

    return cardActions;
}

function createActionDelete(idBook) {
    const actionDelete = document.createElement("button");
    actionDelete.classList.add("btn-delete");
    actionDelete.innerHTML = '<img src="icon/Delete Icon.svg">';

    actionDelete.addEventListener("click", function () {
        let confirmation = confirm("Apakah anda yakin ingin menghapus buku tersebut?");

        if (confirmation) {
            const cardParent = document.getElementById(idBook);
            cardParent.addEventListener("eventDelete", function (event) {
                event.target.remove();
            });
            cardParent.dispatchEvent(new Event("eventDelete"));

            deleteBookFromJson(idBook);
            updateJson();
        }
    });

    return actionDelete;
}

function createActionRead(idBook) {
    const action = document.createElement("button");
    action.classList.add("btn-finish");
    action.innerHTML = 'Selesai';

    action.addEventListener("click", function () {
        const cardParent = document.getElementById(idBook);

        const bookYear = cardParent.querySelectorAll(".card-content > span")[0].innerText;
        const bookTitle = cardParent.querySelector(".card-content > h5").innerText;
        const bookAuthor = cardParent.querySelectorAll(".card-content > span")[1].innerText;
        
        cardParent.remove();

        const book = createBook(idBook, bookYear, bookTitle, bookAuthor, true);
        document.getElementById(COMPLETE_BOOK).append(book);

        deleteBookFromJson(idBook);
        const bookObject = composeBookObject(idBook, bookYear, bookTitle, bookAuthor, true);

        books.push(bookObject);
        updateJson();
    })

    return action;
}

function createActionUndo(idBook) {
    const action = document.createElement("button");
    action.classList.add("btn-move");
    action.innerHTML = 'Pindah';

    action.addEventListener("click", function () {
        const cardParent = document.getElementById(idBook);

        const bookYear = cardParent.querySelectorAll(".card-content > span")[0].innerText;
        const bookTitle = cardParent.querySelector(".card-content > h5").innerText;
        const bookAuthor = cardParent.querySelectorAll(".card-content > span")[1].innerText;

        cardParent.remove();

        const book = createBook(idBook, bookYear, bookTitle, bookAuthor, false);
        document.getElementById(INCOMPLETE_BOOK).append(book);

        deleteBookFromJson(idBook);
        const bookObject = composeBookObject(idBook, bookYear, bookTitle, bookAuthor, false);

        books.push(bookObject);
        updateJson();
    })

    return action;
}

function bookSearch(keyword) {
    const filter = keyword.toUpperCase();
    const titles = document.getElementsByTagName("h5");

    for (let i = 0; i < titles.length; i++) {
        const titlesText = titles[i].textContent || titles[i].innerText;

        if (titlesText.toUpperCase().indexOf(filter) > -1) {
            titles[i].closest(".card").style.display = "";
        } else {
            titles[i].closest(".card").style.display = "none";
        }
    }
}

function openPopUp() {
    document.getElementById("popUp").style.right = "0"
    document.getElementById("popUp").style.position = "fixed"
}
function closePopUp() {
    document.getElementById("popUp").style.right = "-100vw"
}
