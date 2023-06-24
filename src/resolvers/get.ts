import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";

type GetBooksContext = RouterContext<"/books", Record<string | number, string | undefined>, Record<string, any>>;

type GetBookContext  = RouterContext<"/book/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>

type GetBooksTContext  = RouterContext<"/books/:author", {
    author: string;
} & Record<string | number, string | undefined>, Record<string, any>>



export const getBooks = async (context : GetBooksContext) => {
    const params = getQuery(context, { mergeParams: true });
    const books = await booksCollection.find({}).toArray()
    if(books.length === 0) { 
        context.response.status = 400
        return
    }

    const BOOKS = books.map((book) => ({
        id : book._id.toString(),
        title : book.title,
        author : book.author
    }))

    if(params.sort === "asc"){
        context.response.body = BOOKS.sort((a,b)=> a.title.localeCompare(b.title) )      
    }
    
    if(params.sort === "des"){
        context.response.body = BOOKS.sort((a,b)=> b.title.localeCompare(a.title) )      
    }
    
    context.response.body = BOOKS

}

export const getBook = async (context : GetBookContext) => {

    const id = context.params.id

    if(!id){
        context.response.status = 400
        return
    }
  
    const book = await booksCollection.findOne({_id : new ObjectId(id)})

    if(!book){
        context.response.status = 404
        return
    }

    context.response.body = {
        id : book._id.toString(),
        title : book.title,
        author : book.author
    }

}

export const getBooksT = async (context : GetBooksTContext) =>{
    const author = context.params.author

    if(!author){
        context.response.status = 500
        context.response.body = "mal"
        return
    }

    const books = await booksCollection.find({author : author}).toArray()

    if(books.length === 0 ){
        context.response.status = 500
        context.response.body = "mal"
        return
    }

    context.response.body = books.map((book) => ({
        id : book._id.toString(),
        title : book.title,
        author : book.author
    }))
}