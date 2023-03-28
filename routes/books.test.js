process.env.NODE_ENV = "test"
const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

const testISBN = "ITESTBOOKS";
describe("Book Routes Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books");

        const b1 = await Book.create({
            isbn: testISBN,
            amazon_url: "https://a.co/testbook",
            author: "Testy McTest",
            language: "EN",
            pages: 45,
            publisher: 'Test Publisher',
            title: 'How To Pass Tests',
            year: 2021
        });

        bookId = b1.id;
    });

    describe("Get /books", function () {
        test("Returns all books", async function () {
            const response = await request(app).get('/books')
            const result = await db.query(`SELECT * FROM books;`)

            expect(response.statusCode).toEqual(200);

            expect(response.body).toEqual(expect.any(Object));
            expect(response.body.books.length).toEqual(result.rows.length);
        })
    })

    describe("POST /books", function () {
        test("can create new book", async function () {
            const response = await request(app)
                .post("/books")
                .send({
                    isbn: "ITESTBOOKS2",
                    amazon_url: "https://a.co/testbook2",
                    author: "Testy McTest",
                    language: "EN",
                    pages: 90,
                    publisher: 'Test Publisher',
                    title: 'How To Pass Tests But Better This Time',
                    year: 2023
                });

            expect(response.statusCode).toEqual(201)

            expect(response.body).toEqual(expect.any(Object));
            expect(response.body.book).toEqual({
                'isbn': "ITESTBOOKS2",
                'amazon_url': "https://a.co/testbook2",
                'author': "Testy McTest",
                'language': "EN",
                'pages': 90,
                'publisher': 'Test Publisher',
                'title': 'How To Pass Tests But Better This Time',
                'year': 2023
            })
        });

        test("Can't create book with invalid input", async function () {
            let response = await request(app)
                .post("/books")
                .send({
                    isbn: "",
                    amazon_url: "",
                    author: 6,
                    language: true,
                    pages: 0,
                    publisher: '',
                    title: '',
                    year: []
                });

            expect(response.statusCode).toBe(400)

            expect(response.body).toEqual(expect.any(Object))
            expect(response.body).toEqual({ 'error': { 'message': expect.any(Array), 'status': 400 }, 'message': expect.any(Array) })
        })

        test("Can't create book without input", async function () {
            let response = await request(app)
                .post("/books")
                .send({});

            expect(response.statusCode).toBe(400)

            expect(response.body).toEqual(expect.any(Object))
            expect(response.body).toEqual({ 'error': { 'message': expect.any(Array), 'status': 400 }, 'message': expect.any(Array) })
        })
    });

    describe('GET /:id', function () {
        test("Returns correct book", async () => {
            const response = await request(app).get(`/books/${testISBN}`)

            expect(response.statusCode).toBe(200);

            expect(response.body).toEqual(expect.any(Object))
            expect(response.body.book).toEqual({
                isbn: testISBN,
                amazon_url: "https://a.co/testbook",
                author: "Testy McTest",
                language: "EN",
                pages: 45,
                publisher: 'Test Publisher',
                title: 'How To Pass Tests',
                year: 2021
            })
        })

        test('Returns 404 if no book found', async () => {
            const response = await request(app).get(`/books/err`)

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual(expect.any(Object));
            expect(response.body).toEqual({ 'error': expect.any(Object), 'message': expect.any(String) })
        })
    })

    describe('PUT /:isbn', function () {
        test('Returns updated book info', async () => {
            const response = await request(app).put(`/books/${testISBN}`).send({
                amazon_url: "https://a.co/testbook2",
                author: "Testy McTest",
                language: "EN",
                pages: 90,
                publisher: 'Test Publisher',
                title: 'How To Pass Tests But Better This Time',
                year: 2023
            });

            expect(response.statusCode).toBe(200);

            expect(response.body.book).toEqual(expect.any(Object));
            expect(response.body.book).toEqual({
                'isbn': "ITESTBOOKS",
                'amazon_url': "https://a.co/testbook2",
                'author': "Testy McTest",
                'language': "EN",
                'pages': 90,
                'publisher': 'Test Publisher',
                'title': 'How To Pass Tests But Better This Time',
                'year': 2023
            })
        })

        test('Returns 404 if book not found', async () => {
            const response = await request(app).put(`/books/err`).send({
                amazon_url: "https://a.co/testbook2",
                author: "Testy McTest",
                language: "EN",
                pages: 90,
                publisher: 'Test Publisher',
                title: 'How To Pass Tests But Better This Time',
                year: 2023
            });

            expect(response.statusCode).toBe(404);

            expect(response.body).toEqual(expect.any(Object));
            expect(response.body).toEqual({ 'error': expect.any(Object), 'message': expect.any(String) })
        })

        test('Returns bad request if input is not valid', async () => {
            const response = await request(app).put(`/books/${testISBN}`).send({
                amazon_url: "not a url",
                author: '',
                language: "LONG",
                pages: 0,
                publisher: false,
                title: null,
                year: '2023'
            });

            expect(response.statusCode).toEqual(400);
            expect(response.body).toEqual({ 'error': { 'message': expect.any(Array), 'status': 400 }, 'message': expect.any(Array) })
        })
    })

    describe('DELETE :/isbn', function(){
        test('deletes book from database', async () => {
            const response = await request(app).delete(`/books/${testISBN}`)

            expect(response.statusCode).toEqual(200);

            expect(response.body).toEqual({ message: "Book deleted" })

            const results = await db.query(`SELECT * FROM books`);

            expect(results.rows.length).toBe(0);
        })

        test('returns 404 if book not found', async () => {
            const response = await request(app).delete(`/books/err`);

            expect(response.statusCode).toEqual(404);

            expect(response.body.error).toEqual({ message: `There is no book with an isbn 'err`, status: 404 })
        })
    })
});

afterAll(async function () {
    await db.end();
});
