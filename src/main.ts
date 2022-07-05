interface BookStates {
  id: number;
  title: string;
  author: string;
  year: number;
  isComplete: boolean;
}

interface BookConstructor extends Omit<BookStates, "id"> {
  id?: number;
}
class Book {
  #book: BookStates;

  onRemove = () => {};
  onToggle = () => {};

  constructor(book: BookConstructor) {
    this.#book = {
      id: Date.now(),
      ...book,
    };
  }

  getData() {
    return { ...this.#book } as BookStates;
  }

  toggleComplete() {
    this.#book.isComplete = !this.#book.isComplete;
    this.onToggle();
  }

  getNode() {
    const bookComponent = document
      .querySelector('[data-component="book"]')
      ?.cloneNode(true) as HTMLLIElement | null;
    if (bookComponent) {
      // Set book title
      const bookTitle = bookComponent.querySelector("[data-title]");
      if (bookTitle) bookTitle.innerHTML = this.#book.title;

      // Set book author
      const bookAuthor = bookComponent.querySelector("[data-author]");
      if (bookAuthor) bookAuthor.innerHTML = this.#book.author;

      // Set book year
      const bookYear = bookComponent.querySelector("[data-year]");
      if (bookYear) bookYear.innerHTML = `(${this.#book.year})`;

      // Set book delete method
      const bookDelete = bookComponent.querySelector(
        "[data-delete]"
      ) as HTMLButtonElement | null;
      if (bookDelete) bookDelete.onclick = () => this.onRemove();

      // Set book toggle method
      const bookIsComplete = bookComponent.querySelector(
        "[data-toggle-complete]"
      ) as HTMLButtonElement | null;
      if (bookIsComplete) bookIsComplete.onclick = () => this.toggleComplete();

      return bookComponent;
    }
    return null;
  }
}

class Bookshelf {
  #list: Book[] = [];
  #notFinishedContainer: HTMLElement;
  #finishedBookshelf: HTMLElement;

  constructor(
    notFinishedContainer: HTMLElement,
    finishedBookshelf: HTMLElement
  ) {
    this.#notFinishedContainer = notFinishedContainer;
    this.#finishedBookshelf = finishedBookshelf;

    const localBooklist = JSON.parse(
      localStorage.getItem("booklist") ?? "[]"
    ) as BookStates[];

    this.addBook(localBooklist);
  }

  addBook(books: Omit<BookStates, "id"> | Omit<BookStates, "id">[]) {
    if (Array.isArray(books)) {
      this.setList([
        ...this.#list,
        ...books.map((bookState) => {
          const book = new Book(bookState);
          book.onRemove = () => this.removeBookById(book.getData().id);
          return book;
        }),
      ]);
    } else {
      const book = new Book(books);
      book.onRemove = () => this.removeBookById(book.getData().id);
      book.onToggle = () => this.render();
      this.setList([...this.#list, book]);
    }
  }

  setList(newList: Book[]) {
    this.#list = newList;
    localStorage.setItem(
      "booklist",
      JSON.stringify(this.#list.map((book) => book.getData()))
    );
    this.render();
  }

  removeBookById(id: number) {
    this.setList(this.#list.filter((book) => book.getData().id !== id));
  }

  render() {
    this.#notFinishedContainer.innerHTML = "";
    this.#finishedBookshelf.innerHTML = "";

    this.#list.forEach((book) => {
      const bookNode = book.getNode();
      if (!bookNode) return;
      if (book.getData().isComplete) {
        this.#finishedBookshelf.append(bookNode);
      } else {
        this.#notFinishedContainer.append(bookNode);
      }
    });
  }
}

// Bookshelf container
const notFinishBookshelfContainer = document.getElementById(
  "not-finished-bookshelf"
);
const finishedBookshelf = document.getElementById("finished-bookshelf");

if (notFinishBookshelfContainer && finishedBookshelf) {
  const notFinishBookshelf = new Bookshelf(
    notFinishBookshelfContainer,
    finishedBookshelf
  );

  const addBookForm = document.getElementById("add-book-form");

  if (addBookForm) {
    addBookForm.onsubmit = (ev) => {
      ev.preventDefault();
      const bookFormTitle = addBookForm.querySelector(
        "#book-title"
      ) as HTMLInputElement;
      const bookFormAuthor = addBookForm.querySelector(
        "#book-author"
      ) as HTMLInputElement;
      const bookFormYear = addBookForm.querySelector(
        "#book-year"
      ) as HTMLInputElement;
      const bookFormIsComplete = addBookForm.querySelector(
        "#book-isComplete"
      ) as HTMLInputElement;

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
