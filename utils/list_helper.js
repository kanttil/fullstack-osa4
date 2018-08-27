const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    const maxLikes = Math.max(...blogs.map(blog => blog.likes))
    const favoriteBlog = blogs.find(blog => blog.likes === maxLikes)

    return {
        title: favoriteBlog.title,
        author: favoriteBlog.author,
        likes: favoriteBlog.likes
    }
}

const mostBlogs = (blogs) => {
    const authors = blogs.reduce((authors, blog) => {
        if (!authors.find(author => author.author === blog.author)) {
            authors.push({
                author: blog.author,
                blogs: 1
            })
        } else {
            authors.find(author => author.author === blog.author)
                .blogs++
        }
        return authors
    }, [])

    const mostBlogs = Math.max(...authors.map(author => author.blogs))
    return authors.find(author => author.blogs === mostBlogs)
}

const mostLikes = (blogs) => {
    const authors = blogs.reduce((authors, blog) => {
        if (!authors.find(author => author.author === blog.author)) {
            authors.push({
                author: blog.author,
                likes: blog.likes
            })
        } else {
            authors.find(author => author.author === blog.author)
                .likes += blog.likes
        }
        return authors
    }, [])

    const mostLikes = Math.max(...authors.map(author => author.likes))
    return authors.find(author => author.likes === mostLikes)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}