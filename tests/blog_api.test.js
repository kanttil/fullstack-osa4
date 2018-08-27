const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, blogsInDb, usersInDb } = require('./test_helper')

beforeAll(async () => {
    await Blog.remove({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    await User.remove({})
    const user = new User({ username: 'root', password: 'sekret' })
    await user.save()
})

describe('GET /api/blogs', () => {
    test('all blogs are returned as json', async () => {
        const blogsInDatabase = await blogsInDb()

        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body.length).toBe(blogsInDatabase.length)

        const returnedTitles = response.body.map(r => r.title)
        blogsInDatabase.forEach(blog => {
            expect(returnedTitles).toContain(blog.title)
        })
    })
})

describe('POST /api/blogs', () => {
    test('succeeds with valid data', async () => {
        const blogsBeforeOperation = await blogsInDb()

        const newBlog = {
            title: 'First class tests',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const blogsAfterOperation = await blogsInDb()
        expect(blogsAfterOperation.length).toBe(blogsBeforeOperation.length + 1)

        const titles = blogsAfterOperation.map(blog => blog.title)
        expect(titles).toContain('First class tests')
    })

    test('succeeds if likes is missing, likes gets value 0', async () => {
        const blogsBeforeOperation = await blogsInDb()

        const newBlog = {
            title: 'TDD harms architecture',
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
        }

        await api
            .post('/api/blogs')
            .send(newBlog)

        const blogsAfterOperation = await blogsInDb()
        expect(blogsAfterOperation.length).toBe(blogsBeforeOperation.length + 1)

        const addedBlog = blogsAfterOperation[blogsAfterOperation.length - 1]
        expect(addedBlog.likes).toBe(0)
    })

    test('fails with proper status code if title is missing', async () => {
        const blogsBeforeOperation = await blogsInDb()

        const newBlog = {
            author: 'Robert C. Martin',
            url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
            likes: 2
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAfterOperation = await blogsInDb()
        expect(blogsAfterOperation.length).toBe(blogsBeforeOperation.length)
    })

    test('fails with proper status code if url is missing', async () => {
        const blogsBeforeOperation = await blogsInDb()

        const newBlog = {
            title: 'Type wars',
            author: 'Robert C. Martin',
            likes: 2
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAfterOperation = await blogsInDb()
        expect(blogsAfterOperation.length).toBe(blogsBeforeOperation.length)
    })
})

describe('POST /api/users', () => {
    test('succeeds with a fresh username', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'new',
            name: 'Newuser',
            password: 'salainen'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length + 1)
        const usernames = usersAfterOperation.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('fails with proper status code and message if username already taken', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'username must be unique' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })

    test('fails with proper status code and message if password is too short', async () => {
        const usersBeforeOperation = await usersInDb()

        const newUser = {
            username: 'user',
            name: 'Superuser',
            password: 'sa'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body).toEqual({ error: 'password must be at least 3 characters' })

        const usersAfterOperation = await usersInDb()
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length)
    })
})

afterAll(() => {
    server.close()
})