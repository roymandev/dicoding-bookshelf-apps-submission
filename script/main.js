"use strict";
class Book {
    #book;
    onRemove = () => { };
    onToggle = () => { };
    constructor(book) {
        this.#book = {
            id: Date.now(),
            ...book,
        };
    }
    getData() {
        return { ...this.#book };
    }
    toggleComplete() {
        this.#book.isComplete = !this.#book.isComplete;
        this.onToggle();
    }
    getNode() {
        const bookComponent = document
            .querySelector('[data-component="book"]')
            ?.cloneNode(true);
        if (bookComponent) {
            // Set book title
            const bookTitle = bookComponent.querySelector("[data-title]");
            if (bookTitle)
                bookTitle.innerHTML = this.#book.title;
            // Set book author
            const bookAuthor = bookComponent.querySelector("[data-author]");
            if (bookAuthor)
                bookAuthor.innerHTML = this.#book.author;
            // Set book year
            const bookYear = bookComponent.querySelector("[data-year]");
            if (bookYear)
                bookYear.innerHTML = `(${this.#book.year})`;
            // Set book delete method
            const bookDelete = bookComponent.querySelector("[data-delete]");
            if (bookDelete)
                bookDelete.onclick = () => this.onRemove();
            // Set book toggle method
            const bookIsComplete = bookComponent.querySelector("[data-toggle-complete]");
            if (bookIsComplete) {
                bookIsComplete.innerText = this.#book.isComplete
                    ? "Set not finish"
                    : "Set finish";
                bookIsComplete.onclick = () => this.toggleComplete();
            }
            return bookComponent;
        }
        return null;
    }
}
class Bookshelf {
    #list = [];
    #notFinishedContainer;
    #finishedBookshelf;
    constructor(notFinishedContainer, finishedBookshelf) {
        this.#notFinishedContainer = notFinishedContainer;
        this.#finishedBookshelf = finishedBookshelf;
        const localBooklist = JSON.parse(localStorage.getItem("booklist") ?? "[]");
        this.addBook(localBooklist);
    }
    addBook(books) {
        if (Array.isArray(books)) {
            this.setList([
                ...this.#list,
                ...books.map((bookState) => {
                    const book = new Book(bookState);
                    book.onRemove = () => this.removeBookById(book.getData().id);
                    book.onToggle = () => this.render();
                    return book;
                }),
            ]);
        }
        else {
            const book = new Book(books);
            book.onRemove = () => this.removeBookById(book.getData().id);
            book.onToggle = () => this.render();
            this.setList([...this.#list, book]);
        }
    }
    setList(newList) {
        this.#list = newList;
        localStorage.setItem("booklist", JSON.stringify(this.#list.map((book) => book.getData())));
        this.render();
    }
    removeBookById(id) {
        this.setList(this.#list.filter((book) => book.getData().id !== id));
    }
    render() {
        this.#notFinishedContainer.innerHTML = "";
        this.#finishedBookshelf.innerHTML = "";
        this.#list.forEach((book) => {
            const bookNode = book.getNode();
            if (!bookNode)
                return;
            if (book.getData().isComplete) {
                this.#finishedBookshelf.append(bookNode);
            }
            else {
                this.#notFinishedContainer.append(bookNode);
            }
        });
        if (!this.#notFinishedContainer.children.length)
            this.#notFinishedContainer.innerHTML = "No Books";
        if (!this.#finishedBookshelf.children.length)
            this.#finishedBookshelf.innerHTML = "No Books";
    }
}
// Bookshelf container
const notFinishBookshelfContainer = document.getElementById("not-finished-bookshelf");
const finishedBookshelf = document.getElementById("finished-bookshelf");
if (notFinishBookshelfContainer && finishedBookshelf) {
    const notFinishBookshelf = new Bookshelf(notFinishBookshelfContainer, finishedBookshelf);
    const addBookForm = document.getElementById("add-book-form");
    if (addBookForm) {
        addBookForm.onsubmit = (ev) => {
            ev.preventDefault();
            const bookFormTitle = addBookForm.querySelector("#book-title");
            const bookFormAuthor = addBookForm.querySelector("#book-author");
            const bookFormYear = addBookForm.querySelector("#book-year");
            const bookFormIsComplete = addBookForm.querySelector("#book-isComplete");
            notFinishBookshelf.addBook({
                title: bookFormTitle.value,
                author: bookFormAuthor.value,
                year: bookFormYear.valueAsNumber,
                isComplete: bookFormIsComplete.checked,
            });
            bookFormTitle.value = "";
            bookFormAuthor.value = "";
            bookFormYear.value = "";
        };
    }
}
