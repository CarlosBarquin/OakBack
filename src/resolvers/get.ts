import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { BODY_TYPES } from "https://deno.land/x/oak@v11.1.0/util.ts";

type GetBooksContext = RouterContext<"/books", Record<string | number, string | undefined>, Record<string, any>>;

type GetBookContext  = RouterContext<"/books/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>

export const getBooks = async (context : GetBooksContext) => {
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